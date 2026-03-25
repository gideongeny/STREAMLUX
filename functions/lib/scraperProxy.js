"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyScrapers = void 0;
const functions = __importStar(require("firebase-functions"));
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
// Configuration
const FZMOVIES_BASE = 'https://www.fzmovies.ng';
const NETNAIJA_BASE = 'https://www.thenetnaija.net';
const getHeaders = (referer) => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Referer': referer,
});
/**
 * Search FzMovies
 */
async function searchFzMovies(query) {
    try {
        const searchUrl = `${FZMOVIES_BASE}/search.php?search=${encodeURIComponent(query)}&submit=Search`;
        const { data } = await axios_1.default.get(searchUrl, {
            headers: getHeaders(FZMOVIES_BASE),
            timeout: 8000
        });
        const $ = cheerio.load(data);
        const results = [];
        $('div.mainbox').each((_, element) => {
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
    }
    catch (e) {
        return [];
    }
}
/**
 * Search NetNaija
 */
async function searchNetNaija(query) {
    try {
        const searchUrl = `${NETNAIJA_BASE}/search?t=${encodeURIComponent(query)}&c=movies`;
        const { data } = await axios_1.default.get(searchUrl, {
            headers: getHeaders(NETNAIJA_BASE),
            timeout: 8000
        });
        const $ = cheerio.load(data);
        const results = [];
        $('.search-results .info').each((_, element) => {
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
    }
    catch (e) {
        return [];
    }
}
/**
 * Unified Scraper Proxy
 */
exports.proxyScrapers = functions
    .runWith({ memory: '512MB', timeoutSeconds: 60 })
    .https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    const { type, id, title } = req.body || req.query || {};
    if (!title && !id) {
        res.status(400).json({ error: "Missing 'title' or 'id' parameter." });
        return;
    }
    const searchQuery = title || id;
    try {
        const [fzMovies, netNaija] = await Promise.allSettled([
            searchFzMovies(searchQuery),
            searchNetNaija(searchQuery)
        ]);
        res.status(200).json({
            fzmovies: fzMovies.status === 'fulfilled' ? fzMovies.value : [],
            netnaija: netNaija.status === 'fulfilled' ? netNaija.value : [],
            type,
            id
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Scraper failed', details: error.message });
    }
});
//# sourceMappingURL=scraperProxy.js.map