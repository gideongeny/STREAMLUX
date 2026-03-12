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
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.healthCheck = exports.resolveStream = exports.proxy = exports.proxyScrapers = exports.proxyExternalAPI = exports.proxyYouTube = exports.proxyTMDB = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const resolver_1 = require("./resolver");
var tmdbProxy_1 = require("./tmdbProxy");
Object.defineProperty(exports, "proxyTMDB", { enumerable: true, get: function () { return tmdbProxy_1.proxyTMDB; } });
var youtubeProxy_1 = require("./youtubeProxy");
Object.defineProperty(exports, "proxyYouTube", { enumerable: true, get: function () { return youtubeProxy_1.proxyYouTube; } });
var externalProxy_1 = require("./externalProxy");
Object.defineProperty(exports, "proxyExternalAPI", { enumerable: true, get: function () { return externalProxy_1.proxyExternalAPI; } });
var scraperProxy_1 = require("./scraperProxy");
Object.defineProperty(exports, "proxyScrapers", { enumerable: true, get: function () { return scraperProxy_1.proxyScrapers; } });
var corsProxy_1 = require("./corsProxy");
Object.defineProperty(exports, "proxy", { enumerable: true, get: function () { return corsProxy_1.corsProxy; } });
// Initialize Firebase Admin
admin.initializeApp();
/**
 * HTTP Callable Function: Resolve Stream URL
 *
 * This function uses a headless browser to extract direct media URLs from embed providers.
 * It intercepts network requests and returns the direct video stream URL.
 *
 * Configuration:
 * - Memory: 2GB (required for headless Chrome)
 * - Timeout: 300 seconds
 * - Region: us-central1
 */
/**
 * HTTP Endpoint: Resolve Stream URL
 *
 * This function uses a headless browser to extract direct media URLs from embed providers.
 */
exports.resolveStream = functions
    .runWith({
    memory: '2GB',
    timeoutSeconds: 300,
})
    .https.onRequest(async (req, res) => {
    // CORS setup
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    const data = req.method === 'POST' ? req.body : req.query;
    const { providerUrl, mediaType, tmdbId } = data;
    // Validate input
    if (!providerUrl || typeof providerUrl !== 'string') {
        res.status(400).json({ error: 'Provider URL is required and must be a string.' });
        return;
    }
    try {
        functions.logger.info('Resolving stream URL', { providerUrl, mediaType, tmdbId });
        // Call the resolver to extract the direct media URL
        const result = await (0, resolver_1.resolveMediaUrl)(providerUrl);
        res.status(200).json(Object.assign({ success: true }, result));
    }
    catch (error) {
        functions.logger.error('Error resolving stream URL', {
            error: error.message,
            providerUrl,
        });
        res.status(500).json({
            error: `Failed to resolve stream URL: ${error.message}`
        });
    }
});
/**
 * HTTP Endpoint: Health Check
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});
/**
 * Scheduled Function: Keep Alive
 */
// export const keepAlive = functions.pubsub.schedule('every 15 minutes').onRun(async (_context) => {
//     try {
//         console.log('Keep alive ping at', new Date().toISOString());
//         return null;
//     } catch (error) {
//         console.error('Keep alive failed', error);
//         return null;
//     }
// });
/**
 * Unified API Entry Point (REST)
 * Fulfills the /api/** rewrite in firebase.json
 */
exports.api = functions.https.onRequest(async (req, res) => {
    const path = req.path.replace(/^\/api\//, '');
    // Routing logic
    if (path.startsWith('proxy/tmdb') || path.startsWith('tmdb')) {
        return exports.proxyTMDB(req, res);
    }
    if (path.startsWith('proxy/youtube') || path.startsWith('youtube')) {
        return exports.proxyYouTube(req, res);
    }
    if (path.startsWith('proxy/external') || path.startsWith('external')) {
        return exports.proxyExternalAPI(req, res);
    }
    if (path.startsWith('scrapers')) {
        return exports.proxyScrapers(req, res);
    }
    if (path === 'resolve' || path === 'proxy/resolve') {
        return exports.resolveStream(req, res);
    }
    if (path === 'proxy' || path === 'cors') {
        return exports.corsProxy(req, res);
    }
    if (path === 'health') {
        return exports.healthCheck(req, res);
    }
    res.status(404).json({ error: 'API route not found', path });
});
//# sourceMappingURL=index.js.map