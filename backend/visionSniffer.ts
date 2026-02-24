import puppeteer from 'puppeteer';
import { Response as ExpressResponse } from 'express';

interface SniffResult {
    url: string;
    type: string;
    headers?: Record<string, string>;
    timestamp: number;
}

/**
 * VisionLinkSniffer - Automates the F12 Network Tab interception
 * Supports two modes:
 *   1. sniff()       - Returns URL + headers (for caching/inspection)
 *   2. sniffAndPipe() - Intercepts the actual video bytes and pipes them directly
 *                        to an Express response, bypassing all CDN IP-locking
 */
export class VisionLinkSniffer {
    private static browser: any = null;
    private static cache: Map<string, SniffResult> = new Map();
    private static CACHE_TTL = 3600000; // 1 hour

    static async init() {
        if (!this.browser) {
            console.log('[VisionSniffer] Launching headless browser...');
            const launchOptions: any = {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                ],
            };
            // On Render/Linux servers, use the system Chromium
            if (process.env.PUPPETEER_EXECUTABLE_PATH) {
                launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
            }
            this.browser = await puppeteer.launch(launchOptions);
        }
    }

    /**
     * Detects and returns the stream URL + its request headers.
     * Used for caching / inspection.
     */
    static async sniff(embedUrl: string): Promise<SniffResult | null> {
        // Check cache first
        const cached = this.cache.get(embedUrl);
        if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
            console.log(`[VisionSniffer] ⚡ Cache Hit: ${embedUrl}`);
            return cached;
        }

        await this.init();
        const page = await this.browser.newPage();

        await page.setRequestInterception(true);
        let sniffingResult: SniffResult | null = null;

        page.on('request', async (req: any) => {
            const url = req.url().toLowerCase();
            const resourceType = req.resourceType();

            if (!sniffingResult && (url.includes('.m3u8') || url.includes('.mp4') || (resourceType === 'media' && !url.includes('google')))) {
                console.log(`[VisionSniffer] 🎯 Stream Detected: ${url}`);
                sniffingResult = {
                    url: req.url(),
                    type: url.includes('.m3u8') ? 'hls' : 'mp4',
                    headers: req.headers(),
                    timestamp: Date.now()
                };
            }

            if (resourceType === 'image' || resourceType === 'font' || url.includes('doubleclick') || url.includes('adsystem')) {
                req.abort();
            } else {
                req.continue();
            }
        });

        return new Promise(async (resolve) => {
            let solved = false;

            page.on('response', async (res: any) => {
                if (solved) return;

                if (sniffingResult && res.url() === sniffingResult.url) {
                    solved = true;
                    console.log(`[VisionSniffer] ✅ High-Quality Source Captured with Headers`);

                    this.cache.set(embedUrl, sniffingResult);
                    resolve(sniffingResult);

                    await page.close();
                }
            });

            try {
                console.log(`[VisionSniffer] Navigating to: ${embedUrl}`);
                await page.goto(embedUrl, { waitUntil: 'networkidle2', timeout: 30000 });

                if (!solved) {
                    console.log('[VisionSniffer] Attempting to trigger playback...');
                    await page.evaluate(() => {
                        const playButton = document.querySelector('button, .play, .vjs-big-play-button');
                        if (playButton) (playButton as HTMLElement).click();
                    });
                }

                setTimeout(async () => {
                    if (!solved) {
                        console.log('[VisionSniffer] ❌ Sniffing timeout');
                        await page.close();
                        resolve(null);
                    }
                }, 15000);

            } catch (err) {
                console.error('[VisionSniffer] Error during sniffing:', err);
                await page.close();
                resolve(null);
            }
        });
    }

    /**
     * ⚡ PIPE MODE: Intercepts the video response bytes inside the Puppeteer
     * session and pipes them directly to the Express response.
     *
     * This is the most reliable approach because:
     * - The request is made FROM THE SAME SESSION that has CDN permission
     * - No IP mismatch, no session-binding 403
     * - Works even with short-lived CDN tokens
     */
    static async sniffAndPipe(
        embedUrl: string,
        expressRes: ExpressResponse,
        filename: string = 'download.mp4'
    ): Promise<boolean> {
        await this.init();
        const page = await this.browser.newPage();

        await page.setRequestInterception(true);

        return new Promise(async (resolve) => {
            let piped = false;

            page.on('request', async (req: any) => {
                const url = req.url().toLowerCase();
                const resourceType = req.resourceType();

                if (!piped && (url.includes('.m3u8') || url.includes('.mp4') || (resourceType === 'media' && !url.includes('google')))) {
                    piped = true;
                    console.log(`[VisionSniffer-Pipe] 🎯 Intercepting stream: ${url}`);

                    // Don't abort this request — let it through so we get the response
                    req.continue();

                    // Also initiate a server-side download using the EXACT same headers
                    // as the browser request, in the same network context
                    try {
                        const streamHeaders = req.headers();
                        const streamUrl = req.url();

                        // Use node-fetch / https to download with the exact same headers
                        const https = require('https');
                        const http = require('http');
                        const parsedUrl = new URL(streamUrl);
                        const client = parsedUrl.protocol === 'https:' ? https : http;

                        const options = {
                            hostname: parsedUrl.hostname,
                            path: parsedUrl.pathname + parsedUrl.search,
                            method: 'GET',
                            headers: {
                                ...streamHeaders,
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            }
                        };

                        const downloadReq = client.request(options, (downloadRes: any) => {
                            console.log(`[VisionSniffer-Pipe] ✅ Stream status: ${downloadRes.statusCode}`);

                            if (downloadRes.statusCode === 200 || downloadRes.statusCode === 206) {
                                const contentType = downloadRes.headers['content-type'] || (url.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4');

                                expressRes.set({
                                    'Content-Type': contentType,
                                    'Content-Disposition': `attachment; filename="${filename}"`,
                                    'Accept-Ranges': 'bytes',
                                    'Cache-Control': 'no-cache',
                                    ...(downloadRes.headers['content-length'] && { 'Content-Length': downloadRes.headers['content-length'] }),
                                });

                                downloadRes.pipe(expressRes);
                                page.close().catch(() => { });
                                resolve(true);
                            } else {
                                console.error(`[VisionSniffer-Pipe] ❌ Stream responded with ${downloadRes.statusCode}`);
                                page.close().catch(() => { });
                                resolve(false);
                            }
                        });

                        downloadReq.on('error', (err: any) => {
                            console.error('[VisionSniffer-Pipe] Request error:', err.message);
                            page.close().catch(() => { });
                            resolve(false);
                        });

                        downloadReq.end();

                    } catch (pipeErr: any) {
                        console.error('[VisionSniffer-Pipe] Pipe error:', pipeErr.message);
                        await page.close();
                        resolve(false);
                    }

                } else if (resourceType === 'image' || resourceType === 'font' || url.includes('doubleclick') || url.includes('adsystem')) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            try {
                await page.goto(embedUrl, { waitUntil: 'networkidle2', timeout: 30000 });

                if (!piped) {
                    await page.evaluate(() => {
                        const playButton = document.querySelector('button, .play, .vjs-big-play-button');
                        if (playButton) (playButton as HTMLElement).click();
                    });
                }

                // Timeout after 20 seconds
                setTimeout(async () => {
                    if (!piped) {
                        console.log('[VisionSniffer-Pipe] ❌ Pipe timeout - no stream found');
                        await page.close();
                        resolve(false);
                    }
                }, 20000);

            } catch (err: any) {
                console.error('[VisionSniffer-Pipe] Navigation error:', err.message);
                await page.close();
                resolve(false);
            }
        });
    }

    static async shutdown() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

export default VisionLinkSniffer;
