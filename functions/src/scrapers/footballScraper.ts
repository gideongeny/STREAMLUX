import * as playwright from 'playwright-core';
import chromium from 'chrome-aws-lambda';

export interface ScrapedMatch {
    id: string;
    homeTeam: string;
    awayTeam: string;
    status: string;
    link: string;
    league?: string;
    time?: string;
}

/**
 * Scrape matches from multiple elite sources
 */
export async function scrapeAllSports(): Promise<ScrapedMatch[]> {
    const sources = [
        { name: 'SportsLiveToday', url: 'https://sportslivetoday.com/live?sportType=football' },
        { name: 'VIPSportLive', url: 'https://www.vipsportlive.com' },
        { name: 'FoxTrend', url: 'https://foxtrend.net/' },
        { name: 'Sporty100', url: 'https://sporty100.com' },
        { name: 'SportSurge', url: 'https://sportsurge.ws/' },
        { name: 'CrackStreams', url: 'https://crackstreams.ms/' }
    ];

    let browser: playwright.Browser | null = null;
    const allMatches: ScrapedMatch[] = [];

    try {
        browser = await playwright.chromium.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        });

        for (const source of sources) {
            try {
                const page = await context.newPage();
                await page.goto(source.url, { waitUntil: 'networkidle', timeout: 30000 });
                await page.waitForTimeout(3000);

                const sourceMatches = await page.evaluate((sourceName) => {
                    const results: any[] = [];
                    const items = Array.from(document.querySelectorAll('a, .match-item, .fixture, [class*="match"], [class*="fixture"]'));
                    
                    items.forEach((el: any) => {
                        const text = el.innerText || "";
                        if ((text.includes(' vs ') || text.includes(' - ')) && text.length < 200) {
                            const link = el.href || el.closest('a')?.href || "";
                            if (link && link.startsWith('http')) {
                                const parts = text.split(/\s+vs\s+|\s+-\s+/);
                                results.push({
                                    home: parts[0]?.trim().split('\n').pop()?.trim() || "Match",
                                    away: parts[1]?.trim().split('\n')[0]?.trim() || "Live",
                                    link: link,
                                    source: sourceName
                                });
                            }
                        }
                    });
                    return results;
                }, source.name);

                sourceMatches.forEach((m: any) => {
                    if (!allMatches.some(existing => existing.link === m.link)) {
                        allMatches.push({
                            id: `scraped-${source.name}-${allMatches.length}-${Date.now()}`,
                            homeTeam: m.home,
                            awayTeam: m.away,
                            status: "live",
                            link: m.link,
                            league: source.name,
                            time: "Live Now"
                        });
                    }
                });
                await page.close();
            } catch (e) {
                console.warn(`Failed to scrape ${source.name}:`, e);
            }
        }

        await browser.close();
        return allMatches;

    } catch (error) {
        console.error('Error in multi-source scraping:', error);
        if (browser) await browser.close();
        return allMatches; // Return whatever we got
    }
}

/**
 * Legacy support for sportslivetoday
 */
export async function scrapeSportsLiveToday(): Promise<ScrapedMatch[]> {
    return scrapeAllSports();
}
