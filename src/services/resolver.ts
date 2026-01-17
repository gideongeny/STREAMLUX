import { EMBED_ALTERNATIVES } from "../shared/constants";

// Proxy Helpers
const PROXY_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001/api";

export const getProxyUrl = (url: string, referer?: string) => {
    return `${PROXY_BASE}/proxy?url=${encodeURIComponent(url)}${referer ? `&referer=${encodeURIComponent(referer)}` : ''}`;
};

export const getDownloadUrl = (url: string, filename?: string) => {
    return `${PROXY_BASE}/download?url=${encodeURIComponent(url)}${filename ? `&filename=${encodeURIComponent(filename)}` : ''}`;
};

// Helper to get backend resolution
const resolveBackend = async (type: string, id: string, s?: string, e?: string): Promise<any> => {
    try {
        const query = new URLSearchParams({ type, id });
        if (s) query.append('s', s);
        if (e) query.append('e', e);

        const response = await fetch(`${PROXY_BASE}/resolve?${query.toString()}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (err) {
        return null;
    }
};

export interface ResolvedSource {
    name: string;
    url: string;
    quality: string;
    speed: "fast" | "medium" | "slow";
    status: "active" | "slow" | "down" | "checking";
    type: "embed" | "direct";
    priority: number; // Lower = higher priority
}

export class ResolverService {
    private static instance: ResolverService;
    private healthCache: Map<string, { status: "active" | "slow" | "down", timestamp: number }> = new Map();
    private readonly HEALTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    static getInstance(): ResolverService {
        if (!ResolverService.instance) {
            ResolverService.instance = new ResolverService();
        }
        return ResolverService.instance;
    }

    /**
     * Ping a source to check if it's available
     * Uses a lightweight HEAD request with timeout
     */
    async pingSource(url: string): Promise<"active" | "slow" | "down"> {
        const cacheKey = url;
        const cached = this.healthCache.get(cacheKey);

        // Return cached result if still valid
        if (cached && Date.now() - cached.timestamp < this.HEALTH_CACHE_TTL) {
            return cached.status;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const startTime = Date.now();
            await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                mode: 'no-cors', // Avoid CORS issues
            });
            clearTimeout(timeoutId);

            const responseTime = Date.now() - startTime;

            // Determine status based on response time
            let status: "active" | "slow" | "down";
            if (responseTime < 2000) {
                status = "active";
            } else if (responseTime < 5000) {
                status = "slow";
            } else {
                status = "down";
            }

            // Cache the result
            this.healthCache.set(cacheKey, { status, timestamp: Date.now() });
            return status;
        } catch (error) {
            // If fetch fails, mark as down
            this.healthCache.set(cacheKey, { status: "down", timestamp: Date.now() });
            return "down";
        }
    }

    /**
     * Get the first healthy source from the list
     */
    async getHealthySource(sources: ResolvedSource[]): Promise<ResolvedSource | null> {
        // Sort by priority first
        const sortedSources = [...sources].sort((a, b) => a.priority - b.priority);

        for (const source of sortedSources) {
            const health = await this.pingSource(source.url);
            if (health === "active" || health === "slow") {
                return { ...source, status: health };
            }
        }

        // If no healthy source found, return the first one anyway
        return sortedSources[0] || null;
    }

    /**
     * Generates a list of potential streaming/download sources based on media ID.
     * Includes VidSrc (primary), Vidplay, Upcloud, Vidcloud, and SmashyStream
     */
    async resolveSources(
        mediaType: "movie" | "tv",
        id: number | string,
        season?: number,
        episode?: number,
        imdbId?: string
    ): Promise<ResolvedSource[]> {
        const tmdbId = id.toString();

        // Build sources with priority ordering
        const sources: ResolvedSource[] = [
            // Priority 1: VidSrc Me (Primary - most reliable)
            {
                name: "VidSrc Me",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.VIDSRC_ME}/movie/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.VIDSRC_ME}/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p",
                speed: "fast",
                status: "checking",
                type: "embed",
                priority: 1
            },
            // Priority 2: Vidplay
            {
                name: "Vidplay",
                url: mediaType === "movie"
                    ? `https://vidplay.online/e/movie/${tmdbId}`
                    : `https://vidplay.online/e/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p",
                speed: "fast",
                status: "checking",
                type: "embed",
                priority: 2
            },
            // Priority 3: Upcloud
            {
                name: "Upcloud",
                url: mediaType === "movie"
                    ? `https://upcloud.to/e/movie/${tmdbId}`
                    : `https://upcloud.to/e/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p",
                speed: "medium",
                status: "checking",
                type: "embed",
                priority: 3
            },
            // Priority 4: Vidcloud
            {
                name: "Vidcloud",
                url: mediaType === "movie"
                    ? `https://vidcloud.stream/e/movie/${tmdbId}`
                    : `https://vidcloud.stream/e/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "720p",
                speed: "medium",
                status: "checking",
                type: "embed",
                priority: 4
            },
            // Priority 5: SmashyStream
            {
                name: "SmashyStream",
                url: mediaType === "movie"
                    ? `https://player.smashy.stream/movie/${tmdbId}`
                    : `https://player.smashy.stream/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p",
                speed: "fast",
                status: "checking",
                type: "embed",
                priority: 5
            },
            // Priority 6: VidSrc Pro (Alternative)
            {
                name: "VidSrc Pro",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.VIDSRC_PRO}/movie/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.VIDSRC_PRO}/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p",
                speed: "fast",
                status: "checking",
                type: "embed",
                priority: 6
            },
            // Priority 7: VidSrc To (Alternative)
            {
                name: "VidSrc To",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.VIDSRC_TO}/movie/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.VIDSRC_TO}/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p",
                speed: "fast",
                status: "checking",
                type: "embed",
                priority: 7
            },
            // Priority 8: APIMDB
            {
                name: "APIMDB",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.APIMDB}/movie/${imdbId || tmdbId}`
                    : `${EMBED_ALTERNATIVES.APIMDB}/tmdb/tv/${tmdbId}/${season || 1}/${episode || 1}/`,
                quality: "720p",
                speed: "medium",
                status: "checking",
                type: "embed",
                priority: 8
            }
        ];

        // NEW: Check backend resolution for VidSrc
        try {
            const backendData = await resolveBackend(
                mediaType,
                tmdbId,
                season?.toString(),
                episode?.toString()
            );
            if (backendData && backendData.status === 'active' && backendData.proxiedUrl) {
                // Prepend the backend resolved source as Priority 0 (Highest)
                sources.unshift({
                    name: "StreamLux Proxy (VidSrc)",
                    url: backendData.proxiedUrl,
                    quality: "1080p",
                    speed: "fast",
                    status: "active",
                    type: "embed",
                    priority: 0
                });
            }
        } catch (e) {
            console.warn("Backend resolution failed, falling back to client sources");
        }

        // Simulate network delay for "Resolving" feel
        await new Promise(resolve => setTimeout(resolve, 800));

        // Check health of all sources in parallel (don't wait for results)
        sources.forEach(source => {
            this.pingSource(source.url).then(status => {
                source.status = status;
            });
        });

        return sources;
    }

    /**
     * Clear health cache (useful for testing or manual refresh)
     */
    clearHealthCache(): void {
        this.healthCache.clear();
    }
}

export const resolverService = ResolverService.getInstance();

