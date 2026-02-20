import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://o2tvseries.com';

export const crawlO2TvSeries = async (): Promise<any[]> => {
    try {
        // O2 often redirects or has specific landing pages. We'll try the recently updated page or home.
        const url = `${BASE_URL}/search/list_all_tv_series`; // Or just base
        console.log(`Crawling O2TvSeries (${url})...`);

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });
        const $ = cheerio.load(data);
        const results: any[] = [];

        // O2 structure is often simple lists
        $('.data_list div').each((_, element) => {
            const link = $(element).find('a');
            const title = link.text().trim();
            const href = link.attr('href');

            if (title && href) {
                results.push({
                    title,
                    url: href,
                    source: 'O2TvSeries',
                    category: 'Series'
                });
            }
        });

        console.log(`Found ${results.length} items on O2TvSeries.`);
        return results.slice(0, 50); // Limit
    } catch (error) {
        console.error('Error crawling O2TvSeries:', error);
        return [];
    }
};


