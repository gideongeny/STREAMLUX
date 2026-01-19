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
exports.keepAlive = exports.healthCheck = exports.resolveStream = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const resolver_1 = require("./resolver");
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
exports.resolveStream = functions
    .runWith({
    memory: '2GB',
    timeoutSeconds: 300,
})
    .https.onCall(async (data, context) => {
    // Rate limiting: Only allow authenticated users
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to use this function.');
    }
    const { providerUrl, mediaType, tmdbId } = data;
    // Validate input
    if (!providerUrl || typeof providerUrl !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Provider URL is required and must be a string.');
    }
    try {
        functions.logger.info('Resolving stream URL', {
            providerUrl,
            mediaType,
            tmdbId,
            userId: context.auth.uid,
        });
        // Call the resolver to extract the direct media URL
        const result = await (0, resolver_1.resolveMediaUrl)(providerUrl);
        functions.logger.info('Successfully resolved stream URL', {
            directUrl: result.directUrl,
            mimeType: result.mimeType,
        });
        return {
            success: true,
            directUrl: result.directUrl,
            mimeType: result.mimeType,
            quality: result.quality,
            headers: result.headers,
        };
    }
    catch (error) {
        functions.logger.error('Error resolving stream URL', {
            error: error.message,
            stack: error.stack,
            providerUrl,
        });
        throw new functions.https.HttpsError('internal', `Failed to resolve stream URL: ${error.message}`);
    }
});
/**
 * HTTP Endpoint: Health Check
 * Simple endpoint to verify the function is running
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
 * Pings the health check endpoint every 15 minutes to prevent cold starts
 */
exports.keepAlive = functions.pubsub.schedule('every 15 minutes').onRun(async (context) => {
    try {
        // Self-ping logic or just finish execution to keep the instance warm
        console.log('Keep alive ping executed at', new Date().toISOString());
        return null;
    }
    catch (error) {
        console.error('Keep alive failed', error);
        return null;
    }
});
//# sourceMappingURL=index.js.map