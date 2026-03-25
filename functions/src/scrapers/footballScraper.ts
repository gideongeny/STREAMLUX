import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedMatch {
    id: string;
    homeTeam: string;
    awayTeam: string;
    status: string;
    link: string;
    league?: string;
    time?: string;
    sport?: string;
    isLive?: boolean;
}

/**
 * Scrape matches from multiple elite sources in PARALLEL (FAST)
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

    const allMatches: ScrapedMatch[] = [];

    const scrapeSource = async (source: { name: string, url: string }) => {
        try {
            const { data } = await axios.get(source.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
                timeout: 8000 // 8 second timeout per source
            });

            const $ = cheerio.load(data);
            const results: ScrapedMatch[] = [];
            
            // Replicating the generic logic into cheerio
            $('a, .match-item, .fixture, [class*="match"], [class*="fixture"]').each((i, el) => {
                const element = $(el);
                const text = element.text() || "";
                
                if ((text.includes(' vs ') || text.includes(' - ')) && text.length < 200) {
                    const link = element.attr('href') || element.closest('a').attr('href') || "";
                    if (link && link.startsWith('http')) {
                        const parts = text.split(/\s+vs\s+|\s+-\s+/);
                        const home = parts[0]?.trim().split('\n').pop()?.trim() || "Match";
                        const away = parts[1]?.trim().split('\n')[0]?.trim() || "Live";

                        results.push({
                            id: `scraped-${source.name}-${i}-${Date.now()}`,
                            homeTeam: home,
                            awayTeam: away,
                            status: "live",
                            isLive: true,
                            link: link,
                            league: source.name,
                            sport: "Football",
                            time: "Live Now"
                        });
                    }
                }
            });
            return results;
        } catch (e: any) {
            console.warn(`Failed to fast-scrape ${source.name}:`, e.message);
            return [];
        }
    };

    try {
        const resultsArray = await Promise.all(sources.map(scrapeSource));
        
        resultsArray.flat().forEach(match => {
            if (!allMatches.some(m => m.link === match.link)) {
                allMatches.push(match);
            }
        });
        
        return allMatches;
    } catch (error) {
        console.error('Error in multi-source parallel scraping:', error);
        return allMatches;
    }
}

/**
 * Legacy support for sportslivetoday
 */
export async function scrapeSportsLiveToday(): Promise<ScrapedMatch[]> {
    return scrapeAllSports();
}
