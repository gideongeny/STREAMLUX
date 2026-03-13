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
exports.proxyExternalAPI = void 0;
const functions = __importStar(require("firebase-functions"));
const axios_1 = __importDefault(require("axios"));
// Environment variables configured in Firebase
const OMDB_API_KEY = process.env.REACT_APP_OMDB_API_KEY || "eb87a867";
/**
 * Universal Proxy for handling external API calls that require sensitive keys.
 * This hides the OMDB_API_KEY and other secondary metadata keys from the client.
 */
exports.proxyExternalAPI = functions.https.onRequest(async (req, res) => {
    // CORS setup
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    const { provider, endpoint, params } = req.body || req.query || {};
    if (!provider) {
        res.status(400).json({ error: "Missing 'provider' parameter." });
        return;
    }
    try {
        let response;
        switch (provider) {
            case "omdb":
                const omdbUrl = endpoint || "http://www.omdbapi.com/";
                response = await axios_1.default.get(omdbUrl, { params: Object.assign(Object.assign({}, params), { apikey: OMDB_API_KEY }) });
                res.status(200).json(response.data);
                break;
            case "apisports":
                const apiSportsKey = "418210481bfff05ff4c1a61d285a0942";
                const apiSportsBase = "https://v3.football.api-sports.io";
                response = await axios_1.default.get(`${apiSportsBase}${endpoint}`, {
                    params,
                    headers: { "x-apisports-key": apiSportsKey }
                });
                res.status(200).json(response.data);
                break;
            case "scorebat":
                const scorebatToken = "Mjc3ODY0XzE3NzE3NjU0MTNfZWFiMWQ1NGRmOTkxNTY3ZjgxNjQ4Y2IyNDMyMTYxYjU2NmZiZjZhMA==";
                response = await axios_1.default.get("https://www.scorebat.com/video-api/v3/feed/", {
                    params: Object.assign(Object.assign({}, params), { token: scorebatToken })
                });
                res.status(200).json(response.data);
                break;
            case "espn":
                const espnBase = "https://site.api.espn.com/apis/site/v2/sports";
                response = await axios_1.default.get(`${espnBase}${endpoint}`, { params });
                res.status(200).json(response.data);
                break;
            case "thesportsdb":
                const sportsDBBase = "https://www.thesportsdb.com/api/v1/json/3";
                response = await axios_1.default.get(`${sportsDBBase}${endpoint}`, { params });
                res.status(200).json(response.data);
                break;
            case "sportmonks":
                const sportmonksBase = "https://api.sportmonks.com/v3/football";
                const sportmonksKey = "pWJ9QW6z7Y6U0uI4R8K9O2Q7L5V3M1N0";
                response = await axios_1.default.get(`${sportmonksBase}${endpoint}`, {
                    params: Object.assign(Object.assign({}, params), { api_token: sportmonksKey })
                });
                res.status(200).json(response.data);
                break;
            case "tmdb-proxy":
                // Fallback or internal routing for TMDB if called via external point
                const tmdbProxy = require('./tmdbProxy');
                return tmdbProxy.proxyTMDB(req, res);
            default:
                res.status(400).json({ error: `Unsupported provider: ${provider}` });
                break;
        }
    }
    catch (error) {
        console.error(`Error proxying to ${provider}:`, error.message);
        res.status(500).json({
            error: `Failed to fetch from ${provider}`,
            details: error.message
        });
    }
});
//# sourceMappingURL=externalProxy.js.map