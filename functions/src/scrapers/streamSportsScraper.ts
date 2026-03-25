import * as playwright from 'playwright-core';
import chromium from 'chrome-aws-lambda';

export interface StreamSportsMatch {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamLogo?: string;
    awayTeamLogo?: string;
    status: 'live' | 'upcoming';
    isLive: boolean;
    startTime?: string;
    kickoffTimeFormatted?: string;
    link: string;
    league?: string;
    sport?: string;
}

/**
 * Scrape matches from streamsports99.ru
 */
export async function scrapeStreamSports(): Promise<StreamSportsMatch[]> {
    const targetUrl = 'https://streamsports99.ru/';
    let browser: playwright.Browser | null = null;
    const matches: StreamSportsMatch[] = [];

    try {
        browser = await playwright.chromium.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        });

        const page = await context.newPage();
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Wait for the match sections to be visible
        await page.waitForSelector('.match-item, .game-row', { timeout: 10000 }).catch(() => {});

        const scrapedData = await page.evaluate(() => {
            const results: any[] = [];
            
            // This is a generic selector - we'll refine it based on visual inspection
            // Standard rows on streamsports99.ru usually look like this
            const matchRows = document.querySelectorAll('div[class*="match"], div[class*="game-row"], .match-item');
            
            matchRows.forEach((row: any) => {
                const text = row.innerText || "";
                const linkElement = row.querySelector('a[href*="/game/"], a[href*="/player/"]');
                const link = linkElement ? linkElement.href : "";
                
                if (link && (text.includes(' vs ') || text.includes(' - '))) {
                    const teams = text.split(/\s+vs\s+|\s+-\s+/);
                    const logos = Array.from(row.querySelectorAll('img[src*="team"]')).map((img: any) => img.src);
                    
                    const isLive = row.textContent.toLowerCase().includes('live') || row.querySelector('.live-indicator');
                    
                    results.push({
                        home: teams[0]?.trim() || "Team A",
                        away: teams[1]?.trim() || "Team B",
                        homeLogo: logos[0] || "",
                        awayLogo: logos[1] || "",
                        link: link,
                        isLive: !!isLive,
                        time: row.querySelector('.time, .match-time')?.innerText?.trim() || ""
                    });
                }
            });
            return results;
        });

        scrapedData.forEach((m: any, index: number) => {
            matches.push({
                id: `ss99-${index}-${Date.now()}`,
                homeTeam: m.home,
                awayTeam: m.away,
                homeTeamLogo: m.homeLogo,
                awayTeamLogo: m.awayLogo,
                status: m.isLive ? 'live' : 'upcoming',
                isLive: m.isLive,
                kickoffTimeFormatted: m.time || "TBD",
                link: m.link,
                league: "StreamSports",
                sport: "Sports"
            });
        });

        await browser.close();
        return matches;

    } catch (error) {
        console.error('Error scraping StreamSports99:', error);
        if (browser) await browser.close();
        return [];
    }
}
