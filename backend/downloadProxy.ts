// Backend Download Proxy with HTTP Range Request Support
// This should be deployed as a Node.js/Express backend

import express, { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Range, Content-Type');
    res.header('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
    next();
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
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
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
                    'Range': `bytes=${start}-${end}`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
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
    res.json({ status: 'ok', service: 'download-proxy' });
});

app.listen(PORT, () => {
    console.log(`Download proxy server running on port ${PORT}`);
});

export default app;
