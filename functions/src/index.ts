import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { resolveMediaUrl } from './resolver';
export { proxyTMDB } from './tmdbProxy';
export { proxyYouTube } from './youtubeProxy';
export { proxyExternalAPI } from './externalProxy';
export { proxyScrapers } from './scraperProxy';
export { corsProxy as proxy } from './corsProxy';

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
export const resolveStream = functions
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
            const result = await resolveMediaUrl(providerUrl);

            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error: any) {
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
export const healthCheck = functions.https.onRequest((req, res) => {
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
export const api = functions.https.onRequest(async (req, res) => {
    // Normalize path: Remove /api/ prefix and leading slashes for robust matching
    const path = req.path.replace(/^\/+api\//, '').replace(/^\/+/, '');
    
    functions.logger.info('API Router - Incoming:', { originalPath: req.path, normalizedPath: path });

    // Routing logic
    if (path.startsWith('proxy/tmdb') || path.startsWith('tmdb')) {
        return (exports.proxyTMDB as any)(req, res);
    }
    if (path.startsWith('proxy/youtube') || path.startsWith('youtube')) {
        return (exports.proxyYouTube as any)(req, res);
    }
    if (path.startsWith('proxy/external') || path.startsWith('external')) {
        return (exports.proxyExternalAPI as any)(req, res);
    }
    if (path.startsWith('scrapers')) {
        return (exports.proxyScrapers as any)(req, res);
    }
    if (path === 'resolve' || path === 'proxy/resolve') {
        return (exports.resolveStream as any)(req, res);
    }
    if (path === 'proxy' || path === 'cors') {
        return (exports.corsProxy as any)(req, res);
    }
    if (path === 'health') {
        return (exports.healthCheck as any)(req, res);
    }

    res.status(404).json({ error: 'API route not found', originalPath: req.path, normalizedPath: path });
});
