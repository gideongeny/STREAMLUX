import * as functions from 'firebase-functions';
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const BASE_URL = 'https://api.themoviedb.org/3';

export const proxyTMDB = functions
    .runWith({ memory: '256MB', timeoutSeconds: 60 })
    .https.onRequest(async (req, res) => {
        // --- SECURE CORS ---
        const allowedOrigins = [
            'https://streamlux-67a84.web.app', 
            'https://streamlux-67a84.firebaseapp.com',
            'http://localhost:5173',
            'http://localhost:3000'
        ];
        const origin = req.headers.origin;
        if (origin && allowedOrigins.includes(origin)) {
            res.set('Access-Control-Allow-Origin', origin);
        }
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        try {
            const endpoint = req.query.endpoint as string || req.body.endpoint;
            const params = req.body.params || req.query || {};

            if (!endpoint) {
                res.status(400).json({ error: 'TMDB endpoint is required' });
                return;
            }

            // Remove internal proxy params if they leaked into query
            delete (params as any).endpoint;

            const response = await axios.get(`${BASE_URL}${endpoint}`, {
                params: {
                    ...params,
                    api_key: TMDB_API_KEY,
                },
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            res.status(200).json(response.data);

        } catch (error: any) {
            functions.logger.error('TMDB Proxy Error:', error.message);
            res.status(error.response?.status || 500).json({
                error: 'Failed to fetch from TMDB',
                details: error.message
            });
        }
    });
