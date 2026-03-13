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
            if (rawPath.includes('proxy') || rawPath.includes('url')) {
                const targetUrl = req.query.url as string || req.body.url as string;
                if (!targetUrl) {
                    res.status(400).json({ error: 'Missing target URL' });
                    return;
                }

                const response = await axios.get(targetUrl, {
                    headers: {
                        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
                        'Referer': new URL(targetUrl).origin
                    },
                    responseType: 'stream'
                });

                res.set('Content-Type', response.headers['content-type']);
                response.data.pipe(res);
                return;
            }

            // --- HEALTH CHECK ---
            if (rawPath.includes('health')) {
                res.status(200).json({ 
                    status: 'online', 
                    gateway: 'consolidated-v2',
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
