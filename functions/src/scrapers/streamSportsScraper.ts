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
 * Scrape matches from streamsports99.ru using section-based selectors (FAST)
 */
export async function scrapeStreamSports(): Promise<StreamSportsMatch[]> {
    const targetUrl = 'https://streamsports99.ru/';
    const matches: StreamSportsMatch[] = [];

    try {
        const { data } = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
            },
            timeout: 8000
        });

        const $ = cheerio.load(data);
        
        const processSection = (selector: string, status: 'live' | 'upcoming') => {
            const section = $(selector);
            // Rows are typically divs inside the section, but they might be structured inside a grid
            section.find('div.flex.items-center, .match-item, [class*="game-row"]').each((index, element) => {
                const row = $(element);
                const text = row.text() || "";
                
                // Look for the "Watch" or "View" button for the link
                const watchBtn = row.find('button[title*="Watch"], button[title*="View"], a[href*="/game/"]');
                let link = watchBtn.attr('onclick')?.match(/'([^']+)'/)?.[1] || watchBtn.attr('href') || "";
                
                // Fallback for link in surrounding anchor
                if (!link) {
                    const anchor = row.closest('a') || row.find('a[href*="/game/"]');
                    link = anchor.attr('href') || "";
                }

                if (link && (text.includes(' vs ') || text.includes(' - '))) {
                    const teams = text.split(/\s+vs\s+|\s+-\s+/);
                    const logos: string[] = [];
                    row.find('img').each((i, img) => {
                        const src = $(img).attr('src');
                        if (src && !src.includes('placeholder')) {
                            logos.push(src.startsWith('http') ? src : `https://streamsports99.ru${src}`);
                        }
                    });
                    
                    const sportTag = row.find('span.bg-gray-800, .league-tag, .sport-tag').first().text().trim();
                    const timeStr = row.find('span.text-red-400, .time, .score').first().text().trim();

                    const home = teams[0]?.trim().split('\n').pop()?.trim() || "Team A";
                    const away = teams[1]?.trim().split('\n')[0]?.trim() || "Team B";

                    matches.push({
                        id: `ss99-${status}-${index}-${Date.now()}`,
                        homeTeam: home,
                        awayTeam: away,
                        homeTeamLogo: logos[0] || "",
                        awayTeamLogo: logos[1] || "",
                        status: status,
                        isLive: status === 'live',
                        kickoffTimeFormatted: timeStr || (status === 'live' ? "LIVE" : "TBD"),
                        link: link.startsWith('http') ? link : `https://streamsports99.ru${link}`,
                        league: sportTag || "StreamSports",
                        sport: sportTag || "Sports"
                    });
                }
            });
        };

        processSection('#live-matches-section', 'live');
        processSection('#upcoming-matches-section', 'upcoming');
        processSection('#todays-matches-section', 'upcoming'); // Treat today's as upcoming fixtures if not yet live

        // Fallback for general match rows if sections IDs changed
        if (matches.length === 0) {
            $('.match-item, [class*="game-row"]').each((index, element) => {
                const row = $(element);
                const text = row.text() || "";
                const link = row.find('a').attr('href') || "";
                if (link && text.includes(' vs ')) {
                    const teams = text.split(' vs ');
                    matches.push({
                        id: `ss99-gen-${index}`,
                        homeTeam: teams[0].trim(),
                        awayTeam: teams[1].trim(),
                        status: text.toLowerCase().includes('live') ? 'live' : 'upcoming',
                        isLive: text.toLowerCase().includes('live'),
                        link: link.startsWith('http') ? link : `https://streamsports99.ru${link}`,
                        sport: "Sports"
                    });
                }
            });
        }

        return matches;

    } catch (error) {
        console.error('Error in refined StreamSports scraping:', error);
        return [];
    }
}
