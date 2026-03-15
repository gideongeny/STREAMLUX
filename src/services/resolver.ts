import { getBackendBase } from "./download";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../shared/firebase";
// Proxy Helpers - backend expects /api/proxy, /api/download, /api/resolve
const getApiBase = () => getBackendBase() + "/api";

export const getProxyUrl = (url: string, referer?: string) => {
    // Standardizing backend expects /api/proxy?url=...
    return `${getApiBase()}/proxy?url=${encodeURIComponent(url)}${referer ? `&referer=${encodeURIComponent(referer)}` : ''}`;
};

export const getDownloadUrl = (url: string, filename?: string) => {
    // Standardizing backend expects /api/download?url=... or through proxy
    return `${getApiBase()}/proxy?url=${encodeURIComponent(url)}${filename ? `&filename=${encodeURIComponent(filename)}` : ''}`;
};

// Helper to get backend resolution
const resolveBackend = async (type: string, id: string, s?: string, e?: string): Promise<any> => {
    try {
        // Updated to use the unified /api/resolve (routed to resolveStream)
        const query = new URLSearchParams({ 
            tmdbId: id,
            mediaType: type 
        });
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
    private globalHealth: Map<string, { success: number, failure: number }> = new Map();
    private readonly HEALTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    private permissionDenied = false;

    private constructor() {
        this.syncGlobalHealth();
        // Sync every 5 minutes
        setInterval(() => this.syncGlobalHealth(), this.HEALTH_CACHE_TTL);
    }

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
     * Sync global health stats from Firestore
     */
    private async syncGlobalHealth() {
        if (!db || this.permissionDenied) return;
        try {
            const healthDoc = await getDoc(doc(db, "system", "health"));
            if (healthDoc.exists()) {
                const data = healthDoc.data();
                Object.keys(data).forEach(key => {
                    this.globalHealth.set(key, data[key]);
                });
            }
        } catch (error: any) {
            if (error?.code === 'permission-denied') {
                this.permissionDenied = true;
                console.log("[Resolver] Firestore access denied (Unauthenticated). Reporting disabled.");
            } else {
                console.warn("Failed to sync global health:", error);
            }
        }
    }

    /**
     * Report successful playback for a source
     */
    async reportPlaybackSuccess(sourceName: string) {
        if (!db || this.permissionDenied) return;
        try {
            const docRef = doc(db, "system", "health");
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                await setDoc(docRef, { [sourceName]: { success: 1, failure: 0 } });
            } else {
                await updateDoc(docRef, {
                    [`${sourceName}.success`]: increment(1)
                });
            }
            const current = this.globalHealth.get(sourceName) || { success: 0, failure: 0 };
            this.globalHealth.set(sourceName, { ...current, success: current.success + 1 });
        } catch (error: any) {
            if (error?.code === 'permission-denied') {
                this.permissionDenied = true;
            } else {
                console.warn("Failed to report success:", error);
            }
        }
    }

    /**
     * Report failed playback for a source
     */
    async reportPlaybackFailure(sourceName: string) {
        if (!db || this.permissionDenied) return;
        try {
            const docRef = doc(db, "system", "health");
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                await setDoc(docRef, { [sourceName]: { success: 0, failure: 1 } });
            } else {
                await updateDoc(docRef, {
                    [`${sourceName}.failure`]: increment(1)
                });
            }
            const current = this.globalHealth.get(sourceName) || { success: 0, failure: 0 };
            this.globalHealth.set(sourceName, { ...current, failure: current.failure + 1 });
        } catch (error: any) {
            if (error?.code === 'permission-denied') {
                this.permissionDenied = true;
            } else {
                console.warn("Failed to report failure:", error);
            }
        }
    }

    /**
     * Get the first healthy source from the list, prioritizing community success
     */
    async getHealthySource(sources: ResolvedSource[]): Promise<ResolvedSource | null> {
        // Sort by priority and community health
        const sortedSources = [...sources].sort((a, b) => {
            const healthA = this.globalHealth.get(a.name);
            const healthB = this.globalHealth.get(b.name);
            
            // Calculate success ratio (default to 0.5 if unknown)
            const ratioA = healthA ? (healthA.success + 1) / (healthA.success + healthA.failure + 2) : 0.5;
            const ratioB = healthB ? (healthB.success + 1) / (healthB.success + healthB.failure + 2) : 0.5;

            // If a source has a horrible ratio (< 20%), penalize its priority heavily
            const effectivePriorityA = ratioA < 0.2 ? a.priority + 100 : a.priority;
            const effectivePriorityB = ratioB < 0.2 ? b.priority + 100 : b.priority;

            if (effectivePriorityA !== effectivePriorityB) {
                return effectivePriorityA - effectivePriorityB; // Lower priority number is better
            }
            
            // If priorities are equal, sort by success ratio (higher is better)
            return ratioB - ratioA;
        });

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
        title?: string,
        currentEpisode?: any
    ): Promise<ResolvedSource[]> {
        // Intercept YouTube String IDs
        let ytId = id.toString();
        if (currentEpisode && currentEpisode.production_code && isNaN(Number(currentEpisode.production_code))) {
            ytId = currentEpisode.production_code;
        }

        if (isNaN(Number(ytId)) && ytId.length >= 10 && !ytId.includes(" ")) {
            return [{
                 name: "YouTube Full Stream",
                 url: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`,
                 quality: "4K/1080p",
                 speed: "fast",
                 status: "active",
                 type: "embed",
                 priority: 0
            }];
        }

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
            // T1 - Premier (No/Low Ads, High Success)
            {
                name: "VidSrc.me",
                url: mediaType === "movie"
                    ? `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`
                    : `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season || 1}&episode=${episode || 1}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 0
            },
            {
                name: "AutoEmbed",
                url: mediaType === "movie"
                    ? `https://autoembed.cc/movie/tmdb/${tmdbId}`
                    : `https://autoembed.cc/tv/tmdb/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "4K/1080p", speed: "fast", status: "active", type: "embed", priority: 1
            },
            {
                name: "VidLink",
                url: mediaType === "movie"
                    ? `https://vidlink.pro/embed/movie/${tmdbId}`
                    : `https://vidlink.pro/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p+", speed: "fast", status: "active", type: "embed", priority: 2
            },
            {
                name: "SmashyStream",
                url: mediaType === "movie"
                    ? `https://embed.smashystream.com/playerjsMovie.php?tmdb=${tmdbId}`
                    : `https://embed.smashystream.com/playerjs.php?tmdb=${tmdbId}&season=${season || 1}&episode=${episode || 1}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 3
            },
            {
                name: "MovieAPI",
                url: mediaType === "movie"
                    ? `https://moviesapi.club/movie/${tmdbId}`
                    : `https://moviesapi.club/tv/${tmdbId}-${season || 1}-${episode || 1}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 4
            },
            // T2 - Standard Quality
            {
                name: "VidSrc",
                url: mediaType === "movie"
                    ? `https://vidsrc.to/embed/movie/${tmdbId}`
                    : `https://vidsrc.to/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 5
            },
            {
                name: "VidSrc.vip",
                url: mediaType === "movie"
                    ? `https://vidsrc.vip/embed/movie/${tmdbId}`
                    : `https://vidsrc.vip/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 6
            },
            {
                name: "VidSrc (Alt)",
                url: mediaType === "movie"
                    ? `https://vidsrc.pro/embed/movie/${tmdbId}`
                    : `https://vidsrc.pro/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 7
            },
            {
                name: "VidSrc.xyz",
                url: mediaType === "movie"
                    ? `https://vidsrc.xyz/embed/movie/${tmdbId}`
                    : `https://vidsrc.xyz/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 8
            },
            {
                name: "Embed.su",
                url: mediaType === "movie"
                    ? `https://embed.su/embed/movie/${tmdbId}`
                    : `https://embed.su/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 9
            },
            {
                name: "Vidplay",
                url: mediaType === "movie"
                    ? `https://vidsrc.to/embed/movie/${tmdbId}?server=vidplay`
                    : `https://vidsrc.to/embed/tv/${tmdbId}/${season || 1}/${episode || 1}?server=vidplay`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 10
            },
            {
                name: "Upcloud",
                url: mediaType === "movie"
                    ? `https://vidsrc.to/embed/movie/${tmdbId}?server=upcloud`
                    : `https://vidsrc.to/embed/tv/${tmdbId}/${season || 1}/${episode || 1}?server=upcloud`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 11
            },
            {
                name: "2Embed",
                url: mediaType === "movie"
                    ? `https://www.2embed.cc/embed/${tmdbId}`
                    : `https://www.2embed.cc/embedtv/${tmdbId}?s=${season || 1}&e=${episode || 1}`,
                quality: "1080p", speed: "medium", status: "active", type: "embed", priority: 12
            },
            {
                name: "SuperEmbed",
                url: mediaType === "movie"
                    ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`
                    : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season || 1}&e=${episode || 1}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 13
            },
            // T3 — New Fast Embeds
            {
                name: "VidFast",
                url: mediaType === "movie"
                    ? `https://vidfast.pro/movie/${tmdbId}`
                    : `https://vidfast.pro/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 14
            },
            {
                name: "FlixHQ",
                url: mediaType === "movie"
                    ? `https://flixhq.to/tmdb-movie/${tmdbId}`
                    : `https://flixhq.to/tmdb-tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 15
            },
            {
                name: "Nontongo",
                url: mediaType === "movie"
                    ? `https://nontongo.win/embed/movie?id=${tmdbId}`
                    : `https://nontongo.win/embed/tv?id=${tmdbId}&s=${season || 1}&e=${episode || 1}`,
                quality: "720p", speed: "medium", status: "active", type: "embed", priority: 16
            },
            {
                name: "EmbedRise",
                url: mediaType === "movie"
                    ? `https://embedrise.xyz/movie/${tmdbId}`
                    : `https://embedrise.xyz/tv/${tmdbId}/${season || 1}/${episode || 1}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 17
            },
            {
                name: "WatchX",
                url: mediaType === "movie"
                    ? `https://watchx.top/embed/movie/${tmdbId}`
                    : `https://watchx.top/embed/tv/${tmdbId}?s=${season || 1}&e=${episode || 1}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 18
            },
            {
                name: "CineZone",
                url: mediaType === "movie"
                    ? `https://cinezone.to/embed/movie?id=${tmdbId}`
                    : `https://cinezone.to/embed/tv?id=${tmdbId}&s=${season || 1}&e=${episode || 1}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 19
            },
            {
                name: "Frembed",
                url: mediaType === "movie"
                    ? `https://frembed.fun/api/film?id=${tmdbId}`
                    : `https://frembed.fun/api/serie?id=${tmdbId}&sa=${season || 1}&epi=${episode || 1}`,
                quality: "1080p", speed: "medium", status: "active", type: "embed", priority: 20
            },
            // Regional Specialists
            {
                name: "MyAsianTV",
                url: `https://myasiantv.to/embed/${tmdbId}`,
                quality: "720p", speed: "medium", status: "active", type: "embed", priority: 21
            },
            {
                name: "DramaCool",
                url: `https://dramacool.com.tr/embed/${tmdbId}`,
                quality: "720p", speed: "medium", status: "active", type: "embed", priority: 22
            },
            {
                name: "KissKH",
                url: `https://kisskh.co/Embed/${embedId}?type=${mediaType === 'movie' ? 1 : 2}`,
                quality: "720p", speed: "medium", status: "active", type: "embed", priority: 23
            },
            {
                name: "AsianEmbed",
                url: `https://asianembed.io/streaming.php?id=${embedId}`,
                quality: "720p", speed: "medium", status: "active", type: "embed", priority: 24
            },
            {
                name: "HiAnime",
                url: mediaType === "tv"
                    ? `https://hianime.to/embed/episode/${tmdbId}`
                    : `https://hianime.to/embed/movie/${tmdbId}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 25
            },
            {
                name: "AniWatch",
                url: `https://aniwatch.to/embed?id=${tmdbId}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 26
            },
            {
                name: "Topish",
                url: `https://topish.to/embed/${embedId}`,
                quality: "720p", speed: "medium", status: "active", type: "embed", priority: 27
            },
            // Latin/Spanish
            {
                name: "NaniPlay (Latin)",
                url: mediaType === "movie"
                    ? `https://naniplay.com/api/movie?tmdb=${tmdbId}`
                    : `https://naniplay.com/api/serie?tmdb=${tmdbId}&temp=${season || 1}&cap=${episode || 1}`,
                quality: "720p", speed: "medium", status: "active", type: "embed", priority: 28
            },
            {
                name: "CineTux (LatAm)",
                url: `https://cinetux.org/embed/${tmdbId}`,
                quality: "720p", speed: "medium", status: "active", type: "embed", priority: 29
            },
            {
                name: "PelisPlus (ES)",
                url: `https://pelisplus.io/embed/${tmdbId}`,
                quality: "720p", speed: "medium", status: "active", type: "embed", priority: 30
            },
            // Legacy / CDN backups
            {
                name: "Vidmov",
                url: `https://vidmov.com/embed/${mediaType}/${tmdbId}${mediaType === 'tv' ? `/${season}/${episode}` : ''}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 31
            },
            {
                name: "MyCloud",
                url: `https://mycloud.click/embed/${mediaType}/${tmdbId}${mediaType === 'tv' ? `/${season}/${episode}` : ''}`,
                quality: "1080p", speed: "medium", status: "active", type: "embed", priority: 32
            },
            {
                name: "MoviNow",
                url: `https://movinow.com/embed/${tmdbId}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 33
            },
            {
                name: "WatchNow",
                url: `https://watchnow.to/embed/${mediaType}/${tmdbId}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 34
            },
            {
                name: "MApi",
                url: `https://api.myfilestorage.xyz/embed/${mediaType}/${tmdbId}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 35
            },
            {
                name: "Rive",
                url: `https://rive.stream/embed/${mediaType}/${tmdbId}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 36
            },
            {
                name: "VidEasy",
                url: `https://videasy.to/embed/${mediaType}/${tmdbId}`,
                quality: "1080p", speed: "fast", status: "active", type: "embed", priority: 37
            },
            {
                name: "Cinemaous",
                url: `https://cinemaous.com/embed/${tmdbId}`,
                quality: "1080p", speed: "medium", status: "active", type: "embed", priority: 38
            },
            {
                name: "StreamTape",
                url: `https://streamtape.com/e/${tmdbId}`,
                quality: "720p", speed: "slow", status: "active", type: "embed", priority: 39
            },
            {
                name: "StreamWish",
                url: `https://streamwish.com/e/${tmdbId}`,
                quality: "720p", speed: "medium", status: "active", type: "embed", priority: 40
            },
            {
                name: "DoodStream",
                url: `https://d000d.com/e/${tmdbId}`,
                quality: "SD", speed: "slow", status: "active", type: "embed", priority: 41
            },
            {
                name: "FileMoon",
                url: `https://filemoon.sx/e/${tmdbId}`,
                quality: "HD", speed: "medium", status: "active", type: "embed", priority: 42
            },
            {
                name: "MixDrop",
                url: `https://mixdrop.co/e/${tmdbId}`,
                quality: "SD", speed: "slow", status: "active", type: "embed", priority: 43
            },
            // Scraper search fallbacks
            {
                name: "LookMovie2",
                url: `https://lookmovie2.to/search?q=${encodeURIComponent(title || '')}`,
                quality: "HD", speed: "medium", status: "active", type: "embed", priority: 50
            },
            {
                name: "SOAP2Day",
                url: `https://soap2day.rs/search/${encodeURIComponent(title || '')}`,
                quality: "HD", speed: "medium", status: "active", type: "embed", priority: 51
            },
            {
                name: "MyFlixer",
                url: `https://myflixer.to/search/${encodeURIComponent(title || '')}`,
                quality: "HD", speed: "medium", status: "active", type: "embed", priority: 52
            },
            {
                name: "FMovies",
                url: `https://fmovies.to/search/${encodeURIComponent(title || '')}`,
                quality: "HD", speed: "medium", status: "active", type: "embed", priority: 53
            },
            {
                name: "123Movies",
                url: `https://123movies.ai/search/${encodeURIComponent(title || '')}`,
                quality: "HD", speed: "medium", status: "active", type: "embed", priority: 54
            },
            {
                name: "Putlocker",
                url: `https://putlocker.vip/search/${encodeURIComponent(title || '')}`,
                quality: "HD", speed: "medium", status: "active", type: "embed", priority: 55
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

            // Process 123Movies sources
            if (data.movies123 && Array.isArray(data.movies123)) {
                data.movies123.forEach((item: any, index: number) => {
                    if (item.url) {
                        scraperSources.push({
                            name: `123Movies - ${item.quality || 'HD'}`,
                            url: item.url,
                            quality: item.quality || 'HD',
                            speed: 'medium',
                            status: 'checking',
                            type: 'embed',
                            priority: 50 + index
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

