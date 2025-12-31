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


        const sources: ResolvedSource[] = [
            {
                name: "VidSrc Me",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.VIDSRC_ME}/movie/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.VIDSRC_ME}/tv/${tmdbId}/${season}/${episode}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed"
            },
            {
                name: "VidSrc Pro",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.VIDSRC_PRO}/movie/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.VIDSRC_PRO}/tv/${tmdbId}/${season}/${episode}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed"
            },
            {
                name: "Embed.su",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.EMBED_SU}/movie/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.EMBED_SU}/tv/${tmdbId}/${season}/${episode}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed"
            },
            {
                name: "Smashy",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.SMASHY}/movie/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.SMASHY}/tv/${tmdbId}/${season}/${episode}`,
                quality: "720p",
                speed: "medium",
                status: "active",
                type: "embed"
            },
            {
                name: "VidSrc XYZ",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.VIDSRC_XYZ}/movie/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.VIDSRC_XYZ}/tv/${tmdbId}/${season}/${episode}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed"
            },
            {
                name: "AutoEmbed",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.AUTOEMBED}/movie/tmdb/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.AUTOEMBED}/tv/tmdb/${tmdbId}/${season}/${episode}`,
                quality: "720p",
                speed: "medium",
                status: "active",
                type: "embed"
            },
            {
                name: "2Embed",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.TWOEMBED}/movie?tmdb=${tmdbId}`
                    : `${EMBED_ALTERNATIVES.TWOEMBED}/tv?tmdb=${tmdbId}&s=${season}&e=${episode}`,
                quality: "HD",
                speed: "medium",
                status: "active",
                type: "embed"
            },
            {
                name: "SuperEmbed",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.SUPEREMBED}/movie/tmdb/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.SUPEREMBED}/tv/tmdb/${tmdbId}/${season}/${episode}`,
                quality: "HD",
                speed: "slow",
                status: "active",
                type: "embed"
            },
            {
                name: "Nollywood TV (African)",
                url: `${EMBED_ALTERNATIVES.NOLLYWOOD_TV}/embed/${tmdbId}`,
                quality: "720p",
                speed: "medium",
                status: "active",
                type: "embed"
            },
            {
                name: "DramaCool (Asian)",
                url: `${EMBED_ALTERNATIVES.DRAMACOOL}/embed/${tmdbId}`,
                quality: "HD",
                speed: "medium",
                status: "active",
                type: "embed"
            },
            {
                name: "KissAsian (Asian)",
                url: `${EMBED_ALTERNATIVES.KISSASIAN}/embed/${tmdbId}`,
                quality: "HD",
                speed: "medium",
                status: "active",
                type: "embed"
            },
            {
                name: "123Movies",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.ONETWOTHREEMOVIES}/movie/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.ONETWOTHREEMOVIES}/tv/${tmdbId}/${season}/${episode}`,
                quality: "SD",
                speed: "slow",
                status: "active",
                type: "embed"
            },
            {
                name: "Fmovies",
                url: mediaType === "movie"
                    ? `${EMBED_ALTERNATIVES.FMOVIES}/movie/${tmdbId}`
                    : `${EMBED_ALTERNATIVES.FMOVIES}/tv/${tmdbId}/${season}/${episode}`,
                quality: "HD",
                speed: "medium",
                status: "active",
                type: "embed"
            },
            {
                name: "FZMovies Mirror",
                url: `${EMBED_ALTERNATIVES.FZMOVIES_EMBED}/${tmdbId}`,
                quality: "HD",
                speed: "medium",
                status: "active",
                type: "embed"
            },
            {
                name: "9jaRocks Flash",
                url: `${EMBED_ALTERNATIVES.NINJAROCKS_EMBED}/${tmdbId}`,
                quality: "720p",
                speed: "medium",
                status: "active",
                type: "embed"
            },
            {
                name: "MovieBox Premium (Aone)",
                url: `https://h5.aoneroom.com/player/index.html?id=${tmdbId}&type=${mediaType === 'movie' ? 1 : 2}${season ? `&s=${season}` : ''}${episode ? `&e=${episode}` : ''}`,
                quality: "1080p",
                speed: "fast",
                status: "active",
                type: "embed"
            },
            {
                name: "StreamLux 4K (Ultra)",
                url: `https://vidsrc.cc/v2/embed/${mediaType}/${tmdbId}${season ? `/${season}/${episode}` : ''}`,
                quality: "4K",
                speed: "fast",
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
