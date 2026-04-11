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
    const OPENROUTER_KEY = "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";
    
    const YT_KEYS = [
        "AIzaSyBXl3lLvGxMOtqtYn75f_X68mc8P-O81qQ", // Movie
        "AIzaSyC4Mz02lYxZSdaA5N-l363GlIJiblhC3sM", // TV
        "AIzaSyB8lDctBCl-3JPNgJSau3TvulbevDyvNyQ", // Music
        "AIzaSyAlENC10uKVhrDGqgzUeOiNysiUFoDof9o"  // General
    ];

    // --- GLOBAL YOUTUBE FETCHER WITH AUTO-ROTATION ---
    const fetchYT = async (path, params = {}) => {
        const baseUrl = `https://www.googleapis.com/youtube/v3${path.startsWith('/') ? path : '/' + path}`;
        for (const key of YT_KEYS) {
            try {
                const url = new URL(baseUrl);
                Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
                url.searchParams.set('key', key);
                if (!url.searchParams.has('part')) url.searchParams.set('part', 'snippet');

                const res = await fetch(url.toString());
                const data = await res.json();
                
                if (data.error) {
                    const reason = data.error.errors?.[0]?.reason || "";
                    if (['quotaExceeded', 'keyInvalid', 'dailyLimitExceeded', 'forbidden'].includes(reason)) {
                        console.warn(`[Gateway] Key exhausted: ${key.slice(0,10)}... Reason: ${reason}. Retrying next...`);
                        continue;
                    }
                    return { error: data.error.message, items: [] };
                }
                return data;
            } catch (e) {
                console.error("[Gateway] YT Fetch Error:", e.message);
            }
        }
        return { error: "All API keys exhausted for today. StreamLux fallback active.", items: [] };
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
        // --- MUSIC ROUTE (Saavn + YT Parallel Hybrid) ---
        if (rawPath.startsWith('music') || rawPath.includes('saavn')) {
            const q = query.q || query.query || 'US Billboard Top Hits 2024';
            
            // Parallel Fetch: Try both Saavn and YouTube simultaneously
            const results = await Promise.allSettled([
                // 1. Saavn Trending / Search
                fetch(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(String(q))}&limit=20`),
                // 2. YouTube Music Official (Using Unified Failsafe)
                fetchYT('/search', {
                    q: `Official Music Video ${q}`,
                    type: 'video',
                    videoCategoryId: '10',
                    videoEmbeddable: 'true',
                    maxResults: '20'
                })
            ]);

            const finalItems = [];
            let saavnData = null;

            // Process Saavn
            if (results[0].status === 'fulfilled') {
                try {
                    const sRes = results[0].value;
                    const sData = await sRes.json();
                    saavnData = sData; 
                    const items = (sData.data?.results || sData.data || sData.results || sData);
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            if (item.id) {
                                item.source = 'saavn';
                                finalItems.push(item);
                            }
                        });
                    }
                } catch(e) {}
            }

            // Process YouTube
            if (results[1].status === 'fulfilled') {
                try {
                    const yData = results[1].value;
                    if (yData.items && Array.isArray(yData.items)) {
                        yData.items.forEach(item => {
                            item.source = 'youtube';
                            finalItems.push(item);
                        });
                    }
                } catch(e) {}
            }

            const merged = [];
            const saavnList = finalItems.filter(i => i.source === 'saavn');
            const ytList = finalItems.filter(i => i.source === 'youtube');
            const max = Math.max(saavnList.length, ytList.length);
            for (let i = 0; i < max; i++) {
                if (ytList[i]) merged.push(ytList[i]);
                if (saavnList[i]) merged.push(saavnList[i]);
            }

            return res.status(200).json({ 
                status: 'SUCCESS', data: merged, items: merged, 
                saavnCount: saavnList.length, ytCount: ytList.length 
            });
        }

        // --- YOUTUBE ROUTE (Unified Logic) ---
        if (rawPath.includes('youtube') || rawPath.includes('yt')) {
            const endpoint = String(query.endpoint || "/search");
            const cleanQuery = { ...query };
            delete cleanQuery.endpoint;
            delete cleanQuery.match;
            delete cleanQuery.proxy;
            delete cleanQuery.context;

            const data = await fetchYT(endpoint, cleanQuery);
            res.setHeader('Cache-Control', 's-maxage=28800, stale-while-revalidate=3600');
            return res.status(200).json(data);
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

        // --- GENIUS AI CHATBOT ROUTE (OpenRouter) ---
        if (rawPath === 'genius' || rawPath.startsWith('genius') || rawPath.includes('geniusProxy')) {
            const body = req.body || {};
            const prompt = body.prompt || body.message || '';
            const persona = body.persona || 'BUTLER';

            const PERSONA_PROMPTS = {
                BUTLER: 'You are Genius, the polite and knowledgeable AI assistant for StreamLux, a premium streaming platform. You help users find movies, TV shows, live sports, music and live TV channels. Always be concise, helpful and elegant.',
                CRITIC: 'You are The Critic, a sharp analytical AI assistant for StreamLux. You give honest, precise recommendations and assessments about movies, TV shows, music, and live sports. Be direct and insightful.',
                FAN: 'You are The Fan, an enthusiastic and knowledgeable AI assistant for StreamLux. You love movies, TV shows, sports, and music. Share your excitement when helping users discover great content!'
            };

            const systemPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.BUTLER;

            const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://streamlux-67a84.web.app',
                    'X-Title': 'StreamLux Genius AI'
                },
                body: JSON.stringify({
                    model: 'meta-llama/llama-4-maverick:free',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 400,
                    temperature: 0.8
                })
            });

            const aiData = await aiRes.json();
            const answer = aiData.choices?.[0]?.message?.content 
                || aiData.error?.message 
                || "I'm having a moment of silence. Please try again!";

            return res.status(200).json({ answer });
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
