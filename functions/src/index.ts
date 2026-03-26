import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import * as crypto from 'crypto';
// Removed defineString import

// Initialize Firebase Admin
admin.initializeApp();

import { scrapeAllSports } from './scrapers/footballScraper';
import { scrapeStreamSports } from './scrapers/streamSportsScraper';
import { searchFzMovies, searchNetNaija, search123Movies } from './scrapers/movieScrapers'; 
import { resolveStream } from './resolver';

// Access Secure Parameters via process.env (loaded from .env)
const TMDB_API_KEY = (process.env.TMDB_API_KEY || "").trim();
const TMDB_BEARER_TOKEN = (process.env.TMDB_BEARER_TOKEN || "").trim();
const YT_KEYS_PARAM = (process.env.YT_KEYS || "").trim(); // Comma-separated
const SPORTMONKS_KEY = (process.env.SPORTMONKS_KEY || "").trim();
const APISPORTS_KEY = (process.env.APISPORTS_KEY || "").trim();
const SCOREBAT_TOKEN = (process.env.SCOREBAT_TOKEN || "").trim();
const OMDB_API_KEY = (process.env.OMDB_API_KEY || "").trim();
const WATCHMODE_API_KEY = (process.env.WATCHMODE_API_KEY || "").trim();
const RAPIDAPI_KEY = (process.env.RAPIDAPI_KEY || "").trim();

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
        } else {
            res.set('Access-Control-Allow-Origin', '*'); // Fallback to accept custom Vercel deployments seamlessly
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
            // --- SPORTS AGGREGATION (server-side, no client placeholders) ---
            if (rawPath === 'sports/live' || rawPath === 'sports/upcoming') {
                const wantLive = rawPath.endsWith('/live');
                const fixtures: any[] = [];

                const mapEspnEvent = (event: any) => {
                    const comp = event?.competitions?.[0];
                    const competitors = comp?.competitors || [];
                    
                    const leagueName = event?.league?.name || event?.season?.name || "Live Sports";
                    const isCompetition = 
                        leagueName.toLowerCase().includes('formula 1') || 
                        leagueName.toLowerCase().includes('f1') ||
                        leagueName.toLowerCase().includes('motogp') ||
                        leagueName.toLowerCase().includes('nascar') ||
                        leagueName.toLowerCase().includes('golf') ||
                        competitors.length < 2;

                    const home = competitors.find((c: any) => c.homeAway === 'home') || competitors[0];
                    const away = competitors.find((c: any) => c.homeAway === 'away') || competitors[1];

                    // If it's a competition and we only have 1 or 0 "real" teams, we handle it specially
                    if (!home?.team && !event.name) return null;

                    const statusName = event?.status?.type?.name || '';
                    const isLive =
                        statusName.includes('LIVE') ||
                        statusName.includes('IN_PROGRESS') ||
                        statusName.includes('STATUS_IN_PROGRESS');

                    const kickoffDate = event?.date ? new Date(event.date) : null;
                    const now = new Date();

                    // STRICT FILTER: If not live and started > 3 hours ago, it's a stale past match
                    if (!isLive && kickoffDate && kickoffDate.getTime() < now.getTime() - (3 * 3600000)) {
                        return null;
                    }

                    if (wantLive && !isLive) return null;

                    return {
                        id: `espn-${event.id}`,
                        leagueId: "epl",
                        leagueName: leagueName,
                        homeTeam: isCompetition ? (event.shortName || event.name) : (home?.team?.displayName || "Team A"),
                        awayTeam: isCompetition ? (comp?.venue?.fullName || "") : (away?.team?.displayName || "Team B"),
                        homeTeamLogo: home?.team?.logo,
                        awayTeamLogo: away?.team?.logo,
                        status: wantLive ? "live" : (isLive ? "live" : "upcoming"),
                        isLive: isLive,
                        homeScore: home?.score ? Number(home.score) : 0,
                        awayScore: away?.score ? Number(away.score) : 0,
                        minute: event?.status?.displayClock || event?.status?.type?.shortDetail,
                        venue: comp?.venue?.fullName || "Stadium",
                        kickoffTimeFormatted: kickoffDate ? kickoffDate.toISOString() : "",
                        isCompetition: isCompetition
                    };
                };

                // ESPN scoreboards (free / stable)
                const espnEndpoints = [
                    "/soccer/eng.1/scoreboard",
                    "/soccer/uefa.champions/scoreboard",
                    "/soccer/uefa.europa/scoreboard",
                    "/soccer/uefa.euro/scoreboard",
                    "/soccer/uefa.nations/scoreboard",
                    "/soccer/fifa.world/scoreboard",
                    "/soccer/fifa.worldq/scoreboard",
                    "/soccer/fifa.friendly/scoreboard",
                    "/soccer/esp.1/scoreboard",
                    "/soccer/ger.1/scoreboard",
                    "/soccer/ita.1/scoreboard",
                    "/soccer/fra.1/scoreboard",
                    "/soccer/usa.1/scoreboard",
                    "/soccer/mex.1/scoreboard",
                    "/soccer/bra.1/scoreboard",
                    "/soccer/arg.1/scoreboard",
                    "/soccer/scoreboard", // General aggregate
                    "/basketball/nba/scoreboard",
                    "/basketball/mens-college-basketball/scoreboard",
                    "/football/nfl/scoreboard",
                    "/baseball/mlb/scoreboard",
                    "/hockey/nhl/scoreboard",
                    "/mma/ufc/scoreboard",
                    "/racing/f1/scoreboard",
                ];

                // Fetch for Today AND Tomorrow to guarantee UPCOMING global sports exist even during late-night hours
                // We add a 3-hour buffer to 'now' to ensure we roll over to 'Today' slightly earlier, matching night-owl viewing habits
                const dateObj = new Date(Date.now() + (3 * 3600000)); 
                const todayStr = dateObj.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
                
                dateObj.setDate(dateObj.getDate() + 1);
                const tomorrowStr = dateObj.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD

                const espnRequests: Promise<any>[] = [];

                espnEndpoints.forEach((endpoint) => {
                    // Fetch Today
                    espnRequests.push(
                        axios.get(`https://site.api.espn.com/apis/site/v2/sports${endpoint}?dates=${todayStr}`, { timeout: 8000 })
                    );
                    // Fetch Tomorrow (Only if we want Upcoming, saves API calls for Live)
                    if (!wantLive) {
                        espnRequests.push(
                            axios.get(`https://site.api.espn.com/apis/site/v2/sports${endpoint}?dates=${tomorrowStr}`, { timeout: 8000 })
                        );
                    }
                });

                const espnResults = await Promise.allSettled(espnRequests);

                for (const r of espnResults) {
                    if (r.status !== "fulfilled") continue;
                    const events = r.value.data?.events;
                    if (!Array.isArray(events)) continue;
                    
                    // Allow up to 60 events per endpoint slice to ensure wealthy diversity!
                    for (const e of events.slice(0, 60)) {
                        const mapped = mapEspnEvent(e);
                        // Prevent duplicates if multiple queries return the same event
                        if (mapped && !fixtures.some(f => f.id === mapped.id)) {
                            fixtures.push(mapped);
                        }
                    }
                }

                // TheSportsDB fallback (no key required)
                try {
                    const d = new Date();
                    const todayUrl = d.toISOString().split("T")[0].replace(/-/g, "-"); 
                    d.setDate(d.getDate() + 1);
                    const tomorrowUrl = d.toISOString().split("T")[0].replace(/-/g, "-");

                    const requests = [
                        axios.get("https://www.thesportsdb.com/api/v1/json/3/eventsday.php", {
                            params: { d: todayUrl },
                            timeout: 8000,
                        })
                    ];
                    
                    if (!wantLive) {
                        requests.push(
                            axios.get("https://www.thesportsdb.com/api/v1/json/3/eventsday.php", {
                                params: { d: tomorrowUrl },
                                timeout: 8000,
                            })
                        );
                    }

                    const tsdbResults = await Promise.allSettled(requests);
                    let allEvents: any[] = [];
                    
                    for(const r of tsdbResults) {
                        if (r.status === "fulfilled" && Array.isArray(r.value.data?.events)) {
                            allEvents.push(...r.value.data.events);
                        }
                    }

                    if (allEvents.length > 0) {
                        const now = Date.now();
                        const filtered = allEvents.filter((e: any) => {
                            const status = String(e.strStatus || "").toLowerCase();
                            const isLive = status.includes("live");
                            
                            // Temporal filter for TSDB
                            const kickoff = e.dateEvent ? new Date(`${e.dateEvent}T${e.strTime || '00:00:00'}`) : null;
                            if (!isLive && kickoff && kickoff.getTime() < now - (3 * 3600000)) return false;

                            if (wantLive) return isLive;
                            return !isLive;
                        });
                        
                        for (const e of filtered.slice(0, 60)) {
                            fixtures.push({
                                id: `tsdb-${e.idEvent}`,
                                leagueId: "epl",
                                leagueName: e.strLeague || "Sports",
                                homeTeam: e.strHomeTeam || "Home",
                                awayTeam: e.strAwayTeam || "Away",
                                status: wantLive ? "live" : (String(e.strStatus || "").toLowerCase().includes("live") ? "live" : "upcoming"),
                                isLive: String(e.strStatus || "").toLowerCase().includes("live"),
                                kickoffTimeFormatted: e.dateEvent || "",
                                venue: e.strVenue || "Arena",
                                homeScore: e.intHomeScore ? Number(e.intHomeScore) : undefined,
                                awayScore: e.intAwayScore ? Number(e.intAwayScore) : undefined,
                                minute: e.strTime || e.strStatus || undefined,
                            });
                        }
                    }
                } catch (e) {
                    // ignore fallback errors
                }

                // Keyed providers (only if configured)
                if (wantLive && SPORTMONKS_KEY) {
                    try {
                        const sm = await axios.get("https://api.sportmonks.com/v3/football/livescores/inplay", {
                            params: { api_token: SPORTMONKS_KEY, include: "participants;scores;periods;league.country;round" },
                            timeout: 8000,
                        });
                        const rows = sm.data?.data;
                        if (Array.isArray(rows)) {
                            for (const row of rows.slice(0, 30)) {
                                fixtures.push({
                                    id: `sm-${row.id}`,
                                    leagueId: "epl",
                                    leagueName: row.league?.name,
                                    homeTeam: row.participants?.find((p: any) => p.meta?.location === "home")?.name || "Home",
                                    awayTeam: row.participants?.find((p: any) => p.meta?.location === "away")?.name || "Away",
                                    homeTeamLogo: row.participants?.find((p: any) => p.meta?.location === "home")?.image_path,
                                    awayTeamLogo: row.participants?.find((p: any) => p.meta?.location === "away")?.image_path,
                                    status: "live",
                                    isLive: true,
                                    kickoffTimeFormatted: "Live Now",
                                    minute: row.periods?.[row.periods.length - 1]?.minutes ? `${row.periods[row.periods.length - 1].minutes}'` : "Live",
                                });
                            }
                        }
                    } catch (e) { }
                }

                if (wantLive && APISPORTS_KEY) {
                    try {
                        const as = await axios.get("https://v3.football.api-sports.io/fixtures", {
                            params: { live: "all" },
                            headers: { "x-apisports-key": APISPORTS_KEY },
                            timeout: 8000,
                        });
                        const rows = as.data?.response;
                        if (Array.isArray(rows)) {
                            for (const row of rows.slice(0, 30)) {
                                fixtures.push({
                                    id: `as-${row.fixture?.id}`,
                                    leagueId: "epl",
                                    leagueName: row.league?.name,
                                    homeTeam: row.teams?.home?.name,
                                    awayTeam: row.teams?.away?.name,
                                    homeTeamLogo: row.teams?.home?.logo,
                                    awayTeamLogo: row.teams?.away?.logo,
                                    status: "live",
                                    isLive: true,
                                    kickoffTimeFormatted: "Live Now",
                                    homeScore: row.goals?.home,
                                    awayScore: row.goals?.away,
                                    minute: row.fixture?.status?.elapsed ? `${row.fixture.status.elapsed}'` : "Live",
                                    venue: row.fixture?.venue?.name,
                                    source: "APISports"
                                });
                            }
                        }
                    } catch (e) { }
                }

                // --- MULTI-SOURCE SCRAPING (In Parallel) ---
                try {
                    const [ssMatches, fsMatches] = await Promise.all([
                        scrapeStreamSports().catch(() => []),
                        scrapeAllSports().catch(() => [])
                    ]);
                    
                    const combinedScraped = [...ssMatches, ...fsMatches];
                    const now = Date.now();
                    const filteredScraped = combinedScraped.filter(m => {
                        const kickoff = (m as any).kickoffTimeFormatted || (m as any).time;
                        // Filter out old dates (anything more than 6 hours in the past is suspicious for 'upcoming')
                        if (m.status === 'upcoming' && kickoff) {
                            const date = new Date(kickoff);
                            if (!isNaN(date.getTime()) && date.getTime() < now - (6 * 3600000)) return false;
                        }
                        
                        if (wantLive) return m.status === 'live' || m.isLive;
                        return m.status === 'upcoming';
                    });
                        
                    fixtures.push(...filteredScraped);
                } catch (e) {
                    console.error("Scraping orchestration failed:", e);
                }

                // Deduplicate by teams
                const seen = new Set<string>();
                const unique = fixtures.filter((f) => {
                    const k = `${String(f.homeTeam || "").toLowerCase()}-${String(f.awayTeam || "").toLowerCase()}`;
                    if (seen.has(k)) return false;
                    seen.add(k);
                    return true;
                });

                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
                res.status(200).json({ success: true, data: unique });
                return;
            }

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
