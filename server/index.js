const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Helper to get headers that mimic a real browser
const getBrowserHeaders = (referer) => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': referer || 'https://www.google.com/',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
});

// Root endpoint check
app.get('/', (req, res) => {
    res.send('StreamLux Proxy Server is Running');
});

// Proxy Endpoint: Bypasses CORS and Referer checks
// Usage: /api/proxy?url=ENCODED_URL&referer=OPTIONAL_REFERER
app.get('/api/proxy', async (req, res) => {
    const { url, referer } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        console.log(`[Proxy] Fetching: ${url}`);

        const response = await axios.get(url, {
            headers: getBrowserHeaders(referer),
            responseType: 'stream', // Stream the response directly to client
            validateStatus: () => true, // Don't throw on 4xx/5xx
        });

        // Copy critical headers from the upstream response
        const headersToForward = ['content-type', 'content-length', 'location'];
        headersToForward.forEach(header => {
            if (response.headers[header]) {
                res.setHeader(header, response.headers[header]);
            }
        });

        // Pipe the data
        response.data.pipe(res);
    } catch (error) {
        console.error(`[Proxy Error] ${error.message}`);
        res.status(500).json({ error: 'Proxy request failed', details: error.message });
    }
});

// Download Endpoint: Forces file download
// Usage: /api/download?url=ENCODED_VIDEO_URL&filename=my_movie.mp4
app.get('/api/download', async (req, res) => {
    const { url, filename } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    const downloadName = filename || 'download.mp4';

    try {
        console.log(`[Download] Starting for: ${downloadName}`);

        const response = await axios.get(url, {
            headers: getBrowserHeaders(),
            responseType: 'stream',
        });

        // Set headers to trigger browser download
        res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');

        if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
        }

        response.data.pipe(res);
    } catch (error) {
        console.error(`[Download Error] ${error.message}`);
        res.status(500).send('Failed to download file');
    }


});

// Resolver Endpoint: Attempts to find direct links or proxyable content
// Usage: /api/resolve?type=movie&id=TMDB_ID
app.get('/api/resolve', async (req, res) => {
    const { type, id } = req.query;

    if (!type || !id) {
        return res.status(400).json({ error: 'Missing type or id parameters' });
    }

    try {
        console.log(`[Resolver] Attempting to resolve ${type} ${id}`);
        // Basic placeholder for scraping logic - in a real scenario this would parse HTML
        // Construct standard VidSrc URL
        const vidsrcUrl = type === 'movie'
            ? `https://vidsrc.me/embed/movie?tmdb=${id}`
            : `https://vidsrc.me/embed/tv?tmdb=${id}`;

        // Attempt to verify if the embed exists
        const check = await axios.head(vidsrcUrl, {
            headers: getBrowserHeaders('https://vidsrc.me/'),
            validateStatus: () => true
        });

        if (check.status === 200) {
            // If active, return a proxied URL that the frontend can use
            // We return the Embed URL itself, but wrapped in our proxy
            return res.json({
                source: 'vidsrc',
                status: 'active',
                // The frontend player can use this URL to load the iframe content via our proxy
                proxiedUrl: `http://localhost:${PORT}/api/proxy?url=${encodeURIComponent(vidsrcUrl)}&referer=${encodeURIComponent('https://vidsrc.me/')}`,
                directUrl: vidsrcUrl,
                isProxyNeeded: true
            });
        }

        res.status(404).json({ error: 'Source not found' });
    } catch (error) {
        console.error(`[Resolver Error] ${error.message}`);
        res.status(500).json({ error: 'Resolution failed' });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Backend Proxy Server running on http://localhost:${PORT}`);
    console.log(`   - Proxy:    http://localhost:${PORT}/api/proxy`);
    console.log(`   - Download: http://localhost:${PORT}/api/download\n`);
});
