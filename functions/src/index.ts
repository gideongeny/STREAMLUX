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
/**
 * Niche Metadata & Waterfall Search Utilities
 */
const fetchJikanMetadata = async (query: string) => {
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime`, {
            params: { q: query, limit: 1 },
            timeout: 5000
        });
        return response.data?.data?.[0] || null;
    } catch (e) {
        console.error('Jikan API error:', e);
        return null;
    }
};

const fetchInternetArchiveMetadata = async (query: string) => {
    try {
        const response = await axios.get(`https://archive.org/advancedsearch.php`, {
            params: {
                q: `title:(${query}) AND mediatype:(movies)`,
                output: 'json',
                rows: 1
            },
            timeout: 5000
        });
        const doc = response.data?.response?.docs?.[0];
        if (doc) {
            return {
                title: doc.title,
                id: doc.identifier,
                year: doc.date,
                description: doc.description || doc.subject
            };
        }
        return null;
    } catch (e) {
        console.error('Internet Archive error:', e);
        return null;
    }
};

const comprehensiveWaterfallSearch = async (query: string) => {
    const anime = await fetchJikanMetadata(query);
    if (anime) return { source: 'jikan', data: anime };
    const archive = await fetchInternetArchiveMetadata(query);
    if (archive) return { source: 'archive', data: archive };
    return null;
};


// Access Secure Parameters via process.env (loaded from .env)
const TMDB_API_KEY = (process.env.TMDB_API_KEY || "").trim();
const TMDB_BEARER_TOKEN = (process.env.TMDB_BEARER_TOKEN || "").trim();
const YT_KEYS_PARAM = (process.env.YT_KEYS || "").trim(); // Comma-separated
const SPORTMONKS_KEY = (process.env.SPORTMONKS_KEY || "").trim();
const APISPORTS_KEY = (process.env.APISPORTS_KEY || "e993ed7d8bcb48b798f7e469af594673").trim();
const SCOREBAT_TOKEN = (process.env.SCOREBAT_TOKEN || "").trim();
const OMDB_API_KEY = (process.env.OMDB_API_KEY || "").trim();
const WATCHMODE_API_KEY = (process.env.WATCHMODE_API_KEY || "hYQoz7vtpJ0hp4vysj5KuZlmSN1PcxWwEklLGquM").trim();
const RAPIDAPI_KEY = (process.env.RAPIDAPI_KEY || "").trim();
const FANART_API_KEY = (process.env.FANART_API_KEY || "c96f72ba3607fcac11343afbee5e8f97").trim();
const TRAKT_CLIENT_ID = (process.env.TRAKT_CLIENT_ID || "3d7c694f8d3e6a841ef0048d59bcf0bb384931Ht6TLmpMc3xhN5euPZo5ecC4RJtfJrJu8").trim();
// const TRAKT_CLIENT_SECRET = (process.env.TRAKT_CLIENT_SECRET || "917f877e6c85220194d0eb85a05c16e9750b835775d4d26ae1a854433bc7fc0e").trim();

const TASTEDIVE_API_KEY = (process.env.TASTEDIVE_API_KEY || "1070702-Streamlu-F18F9A64").trim();



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
            "RAPIDAPI_KEY",
            "FANART_API_KEY",
            "TRAKT_CLIENT_ID",
            "TRAKT_CLIENT_SECRET",
            "TASTEDIVE_API_KEY"
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

                /**
                 * Universal Normalizer to ensure consistency across all providers 
                 */
                const normalizeMatch = (m: any) => {
                    if (!m) return null;
                    
                    const home = String(m.homeTeam || "").toLowerCase();
                    const away = String(m.awayTeam || "").toLowerCase();
                    const league = String(m.leagueName || m.league || "").toLowerCase();
                    const currentSport = String(m.sport || "").toLowerCase();
                    const allText = `${home} ${away} ${league} ${currentSport}`;

                    // 1. Aggressive Sport Detection
                    let sport = m.sport || "Sports";
                    const isSoccer = allText.includes('soccer') || allText.includes('football') || allText.includes('premier league') || allText.includes('laliga') || allText.includes('serie a') || allText.includes('bundesliga');
                    const isRacing = allText.includes('racing') || allText.includes('f1') || allText.includes('formula 1') || allText.includes('motogp') || allText.includes('nascar') || allText.includes('grand prix') || allText.includes('prix') || allText.includes('paddock') || allText.includes('circuit') || allText.includes('grand-prix') || allText.includes('qualifying') || allText.includes('practice');
                    const isMMA = allText.includes('mma') || allText.includes('ufc') || allText.includes('bellator') || allText.includes('fighting') || allText.includes('knockout') || allText.includes('pFL');
                    const isBasketball = allText.includes('basketball') || allText.includes('nba') || allText.includes('euroleague') || allText.includes('wnba');

                    if (isSoccer) sport = "Soccer";
                    if (isBasketball) sport = "Basketball";
                    if (isMMA) sport = "MMA";
                    if (isRacing) sport = "Racing";

                    // 2. Competition Detection (Universal)
                    const isCompetition = 
                        m.isCompetition === true || 
                        sport === 'Racing' || 
                        sport === 'MMA' || 
                        allText.includes('golf') || 
                        allText.includes('tour de france') ||
                        allText.includes('open championship') ||
                        allText.includes('masters') ||
                        allText.includes('wimbledon') ||
                        (m.homeTeam && !m.awayTeam) ||
                        (m.homeTeam && m.homeTeam.toLowerCase().includes('grand prix')) ||
                        (m.homeTeam && m.homeTeam.toLowerCase().includes('prix'));

                    // 3. Clean Labels & ID Normalization
                    const isF1 = allText.includes('f1') || allText.includes('formula 1') || league.includes('formula 1') || league.includes('f1');
                    const isMotoGP = allText.includes('motogp') || league.includes('motogp');
                    
                    return {
                        ...m,
                        sport: sport,
                        isCompetition: !!isCompetition,
                        leagueId: isF1 ? 'f1' : (isMotoGP ? 'motogp' : (m.leagueId || 'general')),
                    };
                };

                const mapEspnEvent = (event: any, endpoint: string) => {
                    const comp = event?.competitions?.[0];
                    const competitors = comp?.competitors || [];
                    
                    const endpointParts = endpoint.split('/');
                    const sportCat = endpointParts[1] || "sports"; 
                    const leagueSub = endpointParts[2] || "league";

                    const leagueName = event?.league?.name || event?.season?.name || "Live Sports";
                    const isCompetition = 
                        sportCat === 'racing' ||
                        sportCat === 'mma' ||
                        leagueName.toLowerCase().includes('formula 1') || 
                        leagueName.toLowerCase().includes('f1') ||
                        leagueName.toLowerCase().includes('motogp');

                    const home = competitors.find((c: any) => c.homeAway === 'home') || competitors[0];
                    const away = competitors.find((c: any) => c.homeAway === 'away') || competitors[1];

                    if (!home?.team && !event.name) return null;

                    const statusName = event?.status?.type?.name || '';
                    const isLive = statusName.includes('LIVE') || statusName.includes('IN_PROGRESS');

                    const kickoffDate = event?.date ? new Date(event.date) : null;
                    
                    return normalizeMatch({
                        id: `espn-${event.id}`,
                        leagueId: leagueSub === 'scoreboard' ? sportCat : leagueSub,
                        sport: sportCat.charAt(0).toUpperCase() + sportCat.slice(1),
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
                    });
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
                    const endpointUsed = r.value.config?.url?.split('/sports')?.[1]?.split('?')?.[0] || "";
                    if (!Array.isArray(events)) continue;
                    
                    // Allow up to 60 events per endpoint slice to ensure wealthy diversity!
                    for (const e of events.slice(0, 60)) {
                        const mapped = mapEspnEvent(e, endpointUsed);
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
                            const kickoff = e.dateEvent ? new Date(`${e.dateEvent}T${e.strTime || '00:00:00'}`) : null;
                            if (!isLive && kickoff && kickoff.getTime() < now - (3 * 3600000)) return false;
                            if (wantLive) return isLive;
                            return !isLive;
                        });
                        
                        for (const e of filtered.slice(0, 70)) {
                            const normalized = normalizeMatch({
                                id: `tsdb-${e.idEvent}`,
                                sport: e.strSport || "Sports",
                                leagueId: String(e.idLeague || "general"),
                                leagueName: e.strLeague || "Sports",
                                homeTeam: e.strHomeTeam || "Home",
                                awayTeam: e.strAwayTeam || "Away",
                                status: wantLive ? "live" : (String(e.strStatus || "").toLowerCase().includes("live") ? "live" : "upcoming"),
                                isLive: String(e.strStatus || "").toLowerCase().includes("live"),
                                kickoffTimeFormatted: e.dateEvent || "",
                                venue: e.strVenue || "Arena",
                                homeScore: e.intHomeScore ? Number(e.intHomeScore) : 0,
                                awayScore: e.intAwayScore ? Number(e.intAwayScore) : 0,
                                minute: e.strTime || e.strStatus || undefined,
                            });
                            if (normalized && !fixtures.some(f => f.id === normalized.id)) {
                                fixtures.push(normalized);
                            }
                        }
                    }
                } catch (e) {}

                // Keyed providers
                if (wantLive) {
                    // SportMonks
                    if (SPORTMONKS_KEY) {
                        try {
                            const sm = await axios.get("https://api.sportmonks.com/v3/football/livescores/inplay", {
                                params: { api_token: SPORTMONKS_KEY, include: "participants;scores;periods;league.country;round" },
                                timeout: 8000,
                            });
                            const smData = sm.data?.data;
                            if (Array.isArray(smData)) {
                                smData.forEach((match: any) => {
                                    const normalized = normalizeMatch({
                                        id: `sm-${match.id}`,
                                        sport: "Soccer",
                                        leagueId: match.league?.id || "epl",
                                        leagueName: match.league?.name || "Football",
                                        homeTeam: match.participants?.[0]?.name || "Home",
                                        awayTeam: match.participants?.[1]?.name || "Away",
                                        homeTeamLogo: match.participants?.[0]?.image_path,
                                        awayTeamLogo: match.participants?.[1]?.image_path,
                                        status: "live",
                                        isLive: true,
                                        homeScore: match.scores?.find((s: any) => s.description === "CURRENT")?.score?.participants?.[0]?.score || 0,
                                        awayScore: match.scores?.find((s: any) => s.description === "CURRENT")?.score?.participants?.[1]?.score || 0,
                                        venue: match.venue?.name || "Stadium",
                                    });
                                    if (normalized && !fixtures.some(f => f.id === normalized.id)) fixtures.push(normalized);
                                });
                            }
                        } catch (e) {}
                    }

                    // APISports
                    if (APISPORTS_KEY) {
                        try {
                            const as = await axios.get("https://v3.football.api-sports.io/fixtures", {
                                params: { live: "all" },
                                headers: { "x-apisports-key": APISPORTS_KEY },
                                timeout: 8000,
                            });
                            const rows = as.data?.response;
                            if (Array.isArray(rows)) {
                                for (const row of rows.slice(0, 30)) {
                                    const normalized = normalizeMatch({
                                        id: `as-${row.fixture?.id}`,
                                        sport: "Soccer",
                                        leagueId: "epl",
                                        leagueName: row.league?.name || "Football",
                                        homeTeam: row.teams?.home?.name,
                                        awayTeam: row.teams?.away?.name,
                                        homeTeamLogo: row.teams?.home?.logo,
                                        awayTeamLogo: row.teams?.away?.logo,
                                        status: "live",
                                        isLive: true,
                                        homeScore: row.goals?.home,
                                        awayScore: row.goals?.away,
                                        minute: row.fixture?.status?.elapsed ? `${row.fixture.status.elapsed}'` : "Live",
                                        venue: row.fixture?.venue?.name,
                                    });
                                    if (normalized && !fixtures.some(f => f.id === normalized.id)) fixtures.push(normalized);
                                }
                            }
                        } catch (e) {}
                    }
                }

                // --- MULTI-SOURCE SCRAPING ---
                try {
                    const [ssMatches, fsMatches] = await Promise.all([
                        scrapeStreamSports().catch(() => []),
                        scrapeAllSports().catch(() => [])
                    ]);
                    
                    const combinedScraped = [...ssMatches, ...fsMatches];
                    const now = Date.now();
                    const filteredScraped = combinedScraped.filter(m => {
                        const kickoff = (m as any).kickoffTimeFormatted || (m as any).time;
                        if (m.status === 'upcoming' && kickoff) {
                            const date = new Date(kickoff);
                            if (!isNaN(date.getTime()) && date.getTime() < now - (6 * 3600000)) return false;
                        }
                        return wantLive ? (m.status === 'live' || m.isLive) : m.status === 'upcoming';
                    });
                        
                    filteredScraped.forEach(m => {
                        const normalized = normalizeMatch(m);
                        if (normalized && !fixtures.some(f => f.id === normalized.id)) {
                            fixtures.push(normalized);
                        }
                    });
                } catch (e) {
                    console.error("Scraping orchestration failed:", e);
                }

                // Final Deduplication by Team Names
                const seen = new Set<string>();
                const unique = fixtures.filter((f) => {
                    const k = `${String(f.homeTeam || "").toLowerCase()}-${String(f.awayTeam || "").toLowerCase()}`;
                    if (seen.has(k)) return false;
                    seen.add(k);
                    return true;
                });

                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
                // Final Score Intelligence: If all providers return 0-0 but match is 'Live', it's usually a state issue.
                // We'll mark them as 'LIVE' but keep current score.
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

            // --- FANART PROXY ---
            if (rawPath === 'fanart' || rawPath.startsWith('fanart/')) {
                if (!FANART_API_KEY) {
                    res.status(500).json({ error: 'FANART_API_KEY not configured' });
                    return;
                }
                const subPath = rawPath.replace(/^fanart\/?/, '');
                const target = `https://webservice.fanart.tv/v3/${subPath}`;
                const params = { ...(req.query || {}), api_key: FANART_API_KEY };
                const response = await axios.get(target, { params, timeout: 10000 });
                res.status(200).json(response.data);
                return;
            }

            // --- TRAKT PROXY ---
            if (rawPath === 'trakt' || rawPath.startsWith('trakt/')) {
                if (!TRAKT_CLIENT_ID) {
                    res.status(500).json({ error: 'TRAKT_CLIENT_ID not configured' });
                    return;
                }
                const subPath = rawPath.replace(/^trakt\/?/, '');
                const target = `https://api.trakt.tv/${subPath}`;
                const headers = {
                    'Content-Type': 'application/json',
                    'trakt-api-version': '2',
                    'trakt-api-key': TRAKT_CLIENT_ID
                };
                const response = await axios.get(target, { headers, params: req.query, timeout: 10000 });
                res.status(200).json(response.data);
                return;
            }

            // --- TASTEDIVE PROXY ---
            if (rawPath === 'tastedive' || rawPath.startsWith('tastedive/')) {
                if (!TASTEDIVE_API_KEY) {
                    res.status(500).json({ error: 'TASTEDIVE_API_KEY not configured' });
                    return;
                }
                const target = `https://tastedive.com/api/similar`;
                const params = { ...(req.query || {}), k: TASTEDIVE_API_KEY };
                const response = await axios.get(target, { params, timeout: 10000 });
                res.status(200).json(response.data);
                return;
            }

            // --- MUSIC PROXY (Saavn + YouTube) ---
            if (rawPath === 'music/search' || rawPath === 'music/trending' || rawPath.startsWith('music/saavn')) {
                const q = req.query.q as string;
                
                // Prioritize Saavn for high-quality audio
                if (rawPath.startsWith('music/saavn') || rawPath === 'music/search' || rawPath === 'music/trending') {
                    try {
                        let saavnUrl = "";
                        if (rawPath.includes('trending') || (rawPath === 'music/trending')) {
                            saavnUrl = `https://saavn.me/modules?language=english,hindi`;
                        } else {
                            saavnUrl = `https://saavn.me/search/all?query=${encodeURIComponent(q || 'top hits')}`;
                        }

                        const saavnRes = await axios.get(saavnUrl, { timeout: 8000 });
                        if (saavnRes.data) {
                            res.status(200).json(saavnRes.data);
                            return;
                        }
                    } catch (e) {
                        console.warn('Saavn API failed, falling back to YouTube:', e);
                    }
                }

                // Fallback to YouTube Data API
                const keys = getYTKeys();
                let lastError = null;

                for (const key of keys) {
                    if (deadKeys.has(key)) continue;
                    try {
                        const isTrending = rawPath.includes('trending');
                        const params = {
                            part: 'snippet',
                            key: key,
                            maxResults: 20,
                            videoCategoryId: '10', // Music Category
                            type: 'video',
                            ...(req.query || {})
                        };

                        let target = `${YT_BASE_URL}/search`;
                        if (isTrending) {
                            target = `${YT_BASE_URL}/videos`;
                            (params as any).chart = 'mostPopular';
                            delete (params as any).type;
                            delete (params as any).q;
                        }

                        const response = await axios.get(target, { params, timeout: 8000 });
                        res.status(200).json(response.data);
                        return;
                    } catch (e: any) {
                        lastError = e;
                        if (e.response?.status === 403) deadKeys.add(key);
                    }
                }
                res.status(500).json({ error: 'Music API unavailable', detail: lastError?.message });
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

            // --- NICHE METADATA SEARCH ---
            if (rawPath === 'search/niche' || rawPath.startsWith('search/niche/')) {
                const q = req.query?.q as string;
                if (!q) {
                    res.status(400).json({ error: 'Query parameter q is required' });
                    return;
                }
                const results = await comprehensiveWaterfallSearch(q);
                res.status(200).json(results);
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
