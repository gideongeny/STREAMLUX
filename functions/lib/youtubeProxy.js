"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyYouTube = void 0;
const functions = __importStar(require("firebase-functions"));
const axios_1 = __importDefault(require("axios"));
// Backend-only YouTube API Keys for Quota Rotation (Loaded from Firebase Config)
let API_KEYS = [];
try {
    // Config should be stored as a comma-separated string: "key1,key2,key3"
    const keysString = ((_a = functions.config().youtube) === null || _a === void 0 ? void 0 : _a.keys) || "";
    API_KEYS = keysString.split(',').map((k) => k.trim()).filter(Boolean);
}
catch (e) {
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
const deadKeys = new Set();
// High-priority keys for specific sections to ensure they always have quota
const SPECIAL_KEYS = {
    "sports": "AIzaSyBo8OwaCOTQsppnpaJV_nU9ollTlbI0chM",
    "entertainment": "AIzaSyBIV8LYYwPg5CWXn6W0aL5Z6P8-c_AATrY"
};
function getActiveKey(context) {
    // If a context key is requested and not dead, use it
    if (context && SPECIAL_KEYS[context]) {
        const specialKey = SPECIAL_KEYS[context];
        if (!deadKeys.has(specialKey)) {
            return { key: specialKey, index: -1 };
        }
    }
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
    if (context && SPECIAL_KEYS[context]) {
        return { key: SPECIAL_KEYS[context], index: -1 };
    }
    return { key: API_KEYS[0], index: 0 };
}
function markKeyAsDead(key) {
    deadKeys.add(key);
    functions.logger.warn(`[YouTube Proxy] Key marked as DEAD (Quota Exceeded). Total dead keys: ${deadKeys.size}/${API_KEYS.length}`);
}
exports.proxyYouTube = functions
    .runWith({ memory: '256MB', timeoutSeconds: 60 })
    .https.onRequest(async (req, res) => {
    var _a, _b, _c;
    // Handle CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    const endpoint = req.query.endpoint || req.body.endpoint;
    const params = req.body.params || req.query || {};
    const retryCount = parseInt(req.query.retryCount || req.body.retryCount || "0");
    const context = req.query.context || req.body.context;
    if (!endpoint) {
        res.status(400).json({ error: 'YouTube endpoint is required' });
        return;
    }
    const activeParams = getActiveKey(context);
    if (!activeParams) {
        res.status(500).json({ error: 'No API keys configured or available.' });
        return;
    }
    try {
        // Remove internal proxy params
        delete params.endpoint;
        delete params.retryCount;
        delete params.context;
        const response = await axios_1.default.get(`${BASE_URL}${endpoint}`, {
            params: Object.assign(Object.assign({}, params), { key: activeParams.key })
        });
        res.status(200).json(response.data);
    }
    catch (error) {
        const status = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status;
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
            let currentKeyParams = getActiveKey(context);
            while (currentRetry < API_KEYS.length && currentKeyParams) {
                try {
                    const retryResponse = await axios_1.default.get(`${BASE_URL}${endpoint}`, {
                        params: Object.assign(Object.assign({}, params), { key: currentKeyParams.key })
                    });
                    res.status(200).json(retryResponse.data);
                    return;
                }
                catch (err) {
                    if (((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.status) === 403) {
                        markKeyAsDead(currentKeyParams.key);
                        currentKeyParams = getActiveKey(context);
                        currentRetry++;
                    }
                    else {
                        throw err;
                    }
                }
            }
        }
        functions.logger.error('YouTube Proxy Error:', error.message);
        res.status(((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) || 500).json({
            error: 'Failed to fetch from YouTube',
            details: error.message
        });
    }
});
//# sourceMappingURL=youtubeProxy.js.map