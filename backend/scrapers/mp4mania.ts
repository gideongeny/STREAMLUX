import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://mp4mania.com';

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

export const crawlMP4Mania = async (): Promise<DownloadResult[]> => {
    try {
        console.log(`Crawling MP4Mania (${BASE_URL})...`);
        const { data } = await axios.get(BASE_URL, { headers: getHeaders(), timeout: 15000 });
        const $ = cheerio.load(data);
        const results: DownloadResult[] = [];

        // MP4Mania structure
        $('article, .post, .movie-item, .entry').each((_, element) => {
            const titleElem = $(element).find('h2 a, h3 a, .entry-title a').first();
            const title = titleElem.text().trim();
            const href = titleElem.attr('href');

            const quality = $(element).text().match(/(MP4|3GP|720p|480p)/i)?.[0];

            if (title && href) {
                results.push({
                    title,
                    url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
                    source: 'MP4Mania',
                    category: 'Movie',
                    quality
                });
            }
        });

        console.log(`Found ${results.length} items on MP4Mania.`);
        return results.slice(0, 100);
    } catch (error) {
        console.error('Error crawling MP4Mania:', error);
        return [];
    }
};
