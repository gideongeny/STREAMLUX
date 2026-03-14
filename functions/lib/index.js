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
exports.resolveStream = exports.proxy = exports.proxyScrapers = exports.proxyExternalAPI = exports.proxyYouTube = exports.proxyTMDB = exports.gateway = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
// Initialize Firebase Admin
admin.initializeApp();
const footballScraper_1 = require("./scrapers/footballScraper");
const TMDB_API_KEY = "69ef02da25ccfbc48bfd094eb8e348f9";
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const YT_BASE_URL = 'https://www.googleapis.com/youtube/v3';
// Backend-only YouTube API Keys for Quota Rotation
const YT_KEYS = [
    "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc",
    "AIzaSyAQOFn1SVkbrQDJn7VeRMs5vAV1mYErImM",
    "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
    "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY",
    "AIzaSyBo8OwaCOTQsppnpaJV_nU9ollTlbI0chM",
    "AIzaSyBIV8LYYwPg5CWXn6W0aL5Z6P8-c_AATrY"
];
const deadKeys = new Set();
/**
 * Consolidated Gateway Function
 * Handles TMDB, YouTube, and CORS/External proxies in one robust endpoint.
 */
exports.gateway = functions
    .runWith({ memory: '1GB', timeoutSeconds: 120 })
    .https.onRequest(async (req, res) => {
    var _a, _b;
    // Standard CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    const reqPath = req.path || "";
    const rawPath = reqPath.replace(/^\/api\//, '').replace(/^\/+/, '');
    try {
        // --- TMDB PROXY ---
        if (rawPath.includes('tmdb')) {
            const endpoint = req.body.endpoint || req.query.endpoint || "/movie/popular";
            const params = Object.assign(Object.assign({}, (req.body.params || {})), (req.query || {}));
            delete params.endpoint;
            const response = await axios_1.default.get(`${TMDB_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
                params: Object.assign(Object.assign({}, params), { api_key: TMDB_API_KEY })
            });
            res.status(200).json(response.data);
            return;
        }
        // --- YOUTUBE PROXY ---
        if (rawPath.includes('youtube')) {
            const endpoint = req.body.endpoint || req.query.endpoint || "/videos";
            const params = Object.assign(Object.assign({}, (req.body.params || {})), (req.query || {}));
            delete params.endpoint;
            delete params.context;
            let key = YT_KEYS[0];
            for (const k of YT_KEYS) {
                if (!deadKeys.has(k)) {
                    key = k;
                    break;
                }
            }
            try {
                const response = await axios_1.default.get(`${YT_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
                    params: Object.assign(Object.assign({}, params), { key })
                });
                res.status(200).json(response.data);
                return;
            }
            catch (err) {
                if (((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) === 403)
                    deadKeys.add(key);
                throw err;
            }
        }
        // --- CORS / EXTERNAL PROXY ---
        if (rawPath.includes('proxy/external') || rawPath.includes('external')) {
            const { provider, endpoint, params } = Object.assign(Object.assign({}, (req.query || {})), (req.body || {}));
            if (!provider) {
                res.status(400).json({ error: 'Missing provider parameter' });
                return;
            }
            let targetUrl = "";
            let headers = {
                'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
            };
            switch (provider) {
                case "sportmonks":
                    const smKey = "pWJ9QW6z7Y6U0uI4R8K9O2Q7L5V3M1N0";
                    targetUrl = `https://api.sportmonks.com/v3/football${endpoint}`;
                    const smParams = Object.assign(Object.assign({}, params), { api_token: smKey });
                    const smResponse = await axios_1.default.get(targetUrl, { params: smParams });
                    res.status(200).json(smResponse.data);
                    return;
                case "apisports":
                    const asKey = "418210481bfff05ff4c1a61d285a0942";
                    targetUrl = `https://v3.football.api-sports.io${endpoint}`;
                    const asResponse = await axios_1.default.get(targetUrl, {
                        params,
                        headers: Object.assign(Object.assign({}, headers), { "x-apisports-key": asKey })
                    });
                    res.status(200).json(asResponse.data);
                    return;
                case "scorebat":
                    const sbToken = "Mjc3ODY0XzE3NzE3NjU0MTNfZWFiMWQ1NGRmOTkxNTY3ZjgxNjQ4Y2IyNDMyMTYxYjU2NmZiZjZhMA==";
                    targetUrl = "https://www.scorebat.com/video-api/v3/feed/";
                    const sbResponse = await axios_1.default.get(targetUrl, {
                        params: Object.assign(Object.assign({}, params), { token: sbToken })
                    });
                    res.status(200).json(sbResponse.data);
                    return;
                case "espn":
                    targetUrl = `https://site.api.espn.com/apis/site/v2/sports${endpoint}`;
                    const espnResponse = await axios_1.default.get(targetUrl, { params });
                    res.status(200).json(espnResponse.data);
                    return;
                case "thesportsdb":
                    targetUrl = `https://www.thesportsdb.com/api/v1/json/3${endpoint}`;
                    const tsdbResponse = await axios_1.default.get(targetUrl, { params });
                    res.status(200).json(tsdbResponse.data);
                    return;
                case "sportslivetoday":
                    const scrapedMatches = await (0, footballScraper_1.scrapeSportsLiveToday)();
                    res.status(200).json({ success: true, response: scrapedMatches });
                    return;
                default:
                    // Generic proxy fallback
                    const url = req.query.url || req.body.url;
                    if (!url) {
                        res.status(400).json({ error: 'Unsupported provider and missing target URL' });
                        return;
                    }
                    const response = await axios_1.default.get(url, {
                        headers: Object.assign(Object.assign({}, headers), { 'Referer': new URL(url).origin }),
                        responseType: 'stream'
                    });
                    res.set('Content-Type', response.headers['content-type']);
                    response.data.pipe(res);
                    return;
            }
        }
        // --- HEALTH CHECK ---
        if (rawPath.includes('health')) {
            res.status(200).json({
                status: 'online',
                gateway: 'consolidated-v2-sports',
                timestamp: Date.now()
            });
            return;
        }
        res.status(404).json({ error: 'Gateway route not found', path: rawPath });
    }
    catch (error) {
        console.error('[Gateway Error]', error.message);
        res.status(((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500).json({
            error: 'Gateway failed to fetch upstream',
            details: error.message
        });
    }
});
// Maintain back-compat exports
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
var resolver_1 = require("./resolver");
Object.defineProperty(exports, "resolveStream", { enumerable: true, get: function () { return resolver_1.resolveStream; } });
//# sourceMappingURL=index.js.map