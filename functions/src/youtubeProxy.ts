import * as functions from 'firebase-functions';
import axios from 'axios';

// Backend-only YouTube API Keys for Quota Rotation
const API_KEYS = [
    "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc",
    "AIzaSyAQOFn1SVkbrQDJn7VeRMs5vAV1mYErImM",
    "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
    "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY" // Default fallback
];
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

let currentKeyIndex = 0;

function getActiveKey(): string {
    return API_KEYS[currentKeyIndex];
}

function rotateKey() {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    functions.logger.warn(`[YouTube Proxy] Quota hit. Rotating to key index: ${currentKeyIndex}`);
}

export const proxyYouTube = functions
    .runWith({ memory: '256MB', timeoutSeconds: 60 })
    .https.onCall(async (data) => {
        const { endpoint, params = {}, retryCount = 0 } = data;

        if (!endpoint) {
            throw new functions.https.HttpsError('invalid-argument', 'YouTube endpoint is required');
        }

        try {
            // Inject the backend-only key
            const queryParams = {
                ...params,
                key: getActiveKey(),
            };

            const response = await axios.get(`${BASE_URL}${endpoint}`, {
                params: queryParams
            });

            return {
                success: true,
                data: response.data
            };

        } catch (error: any) {
            // Native Backend Quota Rotation logic
            if (error?.response?.status === 403 && retryCount < API_KEYS.length) {
                rotateKey();
                // Recursively retry the backend request
                return exports.proxyYouTube({ ...data, retryCount: retryCount + 1 });
            }

            functions.logger.error('YouTube Proxy Error:', error.message);
            throw new functions.https.HttpsError(
                'internal',
                `Failed to fetch from YouTube: ${error.message}`
            );
        }
    });
