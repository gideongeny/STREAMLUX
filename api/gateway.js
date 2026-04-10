/**
 * api/gateway.js
 * ULTIMATE REFINEMENT - Universal Normalizer & CORS Everywhere
 * Zero Dependencies | Native Fetch | Ultra-Stable
 */

module.exports = async (req, res) => {
    // 1. Centralized CORS Enforcement
    const setCors = (response) => {
        response.setHeader('Access-Control-Allow-Credentials', 'true');
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    };

    setCors(res);
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. Constants & Keys
    const TMDB_API_KEY = "decc520d8469eaea0202f55d41a13a0c";
    const TMDB_BEARER = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWNjNTIwZDg0NjllYWVhMDIwMmY1NWQ0MWExM2EwYyIsIm5iZiI6MTc1NDgyNjU1Mi4zMTcsInN1YiI6IjY4OTg4NzM4NzczZjAxYzIzNDVkMGRlYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UIMvffG-q5sYc04gTT0efdW_k4Iu4fnOedNfs4cYIu8";
    
    const YT_KEYS = {
        movie: "AIzaSyDhbC7IZNOqpMki1Yni5JnSiXQQfnp5Sxw",
        tv: "AIzaSyD6W4_T3YkWJKy9Mtj2u188g8HayHMuPq8",
        music: "AIzaSyCU6TH5NPF-ZyX-hWjTQTaSGH0lTy9pops",
        general: "AIzaSyAlENC10uKVhrDGqgzUeOiNysiUFoDof9o"
    };

    // 3. Universal Path Normalizer
    const query = req.query || {};
    const match = query.match || "";
    // Normalize path by stripping Vercel prefixes
    let rawPath = (Array.isArray(match) ? match[0] : String(match))
        .replace(/^\/?api\//, '')
        .replace(/^\/?proxy\/tmdb\//, '')
        .replace(/^\/?tmdb\//, '')
        .replace(/^\/+/, '');
    
    // Fallback detection for direct calls
    if (!rawPath && req.url) {
        const urlP = req.url.split('?')[0];
        rawPath = urlP.replace(/^\/api\//, '').replace(/^\/+/, '');
    }

    try {
        // --- MUSIC ROUTE (Saavn + YT Fallback) ---
        // We only trigger if the path is specifically for music to avoid colliding with TMDB trending
        if (rawPath.startsWith('music') || rawPath.includes('saavn')) {
            const q = query.q || query.query || 'Global Top Hits 2024';
            try {
                // Try Saavn Modules (Trending) and Search
                const endpoints = [
                    `https://saavn.dev/api/modules?language=english,hindi`,
                    `https://saavn.dev/api/search/songs?query=${encodeURIComponent(String(q))}&limit=40`
                ];
                
                for (const sUrl of endpoints) {
                    try {
                        const sRes = await fetch(sUrl);
                        const sData = await sRes.json();
                        // saavn.dev usually wraps results in a 'data' property
                        const items = (sData.data?.trending?.songs || sData.data?.songs || sData.data || sData.results || sData);
                        if (Array.isArray(items) && items.length > 0) return res.status(200).json(sData);
                        if (items && typeof items === 'object' && Object.keys(items).length > 2) return res.status(200).json(sData);
                    } catch (e) {}
                }
            } catch (e) {}

            // YouTube Music Fallback (More aggressive search)
            const musicRetryPool = [YT_KEYS.music, YT_KEYS.general];
            for (const key of musicRetryPool) {
                try {
                    // Try with music category first
                    const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent('Official Music Video ' + String(q))}&type=video&videoCategoryId=10&maxResults=40&key=${key}`;
                    const ytRes = await fetch(ytUrl);
                    const ytData = await ytRes.json();
                    if (ytData && ytData.items && ytData.items.length > 0) return res.status(200).json(ytData);

                    // Fallback to general search without category if music-specific fails
                    const ytUrlGeneral = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(String(q) + ' songs')}&type=video&maxResults=40&key=${key}`;
                    const ytResGen = await fetch(ytUrlGeneral);
                    const ytDataGen = await ytResGen.json();
                    if (ytDataGen && ytDataGen.items && ytDataGen.items.length > 0) return res.status(200).json(ytDataGen);
                } catch (e) {}
            }
            return res.status(200).json({ items: [], results: [] });
        }

        // --- YOUTUBE ROUTE (Rotation) ---
        if (rawPath.includes('youtube') || rawPath.includes('yt')) {
            const endpoint = String(query.endpoint || "/search");
            const context = String(query.context || "general");
            const keyPool = [YT_KEYS[context] || YT_KEYS.general];
            Object.values(YT_KEYS).forEach(k => { if(!keyPool.includes(k)) keyPool.push(k); });

            const ytBase = `https://www.googleapis.com/youtube/v3${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
            
            for (const key of keyPool) {
                try {
                    const finalU = new URL(ytBase);
                    Object.keys(query).forEach(k => { if(!['endpoint', 'match', 'proxy', 'context'].includes(k)) finalU.searchParams.append(k, String(query[k])); });
                    if (!finalU.searchParams.has('part')) finalU.searchParams.set('part', 'snippet');
                    finalU.searchParams.set('key', key);

                    const ytRes = await fetch(finalU.toString());
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

        // --- SPORTS ROUTE ---
        if (rawPath.startsWith('sports')) {
            const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const eps = ["/soccer/eng.1/scoreboard", "/soccer/uefa.champions/scoreboard", "/basketball/nba/scoreboard"];
            const p = eps.map(ep => fetch(`https://site.api.espn.com/apis/site/v2/sports${ep}?dates=${todayStr}`).then(r => r.json()).catch(() => ({events:[]})));
            const results = await Promise.all(p);
            const fixtures = [];
            results.forEach((r, i) => r.events?.forEach(e => {
                const c = e.competitions?.[0];
                const h = c?.competitors?.find(x => x.homeAway === 'home');
                const a = c?.competitors?.find(x => x.homeAway === 'away');
                fixtures.push({
                    id: e.id, sport: eps[i].split('/')[1], homeTeam: h?.team?.displayName, awayTeam: a?.team?.displayName,
                    homeTeamLogo: h?.team?.logo, awayTeamLogo: a?.team?.logo, isLive: e.status?.type?.name?.includes('LIVE')
                });
            }));
            return res.status(200).json({ success: true, data: fixtures });
        }

        // --- TMDB ROUTE (Default Handler) ---
        let endpoint = String(query.endpoint || "");
        if (!endpoint) endpoint = '/' + rawPath;
        if ((!endpoint || endpoint === "/") && query.query) endpoint = "/search/multi";
        if (!endpoint || endpoint === "/") endpoint = "/movie/popular";

        const tmdbFull = `https://api.themoviedb.org/3${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
        const finalU = new URL(tmdbFull);
        Object.keys(query).forEach(k => { if(k !== 'endpoint' && k !== 'match') finalU.searchParams.append(k, String(query[k])); });
        finalU.searchParams.set('api_key', TMDB_API_KEY);

        const tmdbRes = await fetch(finalU.toString(), {
            headers: { 'Authorization': `Bearer ${TMDB_BEARER}`, 'Accept': 'application/json' }
        });
        const data = await tmdbRes.json();
        return res.status(200).json(data);

    } catch (err) {
        setCors(res);
        return res.status(200).json({ 
            error: true, 
            message: 'Gateway Recovery Mode Active', 
            details: err.message,
            path: rawPath
        });
    }
}
