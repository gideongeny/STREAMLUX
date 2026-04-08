/**
 * Vercel Gateway: Zero-Dependency Version
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

    const query = req.query || {};
    const match = query.match || "";
    const rawPath = (Array.isArray(match) ? match[0] : String(match)).replace(/^\/+/, '');

    // 3. Logic: Detect TMDB/YouTube
    const isTmdbPath = rawPath.includes('tmdb') || 
                      ['movie', 'tv', 'trending', 'person', 'search', 'configuration', 'genre', 'discover'].some(p => rawPath.startsWith(p));

    try {
        if (isTmdbPath || query.endpoint) {
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

        if (rawPath.includes('youtube')) {
            const endpoint = String(query.endpoint || "/videos");
            const key = String(process.env.YT_KEYS || "").split(',')[0].trim();
            
            const finalParams = new URLSearchParams();
            Object.keys(query).forEach(k => { if(k !== 'endpoint' && k !== 'match') finalParams.append(k, String(query[k])); });
            finalParams.set('key', key);

            const ytUrl = `${YT_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}?${finalParams.toString()}`;
            
            const ytResponse = await fetch(ytUrl);
            const data = await ytResponse.json();
            return res.status(ytResponse.status).json(data);
        }

        // Default Status
        return res.status(200).json({ 
            status: 'active', 
            mode: 'zero-dependency',
            path: rawPath
        });

    } catch (err) {
        console.error('[Zero-Dep Error]:', err.message);
        return res.status(500).json({ 
            error: 'Gateway Failure', 
            message: err.message,
            stack: err.stack?.slice(0, 100)
        });
    }
};
