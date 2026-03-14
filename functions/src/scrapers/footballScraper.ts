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
 * Scrape matches from sportslivetoday.com
 */
export async function scrapeSportsLiveToday(): Promise<ScrapedMatch[]> {
    let browser: playwright.Browser | null = null;

    try {
        browser = await playwright.chromium.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        });

        const page = await context.newPage();
        
        // Navigate with a generous timeout
        await page.goto('https://sportslivetoday.com/live?sportType=football', {
            waitUntil: 'networkidle',
            timeout: 60000
        });

        // Wait a bit for JS to render the lists
        await page.waitForTimeout(5000);

        // Heuristic-based extraction script
        const matches = await page.evaluate(() => {
            const results: any[] = [];
            
            // Look for common match card containers or links
            const items = Array.from(document.querySelectorAll('a, .match-item, .fixture, [class*="match"], [class*="fixture"]'));
            
            items.forEach((el: any) => {
                const text = el.innerText || "";
                if (text.includes(' vs ') || text.includes(' - ')) {
                    const teams = text.split(/\s+vs\s+|\s+-\s+/);
                    if (teams.length >= 2 && text.length < 250) {
                        const link = el.href || el.closest('a')?.href || "";
                        if (link && !results.some(r => r.link === link)) {
                            results.push({
                                home: teams[0].trim().split('\n').pop().trim(),
                                away: teams[1].trim().split('\n')[0].trim(),
                                text: text.trim(),
                                link: link
                            });
                        }
                    }
                }
            });

            return results;
        });

        await browser.close();

        return matches.map((m: any, idx: number) => ({
            id: `scraped-${idx}-${Date.now()}`,
            homeTeam: m.home,
            awayTeam: m.away,
            status: "live",
            link: m.link,
            time: "Live Now"
        }));

    } catch (error) {
        console.error('Error scraping sportslivetoday:', error);
        if (browser) await browser.close();
        return [];
    }
}
