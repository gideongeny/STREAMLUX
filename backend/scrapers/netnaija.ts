import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.thenetnaija.net';

export interface DownloadResult {
    title: string;
    url: string;
    source: 'NetNaija' | 'FzMovies' | 'O2TvSeries';
    category?: string;
    date?: string;
}

const getHeaders = () => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': BASE_URL,
});

export const crawlNetNaija = async (): Promise<DownloadResult[]> => {
    try {
        console.log(`Crawling NetNaija (${BASE_URL})...`);
        const { data } = await axios.get(BASE_URL, { headers: getHeaders(), timeout: 15000 });
        const $ = cheerio.load(data);
        const results: DownloadResult[] = [];

        // Scrape "Recent Movies" or similar sections
        $('.file-one').each((_, element) => {
            const title = $(element).find('h2 a').text().trim();
            const href = $(element).find('h2 a').attr('href');
            const category = $(element).find('.category').text().trim();
            const date = $(element).find('.date').text().trim();

            if (title && href) {
                results.push({
                    title,
                    url: href, // NetNaija usually has full URLs or relative
                    source: 'NetNaija',
                    category: category || 'Movie',
                    date
                });
            }
        });

        // Also check "Trending" or other lists if available on home
        // This is a basic scrape of the main feed

        console.log(`Found ${results.length} items on NetNaija.`);
        return results;
    } catch (error) {
        console.error('Error crawling NetNaija:', error);
        return [];
    }
};


