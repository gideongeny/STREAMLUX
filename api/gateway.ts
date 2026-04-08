/**
 * api/gateway.ts
 * Unified Production Gateway (Ultra-Stable)
 * Handles TMDB, YouTube (Multi-Key), Music (Dual-Fallback), and Sports.
 */

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
    const TMDB_API_KEY = process.env.TMDB_API_KEY || "decc520d8469eaea0202f55d41a13a0c";
    const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWNjNTIwZDg0NjllYWVhMDIwMmY1NWQ0MWExM2EwYyIsIm5iZiI6MTc1NDgyNjU1Mi4zMTcsInN1YiI6IjY4OTg4NzM4NzczZjAxYzIzNDVkMGRlYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UIMvffG-q5sYc04gTT0efdW_k4Iu4fnOedNfs4cYIu8";
    const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    const YT_BASE_URL = 'https://www.googleapis.com/youtube/v3';

    // User-provided API Keys
    const YT_KEYS: Record<string, string> = {
        movie: "AIzaSyDhbC7IZNOqpMki1Yni5JnSiXQQfnp5Sxw",
        tv: "AIzaSyD6W4_T3YkWJKy9Mtj2u188g8HayHMuPq8",
        music: "AIzaSyCU6TH5NPF-ZyX-hWjTQTaSGH0lTy9pops",
        general: "AIzaSyAlENC10uKVhrDGqgzUeOiNysiUFoDof9o"
    };

    // 3. Extract Path
    const query = req.query || {};
    const match = query.match || "";
    // If vercel rewrite is used, match will be the path after /api/
    let rawPath = (Array.isArray(match) ? match[0] : String(match)).replace(/^\/+/, '');
    
    if (rawPath.startsWith('proxy/tmdb')) rawPath = rawPath.replace('proxy/tmdb', '').replace(/^\/+/, '');
    
    try {
        // --- TMDB HANDLER ---
        const isTmdb = rawPath.includes('tmdb') || 
                      ['movie', 'tv', 'trending', 'person', 'search', 'configuration', 'genre', 'discover'].some(p => rawPath.startsWith(p));

        if (isTmdb || query.endpoint) {
            let endpoint = String(query.endpoint || "");
            if (!endpoint) endpoint = rawPath.includes('tmdb/') ? '/' + rawPath.split('tmdb/')[1] : '/' + rawPath;
            if ((!endpoint || endpoint === "/") && query.query) endpoint = "/search/multi";
            if (!endpoint || endpoint === "/") endpoint = "/movie/popular";

            const finalParams = new URLSearchParams();
            Object.keys(query).forEach(k => { if(k !== 'endpoint' && k !== 'match') finalParams.append(k, String(query[k])); });
            finalParams.set('api_key', TMDB_API_KEY);

            const tmdbUrl = `${TMDB_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}?${finalParams.toString()}`;
            const tmdbRes = await fetch(tmdbUrl, {
                headers: { 'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`, 'Accept': 'application/json' }
            });
            const data = await tmdbRes.json();
            return res.status(tmdbRes.status).json(data);
        }

        // --- MUSIC HANDLER (Dual Fallback) ---
        if (rawPath.startsWith('music') || rawPath.includes('saavn')) {
            const q = query.q || query.query || 'top hits';
            const SAAVN_DEV_URL = 'https://saavn.dev/api';
            
            try {
                const saavnUrl = rawPath.includes('trending') 
                    ? `${SAAVN_DEV_URL}/modules?language=english,hindi` 
                    : `${SAAVN_DEV_URL}/search/songs?query=${encodeURIComponent(String(q))}&limit=30`;
                const sRes = await fetch(saavnUrl);
                const sData = await sRes.json();
                if (sData && !sData.error) return res.status(200).json(sData);
            } catch (e) {}

            // Fallback to Working YouTube Key
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

        // --- YOUTUBE HANDLER (Rotation) ---
        if (rawPath.includes('youtube') || rawPath.includes('yt')) {
            const endpoint = String(query.endpoint || "/search");
            const context = String(query.context || "general");
            const keyPool = [YT_KEYS[context] || YT_KEYS.general];
            Object.values(YT_KEYS).forEach(k => { if(!keyPool.includes(k)) keyPool.push(k); });

            const ytParams = new URLSearchParams();
            Object.keys(query).forEach(k => { 
                if(!['endpoint', 'match', 'proxy', 'context'].includes(k)) ytParams.append(k, String(query[k])); 
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
            return res.status(200).json({ items: [], error: "All keys failing" });
        }

        // --- SPORTS HANDLER ---
        if (rawPath.startsWith('sports')) {
            const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const espnEndpoints = ["/soccer/eng.1/scoreboard", "/soccer/uefa.champions/scoreboard", "/basketball/nba/scoreboard"];
            const p = espnEndpoints.map(ep => fetch(`https://site.api.espn.com/apis/site/v2/sports${ep}?dates=${todayStr}`).then(r => r.json()).catch(() => ({events:[]})));
            const results = await Promise.all(p);
            const fixtures: any[] = [];
            results.forEach((r, i) => r.events?.forEach((e: any) => {
                const c = e.competitions?.[0];
                const h = c?.competitors?.find((x: any) => x.homeAway === 'home');
                const a = c?.competitors?.find((x: any) => x.homeAway === 'away');
                fixtures.push({
                    id: e.id, sport: espnEndpoints[i].split('/')[1], homeTeam: h?.team?.displayName, awayTeam: a?.team?.displayName,
                    homeTeamLogo: h?.team?.logo, awayTeamLogo: a?.team?.logo, isLive: e.status?.type?.name?.includes('LIVE')
                });
            }));
            return res.status(200).json({ success: true, data: fixtures });
        }

        return res.status(200).json({ results: [], status: 'gateway active', path: rawPath });
    } catch (err: any) {
        return res.status(500).json({ error: 'Gateway Critical Failure', message: err.message });
    }
}
