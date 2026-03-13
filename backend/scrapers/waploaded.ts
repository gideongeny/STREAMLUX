import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://waploaded.com';

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

export const crawlWaploaded = async (): Promise<DownloadResult[]> => {
    try {
        console.log(`Crawling Waploaded (${BASE_URL})...`);
        const { data } = await axios.get(`${BASE_URL}/category/movies`, {
            headers: getHeaders(),
            timeout: 15000
        });
        const $ = cheerio.load(data);
        const results: DownloadResult[] = [];

        // Waploaded has article/post structure
        $('article, .post-item, .movie-item').each((_, element) => {
            const titleElem = $(element).find('h2 a, h3 a, .entry-title a').first();
            const title = titleElem.text().trim();
            const href = titleElem.attr('href');

            const category = $(element).find('.category, .cat-links').text().trim() || 'Movie';

            if (title && href) {
                results.push({
                    title,
                    url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
                    source: 'Waploaded',
                    category
                });
            }
        });

        console.log(`Found ${results.length} items on Waploaded.`);
        return results.slice(0, 100);
    } catch (error) {
        console.error('Error crawling Waploaded:', error);
        return [];
    }
};
