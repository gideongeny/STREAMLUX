import { ProviderExtension, StreamSource, MediaPlayRequest } from './types';
import { providerContext } from './providerContext';

// Primary CDN and GitHub raw fallbacks for Vega Zenda-Cross providers
const PROVIDER_BASES = [
    'https://cdn.jsdelivr.net/gh/Zenda-Cross/vega-providers@main/dist',
    'https://raw.githubusercontent.com/Zenda-Cross/vega-providers/refs/heads/main/dist',
    'https://fastly.jsdelivr.net/gh/Zenda-Cross/vega-providers@main/dist'
];

// Memory cache for fetched provider code
const moduleCache = new Map<string, string>();

/**
 * Fetch module code with multi-mirror failover and caching
 */
export const fetchProviderModule = async (providerValue: string, moduleName: string = 'stream'): Promise<string | null> => {
    const cacheKey = `${providerValue}_${moduleName}`;
    if (moduleCache.has(cacheKey)) {
        return moduleCache.get(cacheKey)!;
    }

    // Check localStorage cache
    try {
        const stored = localStorage.getItem(`streamlux_mod_${cacheKey}`);
        if (stored) {
            moduleCache.set(cacheKey, stored);
            return stored;
        }
    } catch {}

    for (const base of PROVIDER_BASES) {
        try {
            const url = `${base}/${providerValue}/${moduleName}.js`;
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 7000);

            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timer);

            if (res.ok) {
                const code = await res.text();
                if (code && code.length > 50) {
                    moduleCache.set(cacheKey, code);
                    try {
                        localStorage.setItem(`streamlux_mod_${cacheKey}`, code);
                    } catch {}
                    return code;
                }
            }
        } catch {
            // Try next mirror
        }
    }

    return null;
};

/**
 * Execute a provider module safely in browser context
 */
export const executeProvider = async (
    code: string,
    exportName: string,
    args: any
): Promise<any> => {
    try {
        const exports: Record<string, any> = {};
        const module = { exports };

        // Evaluate provider code in isolated scope
        const runner = new Function(
            'exports',
            'module',
            'require',
            'console',
            'Promise',
            'setTimeout',
            'clearTimeout',
            'setInterval',
            'clearInterval',
            'providerContext',
            `"use strict";\n${code}`
        );

        runner(
            exports,
            module,
            () => ({}),
            console,
            Promise,
            setTimeout,
            clearTimeout,
            setInterval,
            clearInterval,
            providerContext
        );

        const exportedFunc =
            (typeof module.exports === 'function' ? module.exports : null) ||
            module.exports?.[exportName] ||
            module.exports?.getStream ||
            module.exports?.stream ||
            exports?.[exportName] ||
            exports?.getStream ||
            exports?.stream;

        if (typeof exportedFunc === 'function') {
            return await exportedFunc({
                ...args,
                providerContext,
                signal: new AbortController().signal
            });
        }
        return null;
    } catch (err) {
        console.warn(`[StreamLux Provider Runner] Execution failed for ${exportName}:`, err);
        return null;
    }
};

/**
 * Run provider stream extraction for a movie or TV episode
 */
export const resolveProviderStream = async (
    provider: ProviderExtension,
    request: MediaPlayRequest
): Promise<StreamSource[]> => {
    try {
        const streamCode = await fetchProviderModule(provider.value, 'stream');
        if (!streamCode) return [];

        const result = await executeProvider(streamCode, 'getStream', {
            id: request.tmdbId,
            tmdbId: request.tmdbId,
            type: request.mediaType,
            mediaType: request.mediaType,
            season: request.season || 1,
            episode: request.episode || 1,
            title: request.title || '',
            year: request.releaseYear || '',
        });

        if (!result) return [];

        // Normalize single or multiple streams
        const rawStreams = Array.isArray(result) ? result : [result];
        const streams: StreamSource[] = [];

        for (const s of rawStreams) {
            if (s && s.link && typeof s.link === 'string' && s.link.startsWith('http')) {
                streams.push({
                    server: s.server || provider.display_name,
                    link: s.link,
                    type: s.type || (s.link.includes('.m3u8') ? 'hls' : 'mp4'),
                    quality: s.quality || '1080p',
                    subtitles: s.subtitles || [],
                    headers: s.headers,
                    skip: s.skip,
                    providerValue: provider.value
                });
            }
        }

        return streams;
    } catch (err) {
        console.warn(`[StreamLux] Error resolving streams from ${provider.display_name}:`, err);
        return [];
    }
};
