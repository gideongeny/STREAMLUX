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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMediaUrl = resolveMediaUrl;
const playwright = __importStar(require("playwright-core"));
const chrome_aws_lambda_1 = __importDefault(require("chrome-aws-lambda"));
/**
 * Resolve a media URL from an embed provider using headless Chrome
 *
 * This function:
 * 1. Launches a headless Chrome browser
 * 2. Navigates to the provider URL
 * 3. Intercepts network requests
 * 4. Extracts direct video URLs (mp4 or m3u8)
 * 5. Returns the direct URL with metadata
 */
async function resolveMediaUrl(providerUrl) {
    let browser = null;
    try {
        // Launch headless Chrome with AWS Lambda optimizations
        browser = await playwright.chromium.launch({
            args: chrome_aws_lambda_1.default.args,
            executablePath: await chrome_aws_lambda_1.default.executablePath,
            headless: chrome_aws_lambda_1.default.headless,
        });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 },
        });
        const page = await context.newPage();
        // Track intercepted media URLs
        const mediaUrls = [];
        // Intercept network requests
        page.on('request', (request) => {
            const url = request.url();
            const resourceType = request.resourceType();
            // Log all requests for debugging
            console.log(`Request: ${resourceType} - ${url}`);
        });
        page.on('response', async (response) => {
            const url = response.url();
            const contentType = response.headers()['content-type'] || '';
            // Check if this is a video stream
            if (contentType.includes('video/mp4') ||
                contentType.includes('application/x-mpegURL') ||
                contentType.includes('application/vnd.apple.mpegurl') ||
                url.includes('.m3u8') ||
                url.includes('.mp4')) {
                console.log(`Found media URL: ${url} (${contentType})`);
                mediaUrls.push({
                    url,
                    mimeType: contentType,
                    headers: response.headers(),
                });
            }
        });
        // Navigate to the provider URL
        console.log(`Navigating to: ${providerUrl}`);
        await page.goto(providerUrl, {
            waitUntil: 'networkidle',
            timeout: 60000, // 60 second timeout
        });
        // Wait for potential video player initialization
        await page.waitForTimeout(5000);
        // Try to find and click play button if it exists
        try {
            const playButton = await page.$('button[aria-label*="play" i], button[title*="play" i], .play-button, #play-button');
            if (playButton) {
                await playButton.click();
                await page.waitForTimeout(3000);
            }
        }
        catch (e) {
            // Play button not found or not clickable, continue
            console.log('No play button found or clickable');
        }
        // Wait a bit more for any delayed network requests
        await page.waitForTimeout(5000);
        // Close browser
        await browser.close();
        browser = null;
        // Return the best media URL found
        if (mediaUrls.length === 0) {
            throw new Error('No media URLs found in the page');
        }
        // Prefer m3u8 (HLS) over mp4 for adaptive streaming
        const hlsUrl = mediaUrls.find(m => m.mimeType.includes('mpegURL') || m.url.includes('.m3u8'));
        const mp4Url = mediaUrls.find(m => m.mimeType.includes('video/mp4') || m.url.includes('.mp4'));
        const selectedMedia = hlsUrl || mp4Url || mediaUrls[0];
        return {
            directUrl: selectedMedia.url,
            mimeType: selectedMedia.mimeType,
            quality: hlsUrl ? 'adaptive' : 'direct',
            headers: selectedMedia.headers,
        };
    }
    catch (error) {
        console.error('Error resolving media URL:', error);
        // Ensure browser is closed on error
        if (browser) {
            await browser.close();
        }
        throw new Error(`Failed to resolve media URL: ${error.message}`);
    }
}
//# sourceMappingURL=resolver.js.map