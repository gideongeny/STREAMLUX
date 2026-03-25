import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import * as crypto from 'crypto';
// Removed defineString import

// Initialize Firebase Admin
admin.initializeApp();

import { scrapeAllSports } from './scrapers/footballScraper';
import { searchFzMovies, searchNetNaija, search123Movies } from './scrapers/movieScrapers'; 
import { resolveStream } from './resolver';

// Access Secure Parameters via process.env (loaded from .env)
const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || "";
const YT_KEYS_PARAM = process.env.YT_KEYS || ""; // Comma-separated
const SPORTMONKS_KEY = process.env.SPORTMONKS_KEY || "";
const APISPORTS_KEY = process.env.APISPORTS_KEY || "";
const SCOREBAT_TOKEN = process.env.SCOREBAT_TOKEN || "";
const OMDB_API_KEY = process.env.OMDB_API_KEY || "";
const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY || "";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const YT_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper to get YT Keys array
const getYTKeys = () => YT_KEYS_PARAM.split(',').map(k => k.trim());

const deadKeys = new Set<string>();

// Simple in-memory rate limiter (per instance)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute

/**
 * Consolidated Gateway Function
 * Handles TMDB, YouTube, and CORS/External proxies in one robust endpoint.
 */
export const gateway = functions
    .runWith({ 
        memory: '1GB', 
        timeoutSeconds: 120,
        secrets: [
            "TMDB_API_KEY",
            "TMDB_BEARER_TOKEN",
            "YT_KEYS",
            "SPORTMONKS_KEY",
            "APISPORTS_KEY",
            "SCOREBAT_TOKEN",
            "OMDB_API_KEY",
            "WATCHMODE_API_KEY",
            "RAPIDAPI_KEY"
        ]
    })
    .https.onRequest(async (req, res) => {
        // --- RATE LIMITING ---
        const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
        const now = Date.now();
        const info = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

        if (now > info.resetTime) {
            info.count = 1;
            info.resetTime = now + RATE_LIMIT_WINDOW;
        } else {
            info.count++;
        }
        rateLimitMap.set(ip, info);

        if (info.count > MAX_REQUESTS_PER_WINDOW) {
            console.warn(`Rate limit exceeded for IP: ${ip}`);
            res.status(429).send('Too many requests. Please try again later.');
            return;
        }

        // --- SECURITY HEADERS ---
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('X-Frame-Options', 'DENY');
        res.set('X-XSS-Protection', '1; mode=block');
        res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        
        // --- SECURE CORS ---
        const allowedOrigins = [
            'https://streamlux-67a84.web.app', 
            'https://streamlux-67a84.firebaseapp.com',
            'http://localhost:5173', // Dev
            'http://localhost:3000'  // Dev
        ];
        const origin = req.headers.origin;
        if (origin && allowedOrigins.includes(origin)) {
            res.set('Access-Control-Allow-Origin', origin);
        }
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        const reqPath = req.path || "";
        const rawPath = reqPath.replace(/^\/api\//, '').replace(/^\/+/, '');
        
        try {
            // --- OMDB PROXY (server-side key) ---
            if (rawPath === 'omdb' || rawPath.startsWith('omdb/')) {
                if (!OMDB_API_KEY) {
                    res.status(500).json({ error: 'OMDB_API_KEY not configured' });
                    return;
                }

                const params = { ...(req.query || {}), ...(req.body?.params || {}), ...(req.body || {}) } as any;
                delete params.params;

                const response = await axios.get(`https://www.omdbapi.com/`, {
                    params: { ...params, apikey: OMDB_API_KEY },
                    timeout: 10000
                });
                res.status(200).json(response.data);
                return;
            }

            // --- WATCHMODE PROXY (server-side key) ---
            if (rawPath === 'watchmode' || rawPath.startsWith('watchmode/')) {
                if (!WATCHMODE_API_KEY) {
                    res.status(500).json({ error: 'WATCHMODE_API_KEY not configured' });
                    return;
                }

                const subPath = rawPath.replace(/^watchmode\/?/, '');
                const target = `https://api.watchmode.com/v1/${subPath}`;
                const params = { ...(req.query || {}), ...(req.body || {}) } as any;

                const response = await axios.get(target, {
                    params: { ...params, apiKey: WATCHMODE_API_KEY },
                    timeout: 10000
                });
                res.status(200).json(response.data);
                return;
            }

            // --- RAPIDAPI PROXY (server-side key) ---
            if (rawPath === 'rapidapi/streaming-availability' || rawPath.startsWith('rapidapi/streaming-availability/')) {
                if (!RAPIDAPI_KEY) {
                    res.status(500).json({ error: 'RAPIDAPI_KEY not configured' });
                    return;
                }

                const subPath = rawPath.replace(/^rapidapi\/streaming-availability\/?/, '');
                const target = `https://streaming-availability.p.rapidapi.com/${subPath}`;
                const params = { ...(req.query || {}), ...(req.body || {}) } as any;

                const response = await axios.get(target, {
                    params,
                    headers: {
                        'X-RapidAPI-Key': RAPIDAPI_KEY,
                        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
                        'Accept': 'application/json'
                    },
                    timeout: 10000
                });
                res.status(200).json(response.data);
                return;
            }

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

            // --- YOUTUBE PROXY WITH ROBUST ROTATION & CACHE ---
            if (rawPath.includes('youtube')) {
                const endpoint = req.body.endpoint || req.query.endpoint || "/videos";
                const params = { ...(req.body.params || {}), ...(req.query || {}) };
                const context = params.context as string;
                const noCache = params.noCache === 'true' || params.noCache === true;
                
                delete params.endpoint;
                delete params.retryCount;
                delete params.context;
                delete params.noCache;

                // Hash request for cache lookup
                const rawKey = `${endpoint}_${JSON.stringify(params)}`;
                const cacheId = crypto.createHash('sha256').update(rawKey).digest('hex');

                if (!noCache) {
                    try {
                        const cacheDoc = await admin.firestore().collection('youtube_cache').doc(cacheId).get();
                        if (cacheDoc.exists) {
                            const data = cacheDoc.data();
                            if (data && (Date.now() - data.timestamp < 48 * 60 * 60 * 1000)) {
                                res.status(200).json(data.payload);
                                return;
                            }
                        }
                    } catch (e) {}
                }

                // Build candidate keys
            const ytKeys = getYTKeys();
            const candidates: string[] = [];
            const sportsKey = SPORTMONKS_KEY; // Re-use for YT context if applicable
            
            if (context === "sports" && !deadKeys.has(sportsKey)) {
                candidates.push(sportsKey);
            }

            for (const k of ytKeys) {
                if (!deadKeys.has(k)) candidates.push(k);
            }

            if (candidates.length === 0) {
                deadKeys.clear();
                candidates.push(...ytKeys);
            }
    

                let lastError: any = null;
                for (const key of candidates) {
                    try {
                        const response = await axios.get(`${YT_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
                            params: { ...params, key },
                            timeout: 8000
                        });
                        
                        // Cache background
                        admin.firestore().collection('youtube_cache').doc(cacheId).set({
                            timestamp: Date.now(),
                            payload: response.data,
                            endpoint
                        }).catch(() => {});

                        res.status(200).json(response.data);
                        return;
                    } catch (err: any) {
                        lastError = err;
                        if (err.response?.status === 403) {
                            deadKeys.add(key);
                            continue;
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
                        targetUrl = `https://api.sportmonks.com/v3/football${endpoint}`;
                        const smParams = { ...params, api_token: SPORTMONKS_KEY };
                        const smResponse = await axios.get(targetUrl, { params: smParams });
                        res.status(200).json(smResponse.data);
                        return;

                    case "apisports":
                        targetUrl = `https://v3.football.api-sports.io${endpoint}`;
                        const asResponse = await axios.get(targetUrl, { 
                            params, 
                            headers: { ...headers, "x-apisports-key": APISPORTS_KEY } 
                        });
                        res.status(200).json(asResponse.data);
                        return;

                    case "scorebat":
                        targetUrl = "https://www.scorebat.com/video-api/v3/feed/";
                        const sbResponse = await axios.get(targetUrl, { 
                            params: { ...params, token: SCOREBAT_TOKEN } 
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
                    case "all-sports":
                        const scrapedMatches = await scrapeAllSports();
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
                const [fz, net, movie123] = await Promise.allSettled([
                    searchFzMovies(query),
                    searchNetNaija(query),
                    search123Movies(query)
                ]);
                res.status(200).json({
                    fzmovies: fz.status === 'fulfilled' ? fz.value : [],
                    netnaija: net.status === 'fulfilled' ? net.value : [],
                    movies123: movie123.status === 'fulfilled' ? movie123.value : [],
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

/**
 * Scheduled Function: Notify users of new trending content
 * Runs every 12 hours
 */
export const notifyTrendingContent = functions.pubsub
    .schedule('every 12 hours')
    .onRun(async (context) => {
        try {
            if (!TMDB_API_KEY) {
                console.warn("TMDB_API_KEY not configured; skipping notifyTrendingContent.");
                return null;
            }
            // 1. Fetch trending content from TMDB
        const response = await axios.get(`${TMDB_BASE_URL}/trending/all/day`, {
            params: { api_key: TMDB_API_KEY },
            headers: { 'Authorization': `Bearer ${TMDB_BEARER_TOKEN}` }
        });
    
            const topItem = response.data.results[0];
            if (!topItem) return null;

            const title = topItem.title || topItem.name;
            const type = topItem.media_type === "movie" ? "movie" : "tv";
            const imageUrl = topItem.poster_path ? `https://image.tmdb.org/t/p/w780${topItem.poster_path}` : undefined; // Higher res for big picture

            // Catchy message templates
            const getCatchyMessage = (itemTitle: string, itemType: string) => {
                const templates = [
                    { title: `🔥 Trending Now: ${itemTitle}`, body: `Everyone is talking about this. Watch the buzz now on StreamLux!` },
                    { title: `🍿 Movie Night?`, body: `${itemTitle} is topping the charts today. Ready to watch?` },
                    { title: `✨ New for You`, body: `We found something you'll love: ${itemTitle}. Check it out!` },
                    { title: `🎬 Now Playing`, body: `Start streaming ${itemTitle} and more trending ${itemType}s on StreamLux.` },
                    { title: `🌟 Direct from TMDB`, body: `${itemTitle} is the #1 trending ${itemType} right now!` }
                ];
                // Add specific template for Pirates/Jack Sparrow style if title matches loosely (just an example of how to scale)
                if (itemTitle.toLowerCase().includes('pirate') || itemTitle.toLowerCase().includes('jack')) {
                    return { title: `Ready to set sail?`, body: `Captain Jack Sparrow is waiting for you in ${itemTitle}!` };
                }
                return templates[Math.floor(Math.random() * templates.length)];
            };

            const content = getCatchyMessage(title, type);

            // 2. Query all users from Firestore who have FCM tokens
            const usersSnapshot = await admin.firestore().collection('users').where('fcmTokens', '!=', null).get();
            
            const allTokens: string[] = [];
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
                    allTokens.push(...data.fcmTokens);
                }
            });

            if (allTokens.length === 0) {
                console.log('No FCM tokens found to notify.');
                return null;
            }

            // Remove duplicates and limit for multicast (max 500 tokens per call)
            const uniqueTokens = Array.from(new Set(allTokens)).slice(0, 500);

            // 3. Send Multicast Message
            const message: admin.messaging.MulticastMessage = {
                tokens: uniqueTokens,
                notification: {
                    title: content.title,
                    body: content.body,
                    imageUrl: imageUrl
                },
                data: {
                    type: 'trending',
                    id: String(topItem.id),
                    mediaType: type,
                    url: `/${type}/${topItem.id}`,
                    image: imageUrl || ''
                },
                android: {
                    priority: 'high',
                    ttl: 3600 * 1000, // 1 hour
                    notification: {
                        channelId: 'trending',
                        sticky: false,
                        visibility: 'public',
                        icon: 'mipmap/ic_launcher',
                        color: '#E50914',
                        imageUrl: imageUrl // Redundant for some SDK versions
                    }
                },
                webpush: {
                    fcmOptions: {
                        link: `/${type}/${topItem.id}`
                    },
                    notification: {
                        icon: '/logo.svg',
                        image: imageUrl
                    }
                }
            };

            const responseFCM = await admin.messaging().sendEachForMulticast(message);
            console.log(`Successfully sent ${responseFCM.successCount} trending notifications for ${title}.`);

            return null;
        } catch (error: any) {
            console.error('Error in notifyTrendingContent:', error.message);
            return null;
        }
    });

// Premium System: Manual Upgrades only. Ad-Free Guards are preserved in frontend.
