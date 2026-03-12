import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from "cheerio";

const FZMOVIES_BASE = 'https://www.fzmovies.ng';
const NETNAIJA_BASE = 'https://www.thenetnaija.net';

const getHeaders = (referer: string) => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Referer': referer,
});

async function searchFzMovies(query: string) {
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

async function searchNetNaija(query: string) {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const query = { ...(req.query || {}), ...(req.body || {}) };
  const { type, id, title } = query;

  if (!title && !id) {
    return res.status(400).json({ error: "Missing 'title' or 'id' parameter." });
  }

  const searchQuery = title || id;

  try {
    const [fzMovies, netNaija] = await Promise.allSettled([
      searchFzMovies(searchQuery),
      searchNetNaija(searchQuery)
    ]);

    return res.status(200).json({
      fzmovies: fzMovies.status === 'fulfilled' ? fzMovies.value : [],
      netnaija: netNaija.status === 'fulfilled' ? netNaija.value : [],
      type,
      id
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Scraper failed', details: error.message });
  }
}
