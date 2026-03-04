import { getBackendBase } from "./download";

// Proxy Helpers - backend expects /api/proxy, /api/download, /api/resolve
const getApiBase = () => getBackendBase() + "/api";

export const getProxyUrl = (url: string, referer?: string) => {
    return `${getApiBase()}/proxy?url=${encodeURIComponent(url)}${referer ? `&referer=${encodeURIComponent(referer)}` : ''}`;
};

export const getDownloadUrl = (url: string, filename?: string) => {
    return `${getApiBase()}/download?url=${encodeURIComponent(url)}${filename ? `&filename=${encodeURIComponent(filename)}` : ''}`;
};

// Helper to get backend resolution
const resolveBackend = async (type: string, id: string, s?: string, e?: string): Promise<any> => {
    try {
        const query = new URLSearchParams({ type, id });
        if (s) query.append('s', s);
        if (e) query.append('e', e);

        const response = await fetch(`${getApiBase()}/resolve?${query.toString()}`);
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
        imdbId?: string,
        title?: string
    ): Promise<ResolvedSource[]> {
        let sources: ResolvedSource[] = [];

        // 1. Unified Backend Resolver (Priority: High)
        // queries scrapers that need title
        try {
            const scrapers = await this.getScraperSources(
                mediaType,
                id.toString(),
                season,
                episode,
                title
            );

            scrapers.forEach(s => {
                s.priority = 0; // High priority to appear first
                sources.push(s);
            });
        } catch (e) {
            console.warn("Unified backend resolution skipped/failed", e);
        }

        // 2. VidSrc & Embeds (Priority: Medium)
        const embedId = imdbId || id;
        const tmdbId = id.toString();

        sources.push(
            // 0. VidSrc.me (Clean Alternative - NEW DEFAULT)
            {
                name: "VidSrc.me",
                url: mediaType === "movie"
                    ? `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`
                    : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season || 1}&episode=${episode || 1}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed",
                priority: 0
            },
            // 1. VidLink (Premium Ad-Free / Low Ads)
            {
                name: "VidLink",
                url: mediaType === "movie"
                    ? `https://vidlink.pro/embed/movie/${tmdbId}`
                    : `https://vidlink.pro/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p+",
                speed: "fast",
                status: "active",
                type: "embed",
                priority: 1 // shifted
            },
            // 2. VidSrc.to (Priority 2 - Real Working VidSrc)
            {
                name: "VidSrc",
                url: mediaType === "movie"
                    ? `https://vidsrc.to/embed/movie/${tmdbId}`
                    : `https://vidsrc.to/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed",
                priority: 2
            },
            // 3. VidSrc.vip (Low Ads)
            {
                name: "VidSrc.vip",
                url: mediaType === "movie"
                    ? `https://vidsrc.vip/embed/movie/${tmdbId}`
                    : `https://vidsrc.vip/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed",
                priority: 3
            },
            // 4. VidSrc.pro (Alt)
            {
                name: "VidSrc (Alt)",
                url: mediaType === "movie"
                    ? `https://vidsrc.pro/embed/movie/${tmdbId}`
                    : `https://vidsrc.pro/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed",
                priority: 4
            },
            // 5. Vidplay (via VidSrc.to)
            {
                name: "Vidplay",
                url: mediaType === "movie"
                    ? `https://vidsrc.to/embed/movie/${tmdbId}?server=vidplay`
                    : `https://vidsrc.to/embed/tv/${tmdbId}/${season || 1}/${episode || 1}?server=vidplay`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed",
                priority: 5
            },
            // 6. Upcloud (via VidSrc.to)
            {
                name: "Upcloud",
                url: mediaType === "movie"
                    ? `https://vidsrc.to/embed/movie/${tmdbId}?server=upcloud`
                    : `https://vidsrc.to/embed/tv/${tmdbId}/${season || 1}/${episode || 1}?server=upcloud`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed",
                priority: 6
            },
            // 7. Topish (Nollywood/African)
            {
                name: "Topish",
                url: `https://topish.to/embed/${embedId}`,
                quality: "720p",
                speed: "medium",
                status: "active",
                type: "embed",
                priority: 7
            },
            // 5. Embed.su (International)
            {
                name: "Embed.su",
                url: mediaType === "movie"
                    ? `https://embed.su/embed/movie/${tmdbId}`
                    : `https://embed.su/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed",
                priority: 5
            },
            // 6. VidSrc.xyz (YouTube Aggregator)
            {
                name: "VidSrc.xyz",
                url: mediaType === "movie"
                    ? `https://vidsrc.xyz/embed/movie/${tmdbId}`
                    : `https://vidsrc.xyz/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed",
                priority: 6
            },
            // 7. HiAnime (Anime Specialist)
            {
                name: "HiAnime",
                url: mediaType === "tv" // Typically Anime is TV
                    ? `https://hianime.to/embed/episode/${tmdbId}`
                    : `https://hianime.to/embed/movie/${tmdbId}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed",
                priority: 7
            },
            // 8. AniWatch (Anime)
            {
                name: "AniWatch",
                url: `https://aniwatch.to/embed?id=${tmdbId}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed",
                priority: 8
            },
            // 9. KissKH (Asian Drama)
            {
                name: "KissKH",
                url: `https://kisskh.co/Embed/${embedId}?type=${mediaType === 'movie' ? 1 : 2}`,
                quality: "720p",
                speed: "medium",
                status: "active",
                type: "embed",
                priority: 9
            },
            // 10. AsianEmbed
            {
                name: "AsianEmbed",
                url: `https://asianembed.io/streaming.php?id=${embedId}`,
                quality: "720p",
                speed: "medium",
                status: "active",
                type: "embed",
                priority: 10
            },
            // 11. DoodStream (Regional Mirror)
            {
                name: "DoodStream",
                url: `https://d000d.com/e/${tmdbId}`,
                quality: "SD",
                speed: "slow",
                status: "active",
                type: "embed",
                priority: 11
            },
            // 12. MixDrop
            {
                name: "MixDrop",
                url: `https://mixdrop.co/e/${tmdbId}`,
                quality: "SD",
                speed: "slow",
                status: "active",
                type: "embed",
                priority: 12
            },
            // 13. FileMoon
            {
                name: "FileMoon",
                url: `https://filemoon.sx/e/${tmdbId}`,
                quality: "HD",
                speed: "medium",
                status: "active",
                type: "embed",
                priority: 13
            },
            // 14. 2Embed (Fallback)
            {
                name: "2Embed",
                url: mediaType === "movie"
                    ? `https://www.2embed.cc/embed/${tmdbId}`
                    : `https://www.2embed.cc/embedtv/${tmdbId}?s=${season || 1}&e=${episode || 1}`,
                quality: "1080p",
                speed: "medium",
                status: "active",
                type: "embed",
                priority: 14
            },
            // 15. SuperEmbed (Fallback)
            {
                name: "SuperEmbed",
                url: mediaType === "movie"
                    ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`
                    : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season || 1}&e=${episode || 1}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed",
                priority: 15
            }
        );

        // Simulate network delay for "Resolving" feel
        await new Promise(resolve => setTimeout(resolve, 800));

        // Choose the first healthy source based on HEAD ping,
        // then put it at the top of the list so the player starts
        // with something that is actually up.
        const healthy = await this.getHealthySource(sources);
        if (healthy) {
            const seen = new Set<string>();
            const reordered: ResolvedSource[] = [];
            reordered.push(healthy);
            seen.add(healthy.url);
            for (const s of sources) {
                if (!seen.has(s.url)) {
                    reordered.push(s);
                    seen.add(s.url);
                }
            }
            sources = reordered;
        }

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
        episode?: number,
        title?: string
    ): Promise<ResolvedSource[]> {
        try {
            const query = new URLSearchParams({
                type: mediaType,
                id: tmdbId,
            });
            if (season) query.append('season', season.toString());
            if (episode) query.append('episode', episode.toString());
            if (title) query.append('title', title);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second max for scrapers

            const response = await fetch(`${getApiBase()}/scrapers/resolve?${query.toString()}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

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

