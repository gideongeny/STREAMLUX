// services/DownloadEngine.ts

/**
 * Represents a resolved stream URL and its type.
 */
export interface ExtractedStream {
    url: string;
    type: 'hls' | 'mp4';
}

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
     * Fetch a URL through the configured proxy.
     */
    async fetchWithProxy(url: string, options?: RequestInit): Promise<Response> {
        const proxyUrl = this.proxy + url;
        return fetch(proxyUrl, options);
    }

    /**
     * Extract a direct stream URL (HLS or MP4) from an iframe page.
     * @param iframeUrl The URL of the embed iframe.
     * @returns The extracted stream URL and its type.
     * @throws If no stream URL can be found.
     */
    async extractFromIframe(iframeUrl: string): Promise<ExtractedStream> {
        try {
            const response = await this.fetchWithProxy(iframeUrl);
            const html = await response.text();

            // 1. Try to parse the DOM and look for <video> or <source> tags
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Look for video element
            const video = doc.querySelector('video');
            if (video) {
                const src = video.getAttribute('src');
                if (src) {
                    const absolute = this.resolveRelativeUrl(src, iframeUrl);
                    if (absolute.includes('.m3u8')) return { url: absolute, type: 'hls' };
                    if (absolute.includes('.mp4')) return { url: absolute, type: 'mp4' };
                }
                // Check <source> children
                const source = video.querySelector('source');
                if (source) {
                    const src = source.getAttribute('src');
                    if (src) {
                        const absolute = this.resolveRelativeUrl(src, iframeUrl);
                        if (absolute.includes('.m3u8')) return { url: absolute, type: 'hls' };
                        if (absolute.includes('.mp4')) return { url: absolute, type: 'mp4' };
                    }
                }
            }

            // 2. Fallback: regex‑search the whole HTML for .m3u8 or .mp4 URLs
            const urlRegex = /(https?:\/\/[^\s"']+\.(?:m3u8|mp4)(?:\?[^\s"']*)?)/gi;
            const matches = html.match(urlRegex);
            if (matches && matches.length > 0) {
                // Prefer HLS (m3u8) as it usually gives better quality
                const m3u8Url = matches.find(url => url.includes('.m3u8'));
                if (m3u8Url) return { url: m3u8Url, type: 'hls' };
                const mp4Url = matches.find(url => url.includes('.mp4'));
                if (mp4Url) return { url: mp4Url, type: 'mp4' };
            }

            throw new Error('No valid .m3u8 or .mp4 found in iframe HTML');
        } catch (error) {
            console.error('[DownloadEngine] Extraction failed for:', iframeUrl, error);
            throw error;
        }
    }

    /**
     * Download a stream (MP4 or HLS) and return its data as a Uint8Array.
     * @param streamUrl The direct URL to the stream.
     * @param type 'hls' or 'mp4'.
     * @param onProgress Callback receiving download percentage (0‑100).
     * @param signal Optional AbortSignal to cancel the download.
     */
    async downloadStream(
        streamUrl: string,
        type: 'hls' | 'mp4',
        onProgress: (percent: number) => void,
        signal?: AbortSignal
    ): Promise<Uint8Array> {
        if (type === 'mp4') {
            return this.downloadMp4(streamUrl, onProgress, signal);
        } else {
            return this.downloadHls(streamUrl, onProgress, signal);
        }
    }

    // ---------- Private helpers ----------

    private resolveRelativeUrl(relative: string, base: string): string {
        try {
            return new URL(relative, base).href;
        } catch {
            return relative;
        }
    }

    private async downloadMp4(
        url: string,
        onProgress: (percent: number) => void,
        signal?: AbortSignal
    ): Promise<Uint8Array> {
        const response = await this.fetchWithProxy(url, { signal });
        if (!response.ok) {
            throw new Error(`Failed to fetch MP4: ${response.statusText}`);
        }

        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body is not readable');

        const chunks: Uint8Array[] = [];
        let received = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            received += value.length;
            if (total > 0) {
                onProgress((received / total) * 100);
            } else {
                // Cannot track progress without Content‑Length
                onProgress(0);
            }
        }

        // Concatenate chunks into a single Uint8Array
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }
        return result;
    }

    private async downloadHls(
        playlistUrl: string,
        onProgress: (percent: number) => void,
        signal?: AbortSignal
    ): Promise<Uint8Array> {
        // 1. Fetch the playlist (may be a master or a media playlist)
        const masterResp = await this.fetchWithProxy(playlistUrl, { signal });
        const masterText = await masterResp.text();

        let mediaPlaylistUrl = playlistUrl;
        const lines = masterText.split('\n');
        const variantLines = lines.filter(
            line => line.includes('.m3u8') && !line.startsWith('#')
        );

        if (variantLines.length > 0) {
            // Pick the first variant (you could parse bandwidth and choose the highest)
            const variant = variantLines[0].trim();
            mediaPlaylistUrl = this.resolveRelativeUrl(variant, playlistUrl);
        }

        // 2. Fetch the media playlist
        const mediaResp = await this.fetchWithProxy(mediaPlaylistUrl, { signal });
        const mediaText = await mediaResp.text();

        // 3. Parse segment URLs (lines that are not comments and contain .ts)
        const segmentLines = mediaText
            .split('\n')
            .filter(line => line && !line.startsWith('#') && line.includes('.ts'));
        const segmentUrls = segmentLines.map(line =>
            this.resolveRelativeUrl(line.trim(), mediaPlaylistUrl)
        );

        if (segmentUrls.length === 0) {
            throw new Error('No .ts segments found in HLS playlist');
        }

        // 4. Download all segments
        const totalSegments = segmentUrls.length;
        const segmentBuffers: Uint8Array[] = [];

        for (let i = 0; i < totalSegments; i++) {
            if (signal?.aborted) throw new Error('Download aborted');

            const segUrl = segmentUrls[i];
            const segResp = await this.fetchWithProxy(segUrl, { signal });
            if (!segResp.ok) {
                throw new Error(`Failed to fetch segment ${i}: ${segResp.statusText}`);
            }

            const segBuffer = await segResp.arrayBuffer();
            segmentBuffers.push(new Uint8Array(segBuffer));
            onProgress(((i + 1) / totalSegments) * 100);
        }

        // 5. Concatenate all segments
        const totalLength = segmentBuffers.reduce(
            (acc, buf) => acc + buf.length,
            0
        );
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const buf of segmentBuffers) {
            result.set(buf, offset);
            offset += buf.length;
        }
        return result;
    }
}