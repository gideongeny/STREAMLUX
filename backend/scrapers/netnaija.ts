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

export const searchNetNaija = async (query: string): Promise<DownloadResult[]> => {
    try {
        console.log(`Searching NetNaija for: ${query}`);
        const searchUrl = `${BASE_URL}/search?t=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, { headers: getHeaders(), timeout: 15000 });
        const $ = cheerio.load(data);
        const results: DownloadResult[] = [];

        $('.search-results .result-item, .file-one').each((_, element) => {
            const title = $(element).find('h3 a, h2 a').text().trim();
            const href = $(element).find('h3 a, h2 a').attr('href');
            const info = $(element).find('.info').text(); // May contain date/category

            if (title && href) {
                results.push({
                    title,
                    url: href,
                    source: 'NetNaija',
                    category: 'Search Result',
                    date: ''
                });
            }
        });

        console.log(`Found ${results.length} items on NetNaija.`);
        return results;
    } catch (error) {
        console.error('Error searching NetNaija:', error);
        return [];
    }
};

// Keep crawler for fallback or recent
export const crawlNetNaija = async (): Promise<DownloadResult[]> => {
    // ... existing implementation if needed, or remove
    return [];
};


