import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { resolveMediaUrl } from './resolver';

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
export const resolveStream = functions
    .runWith({
        memory: '2GB',
        timeoutSeconds: 300,
    })
    .https.onCall(async (data, context) => {
        // Rate limiting: Only allow authenticated users
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User must be authenticated to use this function.'
            );
        }

        const { providerUrl, mediaType, tmdbId } = data;

        // Validate input
        if (!providerUrl || typeof providerUrl !== 'string') {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Provider URL is required and must be a string.'
            );
        }

        try {
            functions.logger.info('Resolving stream URL', {
                providerUrl,
                mediaType,
                tmdbId,
                userId: context.auth.uid,
            });

            // Call the resolver to extract the direct media URL
            const result = await resolveMediaUrl(providerUrl);

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
        } catch (error: any) {
            functions.logger.error('Error resolving stream URL', {
                error: error.message,
                stack: error.stack,
                providerUrl,
            });

            throw new functions.https.HttpsError(
                'internal',
                `Failed to resolve stream URL: ${error.message}`
            );
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
 * HTTP Endpoint: CORS Proxy for Streaming Sites
 * 
 * Proxies HTTP requests server-side to bypass browser CORS restrictions.
 * Enables streaming from 123movies, NetNaija, MovieBox, etc.
 * 
 * Usage (client):
 *   const proxyUrl = `https://us-central1-<project>.cloudfunctions.net/proxy?url=${encodeURIComponent(targetUrl)}`;
 * 
 * NOTE: User accepts all legal responsibility for content accessed via this proxy.
 */
export const proxy = functions
    .runWith({ memory: '512MB', timeoutSeconds: 60 })
    .https.onRequest(async (req, res) => {
        // Wide-open CORS for the client app
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range, X-Requested-With');
        res.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Type');

        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        const rawUrl = req.query.url as string;
        if (!rawUrl) {
            res.status(400).json({ error: 'Missing ?url= query parameter' });
            return;
        }

        let targetUrl: string;
        try {
            targetUrl = decodeURIComponent(rawUrl);
            // Validate URL structure
            new URL(targetUrl);
        } catch {
            res.status(400).json({ error: 'Invalid URL' });
            return;
        }

        functions.logger.info('CORS Proxy', { target: targetUrl });

        try {
            const httpsModule = require('https');
            const httpModule = require('http');
            const { URL: NodeURL } = require('url');

            const parsed = new NodeURL(targetUrl);
            const isHttps = parsed.protocol === 'https:';
            const requester = isHttps ? httpsModule : httpModule;

            const options = {
                hostname: parsed.hostname,
                port: parsed.port ? parseInt(parsed.port) : (isHttps ? 443 : 80),
                path: parsed.pathname + parsed.search,
                method: req.method,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': req.headers['accept'] || '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': `${parsed.protocol}//${parsed.hostname}/`,
                    'Origin': `${parsed.protocol}//${parsed.hostname}`,
                    ...(req.headers['range'] ? { 'Range': req.headers['range'] as string } : {}),
                },
            };

            const proxyReq = requester.request(options, (proxyRes: any) => {
                const status = proxyRes.statusCode || 200;
                const contentType = proxyRes.headers['content-type'] || 'application/octet-stream';

                res.status(status);
                res.set('Content-Type', contentType);
                if (proxyRes.headers['content-length']) {
                    res.set('Content-Length', proxyRes.headers['content-length']);
                }
                if (proxyRes.headers['content-range']) {
                    res.set('Content-Range', proxyRes.headers['content-range']);
                }
                if (proxyRes.headers['accept-ranges']) {
                    res.set('Accept-Ranges', proxyRes.headers['accept-ranges']);
                }

                proxyRes.pipe(res);
            });

            proxyReq.on('error', (err: Error) => {
                functions.logger.error('Proxy error', { error: err.message });
                if (!res.headersSent) {
                    res.status(502).json({ error: 'Upstream connection failed', details: err.message });
                }
            });

            proxyReq.end();
        } catch (error: any) {
            functions.logger.error('Proxy exception', { error: error.message });
            if (!res.headersSent) {
                res.status(500).json({ error: 'Proxy failed', details: error.message });
            }
        }
    });

/**
 * Scheduled Function: Keep Alive
 */
export const keepAlive = functions.pubsub.schedule('every 15 minutes').onRun(async (_context) => {
    try {
        console.log('Keep alive ping at', new Date().toISOString());
        return null;
    } catch (error) {
        console.error('Keep alive failed', error);
        return null;
    }
});
