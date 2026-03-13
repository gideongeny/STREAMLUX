import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

// Initialize Firebase Admin
admin.initializeApp();

const TMDB_API_KEY = "69ef02da25ccfbc48bfd094eb8e348f9";
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const YT_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Backend-only YouTube API Keys for Quota Rotation
const YT_KEYS = [
    "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc",
    "AIzaSyAQOFn1SVkbrQDJn7VeRMs5vAV1mYErImM",
    "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
    "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY",
    "AIzaSyBo8OwaCOTQsppnpaJV_nU9ollTlbI0chM",
    "AIzaSyBIV8LYYwPg5CWXn6W0aL5Z6P8-c_AATrY"
];

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
            if (rawPath.includes('tmdb')) {
                const endpoint = req.body.endpoint || req.query.endpoint || "/movie/popular";
                const params = { ...(req.body.params || {}), ...(req.query || {}) };
                delete params.endpoint;

                const response = await axios.get(`${TMDB_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
                    params: { ...params, api_key: TMDB_API_KEY }
                });
                res.status(200).json(response.data);
                return;
            }

            // --- YOUTUBE PROXY ---
            if (rawPath.includes('youtube')) {
                const endpoint = req.body.endpoint || req.query.endpoint || "/videos";
                const params = { ...(req.body.params || {}), ...(req.query || {}) };
                delete params.endpoint;
                delete params.context;

                let key = YT_KEYS[0];
                for (const k of YT_KEYS) {
                    if (!deadKeys.has(k)) { key = k; break; }
                }

                try {
                    const response = await axios.get(`${YT_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
                        params: { ...params, key }
                    });
                    res.status(200).json(response.data);
                    return;
                } catch (err: any) {
                    if (err.response?.status === 403) deadKeys.add(key);
                    throw err;
                }
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
