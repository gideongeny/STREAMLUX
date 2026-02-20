import * as playwright from 'playwright-core';
import chromium from 'chrome-aws-lambda';

export interface ResolvedMedia {
    directUrl: string;
    mimeType: string;
    quality?: string;
    headers?: Record<string, string>;
}

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
export async function resolveMediaUrl(providerUrl: string): Promise<ResolvedMedia> {
    let browser: playwright.Browser | null = null;

    try {
        // Launch headless Chrome with AWS Lambda optimizations
        browser = await playwright.chromium.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 },
        });

        const page = await context.newPage();

        // Track intercepted media URLs
        const mediaUrls: Array<{
            url: string;
            mimeType: string;
            headers?: Record<string, string>;
        }> = [];

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
            if (
                contentType.includes('video/mp4') ||
                contentType.includes('application/x-mpegURL') ||
                contentType.includes('application/vnd.apple.mpegurl') ||
                url.includes('.m3u8') ||
                url.includes('.mp4')
            ) {
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
        } catch (e) {
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
        const hlsUrl = mediaUrls.find(m =>
            m.mimeType.includes('mpegURL') || m.url.includes('.m3u8')
        );

        const mp4Url = mediaUrls.find(m =>
            m.mimeType.includes('video/mp4') || m.url.includes('.mp4')
        );

        const selectedMedia = hlsUrl || mp4Url || mediaUrls[0];

        return {
            directUrl: selectedMedia.url,
            mimeType: selectedMedia.mimeType,
            quality: hlsUrl ? 'adaptive' : 'direct',
            headers: selectedMedia.headers,
        };

    } catch (error: any) {
        console.error('Error resolving media URL:', error);

        // Ensure browser is closed on error
        if (browser) {
            await browser.close();
        }

        throw new Error(`Failed to resolve media URL: ${error.message}`);
    }
}
