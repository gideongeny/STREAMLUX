import axios from "axios";
import * as cheerio from "cheerio";

const FZMOVIES_BASE = 'https://www.fzmovies.ng';
const NETNAIJA_BASE = 'https://www.thenetnaija.net';

const getHeaders = (referer: string) => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': referer,
});

export async function searchFzMovies(query: string) {
    try {
        const searchUrl = `${FZMOVIES_BASE}/search.php?search=${encodeURIComponent(query)}&submit=Search`;
        const { data } = await axios.get(searchUrl, { 
            headers: getHeaders(FZMOVIES_BASE),
            timeout: 8000 
        });
        const $ = cheerio.load(data);
        const results: any[] = [];

        $('div.mainbox').each((_: number, element: any) => {
            const link = $(element).find('a').first();
            const title = link.text().trim();
            const href = link.attr('href');
            if (title && href) {
                results.push({
                    title,
                    url: href.startsWith('http') ? href : `${FZMOVIES_BASE}/${href}`,
                    quality: $(element).text().includes('HD') ? 'HD' : 'SD'
                });
            }
        });
        return results;
    } catch (e) {
        return [];
    }
}

export async function searchNetNaija(query: string) {
    try {
        const searchUrl = `${NETNAIJA_BASE}/search?t=${encodeURIComponent(query)}&c=movies`;
        const { data } = await axios.get(searchUrl, { 
            headers: getHeaders(NETNAIJA_BASE),
            timeout: 8000 
        });
        const $ = cheerio.load(data);
        const results: any[] = [];

        $('.search-results .info').each((_: number, element: any) => {
            const link = $(element).find('h2 a');
            const title = link.text().trim();
            const href = link.attr('href');
            if (title && href) {
                results.push({
                    title,
                    url: href.startsWith('http') ? href : `${NETNAIJA_BASE}${href}`
                });
            }
        });
        return results;
    } catch (e) {
        return [];
    }
}

export async function search123Movies(query: string) {
    try {
        const BASE_URL = 'https://123movies.hk';
        const searchUrl = `${BASE_URL}/search/${encodeURIComponent(query).replace(/%20/g, '-')}`;
        const { data } = await axios.get(searchUrl, { 
            headers: getHeaders(BASE_URL),
            timeout: 10000 
        });
        const $ = cheerio.load(data);
        const results: any[] = [];

        $('.ml-item').each((_: number, element: any) => {
            const link = $(element).find('a').first();
            const title = $(element).find('.mli-info h2').text().trim() || link.attr('title') || "";
            const href = link.attr('href');
            const quality = $(element).find('.mli-quality').text().trim();
            
            if (href && title) {
                results.push({
                    title,
                    url: href.startsWith('http') ? href : href.startsWith('/') ? `${BASE_URL}${href}` : `${BASE_URL}/${href}`,
                    quality: quality || 'HD',
                    source: '123Movies'
                });
            }
        });
        return results;
    } catch (e) {
        return [];
    }
}
