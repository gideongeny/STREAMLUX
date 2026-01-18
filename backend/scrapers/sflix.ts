import axios from 'axios';
import * as cheerio from 'cheerio';
import { getAxiosConfigWithProxy } from '../utils/proxyRotation';

export const scrapeSFlix = async (query: string): Promise<any[]> => {
    try {
        const searchUrl = `https://sflix.to/search/${encodeURIComponent(query.replace(/ /g, '-'))}`;
        const { data } = await axios.get(searchUrl, getAxiosConfigWithProxy(searchUrl));
        const $ = cheerio.load(data);
        const results: any[] = [];

        $('.flw-item').each((_, element) => {
            const title = $(element).find('.film-name a').text().trim();
            const href = $(element).find('.film-name a').attr('href');
            const poster = $(element).find('.film-poster img').attr('data-src');
            const quality = $(element).find('.film-poster .pick').text().trim();
            const type = $(element).find('.fdi-item').first().text().trim(); // Movie or TV

            if (title && href) {
                results.push({
                    title,
                    url: href.startsWith('http') ? href : `https://sflix.to${href}`,
                    quality: quality || 'HD',
                    type: type,
                    source: 'SFlix'
                });
            }
        });

        return results;
    } catch (error) {
        console.error('SFlix Scraper Error:', error);
        return [];
    }
};
