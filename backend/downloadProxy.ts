// Backend Download Proxy with HTTP Range Request Support
// This should be deployed as a Node.js/Express backend

import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Helper to get headers that mimic a real browser
const getBrowserHeaders = (referer?: string) => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': referer || 'https://www.google.com/',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
});

/**
 * Proxy Endpoint: Bypasses CORS and Referer checks
 * Usage: /api/proxy?url=ENCODED_URL&referer=OPTIONAL_REFERER
 */
app.get('/api/proxy', async (req: Request, res: Response) => {
    const { url, referer } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        console.log(`[Proxy] Fetching: ${url}`);

        const response = await axios.get(url, {
            headers: getBrowserHeaders(referer as string),
            responseType: 'stream',
            validateStatus: () => true,
        });

        const headersToForward = ['content-type', 'content-length', 'location'];
        headersToForward.forEach(header => {
            if (response.headers[header]) {
                res.setHeader(header, response.headers[header]);
            }
        });

        response.data.pipe(res);
    } catch (error: any) {
        console.error(`[Proxy Error] ${error.message}`);
        res.status(500).json({ error: 'Proxy request failed', details: error.message });
    }
});

/**
 * Resolver Endpoint: Attempts to find direct links or proxyable content
 * Usage: 
 * - Movie: /api/resolve?type=movie&id=TMDB_ID
 * - TV: /api/resolve?type=tv&id=TMDB_ID&s=SEASON&e=EPISODE
 */
app.get('/api/resolve', async (req: Request, res: Response) => {
    const { type, id, s, e } = req.query;

    if (!type || !id) {
        return res.status(400).json({ error: 'Missing type or id parameters' });
    }

    try {
        console.log(`[Resolver] Attempting to resolve ${type} ${id}${s ? ` S${s}E${e}` : ''}`);

        // Construct the correct VidSrc URL
        let vidsrcUrl = '';
        if (type === 'movie') {
            vidsrcUrl = `https://vidsrc.me/embed/movie?tmdb=${id}`;
        } else {
            vidsrcUrl = `https://vidsrc.me/embed/tv?tmdb=${id}&sea=${s}&epi=${e}`;
        }

        // Attempt to verify if the embed exists
        const check = await axios.head(vidsrcUrl, {
            headers: getBrowserHeaders('https://vidsrc.me/'),
            validateStatus: () => true
        });

        if (check.status === 200) {
            // Determine base URL dynamically (for local vs production)
            const protocol = req.protocol;
            const host = req.get('host');
            const baseUrl = `${protocol}://${host}`;

            return res.json({
                source: 'vidsrc',
                status: 'active',
                proxiedUrl: `${baseUrl}/api/proxy?url=${encodeURIComponent(vidsrcUrl)}&referer=${encodeURIComponent('https://vidsrc.me/')}`,
                directUrl: vidsrcUrl,
                isProxyNeeded: true
            });
        }

        res.status(404).json({ error: 'Source not found' });
    } catch (error: any) {
        console.error(`[Resolver Error] ${error.message}`);
        res.status(500).json({ error: 'Resolution failed' });
    }
});

/**
 * Download proxy route with HTTP Range Request support
 * Supports pause/resume downloads
 */
app.get('/api/download', async (req: Request, res: Response) => {
    try {
        const { url, filename } = req.query;

        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        // Generate ETag for consistency
        const etag = crypto.createHash('md5').update(url).digest('hex');

        // Get file info first
        const headResponse = await axios.head(url, {
            headers: getBrowserHeaders(),
        });

        const fileSize = parseInt(headResponse.headers['content-length'] || '0');
        const contentType = headResponse.headers['content-type'] || 'application/octet-stream';

        // Check if client sent Range header
        const range = req.headers.range;

        if (range) {
            // Parse range header (e.g., "bytes=0-1023")
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = (end - start) + 1;

            // Fetch partial content from source
            const response = await axios.get(url, {
                headers: {
                    ...getBrowserHeaders(),
                    'Range': `bytes=${start}-${end}`,
                },
                responseType: 'stream',
            });

            // Send 206 Partial Content
            res.status(206);
            res.set({
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename || 'download'}"`,
                'ETag': etag,
            });

            response.data.pipe(res);
        } else {
            // No range requested, send full file
            const response = await axios.get(url, {
                headers: getBrowserHeaders(),
                responseType: 'stream',
            });

            res.status(200);
            res.set({
                'Content-Length': fileSize,
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename || 'download'}"`,
                'Accept-Ranges': 'bytes',
                'ETag': etag,
            });

            response.data.pipe(res);
        }
    } catch (error: any) {
        console.error('Download proxy error:', error.message);
        res.status(500).json({
            error: 'Failed to proxy download',
            message: error.message
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'download-proxy', enhanced: true });
});

app.listen(PORT, () => {
    console.log(`🚀 Enhanced StreamLux Backend running on port ${PORT}`);
});

export default app;
