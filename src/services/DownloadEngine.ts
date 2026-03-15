// services/DownloadEngine.ts

/**
 * Represents a resolved stream URL and its type.
 */
export interface ExtractedStream {
    url: string;
    type: 'hls' | 'mp4';
}

/**
 * Stages of the download process for user feedback.
 */
export type DownloadStage = 
    | 'Initializing...'
    | 'Extracting Steam...'
    | 'Analysing Playlist...'
    | 'Downloading Segments...'
    | 'Downloading File...'
    | 'Merging Data...'
    | 'Finalizing...'
    | 'Opening Download Page...'
    | 'Redirecting...'
    | 'Completed'
    | 'Failed';

/**
 * DownloadEngine handles fetching, extracting, and downloading media streams.
 * It uses a proxy prefix to bypass CORS restrictions.
 */
export class DownloadEngine {
    private proxy: string;

    /**
     * @param proxy Base URL of the proxy (e.g. 'https://cors-anywhere.herokuapp.com/')
     */
    constructor(proxy: string = '/api-proxy/') {
        // Ensure proxy ends with a slash for easy concatenation
        this.proxy = proxy.endsWith('/') ? proxy : proxy + '/';
    }

    /**
     * Update the proxy URL at runtime.
     */
    setProxy(proxy: string): void {
        this.proxy = proxy.endsWith('/') ? proxy : proxy + '/';
    }

    /**
     * Resolves a relative URL to an absolute one given a base URL.
     */
    private resolveRelativeUrl(url: string, base: string): string {
        try {
            return new URL(url, base).href;
        } catch (e) {
            return url;
        }
    }

    /**
     * Fetch a URL through the configured proxy with stealth headers.
     */
    async fetchWithProxy(url: string, options: RequestInit = {}, contextUrl?: string): Promise<Response> {
        // Ensure the URL is absolute before passing to the transparent proxy
        let absoluteUrl = url;
        if (contextUrl && !url.startsWith('http')) {
            absoluteUrl = new URL(url, contextUrl).href;
        }

        // The Transparent Proxy expects: /api-proxy/https://domain.com/path
        const proxyUrl = this.proxy + absoluteUrl;
        
        const headers: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': '*/*',
            ...(options.headers as Record<string, string> || {})
        };

        if (contextUrl) {
            try {
                const origin = new URL(contextUrl).origin;
                headers['Referer'] = contextUrl;
                headers['Origin'] = origin;
            } catch (e) {
                console.warn('[DownloadEngine] Referer context failed:', contextUrl);
            }
        }

        return fetch(proxyUrl, { ...options, headers });
    }

    /**
     * Extract a direct stream URL (HLS or MP4) from an iframe page.
     * @param iframeUrl The URL of the embed iframe.
     * @param statusCallback Optional callback to report current extraction stage.
     * @returns The extracted stream URL and its type.
     * @throws If no stream URL can be found.
     */
    async extractFromIframe(iframeUrl: string, statusCallback?: (stage: DownloadStage) => void): Promise<ExtractedStream> {
        try {
            statusCallback?.('Extracting Steam...');
            console.log('[DownloadEngine] Extraction Juggernaut starting for:', iframeUrl);
            const response = await this.fetchWithProxy(iframeUrl, {}, iframeUrl);
            const html = await response.text();
            
            // 1. Script Excavation: Scan all script content (handles packed/obfuscated links)
            try {
                const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
                let scriptMatch;
                while ((scriptMatch = scriptRegex.exec(html)) !== null) {
                    const scriptContent = scriptMatch[1];
                    
                    // Look for Base64 streams in scripts
                    const b64Regex = /[A-Za-z0-9+/]{80,}=*/g;
                    const b64s = scriptContent.match(b64Regex) || [];
                    for (const b64 of b64s) {
                        try {
                            const decoded = atob(b64);
                            const streamMatch = decoded.match(/(https?:\/\/[^\s"']+\.(?:m3u8|mp4)[^\s"']*)/i);
                            if (streamMatch) {
                                console.log('[DownloadEngine] Found via Script Excavation (Base64):', streamMatch[1]);
                                return { url: streamMatch[1], type: streamMatch[1].includes('.m3u8') ? 'hls' : 'mp4' };
                            }
                        } catch(e) {}
                    }

                    // Look for direct URLs in scripts
                    const urlInScript = scriptContent.match(/(https?:\/\/[^\s"']+\.(?:m3u8|mp4)[^\s"']*)/i);
                    if (urlInScript) {
                        console.log('[DownloadEngine] Found via Script Excavation (Direct):', urlInScript[1]);
                        return { url: urlInScript[1], type: urlInScript[1].includes('.m3u8') ? 'hls' : 'mp4' };
                    }
                }
            } catch (e) { console.warn('[DownloadEngine] Script Excavation failed'); }

            const urlRegex = /(https?:\/\/[^\s"']+\.(?:m3u8|mp4)[^\s"']*)/gi;

            // 2. Try JSON and Data attributes
            const jsonMatches = html.match(/["'](https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*)["']/gi);
            if (jsonMatches) {
                const clean = jsonMatches[0].replace(/["']/g, '');
                console.log('[DownloadEngine] Found via JSON/Data scan:', clean);
                return { url: clean, type: clean.includes('.m3u8') ? 'hls' : 'mp4' };
            }

            // 3. Parse DOM for <video> or <source>
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const video = doc.querySelector('video') || doc.querySelector('source');
            const src = video?.getAttribute('src');
            if (src) {
                const absolute = this.resolveRelativeUrl(src, iframeUrl);
                console.log('[DownloadEngine] Found via DOM scan:', absolute);
                return { url: absolute, type: absolute.includes('.m3u8') ? 'hls' : 'mp4' };
            }

            // 4. Brute Force Regex
            const matches = html.match(urlRegex);
            if (matches) {
                const best = matches.find(u => u.includes('.m3u8')) || matches[0];
                console.log('[DownloadEngine] Found via Brute Force Regex:', best);
                return { url: best, type: best.includes('.m3u8') ? 'hls' : 'mp4' };
            }

            console.error('[DownloadEngine] Extraction Juggernaut failed. HTML tail:', html.slice(-200));
            throw new Error('Could not capture stream. Provider may be blocked or using advanced DRM.');
        } catch (error) {
            console.error('[DownloadEngine] Fatal Extraction Error:', error);
            statusCallback?.('Failed');
            throw error;
        }
    }
}