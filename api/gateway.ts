/**
 * Vercel Gateway: Zero-Dependency Version (Ultra-Stable)
 * Uses native Node.js fetch (Node 18+) to eliminate bundling crashes.
 */
module.exports = async (req, res) => {
    // 1. CORS Headers (Pure Node/Vercel)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. Constants & Data
    const TMDB_API_KEY = process.env.TMDB_API_KEY || "decc520d8469eaea0202f55d41a13a0c";
    const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWNjNTIwZDg0NjllYWVhMDIwMmY1NWQ0MWExM2EwYyIsIm5iZiI6MTc1NDgyNjU1Mi4zMTcsInN1YiI6IjY4OTg4NzM4NzczZjAxYzIzNDVkMGRlYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UIMvffG-q5sYc04gTT0efdW_k4Iu4fnOedNfs4cYIu8";
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    const YT_BASE_URL = 'https://www.googleapis.com/youtube/v3';
    const SAAVN_BASE_URL = 'https://saavn.me'; // Robust Saavn API Proxy

    const query = req.query || {};
    const match = query.match || "";
    let rawPath = (Array.isArray(match) ? match[0] : String(match)).replace(/^\/+/, '');

    // Handle legacy proxy prefix (e.g. /api/proxy/tmdb/movie/123 -> /movie/123)
    if (rawPath.startsWith('proxy/tmdb')) {
        rawPath = rawPath.replace('proxy/tmdb', '').replace(/^\/+/, '');
    } else if (rawPath.startsWith('proxy/search')) {
        rawPath = 'search/' + rawPath.replace('proxy/search', '').replace(/^\/+/, '');
    }

    // 3. Logic: Detect TMDB/YouTube
    const isTmdbPath = rawPath.includes('tmdb') || 
                      ['movie', 'tv', 'trending', 'person', 'search', 'configuration', 'genre', 'discover'].some(p => rawPath.startsWith(p));

    try {
        if (isTmdbPath || query.endpoint) {
            let endpoint = String(query.endpoint || "");
            
            if (!endpoint) {
                if (rawPath.includes('tmdb/')) {
                    endpoint = '/' + rawPath.split('tmdb/')[1];
                } else if (isTmdbPath && rawPath !== 'tmdb') {
                    endpoint = '/' + rawPath;
                }
            }
            
            // Auto-Search Intelligence: If query is present but no endpoint, route to search
            if ((!endpoint || endpoint === "/") && query.query) {
                endpoint = "/search/multi";
            }

            if (!endpoint || endpoint === "/") endpoint = "/movie/popular";

            // Build clean search params
            const finalParams = new URLSearchParams();
            Object.keys(query).forEach(key => {
                if (key !== 'endpoint' && key !== 'match') {
                    finalParams.append(key, String(query[key]));
                }
            });
            finalParams.set('api_key', TMDB_API_KEY);

            const tmdbUrl = `${TMDB_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}?${finalParams.toString()}`;

            // --- NATIVE FETCH ---
            const tmdbResponse = await fetch(tmdbUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`
                }
            });

            const data = await tmdbResponse.json();
            return res.status(tmdbResponse.status).json(data);
        }

        // --- MUSIC PROXY ---
        if (rawPath.startsWith('music') || rawPath.includes('saavn')) {
            const q = query.q || query.query || 'top hits';
            let saavnUrl = "";
            const SAAVN_DEV_URL = 'https://saavn.dev/api';
            
            if (rawPath.includes('trending')) {
                saavnUrl = `${SAAVN_DEV_URL}/modules?language=english,hindi`;
            } else {
                saavnUrl = `${SAAVN_DEV_URL}/search/songs?query=${encodeURIComponent(String(q))}&limit=30`;
            }

            const saavnResponse = await fetch(saavnUrl);
            const data = await saavnResponse.json();
            return res.status(saavnResponse.status).json(data);
        }

        // --- YOUTUBE PROXY ---
        if (rawPath.includes('youtube') || rawPath.includes('yt')) {
            const endpoint = String(query.endpoint || "/search");
            const key = String(process.env.YT_KEYS || "").split(',')[0].trim();
            
            const ytParams = new URLSearchParams();
            Object.keys(query).forEach(k => { 
                if(k !== 'endpoint' && k !== 'match' && k !== 'proxy') ytParams.append(k, String(query[k])); 
            });
            
            // Standard YouTube Defaults
            if (!ytParams.has('part')) ytParams.set('part', 'snippet');
            if (!ytParams.has('maxResults')) ytParams.set('maxResults', '25');
            if (key) ytParams.set('key', key);

            const ytUrl = `${YT_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}?${ytParams.toString()}`;
            
            const ytResponse = await fetch(ytUrl);
            const data = await ytResponse.json();
            
            // If API Key fails or is missing, return a safe fallback to prevent frontend crashes
            if (data.error) {
                return res.status(200).json({ items: [], results: [], error: data.error.message });
            }
            return res.status(200).json(data);
        }

        // --- SPORTS AGGREGATOR ---
        if (rawPath.startsWith('sports')) {
            const wantLive = rawPath.endsWith('/live');
            const fixtures = [];

            // Helper: Normalizer
            const normalize = (m) => ({
                id: String(m.id || Math.random()),
                sport: String(m.sport || "Sports"),
                leagueName: String(m.leagueName || "Live Sports"),
                homeTeam: String(m.homeTeam || "Team A"),
                awayTeam: String(m.awayTeam || "Team B"),
                homeTeamLogo: m.homeTeamLogo || "",
                awayTeamLogo: m.awayTeamLogo || "",
                status: m.status || (wantLive ? "live" : "upcoming"),
                isLive: !!m.isLive,
                homeScore: Number(m.homeScore || 0),
                awayScore: Number(m.awayScore || 0),
                minute: String(m.minute || ""),
                kickoffTimeFormatted: m.kickoffTimeFormatted || ""
            });
            
            // 1. ESPN Scoreboards
            const espnEndpoints = [
                "/soccer/eng.1/scoreboard", "/soccer/uefa.champions/scoreboard",
                "/soccer/esp.1/scoreboard", "/soccer/ger.1/scoreboard",
                "/soccer/ita.1/scoreboard", "/soccer/fra.1/scoreboard",
                "/basketball/nba/scoreboard", "/mma/ufc/scoreboard"
            ];
            
            const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const promises = espnEndpoints.map(ep => 
                fetch(`https://site.api.espn.com/apis/site/v2/sports${ep}?dates=${todayStr}`)
                .then(r => r.json())
                .catch(() => ({ events: [] }))
            );

            const results = await Promise.all(promises);
            results.forEach((res, idx) => {
                if (Array.isArray(res.events)) {
                    res.events.forEach(e => {
                        const comp = e.competitions?.[0];
                        const home = comp?.competitors?.find(c => c.homeAway === 'home');
                        const away = comp?.competitors?.find(c => c.homeAway === 'away');
                        fixtures.push(normalize({
                            id: `espn-${e.id}`,
                            sport: espnEndpoints[idx].split('/')[1],
                            leagueName: e.league?.name || "ESPN",
                            homeTeam: home?.team?.displayName,
                            awayTeam: away?.team?.displayName,
                            homeTeamLogo: home?.team?.logo,
                            awayTeamLogo: away?.team?.logo,
                            isLive: e.status?.type?.name?.includes('LIVE'),
                            homeScore: home?.score,
                            awayScore: away?.score,
                            minute: e.status?.displayClock,
                            kickoffTimeFormatted: e.date
                        }));
                    });
                }
            });

            // 2. TheSportsDB
            try {
                const tsdbRes = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${new Date().toISOString().split('T')[0]}`);
                const tsdbData = await tsdbRes.json();
                if (Array.isArray(tsdbData.events)) {
                    tsdbData.events.forEach(e => {
                        fixtures.push(normalize({
                            id: `tsdb-${e.idEvent}`,
                            sport: e.strSport,
                            leagueName: e.strLeague,
                            homeTeam: e.strHomeTeam,
                            awayTeam: e.strAwayTeam,
                            isLive: String(e.strStatus).toLowerCase().includes('live'),
                            homeScore: e.intHomeScore,
                            awayScore: e.intAwayScore,
                            kickoffTimeFormatted: e.dateEvent
                        }));
                    });
                }
            } catch (e) {}

            return res.status(200).json({ success: true, data: fixtures });
        }

        // Default Success (Empty results fallback to prevent frontend crashes)
        return res.status(200).json({ 
            results: [],
            data: [],
            status: 'active', 
            mode: 'zero-dependency',
            path: rawPath
        });

    } catch (err) {
        console.error('[Zero-Dep Error]:', err.message);
        return res.status(500).json({ 
            results: [],
            error: 'Gateway Failure', 
            message: err.message
        });
    }
};
