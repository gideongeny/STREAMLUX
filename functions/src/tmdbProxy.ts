import * as functions from 'firebase-functions';
import axios from 'axios';

// The TMDB API Key should be set in Firebase Config:
// firebase functions:config:set tmdb.key="YOUR_API_KEY"
// For now, we'll embed the key here to ensure a smooth transition, but it is executed purely backend-side.
const TMDB_API_KEY = "69ef02da25ccfbc48bfd094eb8e348f9"; 
const BASE_URL = 'https://api.themoviedb.org/3';

export const proxyTMDB = functions
    .runWith({ memory: '256MB', timeoutSeconds: 60 })
    .https.onCall(async (data) => {
        try {
            const { endpoint, params = {} } = data;

            if (!endpoint) {
                throw new functions.https.HttpsError('invalid-argument', 'TMDB endpoint is required');
            }

            // Inject the private server key into the request
            const queryParams = {
                ...params,
                api_key: TMDB_API_KEY,
            };

            const response = await axios.get(`${BASE_URL}${endpoint}`, {
                params: queryParams,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                data: response.data
            };

        } catch (error: any) {
            functions.logger.error('TMDB Proxy Error:', error.message);
            throw new functions.https.HttpsError(
                'internal',
                `Failed to fetch from TMDB: ${error.message}`
            );
        }
    });
