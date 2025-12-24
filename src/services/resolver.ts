import { EMBED_ALTERNATIVES } from "../shared/constants";

export interface ResolvedSource {
    name: string;
    url: string;
    quality: string;
    speed: "fast" | "medium" | "slow";
    status: "active" | "slow" | "down";
    type: "embed" | "direct";
}

export class ResolverService {
    private static instance: ResolverService;

    static getInstance(): ResolverService {
        if (!ResolverService.instance) {
            ResolverService.instance = new ResolverService();
        }
        return ResolverService.instance;
    }

    /**
     * Generates a list of potential streaming/download sources based on media ID.
     * In a real app, this would perform actual scraping. For now, it intelligently 
     * maps constants to the specific media item.
     */
    async resolveSources(
        mediaType: "movie" | "tv",
        id: number | string,
        season?: number,
        episode?: number,
        imdbId?: string
    ): Promise<ResolvedSource[]> {
        const tmdbId = id.toString();
        const imdb = imdbId || tmdbId;

        const sources: ResolvedSource[] = [
            {
                name: "Server VidSrc (Pro)",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.VIDSRC_PRO}/movie/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.VIDSRC_PRO}/tv/${tmdbId}/${season}/${episode}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed"
            },
            {
                name: "Direct Download (Alpha)",
                url: mediaType === "movie"
                    ? `https://vidsrc.pro/vidsrc.php?id=${tmdbId}`
                    : `https://vidsrc.pro/vidsrc.php?id=${tmdbId}&s=${season}&e=${episode}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "direct"
            },
            {
                name: "Server Embed.su",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.EMBED_SU}/movie/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.EMBED_SU}/tv/${tmdbId}/${season}/${episode}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed"
            },
            {
                name: "Server Smashy",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.SMASHY}/movie/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.SMASHY}/tv/${tmdbId}/${season}/${episode}`,
                quality: "720p",
                speed: "medium",
                status: "active",
                type: "embed"
            },
            {
                name: "Server VidSrc.xyz",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.VIDSRC_XYZ}/movie/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.VIDSRC_XYZ}/tv/${tmdbId}/${season}/${episode}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed"
            },
            {
                name: "Server AutoEmbed",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.AUTOEMBED}/movie/tmdb/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.AUTOEMBED}/tv/tmdb/${tmdbId}/${season}/${episode}`,
                quality: "720p",
                speed: "medium",
                status: "active",
                type: "embed"
            }
        ];

        // Simulate network delay for "Resolving" feel
        await new Promise(resolve => setTimeout(resolve, 800));

        return sources;
    }
}

export const resolverService = ResolverService.getInstance();
