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
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyYouTube = void 0;
const functions = __importStar(require("firebase-functions"));
const axios_1 = __importDefault(require("axios"));
// Backend-only YouTube API Keys for Quota Rotation
const API_KEYS = [
    "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc",
    "AIzaSyAQOFn1SVkbrQDJn7VeRMs5vAV1mYErImM",
    "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
    "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY" // Default fallback
];
const BASE_URL = 'https://www.googleapis.com/youtube/v3';
let currentKeyIndex = 0;
function getActiveKey() {
    return API_KEYS[currentKeyIndex];
}
function rotateKey() {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    functions.logger.warn(`[YouTube Proxy] Quota hit. Rotating to key index: ${currentKeyIndex}`);
}
exports.proxyYouTube = functions
    .runWith({ memory: '256MB', timeoutSeconds: 60 })
    .https.onCall(async (data) => {
    var _a;
    const { endpoint, params = {}, retryCount = 0 } = data;
    if (!endpoint) {
        throw new functions.https.HttpsError('invalid-argument', 'YouTube endpoint is required');
    }
    try {
        // Inject the backend-only key
        const queryParams = Object.assign(Object.assign({}, params), { key: getActiveKey() });
        const response = await axios_1.default.get(`${BASE_URL}${endpoint}`, {
            params: queryParams
        });
        return {
            success: true,
            data: response.data
        };
    }
    catch (error) {
        // Native Backend Quota Rotation logic
        if (((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) === 403 && retryCount < API_KEYS.length) {
            rotateKey();
            // Recursively retry the backend request
            return exports.proxyYouTube(Object.assign(Object.assign({}, data), { retryCount: retryCount + 1 }));
        }
        functions.logger.error('YouTube Proxy Error:', error.message);
        throw new functions.https.HttpsError('internal', `Failed to fetch from YouTube: ${error.message}`);
    }
});
//# sourceMappingURL=youtubeProxy.js.map