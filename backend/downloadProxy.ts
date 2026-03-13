// Backend Download Proxy with HTTP Range Request Support
// This should be deployed as a Node.js/Express backend

import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import axios from "axios";
import crypto from "crypto";
import { exec, spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import keepAliveRoutes from "./keepAlive";
import scraperResolverRoutes from "./scraperResolver";
import VisionLinkSniffer from "./visionSniffer";

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS (important for Vercel/Firebase frontends calling this API)
// - If CORS_ORIGINS is set (comma-separated), we use that allowlist.
// - If not set, we use the default production frontends + *.vercel.app, *.web.app, *.firebaseapp.com.
const DEFAULT_CORS_ORIGINS = [
    "https://streamlux.vercel.app",
    "https://streamlux-67a84.web.app",
    "https://streamlux-backend.onrender.com",
    "https://streamlux.onrender.com",
].join(",");
const corsOriginsEnv = (process.env.CORS_ORIGINS || DEFAULT_CORS_ORIGINS).trim();
const allowAllOrigins = corsOriginsEnv.length === 0;
const allowedOrigins = new Set(
    corsOriginsEnv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
);

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        // Non-browser clients (curl, server-to-server, downloads via navigation) may not send Origin
        if (!origin) return callback(null, true);

        if (allowAllOrigins) return callback(null, true);

        if (allowedOrigins.has(origin)) return callback(null, true);

        // Allow common deployment domains without needing to enumerate every preview URL
        try {
            const { hostname } = new URL(origin);
            if (hostname.endsWith(".vercel.app")) return callback(null, true);
            if (hostname.endsWith(".web.app")) return callback(null, true);
            if (hostname.endsWith(".firebaseapp.com")) return callback(null, true);
        } catch {
            // ignore URL parse failures
        }

        return callback(null, false);
    },
    methods: ["GET", "HEAD", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Range", "Accept", "Origin", "Authorization"],
    exposedHeaders: [
        "Content-Length",
        "Content-Range",
        "Accept-Ranges",
        "Content-Disposition",
        "ETag",
        "Content-Type",
        "Location",
    ],
    maxAge: 86400,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// Keep-Alive Routes
app.use("/api", keepAliveRoutes);
app.use("/api", scraperResolverRoutes);

// Helper to get headers that mimic a real browser
const getBrowserHeaders = (overrides?: Record<string, string>) => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.google.com/',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    ...overrides
});

/**
 * Proxy Endpoint: Bypasses CORS and Referer checks
 * Usage: /api/proxy?url=ENCODED_URL&referer=OPTIONAL_REFERER
 */
app.get("/api/proxy", async (req: Request, res: Response) => {
    const { url, referer } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        console.log(`[Proxy] Fetching: ${url} `);

        const response = await axios.get(url, {
            headers: getBrowserHeaders(referer ? { 'Referer': referer as string } : {}),
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
        res.status(500).json({ error: "Proxy request failed", details: error.message });
    }
});

/**
 * Resolver Endpoint: Attempts to find direct links or proxyable content
 * Usage: 
 * - Movie: /api/resolve?type=movie&id=TMDB_ID
 * - TV: /api/resolve?type=tv&id=TMDB_ID&s=SEASON&e=EPISODE
 */
app.get("/api/resolve", async (req: Request, res: Response) => {
    const { type, id, s, e } = req.query;

    if (!type || !id) {
        return res.status(400).json({ error: 'Missing type or id parameters' });
    }

    try {
        console.log(
            `[Resolver] Attempting to resolve ${type} ${id}${s ? ` S${s}E${e}` : ""} `
        );

        // Construct the correct VidSrc URL
        let vidsrcUrl = "";
        if (type === "movie") {
            vidsrcUrl = `https://vidsrc.me/embed/movie?tmdb=${id}`;
        } else {
            vidsrcUrl = `https://vidsrc.me/embed/tv?tmdb=${id}&sea=${s}&epi=${e}`;
        }

        // Attempt to verify if the embed exists
        const check = await axios.head(vidsrcUrl, {
            headers: getBrowserHeaders({ Referer: "https://vidsrc.me/" }),
            validateStatus: () => true,
        });

        if (check.status === 200) {
            // Determine base URL dynamically (for local vs production)
            const protocol = req.protocol;
            const host = req.get("host");
            const baseUrl = `${protocol}://${host}`;

            return res.json({
                source: "vidsrc",
                status: "active",
                proxiedUrl: `${baseUrl}/api/proxy?url=${encodeURIComponent(
                    vidsrcUrl
                )}&referer=${encodeURIComponent("https://vidsrc.me/")}`,
                directUrl: vidsrcUrl,
                isProxyNeeded: true,
            });
        }

        res.status(404).json({ error: "Source not found" });
    } catch (error: any) {
        console.error(`[Resolver Error] ${error.message}`);
        res.status(500).json({ error: "Resolution failed" });
    }
});

/**
 * Vision Sniffer Endpoint: Extracts direct streams using headless browser
 * Usage: /api/vision/sniff?url=ENCODED_EMBED_URL
 */
app.get('/api/vision/sniff', async (req: express.Request, res: express.Response) => {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        console.log(`[VisionSniffer] Sniffing request for: ${url}`);
        const result = await VisionLinkSniffer.sniff(url);

        if (result) {
            res.json({
                success: true,
                ...result
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Could not detect video stream from source'
            });
        }
    } catch (error: any) {
        console.error(`[VisionSniffer Route Error] ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Sniffing process failed',
            details: error.message
        });
    }
});

/**
 * Vision Download: Sniffs AND pipes the video directly to the browser.
 * This is the most reliable approach - the download happens from within
 * the same Puppeteer session that has CDN permission, bypassing all
 * 403 session/IP-locking issues.
 * Usage: GET /api/vision/download?url=ENCODED_EMBED_URL&filename=FILENAME
 */
app.get('/api/vision/download', async (req: express.Request, res: express.Response) => {
    const { url, filename } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    const safeFilename = (typeof filename === 'string' ? filename : null) || 'download.mp4';

    console.log(`[VisionDownload] Starting pipe download for: ${url}`);

    try {
        const success = await VisionLinkSniffer.sniffAndPipe(url, res, safeFilename);

        if (!success) {
            // sniffAndPipe already closed res on failure — only reply if not already sent
            if (!res.headersSent) {
                res.status(404).json({
                    error: 'Stream not found',
                    message: 'Could not detect or pipe a video stream from this source'
                });
            }
        }
    } catch (error: any) {
        console.error(`[VisionDownload Error] ${error.message}`);
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Vision download failed',
                details: error.message
            });
        }
    }
});

/**
 * Scraper Resolver Endpoint: Returns direct video URLs from scrapers
 * Usage: /api/scrapers/resolve?type=movie&id=TMDB_ID
 */
app.get('/api/scrapers/resolve', async (req: Request, res: Response) => {
    try {
        const { type, id, season, episode } = req.query;

        if (!type || !id) {
            return res.status(400).json({
                error: 'Missing required parameters: type and id'
            });
        }

        console.log(`[Scraper Resolver] Resolving ${type} ${id}${season ? ` S${season}E${episode}` : ''}`);

        // Return empty arrays for now
        // In production, this would:
        // 1. Fetch TMDB data to get the title
        // 2. Search each scraper with the title
        // 3. Return matching direct video URLs
        const response: any = {
            fzmovies: [],
            netnaija: [],
            o2tvseries: [],
            message: 'Scraper integration placeholder - implement with actual scraper logic'
        };

        res.json(response);
    } catch (error: any) {
        console.error('[Scraper Resolver Error]:', error.message);
        res.status(500).json({
            error: 'Failed to resolve scraper sources',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Download proxy route with HTTP Range Request support
 * Supports pause/resume downloads
 */
app.get('/api/download', async (req: express.Request, res: express.Response) => {
    try {
        const { url, filename, headers: encodedHeaders } = req.query;

        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        // Parse custom headers if provided
        let customHeaders: Record<string, string> = {};
        if (encodedHeaders && typeof encodedHeaders === 'string') {
            try {
                customHeaders = JSON.parse(decodeURIComponent(encodedHeaders));
            } catch (e) {
                console.warn('[DownloadProxy] Failed to parse custom headers');
            }
        }

        // Filter out headers that might cause issues when proxying
        const forbiddenHeaders = ['host', 'connection', 'content-length', 'accept-encoding', 'if-none-match', 'if-modified-since'];
        const filteredHeaders: Record<string, string> = {};
        Object.keys(customHeaders).forEach(key => {
            if (!forbiddenHeaders.includes(key.toLowerCase())) {
                filteredHeaders[key] = customHeaders[key];
            }
        });

        const requestHeaders = getBrowserHeaders(filteredHeaders);
        const etag = crypto.createHash('md5').update(url).digest('hex');

        let fileSize = 0;
        let contentType = 'application/octet-stream';

        // Try to get file info first, but DON'T fail if it fails (some servers block HEAD)
        try {
            const headResponse = await axios.head(url, {
                headers: requestHeaders,
                timeout: 5000,
            });
            fileSize = parseInt(headResponse.headers['content-length'] || '0');
            contentType = headResponse.headers['content-type'] || 'application/octet-stream';
        } catch (e: any) {
            console.warn(`[DownloadProxy] HEAD request failed (Status: ${e.response?.status}), proceeding with GET...`);
        }

        // Check if client sent Range header
        const range = req.headers.range;

        if (range) {
            // Parse range header
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : (fileSize > 0 ? fileSize - 1 : undefined);
            const rangeHeader = end !== undefined ? `bytes=${start}-${end}` : `bytes=${start}-`;

            // Fetch partial content
            const response = await axios.get(url, {
                headers: {
                    ...requestHeaders,
                    'Range': rangeHeader,
                },
                responseType: 'stream',
            });

            // If we didn't know the fileSize, try to get it from the response
            const contentRange = response.headers['content-range'];
            const actualSize = contentRange ? contentRange.split('/')[1] : (fileSize > 0 ? fileSize : response.headers['content-length']);

            res.status(206);
            res.set({
                'Content-Range': contentRange || `bytes ${start}-${end !== undefined ? end : ''}/${actualSize || ''}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': response.headers['content-length'],
                'Content-Type': contentType || response.headers['content-type'],
                'Content-Disposition': `attachment; filename="${filename || 'download'}"`,
                'ETag': etag,
            });

            response.data.pipe(res);
        } else {
            // No range requested, send full file
            const response = await axios.get(url, {
                headers: requestHeaders,
                responseType: 'stream',
            });

            res.status(200);
            res.set({
                'Content-Length': response.headers['content-length'] || fileSize,
                'Content-Type': response.headers['content-type'] || contentType,
                'Content-Disposition': `attachment; filename="${filename || 'download'}"`,
                'Accept-Ranges': 'bytes',
                'ETag': etag,
            });

            response.data.pipe(res);
        }
    } catch (error: any) {
        const status = error?.response?.status;
        console.error('Download proxy error:', error.message, 'upstream status:', status);

        // If upstream blocks (403/401), only redirect when the URL is a direct stream
        // (e.g. .mp4, .m3u8). Do NOT redirect to embed pages (e.g. vidsrc.to/embed) — they often 404.
        if (status === 403 || status === 401) {
            try {
                const rawUrl = (req.query.url as string) || '';
                const decoded = decodeURIComponent(rawUrl).toLowerCase();
                const isDirectStream = /\.(mp4|m3u8|ts|webm|mkv)(\?|$)/i.test(decoded) || decoded.includes("/stream/") || decoded.includes("/video/");
                if (rawUrl && isDirectStream) {
                    return res.redirect(302, rawUrl);
                }
            } catch {
                // ignore and fall through to JSON error
            }
        }

        res.status(500).json({
            error: 'Failed to proxy download',
            message: error.message,
            status,
        });
    }
});

// ─── yt-dlp helpers ────────────────────────────────────────────────────────

// Resolve yt-dlp binary path (system PATH install, or YTDLP_PATH env var)
function getYtDlpBinary(): string {
    if (process.env.YTDLP_PATH) return process.env.YTDLP_PATH;
    const ext = os.platform() === 'win32' ? '.exe' : '';
    const localPath = path.join(__dirname, `yt-dlp${ext}`);
    if (fs.existsSync(localPath)) return localPath;
    return `yt-dlp${ext}`;
}

/**
 * Direct Redirect: Redirects the browser straight to the stream URL.
 * This COMPLETELY avoids the server-side proxy 403 problem.
 * The browser downloads the file with its own HTTP stack.
 * Usage: GET /api/stream/redirect?url=ENCODED_URL
 */
app.get('/api/stream/redirect', (req: express.Request, res: express.Response) => {
    const { url, filename } = req.query;
    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing url parameter' });
    }
    try {
        const decoded = decodeURIComponent(url);
        const safeFilename = (typeof filename === 'string' ? filename : null) || 'download.mp4';
        // Redirect the browser directly to the CDN URL
        // This avoids all server-side proxy 403 issues
        res.redirect(302, decoded);
    } catch (err: any) {
        res.status(400).json({ error: 'Invalid URL', message: err.message });
    }
});

/**
 * yt-dlp Endpoint: Extracts the best direct video URL, then redirects to it.
 * Uses yt-dlp for platforms it supports (YouTube, Vimeo, etc.).
 * For unknown CDN URLs, falls back to direct redirect.
 * Usage: GET /api/ytdl?url=ENCODED_EMBED_URL&filename=optional_filename
 */
app.get('/api/ytdl', async (req: express.Request, res: express.Response) => {
    const { url, filename } = req.query;
    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    const ytdlp = getYtDlpBinary();
    const safeFilename = (typeof filename === 'string' ? filename : null) || 'download.mp4';
    const decoded = decodeURIComponent(url);

    // STEP 1: Try yt-dlp to extract a better/authenticated URL
    try {
        const directUrl = await new Promise<string>((resolve, reject) => {
            const args = [
                '--no-playlist',
                '--no-warnings',
                '--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
                '--get-url',
                decoded,
            ];

            let stdout = '';
            let stderr = '';
            const proc = spawn(ytdlp, args, { timeout: 30000 });
            proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
            proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
            proc.on('close', (code: number) => {
                const extracted = stdout.trim().split('\n')[0].trim();
                if (code === 0 && extracted.startsWith('http')) {
                    resolve(extracted);
                } else {
                    reject(new Error(stderr.trim() || `yt-dlp exited with code ${code}`));
                }
            });
            proc.on('error', reject);
        });

        console.log(`[YTDLP] ✅ Extracted URL, redirecting...`);
        // Redirect the browser directly to the extracted URL — no server proxying!
        return res.redirect(302, directUrl);

    } catch (err: any) {
        // yt-dlp failed (likely unknown CDN URL) — fall back to direct redirect
        console.warn(`[YTDLP] yt-dlp failed (${err.message.substring(0, 80)}), trying direct redirect...`);

        // Direct redirect: browser downloads from CDN URL natively
        // This works when the CDN URL is valid and just needs the right Referer/UA
        // which the browser will set automatically if the user came from the site
        try {
            console.log(`[YTDLP] ↩️ Direct redirect to: ${decoded.substring(0, 80)}...`);
            return res.redirect(302, decoded);
        } catch (redirectErr: any) {
            return res.status(500).json({
                error: 'Download failed',
                message: 'Could not extract or redirect to video stream',
                hint: 'The video host may require authentication. Try opening the stream page directly.'
            });
        }
    }
});

/**
 * Health check and keep-alive endpoints
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: 'StreamLux backend is running',
        service: 'download-proxy',
        enhanced: true
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: 'StreamLux backend is running'
    });
});

app.get('/api/ping', (req, res) => {
    res.status(200).json({
        pong: true,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/keep-alive', (req, res) => {
    const memoryUsage = process.memoryUsage();

    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        },
        nodeVersion: process.version,
        platform: process.platform,
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Enhanced StreamLux Backend running on port ${PORT}`);
});

export default app;
