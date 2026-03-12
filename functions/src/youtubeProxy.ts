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
    .https.onRequest(async (req, res) => {
        // Handle CORS
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        const endpoint = req.query.endpoint as string || req.body.endpoint;
        const params = req.body.params || req.query || {};
        const retryCount = parseInt(req.query.retryCount as string || req.body.retryCount || "0");

        if (!endpoint) {
            res.status(400).json({ error: 'YouTube endpoint is required' });
            return;
        }

        const activeParams = getActiveKey();
        if (!activeParams) {
             res.status(500).json({ error: 'No API keys configured or available.' });
             return;
        }

        try {
            // Remove internal proxy params
            delete (params as any).endpoint;
            delete (params as any).retryCount;

            const response = await axios.get(`${BASE_URL}${endpoint}`, {
                params: {
                    ...params,
                    key: activeParams.key,
                }
            });

            res.status(200).json(response.data);

        } catch (error: any) {
            const status = error?.response?.status;
            
            // 403 usually means Quota Exceeded for YouTube Data API
            if (status === 403 && retryCount < API_KEYS.length) {
                markKeyAsDead(activeParams.key);
                
                // Recursively retry by calling a local version of our logic or just looping
                // Since this is onRequest, we can just loop until success or exhaust keys
                functions.logger.info(`[YouTube Proxy] Retrying internally (${retryCount + 1}/${API_KEYS.length})...`);
                
                // We'll redirect to ourself for the retry to keep the logic clean, 
                // but incrementing retryCount to avoid infinite loops
                const nextRetryCount = retryCount + 1;
                
                // For a more robust internal retry without a second HTTP hop:
                let currentRetry = nextRetryCount;
                let currentKeyParams = getActiveKey();
                
                while (currentRetry < API_KEYS.length && currentKeyParams) {
                   try {
                       const retryResponse = await axios.get(`${BASE_URL}${endpoint}`, {
                           params: { ...params, key: currentKeyParams.key }
                       });
                       res.status(200).json(retryResponse.data);
                       return;
                   } catch (err: any) {
                       if (err?.response?.status === 403) {
                           markKeyAsDead(currentKeyParams.key);
                           currentKeyParams = getActiveKey();
                           currentRetry++;
                       } else {
                           throw err;
                       }
                   }
                }
            }

            functions.logger.error('YouTube Proxy Error:', error.message);
            res.status(error.response?.status || 500).json({
                error: 'Failed to fetch from YouTube',
                details: error.message
            });
        }
    });
