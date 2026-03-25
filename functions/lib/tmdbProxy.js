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
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyTMDB = void 0;
const functions = __importStar(require("firebase-functions"));
const axios_1 = __importDefault(require("axios"));
const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const BASE_URL = 'https://api.themoviedb.org/3';
exports.proxyTMDB = functions
    .runWith({ memory: '256MB', timeoutSeconds: 60 })
    .https.onRequest(async (req, res) => {
    var _a;
    // --- SECURE CORS ---
    const allowedOrigins = [
        'https://streamlux-67a84.web.app',
        'https://streamlux-67a84.firebaseapp.com',
        'http://localhost:5173',
        'http://localhost:3000'
    ];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
    }
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    try {
        const endpoint = req.query.endpoint || req.body.endpoint;
        const params = req.body.params || req.query || {};
        if (!endpoint) {
            res.status(400).json({ error: 'TMDB endpoint is required' });
            return;
        }
        // Remove internal proxy params if they leaked into query
        delete params.endpoint;
        const response = await axios_1.default.get(`${BASE_URL}${endpoint}`, {
            params: Object.assign(Object.assign({}, params), { api_key: TMDB_API_KEY }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        res.status(200).json(response.data);
    }
    catch (error) {
        functions.logger.error('TMDB Proxy Error:', error.message);
        res.status(((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500).json({
            error: 'Failed to fetch from TMDB',
            details: error.message
        });
    }
});
//# sourceMappingURL=tmdbProxy.js.map