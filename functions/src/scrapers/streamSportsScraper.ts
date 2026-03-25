import axios from 'axios';
import * as cheerio from 'cheerio';

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
 * Scrape matches from streamsports99.ru using axios/cheerio (FAST)
 */
export async function scrapeStreamSports(): Promise<StreamSportsMatch[]> {
    const targetUrl = 'https://streamsports99.ru/';
    const matches: StreamSportsMatch[] = [];

    try {
        const { data } = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            },
            timeout: 5000
        });

        const $ = cheerio.load(data);
        const matchRows = $('div[class*="match"], div[class*="game-row"], .match-item');

        matchRows.each((index, element) => {
            const row = $(element);
            const text = row.text() || "";
            const linkElement = row.find('a[href*="/game/"], a[href*="/player/"]');
            const link = linkElement.attr('href') || "";
            
            if (link && (text.includes(' vs ') || text.includes(' - '))) {
                const teams = text.split(/\s+vs\s+|\s+-\s+/);
                const logos: string[] = [];
                row.find('img[src*="team"]').each((i, img) => {
                    const src = $(img).attr('src');
                    if (src) logos.push(src.startsWith('http') ? src : `https://streamsports99.ru${src}`);
                });
                
                const isLive = text.toLowerCase().includes('live') || row.find('.live-indicator').length > 0;
                const timeStr = row.find('.time, .match-time').text().trim();

                const home = teams[0]?.trim().split('\n').pop()?.trim() || "Team A";
                const away = teams[1]?.trim().split('\n')[0]?.trim() || "Team B";

                matches.push({
                    id: `ss99-${index}-${Date.now()}`,
                    homeTeam: home,
                    awayTeam: away,
                    homeTeamLogo: logos[0] || "",
                    awayTeamLogo: logos[1] || "",
                    status: isLive ? 'live' : 'upcoming',
                    isLive: isLive,
                    kickoffTimeFormatted: timeStr || "TBD",
                    link: link.startsWith('http') ? link : `https://streamsports99.ru${link}`,
                    league: "StreamSports",
                    sport: "Sports"
                });
            }
        });

        return matches;

    } catch (error) {
        console.error('Error in fast StreamSports scraping:', error);
        return [];
    }
}
