import puppeteer from 'puppeteer';
import { Request } from 'express';

interface SniffResult {
    url: string;
    type: string;
    headers?: Record<string, string>;
    timestamp: number;
}

/**
 * VisionLinkSniffer - Automates the F12 Network Tab interception
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

    static async sniff(embedUrl: string): Promise<SniffResult | null> {
        // Check cache first
        const cached = this.cache.get(embedUrl);
        if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
            console.log(`[VisionSniffer] ⚡ Cache Hit: ${embedUrl}`);
            return cached;
        }

        await this.init();
        const page = await this.browser.newPage();

        // Block ads and unnecessary scripts to speed up sniffing
        await page.setRequestInterception(true);
        let sniffingResult: SniffResult | null = null;

        page.on('request', async (req: any) => {
            const url = req.url().toLowerCase();
            const resourceType = req.resourceType();

            // Intercept media streams and capture EXACT headers
            if (!sniffingResult && (url.includes('.m3u8') || url.includes('.mp4') || (resourceType === 'media' && !url.includes('google')))) {
                console.log(`[VisionSniffer] 🎯 Stream Detected: ${url}`);
                sniffingResult = {
                    url: req.url(),
                    type: url.includes('.m3u8') ? 'hls' : 'mp4',
                    headers: req.headers(), // Capture ALL headers (User-Agent, Referer, Origin, cookies, etc.)
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

            // Listen for the "Gold Link"
            page.on('response', async (res: any) => {
                if (solved) return;

                if (sniffingResult && res.url() === sniffingResult.url) {
                    solved = true;
                    console.log(`[VisionSniffer] ✅ High-Quality Source Captured with Headers`);

                    this.cache.set(embedUrl, sniffingResult);
                    resolve(sniffingResult);

                    // Close page after detection
                    await page.close();
                }
            });

            try {
                console.log(`[VisionSniffer] Navigating to: ${embedUrl}`);
                await page.goto(embedUrl, { waitUntil: 'networkidle2', timeout: 30000 });

                // Try to find and click a play button if detection hasn't happened
                if (!solved) {
                    console.log('[VisionSniffer] Attempting to trigger playback...');
                    await page.evaluate(() => {
                        const playButton = document.querySelector('button, .play, .vjs-big-play-button');
                        if (playButton) (playButton as HTMLElement).click();
                    });
                }

                // If nothing found after 15 seconds, timeout
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

    static async shutdown() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

export default VisionLinkSniffer;
