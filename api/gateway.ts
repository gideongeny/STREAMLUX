const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY || "decc520d8469eaea0202f55d41a13a0c";
const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWNjNTIwZDg0NjllYWVhMDIwMmY1NWQ0MWExM2EwYyIsIm5iZiI6MTc1NDgyNjU1Mi4zMTcsInN1YiI6IjY4OTg4NzM4NzczZjAxYzIzNDVkMGRlYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UIMvffG-q5sYc04gTT0efdW_k4Iu4fnOedNfs4cYIu8";
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const YT_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Additional Keys
const APISPORTS_KEY = process.env.APISPORTS_KEY || "e993ed7d8bcb48b798f7e469af594673";

/**
 * Vercel Serverless Gateway
 * Ultra-stable Node.js version to prevent FUNCTION_INVOCATION_FAILED.
 */
module.exports = async (req, res) => {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. Safely Parse Incoming Data
    const query = req.query || {};
    const body = req.body || {};
    const match = query.match || "";
    const rawPath = (Array.isArray(match) ? match[0] : String(match)).replace(/^\/+/, '');

    // 3. Path Detection
    const isTmdbPath = rawPath.includes('tmdb') || 
                      rawPath.startsWith('movie') || 
                      rawPath.startsWith('tv') || 
                      rawPath.startsWith('trending') || 
                      rawPath.startsWith('person') || 
                      rawPath.startsWith('search') ||
                      rawPath.startsWith('configuration') ||
                      rawPath.startsWith('genre') ||
                      rawPath.startsWith('discover');

    try {
        // --- TMDB PROXY ---
        if (isTmdbPath || query.endpoint) {
            let endpoint = String(query.endpoint || body.endpoint || "");
            
            if (!endpoint) {
                if (rawPath.includes('tmdb/')) {
                    endpoint = '/' + rawPath.split('tmdb/')[1];
                } else if (isTmdbPath) {
                    endpoint = '/' + rawPath;
                }
            }
            
            if (!endpoint || endpoint === "/") {
                endpoint = "/movie/popular";
            }

            // Clean internal params
            const params = { ...query, ...body };
            delete params.endpoint;
            delete params.match;

            const targetUrl = `${TMDB_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
            
            const response = await axios.get(targetUrl, {
                params: { ...params, api_key: TMDB_API_KEY },
                headers: { 
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`
                }
            });
            return res.status(200).json(response.data);
        }

        // --- YOUTUBE PROXY ---
        if (rawPath.includes('youtube')) {
            const endpoint = String(query.endpoint || "/videos");
            const key = String(process.env.YT_KEYS || "").split(',')[0].trim() || "";

            const params = { ...query };
            delete params.endpoint;
            delete params.match;

            const response = await axios.get(`${YT_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
                params: { ...params, key },
                timeout: 8000
            });
            return res.status(200).json(response.data);
        }

        // 4. Default Success (Ping)
        return res.status(200).json({ 
            status: 'active', 
            service: 'StreamLux Gateway',
            version: '2.0.1-stable',
            path: rawPath
        });

    } catch (error) {
        const errorStatus = error.response?.status || 500;
        const errorMessage = error.response?.data?.status_message || error.message;
        
        console.error(`[Gateway Error] ${errorStatus}:`, errorMessage);
        
        return res.status(errorStatus).json({ 
            error: 'Gateway Failure', 
            message: errorMessage,
            target: (error.config?.url || 'internal').split('?')[0]
        });
    }
};
