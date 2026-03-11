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
exports.proxyTMDB = void 0;
const functions = __importStar(require("firebase-functions"));
const axios_1 = __importDefault(require("axios"));
// The TMDB API Key should be set in Firebase Config:
// firebase functions:config:set tmdb.key="YOUR_API_KEY"
// For now, we'll embed the key here to ensure a smooth transition, but it is executed purely backend-side.
const TMDB_API_KEY = "69ef02da25ccfbc48bfd094eb8e348f9";
const BASE_URL = 'https://api.themoviedb.org/3';
exports.proxyTMDB = functions
    .runWith({ memory: '256MB', timeoutSeconds: 60 })
    .https.onCall(async (data) => {
    try {
        const { endpoint, params = {} } = data;
        if (!endpoint) {
            throw new functions.https.HttpsError('invalid-argument', 'TMDB endpoint is required');
        }
        // Inject the private server key into the request
        const queryParams = Object.assign(Object.assign({}, params), { api_key: TMDB_API_KEY });
        const response = await axios_1.default.get(`${BASE_URL}${endpoint}`, {
            params: queryParams,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        return {
            success: true,
            data: response.data
        };
    }
    catch (error) {
        functions.logger.error('TMDB Proxy Error:', error.message);
        throw new functions.https.HttpsError('internal', `Failed to fetch from TMDB: ${error.message}`);
    }
});
//# sourceMappingURL=tmdbProxy.js.map