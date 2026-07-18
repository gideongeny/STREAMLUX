export const config = { runtime: 'nodejs' };

/**
 * api/[...match].ts
 * Vercel Catch-all Route: Captures all /api/* traffic
 * Consolidated handler — TMDB, Music, YouTube, Sports, External Proxy
 * Server-side cache + CDN edge caching for scale
 */

// ─── In-Memory Cache ────────────────────────────────────────────
interface CacheEntry { data: any; expires: number; }
const memCache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 5000;

function cacheGet(key: string): any | null {
    const entry = memCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) { memCache.delete(key); return null; }
    return entry.data;
}

function cacheSet(key: string, data: any, ttlMs: number): void {
    if (memCache.size >= MAX_CACHE_SIZE) {
        const firstKey = memCache.keys().next().value;
        if (firstKey) memCache.delete(firstKey);
    }
    memCache.set(key, { data, expires: Date.now() + ttlMs });
}

// ─── Handler ────────────────────────────────────────────────────
function parseBody(req: any): Record<string, any> {
    const raw = req.body;
    if (!raw) return {};
    if (typeof raw === 'object') return raw;
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw);
        } catch {
            return {};
        }
    }
    return {};
}

export default async function handler(req: any, res: any) {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. Constants & Keys
    const TMDB_API_KEY = process.env.TMDB_API_KEY || "7ea638a69773174284507081474e892d";
    const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3ZWE2MzhhNjk3NzMxNzQyODQ1MDcwODE0NzRlODkyZCIsIm5iZiI6MTc1NDgyNjU1Mi4zMTcsInN1YiI6IjY4OTg4NzM4NzczZjAxYzIzNDVkMGRlYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.dIHNX2XlReX3c8917Ug5Sw9QLf_SEkIIcakh4jCsOos";
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    const YT_BASE_URL = 'https://www.googleapis.com/youtube/v3';

    const YT_KEYS: Record<string, string> = {
        movie: "AIzaSyDhbC7IZNOqpMki1Yni5JnSiXQQfnp5Sxw",
        tv: "AIzaSyD6W4_T3YkWJKy9Mtj2u188g8HayHMuPq8",
        music: "AIzaSyCU6TH5NPF-ZyX-hWjTQTaSGH0lTy9pops",
        general: "AIzaSyAlENC10uKVhrDGqgzUeOiNysiUFoDof9o"
    };
    const INNERTUBE_KEYS = ["AIzaSyBXl3lLvGxMOtqtYn75f_X68mc8P-O81qQ", "AIzaSyC4Mz02lYxZSdaA5N-l363GlIJiblhC3sM", "AIzaSyB8lDctBCl-3JPNgJSau3TvulbevDyvNyQ", "AIzaSyAlENC10uKVhrDGqgzUeOiNysiUFoDof9o"];

    // 3. Extract Path from Dynamic Route
    const { match, endpoint: qEndpoint, ...queryParams } = req.query;
    const rawPath = (Array.isArray(match) ? match.join('/') : String(match || "")).replace(/^\/+/, '');

    // Normalize path
    let normalizedPath = rawPath;
    if (normalizedPath.startsWith('proxy/tmdb')) normalizedPath = normalizedPath.replace('proxy/tmdb', '').replace(/^\/+/, '');

    const query: any = { ...queryParams, endpoint: qEndpoint };

    try {
        // ═══════════════════════════════════════════════════════════════
        // A. EXTERNAL PROVIDER PROXY (POST /api/external)
        //    Used by sports (ESPN, SofaScore, WatchFooty, TheSportsDB)
        // ═══════════════════════════════════════════════════════════════
        if ((normalizedPath === 'external' || normalizedPath === 'proxy/external') && req.method === 'POST') {
            const body = req.body || {};
            const { provider, url: targetUrl, method = 'GET', headers = {}, data: postData, query: searchQuery, endpoint: provEndpoint, params: provParams } = body;

            // NTV MULTI-SERVER RESOLVER
            if (provider === 'ntv-resolve' && searchQuery) {
                try {
                    const server = searchQuery.server || 'kobra';
                    const targetSite = 'https://ntvs.cx';
                    const cacheKey = `ntv:${server}:${searchQuery.match}`;
                    const cached = cacheGet(cacheKey);
                    if (cached) {
                        res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
                        res.setHeader('X-Cache', 'HIT');
                        return res.status(cached.status).json(cached.data);
                    }

                    const resApi = await fetch(`${targetSite}/api/get-matches?server=${server}&type=both`, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Accept': 'application/json'
                        },
                        signal: AbortSignal.timeout(8000)
                    });
                    const data = await resApi.json();
                    if (!data.success) throw new Error(`NTV API returned success:false for ${server}`);

                    const allMatches = [...(data.live || []), ...(data.all || [])];
                    const queryStr = searchQuery.match.toLowerCase();

                    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w: string) => w.length > 2);
                    const queryWords = clean(queryStr);

                    const found = allMatches.find((m: any) => {
                        const title = m.title.toLowerCase();
                        const titleWords = clean(title);
                        if (title.includes(queryStr) || queryStr.includes(title)) return true;
                        const overlap = queryWords.filter((w: string) => titleWords.includes(w));
                        if (overlap.length >= 2 || (queryWords.length > 0 && overlap.length / queryWords.length >= 0.5)) return true;
                        return false;
                    });

                    if (found && found.id) {
                        const result = { success: true, url: `${targetSite}/watch/${server}/${found.id}` };
                        cacheSet(cacheKey, { status: 200, data: result }, 30_000);
                        res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
                        return res.status(200).json(result);
                    }

                    const notFound = { success: false, message: `No match found on ${server}` };
                    cacheSet(cacheKey, { status: 404, data: notFound }, 15_000);
                    return res.status(404).json(notFound);
                } catch (e: any) {
                    return res.status(502).json({ error: true, message: e.message });
                }
            }

            // SEARCH STREAM
            if (provider === 'search-stream' && searchQuery) {
                try {
                    const sites: any = {
                        ss99: 'https://streamsports99.ru',
                        ntv: 'https://ntvstream.cx',
                        watchfooty: 'https://watchfooty.st'
                    };
                    const base = sites[searchQuery.site || 'ss99'];
                    const resSearch = await fetch(`${base}/?s=${encodeURIComponent(searchQuery.match)}`);
                    const html = await resSearch.text();

                    let streamUrl = '';
                    if (searchQuery.site === 'ss99') {
                        const m = html.match(/href="(https:\/\/streamsports99\.ru\/player\/[^"]+)"/);
                        if (m) streamUrl = m[1];
                    } else if (searchQuery.site === 'ntv') {
                        const m = html.match(/href="(https:\/\/ntvstream\.cx\/stream\/[^"]+)"/);
                        if (m) streamUrl = m[1];
                    }

                    if (streamUrl) return res.status(200).json({ success: true, url: streamUrl });
                    return res.status(404).json({ success: false, message: "No stream found for this match" });
                } catch (e: any) {
                    return res.status(500).json({ error: true, message: e.message });
                }
            }

            // SOFASCORE / ESPN / THESPORTSDB / WATCHFOOTY — Generic proxy
            if (provider && targetUrl) {
                const cacheKey = `ext:${provider}:${targetUrl}`;
                const cached = cacheGet(cacheKey);
                if (cached) {
                    res.setHeader('X-Cache', 'HIT');
                    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
                    return res.status(200).json(cached);
                }

                try {
                    const fetchRes = await fetch(targetUrl, {
                        method: method,
                        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', ...headers },
                        body: method === 'POST' ? JSON.stringify(postData) : undefined,
                        signal: AbortSignal.timeout(10000)
                    });
                    const data = await fetchRes.json();
                    cacheSet(cacheKey, data, 30_000); // 30s cache for sports
                    res.setHeader('X-Cache', 'MISS');
                    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
                    return res.status(200).json(data);
                } catch (e: any) {
                    return res.status(502).json({ error: true, message: `Proxy fetch failed: ${e.message}` });
                }
            }

            // ESPN PROVIDER (used by publicSportsAPI's getESPNScores which POSTs with provider: "espn")
            if (provider === 'espn' && body.url) {
                const cacheKey = `espn:${body.url}`;
                const cached = cacheGet(cacheKey);
                if (cached) {
                    res.setHeader('X-Cache', 'HIT');
                    return res.status(200).json(cached);
                }
                try {
                    const fetchRes = await fetch(body.url, {
                        headers: { 'Accept': 'application/json' },
                        signal: AbortSignal.timeout(8000)
                    });
                    const data = await fetchRes.json();
                    cacheSet(cacheKey, data, 30_000);
                    return res.status(200).json(data);
                } catch (e: any) {
                    return res.status(502).json({ error: true, message: e.message });
                }
            }

            // SOFASCORE/THESPORTSDB PROVIDER (uses endpoint + params pattern)
            if (provider && provEndpoint) {
                const providerBases: Record<string, string> = {
                    sofascore: 'https://api.sofascore.com/api/v1',
                    thesportsdb: 'https://www.thesportsdb.com/api/v1/json/3',
                };
                const baseUrl = providerBases[provider];
                if (baseUrl) {
                    const fullUrl = `${baseUrl}${provEndpoint.startsWith('/') ? provEndpoint : '/' + provEndpoint}`;
                    const urlWithParams = provParams ? `${fullUrl}?${new URLSearchParams(provParams).toString()}` : fullUrl;

                    const cacheKey = `prov:${provider}:${provEndpoint}`;
                    const cached = cacheGet(cacheKey);
                    if (cached) {
                        res.setHeader('X-Cache', 'HIT');
                        return res.status(200).json({ success: true, data: cached });
                    }

                    try {
                        const fetchRes = await fetch(urlWithParams, {
                            headers: {
                                'Accept': 'application/json',
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            },
                            signal: AbortSignal.timeout(10000)
                        });
                        const data = await fetchRes.json();
                        cacheSet(cacheKey, data, 30_000);
                        return res.status(200).json({ success: true, data });
                    } catch (e: any) {
                        return res.status(502).json({ error: true, message: `${provider} fetch failed: ${e.message}` });
                    }
                }
            }

            // Watchfooty provider (uses url in body)
            if (provider === 'watchfooty' && body.url) {
                const cacheKey = `wf:${body.url}`;
                const cached = cacheGet(cacheKey);
                if (cached) {
                    res.setHeader('X-Cache', 'HIT');
                    return res.status(200).json(cached);
                }
                try {
                    const fetchRes = await fetch(body.url, {
                        headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
                        signal: AbortSignal.timeout(8000)
                    });
                    const data = await fetchRes.json();
                    cacheSet(cacheKey, data, 30_000);
                    return res.status(200).json(data);
                } catch (e: any) {
                    return res.status(502).json({ error: true, message: e.message });
                }
            }

            return res.status(400).json({ error: "Missing provider or url in body" });
        }

        // ═══════════════════════════════════════════════════════════════
        // B. INNERTUBE ROUTE (POST /api/music/innertube)
        //    Unlimited YouTube Music & Videos — cached 15 min
        // ═══════════════════════════════════════════════════════════════
        if (normalizedPath === 'music/innertube' || normalizedPath.includes('innertube')) {
            try {
                const reqData = req.method === 'POST' ? parseBody(req) : req.query;
                const endpoint = reqData?.endpoint || '/search';
                const itQuery = reqData?.query;
                const videoId = reqData?.videoId;
                const browseId = reqData?.browseId;
                const clientName = reqData?.client || 'WEB_REMIX';

                const isSearchable = !videoId;
                const cacheKey = `innertube:${clientName}:${endpoint}:${itQuery || videoId || browseId || 'default'}`;

                if (isSearchable) {
                    const cached = cacheGet(cacheKey);
                    if (cached) {
                        res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800');
                        res.setHeader('X-Cache', 'HIT');
                        return res.status(200).json(cached);
                    }
                }

                const key = INNERTUBE_KEYS[Math.floor(Math.random() * INNERTUBE_KEYS.length)];
                const host = clientName === 'WEB' ? 'www.youtube.com' : 'music.youtube.com';
                const itUrl = `https://${host}/youtubei/v1${endpoint.startsWith('/') ? endpoint : '/' + endpoint}?key=${key}`;

                const clientVersion =
                    clientName === 'WEB'
                        ? '2.20250218.01.00'
                        : clientName === 'WEB_REMIX'
                          ? '1.20250218.01.00'
                          : '1.20240101.01.00';

                const context = {
                    context: {
                        client: {
                            clientName,
                            clientVersion,
                            hl: 'en',
                            gl: 'US',
                        },
                    },
                    ...(itQuery && { query: itQuery }),
                    ...(videoId && { videoId }),
                    ...(browseId && { browseId }),
                };

                const itRes = await fetch(itUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        Origin: `https://${host}`,
                        Referer: `https://${host}/`,
                    },
                    body: JSON.stringify(context),
                });

                const itData = await itRes.json().catch(() => ({}));
                if (!itRes.ok) {
                    return res.status(200).json({ contents: {}, error: itData?.error || 'innertube_failed' });
                }

                if (isSearchable) {
                    cacheSet(cacheKey, itData, 15 * 60_000);
                }
                res.setHeader('Cache-Control', isSearchable ? 'public, s-maxage=900, stale-while-revalidate=1800' : 'no-store');
                res.setHeader('X-Cache', 'MISS');
                return res.status(200).json(itData);
            } catch (e: any) {
                console.error('[innertube]', e?.message || e);
                return res.status(200).json({ contents: {}, error: 'innertube_exception' });
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // B2. PIPED PROXY (GET /api/piped/search | /api/piped/streams)
        //     Server-side — fixes browser CORS on Piped public instances
        // ═══════════════════════════════════════════════════════════════
        if (normalizedPath.startsWith('piped')) {
            const PIPED_INSTANCES = [
                'https://pipedapi.kavin.rocks',
                'https://api.piped.ot.ax',
                'https://pipedapi.drgns.space',
                'https://piped-api.lunar.icu',
            ];
            const q = String(query.q || query.query || '');
            const videoId = String(query.videoId || '');
            const filter = String(query.filter || 'all');

            for (const base of PIPED_INSTANCES) {
                try {
                    const target = normalizedPath.includes('streams') && videoId
                        ? `${base}/streams/${videoId}`
                        : `${base}/search?q=${encodeURIComponent(q)}&filter=${encodeURIComponent(filter)}`;
                    const pRes = await fetch(target, {
                        headers: { 'User-Agent': 'StreamLux/1.0' },
                    });
                    const pData = await pRes.json();
                    if (pRes.ok && pData) {
                        res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
                        return res.status(200).json(pData);
                    }
                } catch (_) {}
            }
            return res.status(200).json({ items: [] });
        }

        // ═══════════════════════════════════════════════════════════════
        // C. MUSIC HANDLER (Saavn + Working YT Fallback)
        // ═══════════════════════════════════════════════════════════════
        if (normalizedPath.startsWith('music') || normalizedPath.includes('saavn')) {
            const q = query.q || query.query || 'top hits';
            const SAAVN_DEV_URL = 'https://saavn.dev/api';

            try {
                const saavnUrl = normalizedPath.includes('trending')
                    ? `${SAAVN_DEV_URL}/modules?language=english,hindi`
                    : `${SAAVN_DEV_URL}/search/songs?query=${encodeURIComponent(String(q))}&limit=30`;
                const sRes = await fetch(saavnUrl);
                const sData = await sRes.json();
                if (sData && !sData.error) return res.status(200).json(sData);
            } catch (e) {}

            // Fallback to YouTube
            const musicRetryPool = [YT_KEYS.music, YT_KEYS.general, YT_KEYS.movie];
            for (const key of musicRetryPool) {
                try {
                    const ytUrl = `${YT_BASE_URL}/search?part=snippet&q=${encodeURIComponent(String(q))}&type=video&videoCategoryId=10&maxResults=30&key=${key}`;
                    const ytRes = await fetch(ytUrl);
                    const ytData = await ytRes.json();
                    if (ytData && !ytData.error) return res.status(200).json(ytData);
                } catch (e) {}
            }
            return res.status(200).json({ items: [], results: [] });
        }

        // ═══════════════════════════════════════════════════════════════
        // D. YOUTUBE HANDLER
        // ═══════════════════════════════════════════════════════════════
        if (normalizedPath.includes('youtube') || normalizedPath.includes('yt')) {
            const endpoint = String(query.endpoint || "/search");
            const context = String(query.context || "general");

            const keyPool = [YT_KEYS[context] || YT_KEYS.general];
            Object.values(YT_KEYS).forEach(k => { if (!keyPool.includes(k)) keyPool.push(k); });

            const ytParams = new URLSearchParams();
            Object.keys(query).forEach(k => {
                if (!['endpoint', 'match', 'proxy', 'context'].includes(k)) ytParams.append(k, String(query[k]));
            });
            if (!ytParams.has('part')) ytParams.set('part', 'snippet');
            if (!ytParams.has('maxResults')) ytParams.set('maxResults', '25');

            for (const key of keyPool) {
                try {
                    const ytUrl = `${YT_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}?${ytParams.toString()}&key=${key}`;
                    const ytRes = await fetch(ytUrl);
                    const data = await ytRes.json();
                    if (data.error) {
                        const reason = data.error.errors?.[0]?.reason || "";
                        if (['quotaExceeded', 'keyInvalid', 'dailyLimitExceeded', 'forbidden'].includes(reason)) continue;
                        return res.status(200).json({ items: [], error: data.error.message });
                    }
                    res.setHeader('Cache-Control', 's-maxage=28800, stale-while-revalidate=3600');
                    return res.status(200).json(data);
                } catch (e) {}
            }
            return res.status(200).json({ items: [], error: "All keys exhausted" });
        }

        // ═══════════════════════════════════════════════════════════════
        // E. SPORTS HUB (GET /api/sports/live or /api/sports/upcoming)
        // ═══════════════════════════════════════════════════════════════
        if (normalizedPath.startsWith('sports')) {
            const wantLive = normalizedPath.includes('live');
            const cacheKey = `sports:merged:${wantLive ? 'live' : 'upcoming'}:${new Date().toISOString().split('T')[0]}`;
            const cached = cacheGet(cacheKey);
            if (cached) {
                res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
                res.setHeader('X-Cache', 'HIT');
                return res.status(200).json(cached);
            }

            const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const espnEndpoints = [
                "/soccer/eng.1/scoreboard",
                "/soccer/esp.1/scoreboard",
                "/soccer/ita.1/scoreboard",
                "/soccer/ger.1/scoreboard",
                "/soccer/uefa.champions/scoreboard",
                "/soccer/all/scoreboard",
                "/basketball/nba/scoreboard",
                "/baseball/mlb/scoreboard",
                "/football/nfl/scoreboard",
                "/hockey/nhl/scoreboard",
                "/racing/f1/scoreboard",
                "/mma/ufc/scoreboard"
            ];
            const p = espnEndpoints.map(ep =>
                fetch(`https://site.api.espn.com/apis/site/v2/sports${ep}?dates=${todayStr}`)
                    .then(r => r.json())
                    .catch(() => ({ events: [] }))
            );
            const results = await Promise.all(p);
            const fixtures: any[] = [];
            results.forEach((r, i) => r.events?.forEach((e: any) => {
                const c = e.competitions?.[0];
                const h = c?.competitors?.find((x: any) => x.homeAway === 'home');
                const a = c?.competitors?.find((x: any) => x.homeAway === 'away');
                if (!h || !a) return;

                const status = e.status?.type?.name || 'STATUS_SCHEDULED';
                const isLive = status.includes('LIVE') || status.includes('IN_PROGRESS');
                if (wantLive && !isLive) return;
                if (!wantLive && isLive) return;

                const venueImg = c?.venue?.images?.[0]?.href;
                const cover = venueImg || h?.team?.logo || a?.team?.logo;
                
                fixtures.push({
                    id: `espn-${e.id}`,
                    sport: espnEndpoints[i].split('/')[1],
                    leagueName: e.season?.name || espnEndpoints[i].split('/')[2] || 'Sports',
                    homeTeam: h?.team?.displayName,
                    awayTeam: a?.team?.displayName,
                    homeTeamLogo: h?.team?.logo,
                    awayTeamLogo: a?.team?.logo,
                    homeScore: h?.score ? Number(h.score) : 0,
                    awayScore: a?.score ? Number(a.score) : 0,
                    isLive,
                    status: isLive ? 'live' : 'upcoming',
                    minute: e.status?.displayClock || e.status?.type?.shortDetail,
                    venue: c?.venue?.fullName || 'Stadium',
                    kickoffTimeFormatted: e.date ? new Date(e.date).toISOString() : new Date().toISOString(),
                    sportsCategory: espnEndpoints[i].split('/')[1].charAt(0).toUpperCase() + espnEndpoints[i].split('/')[1].slice(1),
                    thumb: cover,
                    poster_path: cover
                });
            }));

            // CricHd auto-updated sports channels (15 min refresh) — https://github.com/abusaeeidx/CricHd-playlists-Auto-Update-permanent
            if (wantLive) {
                try {
                    const crichdRes = await fetch(
                        'https://raw.githubusercontent.com/abusaeeidx/CricHd-playlists-Auto-Update-permanent/main/api.json',
                        { signal: AbortSignal.timeout(12000) }
                    );
                    const channels = await crichdRes.json();
                    if (Array.isArray(channels)) {
                        channels.slice(0, 36).forEach((ch: any, idx: number) => {
                            const name = ch.name || 'Live Sports';
                            const logo = ch.logo || '';
                            const sportGuess = /cricket|willow|star sports/i.test(name) ? 'Cricket'
                                : /f1|racing/i.test(name) ? 'Motorsport'
                                : /nba|basketball/i.test(name) ? 'Basketball'
                                : /nfl/i.test(name) ? 'American Football'
                                : /premier|liga|sky sports|football|soccer/i.test(name) ? 'Football'
                                : 'Sports';
                            fixtures.push({
                                id: `crichd-${ch.id || idx}`,
                                leagueId: 'live-sports-tv',
                                leagueName: 'Live Sports TV',
                                homeTeam: name,
                                awayTeam: 'Live Broadcast',
                                homeTeamLogo: logo,
                                awayTeamLogo: logo,
                                thumb: logo,
                                poster_path: logo,
                                fanart: logo,
                                status: 'live',
                                isLive: true,
                                streamUrl: ch.link,
                                sportsCategory: sportGuess,
                                sport: sportGuess,
                                kickoffTimeFormatted: new Date().toISOString(),
                                venue: 'CricHD',
                                minute: 'LIVE'
                            });
                        });
                    }
                } catch (_) { /* optional feed */ }
            }

            const responseData = { success: true, data: fixtures };
            cacheSet(cacheKey, responseData, 30_000);
            res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
            res.setHeader('X-Cache', 'MISS');
            return res.status(200).json(responseData);
        }

        // ═══════════════════════════════════════════════════════════════
        // F. TMDB ROUTE (DEFAULT) — cached by endpoint type
        // ═══════════════════════════════════════════════════════════════
        const isTmdb = normalizedPath.includes('tmdb') ||
            ['movie', 'tv', 'trending', 'person', 'search', 'configuration', 'genre', 'discover', 'collection'].some(p => normalizedPath.startsWith(p));

        if (isTmdb || query.endpoint || !normalizedPath || normalizedPath === 'gateway') {
            let endpoint = String(query.endpoint || "");
            if (!endpoint) {
                if (normalizedPath.includes('tmdb/')) {
                    endpoint = '/' + normalizedPath.split('tmdb/')[1];
                } else if (normalizedPath && normalizedPath !== 'gateway') {
                    endpoint = '/' + normalizedPath;
                }
            }
            if ((!endpoint || endpoint === "/") && query.query) endpoint = "/search/multi";
            if (!endpoint || endpoint === "/") endpoint = "/movie/popular";

            let endpointParams = "";
            if (endpoint.includes("?")) {
                const parts = endpoint.split("?");
                endpoint = parts[0];
                endpointParams = parts[1];
            }

            const finalParams = new URLSearchParams();
            Object.keys(query).forEach(k => { if (k !== 'endpoint' && k !== 'match') finalParams.append(k, String(query[k])); });
            if (endpointParams) {
                const parsedParams = new URLSearchParams(endpointParams);
                parsedParams.forEach((value, key) => { finalParams.append(key, value); });
            }
            finalParams.set('api_key', TMDB_API_KEY);

            // Determine cache TTL
            const isSearch = endpoint.includes('/search');
            const isDetail = /\/(movie|tv)\/\d+/.test(endpoint);
            const isTrending = endpoint.includes('/trending') || endpoint.includes('/popular') || endpoint.includes('/top_rated');
            const isVideos = endpoint.includes('/videos');

            // Edge cache tuned for TMDB free tier + ~20k DAU (few unique endpoints, long TTL)
            let ttlMs = 60 * 60_000;
            let cdnMaxAge = 3600;
            if (isTrending) { ttlMs = 2 * 60 * 60_000; cdnMaxAge = 7200; }
            else if (isDetail) { ttlMs = 7 * 24 * 60 * 60_000; cdnMaxAge = 604800; }
            else if (isVideos) { ttlMs = 24 * 60 * 60_000; cdnMaxAge = 86400; }
            else if (isSearch) { ttlMs = 20 * 60_000; cdnMaxAge = 1200; }
            else if (endpoint.includes('/discover') || endpoint.includes('/collection')) {
                ttlMs = 90 * 60_000; cdnMaxAge = 5400;
            }
            else if (endpoint.includes('/configuration') || endpoint.includes('/genre')) {
                ttlMs = 7 * 24 * 60 * 60_000; cdnMaxAge = 604800;
            }

            const stableParams = new URLSearchParams(finalParams);
            stableParams.delete('api_key');
            stableParams.delete('t');
            const cacheKey = `tmdb:${endpoint}:${stableParams.toString()}`;

            const cached = cacheGet(cacheKey);
            if (cached) {
                res.setHeader('Cache-Control', `public, s-maxage=${cdnMaxAge}, stale-while-revalidate=${cdnMaxAge * 2}`);
                res.setHeader('X-Cache', 'HIT');
                return res.status(200).json(cached);
            }

            const tmdbUrl = `${TMDB_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}?${finalParams.toString()}`;
            const tRes = await fetch(tmdbUrl, {
                headers: { 'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`, 'Accept': 'application/json' }
            });
            const tData = await tRes.json();

            if (tRes.status === 429 || (tData as any)?.status_code === 25) {
                const stale = cacheGet(cacheKey);
                if (stale) {
                    res.setHeader('Cache-Control', `public, s-maxage=${cdnMaxAge}, stale-while-revalidate=${cdnMaxAge * 4}`);
                    res.setHeader('X-Cache', 'STALE');
                    return res.status(200).json(stale);
                }
                return res.status(200).json({ results: [], page: 1, total_pages: 1, total_results: 0 });
            }

            if (tRes.ok) {
                cacheSet(cacheKey, tData, ttlMs);
            }
            res.setHeader('Cache-Control', `public, s-maxage=${cdnMaxAge}, stale-while-revalidate=${cdnMaxAge * 2}`);
            res.setHeader('X-Cache', 'MISS');
            return res.status(tRes.status).json(tData);
        }

        return res.status(200).json({ results: [], data: [], status: 'active', path: rawPath });

    } catch (err: any) {
        return res.status(500).json({ error: 'Gateway Failure', message: err.message, path: rawPath });
    }
}
