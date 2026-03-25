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
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsProxy = void 0;
const functions = __importStar(require("firebase-functions"));
/**
 * Advanced CORS & Referer-Spoofing Proxy
 * Allows direct video links from scraper sites to play without 403 Forbidden errors.
 */
exports.corsProxy = functions
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
    const rawUrl = req.query.url;
    const customReferer = req.query.referer; // Optional custom referer
    if (!rawUrl) {
        res.status(400).json({ error: 'Missing ?url= query parameter' });
        return;
    }
    let targetUrl;
    try {
        targetUrl = decodeURIComponent(rawUrl);
        new URL(targetUrl);
    }
    catch (_a) {
        res.status(400).json({ error: 'Invalid URL' });
        return;
    }
    try {
        const httpsModule = require('https');
        const httpModule = require('http');
        const { URL: NodeURL } = require('url');
        const parsed = new NodeURL(targetUrl);
        const isHttps = parsed.protocol === 'https:';
        const requester = isHttps ? httpsModule : httpModule;
        // Smart Referer spoofing based on origin
        let spoofedReferer = `${parsed.protocol}//${parsed.hostname}/`;
        // Handle known difficult providers
        if (targetUrl.includes('fzmovies.ng')) {
            spoofedReferer = 'https://fzmovies.net/';
        }
        else if (targetUrl.includes('netnaija')) {
            spoofedReferer = 'https://www.thenetnaija.net/';
        }
        else if (targetUrl.includes('o2tvseries')) {
            spoofedReferer = 'https://o2tvseries.com/';
        }
        // Override if explicitly provided
        if (customReferer) {
            spoofedReferer = decodeURIComponent(customReferer);
        }
        const options = {
            hostname: parsed.hostname,
            port: parsed.port ? parseInt(parsed.port) : (isHttps ? 443 : 80),
            path: parsed.pathname + parsed.search,
            method: req.method,
            headers: Object.assign({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36', 'Accept': req.headers['accept'] || '*/*', 'Accept-Language': 'en-US,en;q=0.9', 'Referer': spoofedReferer, 'Origin': `${parsed.protocol}//${parsed.hostname}` }, (req.headers['range'] ? { 'Range': req.headers['range'] } : {})),
        };
        const proxyReq = requester.request(options, (proxyRes) => {
            const status = proxyRes.statusCode || 200;
            const contentType = proxyRes.headers['content-type'] || 'application/octet-stream';
            res.status(status);
            res.set('Content-Type', contentType);
            if (proxyRes.headers['content-length'])
                res.set('Content-Length', proxyRes.headers['content-length']);
            if (proxyRes.headers['content-range'])
                res.set('Content-Range', proxyRes.headers['content-range']);
            if (proxyRes.headers['accept-ranges'])
                res.set('Accept-Ranges', proxyRes.headers['accept-ranges']);
            proxyRes.pipe(res);
        });
        proxyReq.on('error', (err) => {
            console.error('Proxy error', { error: err.message });
            if (!res.headersSent) {
                res.status(502).json({ error: 'Upstream connection failed', details: err.message });
            }
        });
        proxyReq.end();
    }
    catch (error) {
        console.error('Proxy exception', { error: error.message });
        if (!res.headersSent) {
            res.status(500).json({ error: 'Proxy failed', details: error.message });
        }
    }
});
//# sourceMappingURL=corsProxy.js.map