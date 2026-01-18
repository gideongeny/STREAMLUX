import axios from 'axios';
import * as cheerio from 'cheerio';
import { getAxiosConfigWithProxy } from '../utils/proxyRotation';

interface ScraperResult {
    title: string;
    url: string;
    quality?: string;
    isSeries?: boolean;
}

// GogoAnime Scraper (Anime)
export const scrapeGogoAnime = async (query: string): Promise<ScraperResult[]> => {
    try {
        const searchUrl = `https://gogoanime3.co/search.html?keyword=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, getAxiosConfigWithProxy(searchUrl));
        const $ = cheerio.load(data);
        const results: ScraperResult[] = [];

        $('.last_episodes ul li').each((_, element) => {
            const title = $(element).find('.name a').text().trim();
            const href = $(element).find('.name a').attr('href');
            const img = $(element).find('.img a img').attr('src');

            if (title && href) {
                results.push({
                    title,
                    url: href.startsWith('http') ? href : `https://gogoanime3.co${href}`,
                    quality: 'HD', // GogoAnime is mostly HD
                    isSeries: true
                });
            }
        });

        return results;
    } catch (error) {
        console.error('GogoAnime Scraper Error:', error);
        return [];
    }
};

// Dramacool Scraper (Asian Dramas)
export const scrapeDramacool = async (query: string): Promise<ScraperResult[]> => {
    try {
        // Base URL changes often, so using a known reliable mirror or making it configurable would be best
        const baseUrl = 'https://dramacool.pa';
        const searchUrl = `${baseUrl}/search?type=drama&keyword=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, getAxiosConfigWithProxy(searchUrl));
        const $ = cheerio.load(data);
        const results: ScraperResult[] = [];

        $('ul.list-episode-item li').each((_, element) => {
            const title = $(element).find('h3').text().trim();
            const href = $(element).find('a').attr('href');
            const time = $(element).find('.time').text().trim(); // often has date/year

            if (title && href) {
                results.push({
                    title,
                    url: href.startsWith('http') ? href : `${baseUrl}${href}`,
                    quality: 'HD',
                    isSeries: true
                });
            }
        });

        return results;
    } catch (error) {
        console.error('Dramacool Scraper Error:', error);
        return [];
    }
};

// OK.ru video search (Eastern European / General)
export const scrapeOkRu = async (query: string): Promise<ScraperResult[]> => {
    try {
        const searchUrl = `https://ok.ru/search/video?st.query=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, getAxiosConfigWithProxy(searchUrl));
        const $ = cheerio.load(data);
        const results: ScraperResult[] = [];

        $('.video-card').each((_, element) => {
            const title = $(element).find('.movie-title').text().trim();
            const href = $(element).find('a.video-card_lnk').attr('href');

            if (title && href) {
                results.push({
                    title,
                    url: href.startsWith('http') ? href : `https://ok.ru${href}`,
                    quality: 'Unknown',
                    isSeries: false // Assumption
                });
            }
        });

        return results;
    } catch (error) {
        console.error('OK.ru Scraper Error:', error);
        return [];
    }
}
