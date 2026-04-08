import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as crypto from 'crypto';

const TMDB_API_KEY = process.env.TMDB_API_KEY || "decc520d8469eaea0202f55d41a13a0c";
const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZWNjNTIwZDg0NjllYWVhMDIwMmY1NWQ0MWExM2EwYyIsIm5iZiI6MTc1NDgyNjU1Mi4zMTcsInN1YiI6IjY4OTg4NzM4NzczZjAxYzIzNDVkMGRlYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UIMvffG-q5sYc04gTT0efdW_k4Iu4fnOedNfs4cYIu8";
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const YT_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Additional Keys (Pre-filled for user convenience)
const APISPORTS_KEY = process.env.APISPORTS_KEY || "e993ed7d8bcb48b798f7e469af594673";
const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY || "hYQoz7vtpJ0hp4vysj5KuZlmSN1PcxWwEklLGquM";
const FANART_API_KEY = process.env.FANART_API_KEY || "c96f72ba3607fcac11343afbee5e8f97";
const TRAKT_CLIENT_ID = process.env.TRAKT_CLIENT_ID || "3d7c694f8d3e6a841ef0048d59bcf0bb384931Ht6TLmpMc3xhN5euPZo5ecC4RJtfJrJu8";
const TASTEDIVE_API_KEY = process.env.TASTEDIVE_API_KEY || "1070702-Streamlu-F18F9A64";

/**
 * Vercel Serverless Gateway
 * Migrated from Firebase to bypass project-level billing/quota blocks.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Basic CORS (can be further restricted in vercel.json)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const reqPath = req.query.match ? (Array.isArray(req.query.match) ? req.query.match[0] : req.query.match) : "";
    const rawPath = reqPath.replace(/^\/+/, '');
    
    const isTmdbPath = rawPath.includes('tmdb') || 
                      rawPath.startsWith('movie') || 
                      rawPath.startsWith('tv') || 
                      rawPath.startsWith('trending') || 
                      rawPath.startsWith('person') || 
                      rawPath.startsWith('search');

    try {
        // --- TMDB PROXY ---
        if (isTmdbPath || req.query.endpoint) {
            let endpoint = req.query.endpoint as string || req.body?.endpoint;
            
            if (!endpoint) {
                if (rawPath.includes('tmdb/')) {
                    endpoint = '/' + rawPath.split('tmdb/')[1];
                } else if (isTmdbPath) {
                    endpoint = '/' + rawPath;
                }
            }
            
            if (!endpoint) endpoint = "/movie/popular";

            const params = { ...(req.body?.params || {}), ...(req.query || {}) };
            delete params.endpoint;
            delete params.match;

            const response = await axios.get(`${TMDB_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
                params: { ...params, api_key: TMDB_API_KEY },
                headers: { 
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`
                }
            });
            return res.status(200).json(response.data);
        }

        // --- YOUTUBE PROXY (Basic rotation) ---
        if (rawPath.includes('youtube')) {
            const endpoint = req.query.endpoint as string || "/videos";
            const key = process.env.YT_KEYS?.split(',')[0].trim() || "";

            const params = { ...(req.query || {}) };
            delete params.endpoint;
            delete params.match;

            const response = await axios.get(`${YT_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
                params: { ...params, key },
                timeout: 8000
            });
            return res.status(200).json(response.data);
        }

        // Fallback or Status
        res.status(200).json({ status: 'active', message: 'StreamLux Vercel Gateway' });

    } catch (error: any) {
        console.error('Gateway Error:', error.message);
        res.status(error.response?.status || 500).json({ 
            error: 'Gateway Failure', 
            details: error.message 
        });
    }
}
