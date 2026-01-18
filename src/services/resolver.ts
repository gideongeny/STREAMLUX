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
        const sources: ResolvedSource[] = [];

        // 1. Unified Backend Resolver (Priority: High)
        // Queries FZMovies, GogoAnime, Dramacool, OK.ru from backend
        // Use timeout to avoid blocking if backend is slow
        try {
            // We need title for the backend query.
            // In a real app, we'd pass title from the component or fetch it here.
            // For now, if we don't have title, we skip.
            // Assuming this service might be called with title in future refactor.
            // Falling back to existing logic if simple ID is passed,
            // but if we had a title context here it would be:
            // const backendSources = await this.queryUnifiedBackend(title, year, mediaType);
            // sources.push(...backendSources);
        } catch (e) {
            console.warn("Unified backend resolution skipped/failed", e);
        }

        // 2. VidSrc & Embeds (Priority: Medium)
        const embedId = imdbId || id;
        const tmdbId = id.toString();

        sources.push(
            // 1. VidSrc.me
            {
                name: "VidSrc.me",
                url: mediaType === "movie"
                    ? `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`
                    : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&sea=${season}&epi=${episode}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed",
                priority: 1
            },
            // 2. 2Embed
            {
                name: "2Embed",
                url: mediaType === "movie"
                    ? `https://www.2embed.cc/embed/${tmdbId}`
                    : `https://www.2embed.cc/embedtv/${tmdbId}?s=${season}&e=${episode}`,
                quality: "1080p",
                speed: "medium",
                status: "active",
                type: "embed",
                priority: 2
            },
            // 3. SuperEmbed
            {
                name: "SuperEmbed",
                url: mediaType === "movie"
                    ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`
                    : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed",
                priority: 3
            }
        );

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
     * Get scraper sources from backend (FZMovies, NetNaija, O2TVSeries)
     * These return direct video URLs
     */
    private async getScraperSources(
        mediaType: "movie" | "tv",
        tmdbId: string,
        season?: number,
        episode?: number
    ): Promise<ResolvedSource[]> {
        try {
            const query = new URLSearchParams({
                type: mediaType,
                id: tmdbId,
            });
            if (season) query.append('season', season.toString());
            if (episode) query.append('episode', episode.toString());

            const response = await fetch(`${PROXY_BASE}/scrapers/resolve?${query.toString()}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                return [];
            }

            const data = await response.json();
            const scraperSources: ResolvedSource[] = [];

            // Process FZMovies sources
            if (data.fzmovies && Array.isArray(data.fzmovies)) {
                data.fzmovies.forEach((item: any, index: number) => {
                    if (item.downloadLink) {
                        scraperSources.push({
                            name: `FZMovies - ${item.quality || 'HD'}`,
                            url: item.downloadLink,
                            quality: item.quality || '720p',
                            speed: 'medium',
                            status: 'checking',
                            type: 'direct',
                            priority: 100 + index
                        });
                    }
                });
            }

            // Process NetNaija sources
            if (data.netnaija && Array.isArray(data.netnaija)) {
                data.netnaija.forEach((item: any, index: number) => {
                    if (item.url) {
                        scraperSources.push({
                            name: `NetNaija - ${item.category || 'Movie'}`,
                            url: item.url,
                            quality: '720p',
                            speed: 'medium',
                            status: 'checking',
                            type: 'direct',
                            priority: 200 + index
                        });
                    }
                });
            }

            // Process O2TVSeries sources
            if (data.o2tvseries && Array.isArray(data.o2tvseries)) {
                data.o2tvseries.forEach((item: any, index: number) => {
                    if (item.url) {
                        scraperSources.push({
                            name: `O2TVSeries - ${item.title || 'Episode'}`,
                            url: item.url,
                            quality: '720p',
                            speed: 'slow',
                            status: 'checking',
                            type: 'direct',
                            priority: 300 + index
                        });
                    }
                });
            }

            return scraperSources;
        } catch (error) {
            console.error('Error fetching scraper sources:', error);
            return [];
        }
    }

    /**
     * Clear health cache (useful for testing or manual refresh)
     */
    clearHealthCache(): void {
        this.healthCache.clear();
    }
}

export const resolverService = ResolverService.getInstance();

