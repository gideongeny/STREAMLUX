/**
 * StreamLux CORS Proxy Client
 * 
 * Uses the Firebase Cloud Function `proxy` to bypass browser CORS restrictions,
 * enabling streaming from 123movies, NetNaija, MovieBox, and other sites.
 * 
 * Usage:
 *   import { proxyUrl, proxiedFetch } from './services/corsProxy';
 *   const src = proxyUrl('https://www.123movies.net/...');
 */

// Firebase project ID — ensure this matches .firebaserc
const FIREBASE_PROJECT_ID = 'streamlux-app'; // update if different
const PROXY_BASE = `https://us-central1-${FIREBASE_PROJECT_ID}.cloudfunctions.net/proxy`;

/**
 * Wraps a URL so it goes through the server-side CORS proxy.
 * Use the returned URL wherever you'd use the original URL (iframe src, video src, fetch, etc.)
 */
export const proxyUrl = (targetUrl: string): string => {
    return `${PROXY_BASE}?url=${encodeURIComponent(targetUrl)}`;
};

/**
 * Fetch a remote URL through the proxy (avoids CORS for JSON/text responses too).
 */
export const proxiedFetch = async (targetUrl: string, init?: RequestInit): Promise<Response> => {
    return fetch(proxyUrl(targetUrl), init);
};

/**
 * Known streaming embed patterns and how to build their URLs.
 * Extend this as needed.
 */
export const StreamingProxies = {
    /**
     * Build a proxied 123movies embed URL for a movie by TMDB id.
     */
    movies123: (tmdbId: number) =>
        proxyUrl(`https://www.123movies.net/watch-movie/${tmdbId}.html`),

    /**
     * Build a proxied NetNaija search URL for a movie title.
     */
    netNaija: (title: string) =>
        proxyUrl(`https://www.netnaija.com/search?q=${encodeURIComponent(title)}&type=movies`),

    /**
     * Build a proxied MovieBox embed.
     */
    movieBox: (tmdbId: number, type: 'movie' | 'tv' = 'movie') =>
        proxyUrl(`https://moviebox.ng/api/source/${type}/${tmdbId}`),

    /**
     * Generic proxy — use for any URL.
     */
    generic: (url: string) => proxyUrl(url),
};

/**
 * Convert a streaming site URL to a proxied iframe-safe version.
 * Tries to detect the domain and use the correct proxy strategy.
 */
export const getProxiedStreamUrl = (url: string): string => {
    // Already a proxied URL
    if (url.startsWith(PROXY_BASE)) return url;
    return proxyUrl(url);
};
