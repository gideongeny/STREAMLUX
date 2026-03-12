import * as functions from 'firebase-functions';
import axios from 'axios';

// Backend-only YouTube API Keys for Quota Rotation (Loaded from Firebase Config)
let API_KEYS: string[] = [];
try {
    // Config should be stored as a comma-separated string: "key1,key2,key3"
    const keysString = functions.config().youtube?.keys || "";
    API_KEYS = keysString.split(',').map((k: string) => k.trim()).filter(Boolean);
} catch (e) {
    functions.logger.warn("Failed to load YouTube keys from config, using fallbacks.");
}

// Fallbacks only if config is missing (for local testing mostly)
if (API_KEYS.length === 0) {
    API_KEYS = [
        "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc",
        "AIzaSyAQOFn1SVkbrQDJn7VeRMs5vAV1mYErImM",
        "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
        "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY" // Default fallback
    ];
}

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Smart Health Tracking: Keep track of which keys are currently exhausted 
// to avoid hitting them repeatedly and slowing down the user experience.
const deadKeys = new Set<string>();

function getActiveKey(): { key: string, index: number } | null {
    // Find the first key that is NOT dead
    for (let i = 0; i < API_KEYS.length; i++) {
        const candidate = API_KEYS[i];
        if (!deadKeys.has(candidate)) {
            return { key: candidate, index: i };
        }
    }
    
    // If ALL keys are dead, we clear the dead list and hope for a reset.
    functions.logger.error("[YouTube Proxy] ALL keys are dead or exhausted! Flushing dead tracker.");
    deadKeys.clear();
    return { key: API_KEYS[0], index: 0 };
}

function markKeyAsDead(key: string) {
    deadKeys.add(key);
    functions.logger.warn(`[YouTube Proxy] Key marked as DEAD (Quota Exceeded). Total dead keys: ${deadKeys.size}/${API_KEYS.length}`);
}

export const proxyYouTube = functions
    .runWith({ memory: '256MB', timeoutSeconds: 60 })
    .https.onCall(async (data) => {
        const { endpoint, params = {}, retryCount = 0 } = data;

        if (!endpoint) {
            throw new functions.https.HttpsError('invalid-argument', 'YouTube endpoint is required');
        }

        const activeParams = getActiveKey();
        if (!activeParams) {
             throw new functions.https.HttpsError('internal', 'No API keys configured or available.');
        }

        try {
            // Inject the backend-only key
            const queryParams = {
                ...params,
                key: activeParams.key,
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
            const status = error?.response?.status;
            
            // 403 usually means Quota Exceeded for YouTube Data API
            if (status === 403 && retryCount < API_KEYS.length) {
                markKeyAsDead(activeParams.key);
                
                // Recursively retry the backend request with the next healthy key
                functions.logger.info(`[YouTube Proxy] Retrying request (${retryCount + 1}/${API_KEYS.length})...`);
                return exports.proxyYouTube({ ...data, retryCount: retryCount + 1 });
            }

            functions.logger.error('YouTube Proxy Error:', error.message);
            throw new functions.https.HttpsError(
                'internal',
                `Failed to fetch from YouTube: ${error.message}`
            );
        }
    });
