import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.goojara.to';

export interface DownloadResult {
    title: string;
    url: string;
    source: 'NetNaija' | 'FzMovies' | 'O2TvSeries' | 'ToxicWap' | 'YTS' | 'Waploaded' | 'CoolMovieZ' | 'MP4Mania' | 'Goojara';
    category?: string;
    quality?: string;
    date?: string;
}

const getHeaders = () => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': BASE_URL,
});

export const crawlGoojara = async (): Promise<DownloadResult[]> => {
    try {
        console.log(`Crawling Goojara (${BASE_URL})...`);
        const { data } = await axios.get(BASE_URL, { headers: getHeaders(), timeout: 15000 });
        const $ = cheerio.load(data);
        const results: DownloadResult[] = [];

        // Goojara structure (simplified for example - actual site structure may vary)
        $('.dflex').each((_, element) => {
            const titleElem = $(element).find('.m-title a, .it');
            const title = titleElem.text().trim();
            const href = titleElem.attr('href');

            const quality = $(element).find('.quality, .q').text().trim() || 'HD';
            const year = $(element).find('.year, .y').text().trim();

            if (title && href) {
                results.push({
                    title: year ? `${title} (${year})` : title,
                    url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
                    source: 'Goojara',
                    category: 'Movie', // Simplification, could be series
                    quality
                });
            }
        });

        console.log(`Found ${results.length} items on Goojara.`);
        return results.slice(0, 100);
    } catch (error) {
        console.error('Error crawling Goojara:', error);
        return [];
    }
};
