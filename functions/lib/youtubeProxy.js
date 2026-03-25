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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyYouTube = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
// Initialize admin if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
// Backend-only YouTube API Keys for Quota Rotation
let API_KEYS = [];
try {
    const keysString = ((_a = functions.config().youtube) === null || _a === void 0 ? void 0 : _a.keys) || "";
    API_KEYS = keysString.split(',').map((k) => k.trim()).filter(Boolean);
}
catch (e) {
    functions.logger.warn("Failed to load YouTube keys from config, using fallbacks.");
}
if (API_KEYS.length === 0) {
    API_KEYS = [
        "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc",
        "AIzaSyAQOFn1SVkbrQDJn7VeRMs5vAV1mYErImM",
        "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
        "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY"
    ];
}
const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const deadKeys = new Set();
const SPECIAL_KEYS = {
    "sports": "AIzaSyBo8OwaCOTQsppnpaJV_nU9ollTlbI0chM",
    "entertainment": "AIzaSyBIV8LYYwPg5CWXn6W0aL5Z6P8-c_AATrY"
};
function getActiveKey(context) {
    if (context && SPECIAL_KEYS[context]) {
        const specialKey = SPECIAL_KEYS[context];
        if (!deadKeys.has(specialKey)) {
            return { key: specialKey, index: -1 };
        }
    }
    for (let i = 0; i < API_KEYS.length; i++) {
        const candidate = API_KEYS[i];
        if (!deadKeys.has(candidate)) {
            return { key: candidate, index: i };
        }
    }
    deadKeys.clear();
    if (context && SPECIAL_KEYS[context]) {
        return { key: SPECIAL_KEYS[context], index: -1 };
    }
    return { key: API_KEYS[0], index: 0 };
}
function markKeyAsDead(key) {
    deadKeys.add(key);
}
// CACHE HELPER: Hash request for infinite-ish keys
function getCacheKey(endpoint, params) {
    const raw = `${endpoint}_${JSON.stringify(params)}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
}
exports.proxyYouTube = functions
    .runWith({ memory: '256MB', timeoutSeconds: 60 })
    .https.onRequest(async (req, res) => {
    var _a, _b, _c;
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    const endpoint = req.query.endpoint || req.body.endpoint;
    const params = req.body.params || req.query || {};
    const context = req.query.context || req.body.context;
    const noCache = req.query.noCache === 'true' || req.body.noCache === true;
    if (!endpoint) {
        res.status(400).json({ error: 'YouTube endpoint is required' });
        return;
    }
    // 1. CHECK CACHE FIRST (Save Quota!)
    const cacheId = getCacheKey(endpoint, params);
    if (!noCache) {
        try {
            const cacheDoc = await db.collection('youtube_cache').doc(cacheId).get();
            if (cacheDoc.exists) {
                const data = cacheDoc.data();
                const now = Date.now();
                const expiry = 48 * 60 * 60 * 1000; // 48 hours for trailers/highlights
                if (data && (now - data.timestamp < expiry)) {
                    functions.logger.info(`[YouTube Cache] HIT for ${endpoint} - saved 100 quota units!`);
                    res.status(200).json(data.payload);
                    return;
                }
            }
        }
        catch (e) {
            functions.logger.warn("[YouTube Cache] Read failed, proceeding to API.");
        }
    }
    const activeParams = getActiveKey(context);
    if (!activeParams) {
        res.status(500).json({ error: 'No API keys configured or available.' });
        return;
    }
    try {
        // Remove internal proxy params
        const cleanParams = Object.assign({}, params);
        delete cleanParams.endpoint;
        delete cleanParams.retryCount;
        delete cleanParams.context;
        delete cleanParams.noCache;
        const response = await axios_1.default.get(`${BASE_URL}${endpoint}`, {
            params: Object.assign(Object.assign({}, cleanParams), { key: activeParams.key })
        });
        // 2. STORE IN CACHE (Background)
        db.collection('youtube_cache').doc(cacheId).set({
            timestamp: Date.now(),
            payload: response.data,
            endpoint
        }).catch(e => functions.logger.warn("[YouTube Cache] Write failed:", e));
        res.status(200).json(response.data);
    }
    catch (error) {
        const status = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status;
        if (status === 403) {
            markKeyAsDead(activeParams.key);
            // Attempt internal retry loop
            let currentKeyParams = getActiveKey(context);
            while (currentKeyParams) {
                try {
                    const retryRes = await axios_1.default.get(`${BASE_URL}${endpoint}`, {
                        params: Object.assign(Object.assign({}, params), { key: currentKeyParams.key })
                    });
                    // Cache the retry success too
                    db.collection('youtube_cache').doc(cacheId).set({
                        timestamp: Date.now(),
                        payload: retryRes.data,
                        endpoint
                    }).catch(e => { });
                    res.status(200).json(retryRes.data);
                    return;
                }
                catch (err) {
                    if (((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.status) === 403) {
                        markKeyAsDead(currentKeyParams.key);
                        currentKeyParams = getActiveKey(context);
                    }
                    else {
                        break;
                    }
                }
            }
        }
        res.status(((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) || 500).json({
            error: 'Failed to fetch from YouTube',
            details: error.message
        });
    }
});
//# sourceMappingURL=youtubeProxy.js.map