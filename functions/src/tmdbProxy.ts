import * as functions from 'firebase-functions';
import axios from 'axios';

// The TMDB API Key should be set in Firebase Config:
// firebase functions:config:set tmdb.key="YOUR_API_KEY"
// For now, we'll embed the key here to ensure a smooth transition, but it is executed purely backend-side.
const TMDB_API_KEY = "69ef02da25ccfbc48bfd094eb8e348f9"; 
const BASE_URL = 'https://api.themoviedb.org/3';

export const proxyTMDB = functions
    .runWith({ memory: '256MB', timeoutSeconds: 60 })
    .https.onRequest(async (req, res) => {
        // Handle CORS
        res.set('Access-Control-Allow-Origin', '*');
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
