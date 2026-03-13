import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://coolmoviez.live';

export interface DownloadResult {
    title: string;
    url: string;
    source: 'NetNaija' | 'FzMovies' | 'O2TvSeries' | 'ToxicWap' | 'YTS' | 'Waploaded' | 'CoolMovieZ' | 'MP4Mania';
    category?: string;
    quality?: string;
    date?: string;
}

const getHeaders = () => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': BASE_URL,
});

export const crawlCoolMovieZ = async (): Promise<DownloadResult[]> => {
    try {
        console.log(`Crawling CoolMovieZ (${BASE_URL})...`);
        const { data } = await axios.get(BASE_URL, { headers: getHeaders(), timeout: 15000 });
        const $ = cheerio.load(data);
        const results: DownloadResult[] = [];

        // Generic selectors for movie listings
        $('article, .movie, .post, .item').each((_, element) => {
            const titleElem = $(element).find('h2 a, h3 a, .title a, a[title]').first();
            const title = titleElem.text().trim() || titleElem.attr('title')?.trim();
            const href = titleElem.attr('href');

            const quality = $(element).text().match(/(MP4|720p|1080p|HD)/i)?.[0];

            if (title && href) {
                results.push({
                    title,
                    url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
                    source: 'CoolMovieZ',
                    category: 'Movie',
                    quality
                });
            }
        });

        console.log(`Found ${results.length} items on CoolMovieZ.`);
        return results.slice(0, 100);
    } catch (error) {
        console.error('Error crawling CoolMovieZ:', error);
        return [];
    }
};
