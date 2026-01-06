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
 * Simple endpoint to verify the function is running
 */
export const healthCheck = functions.https.onRequest((req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});
