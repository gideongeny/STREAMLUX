import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

// Initialize Firebase Admin
admin.initializeApp();

import { scrapeSportsLiveToday } from './scrapers/footballScraper';
import { searchFzMovies, searchNetNaija } from './scrapers/movieScrapers'; // I'll create this to clean up
import { resolveStream } from './resolver';

const TMDB_API_KEY = "69ef02da25ccfbc48bfd094eb8e348f9";
const TMDB_BEARER_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMDllNmYwZTIxMzYwM2IxY2RhNmY0ODk5ODdjZmY3NCIsIm5iZiI6MTc1NDgyNjU1Mi4zMTcsInN1YiI6IjY4OTg4NzM4NzczZjAxYzIzNDVkMGRlYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.G0DnSMJ9PjLOM8Q9uBf6YruODK27kipmcFshPn0VfL0";
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const YT_BASE_URL = 'https://www.googleapis.com/youtube/v3';

const YT_KEYS = [
    "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc",
    "AIzaSyAQOFn1SVkbrQDJn7VeRMs5vAV1mYErImM",
    "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
    "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY",
    "AIzaSyBo8OwaCOTQsppnpaJV_nU9ollTlbI0chM",
    "AIzaSyBIV8LYYwPg5CWXn6W0aL5Z6P8-c_AATrY"
];

const SPECIAL_KEYS: Record<string, string> = {
    "sports": "AIzaSyBo8OwaCOTQsppnpaJV_nU9ollTlbI0chM",
    "entertainment": "AIzaSyBIV8LYYwPg5CWXn6W0aL5Z6P8-c_AATrY"
};

const deadKeys = new Set<string>();

/**
 * Consolidated Gateway Function
 * Handles TMDB, YouTube, and CORS/External proxies in one robust endpoint.
 */
export const gateway = functions
    .runWith({ memory: '1GB', timeoutSeconds: 120 })
    .https.onRequest(async (req, res) => {
        // Standard CORS
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        const reqPath = req.path || "";
        const rawPath = reqPath.replace(/^\/api\//, '').replace(/^\/+/, '');
        
        try {
            // --- TMDB PROXY ---
            // Stricter matching: only if path strictly includes 'tmdb'
            if (rawPath === 'tmdb' || rawPath.startsWith('proxy/tmdb') || rawPath.includes('tmdb')) {
                // FALLBACK: Extract endpoint from the URL if not in body/query
                // e.g. /api/proxy/tmdb/movie/123 -> /movie/123
                let endpoint = req.body.endpoint || req.query.endpoint;
                
                if (!endpoint && rawPath.includes('tmdb/')) {
                    endpoint = '/' + rawPath.split('tmdb/')[1];
                }
                
                if (!endpoint) endpoint = "/movie/popular";

                const params = { ...(req.body.params || {}), ...(req.query || {}) };
                delete params.endpoint;

                const response = await axios.get(`${TMDB_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
                    params: { ...params, api_key: TMDB_API_KEY },
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`
                    }
                });
                res.status(200).json(response.data);
                return;
            }

            // --- YOUTUBE PROXY WITH ROBUST ROTATION ---
            if (rawPath.includes('youtube')) {
                const endpoint = req.body.endpoint || req.query.endpoint || "/videos";
                const params = { ...(req.body.params || {}), ...(req.query || {}) };
                const context = params.context as string;
                delete params.endpoint;
                delete params.retryCount;
                delete params.context;

                // Build candidate keys: context key first, then all others
                const candidates = [];
                if (context && SPECIAL_KEYS[context] && !deadKeys.has(SPECIAL_KEYS[context])) {
                    candidates.push(SPECIAL_KEYS[context]);
                }
                for (const k of YT_KEYS) {
                    if (!deadKeys.has(k) && k !== SPECIAL_KEYS[context]) candidates.push(k);
                }
                
                // If all dead, reset once
                if (candidates.length === 0) {
                    deadKeys.clear();
                    candidates.push(...YT_KEYS);
                }

                let lastError: any = null;
                for (const key of candidates) {
                    try {
                        const response = await axios.get(`${YT_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
                            params: { ...params, key },
                            timeout: 8000
                        });
                        res.status(200).json(response.data);
                        return;
                    } catch (err: any) {
                        lastError = err;
                        if (err.response?.status === 403) {
                            deadKeys.add(key);
                            continue; // Try next key
                        }
                        throw err;
                    }
                }
                throw lastError || new Error("All YouTube keys exhausted");
            }

            // --- CORS / EXTERNAL PROXY ---
            if (rawPath.includes('proxy/external') || rawPath.includes('external')) {
                const { provider, endpoint, params } = { ...(req.query || {}), ...(req.body || {}) };
                if (!provider) {
                    res.status(400).json({ error: 'Missing provider parameter' });
                    return;
                }

                let targetUrl = "";
                let headers: any = {
                    'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
                };

                switch (provider) {
                    case "sportmonks":
                        const smKey = "pWJ9QW6z7Y6U0uI4R8K9O2Q7L5V3M1N0";
                        targetUrl = `https://api.sportmonks.com/v3/football${endpoint}`;
                        const smParams = { ...params, api_token: smKey };
                        const smResponse = await axios.get(targetUrl, { params: smParams });
                        res.status(200).json(smResponse.data);
                        return;

                    case "apisports":
                        const asKey = "418210481bfff05ff4c1a61d285a0942";
                        targetUrl = `https://v3.football.api-sports.io${endpoint}`;
                        const asResponse = await axios.get(targetUrl, { 
                            params, 
                            headers: { ...headers, "x-apisports-key": asKey } 
                        });
                        res.status(200).json(asResponse.data);
                        return;

                    case "scorebat":
                        const sbToken = "Mjc3ODY0XzE3NzE3NjU0MTNfZWFiMWQ1NGRmOTkxNTY3ZjgxNjQ4Y2IyNDMyMTYxYjU2NmZiZjZhMA==";
                        targetUrl = "https://www.scorebat.com/video-api/v3/feed/";
                        const sbResponse = await axios.get(targetUrl, { 
                            params: { ...params, token: sbToken } 
                        });
                        res.status(200).json(sbResponse.data);
                        return;

                    case "espn":
                        targetUrl = `https://site.api.espn.com/apis/site/v2/sports${endpoint}`;
                        const espnResponse = await axios.get(targetUrl, { params });
                        res.status(200).json(espnResponse.data);
                        return;

                    case "thesportsdb":
                        targetUrl = `https://www.thesportsdb.com/api/v1/json/3${endpoint}`;
                        const tsdbResponse = await axios.get(targetUrl, { params });
                        res.status(200).json(tsdbResponse.data);
                        return;

                    case "sportslivetoday":
                        const scrapedMatches = await scrapeSportsLiveToday();
                        res.status(200).json({ success: true, response: scrapedMatches });
                        return;

                    default:
                        // Generic proxy fallback
                        const url = req.query.url as string || req.body.url as string;
                        if (!url) {
                            res.status(400).json({ error: 'Unsupported provider and missing target URL' });
                            return;
                        }
                        const response = await axios.get(url, {
                            headers: { ...headers, 'Referer': new URL(url).origin },
                            responseType: 'stream'
                        });
                        res.set('Content-Type', response.headers['content-type']);
                        response.data.pipe(res);
                        return;
                }
            }

            // --- MOVIE/TV SCRAPERS ---
            if (rawPath.includes('scrapers') || rawPath.includes('proxy/scrapers')) {
                const { title, id } = { ...(req.query || {}), ...(req.body || {}) };
                const query = title || id;
                if (!query) {
                    res.status(400).json({ error: 'Missing title or id for scraper' });
                    return;
                }
                const [fz, net] = await Promise.allSettled([
                    searchFzMovies(query),
                    searchNetNaija(query)
                ]);
                res.status(200).json({
                    fzmovies: fz.status === 'fulfilled' ? fz.value : [],
                    netnaija: net.status === 'fulfilled' ? net.value : [],
                    success: true
                });
                return;
            }

            // --- STREAM RESOLVER ---
            if (rawPath.includes('resolve')) {
                const { url } = { ...(req.query || {}), ...(req.body || {}) };
                if (!url) {
                    res.status(400).json({ error: 'Missing url for resolution' });
                    return;
                }
                const result = await resolveStream(url);
                res.status(200).json(result);
                return;
            }

            // --- HEALTH CHECK ---
            if (rawPath.includes('health')) {
                res.status(200).json({ 
                    status: 'online', 
                    gateway: 'consolidated-v2-sports',
                    timestamp: Date.now() 
                });
                return;
            }

            res.status(404).json({ error: 'Gateway route not found', path: rawPath });

        } catch (error: any) {
            console.error('[Gateway Error]', error.message);
            res.status(error.response?.status || 500).json({
                error: 'Gateway failed to fetch upstream',
                details: error.message
            });
        }
    });

// Maintain back-compat exports
export { proxyTMDB } from './tmdbProxy';
export { proxyYouTube } from './youtubeProxy';
export { proxyExternalAPI } from './externalProxy';
export { proxyScrapers } from './scraperProxy';
export { corsProxy as proxy } from './corsProxy';
export { resolveStream } from './resolver';
