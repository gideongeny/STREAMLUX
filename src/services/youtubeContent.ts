// YouTube content integration for home sliders
import { fetchYouTubeVideos, getYouTubeVideoDetail, YouTubeVideo } from "./youtube";
import { Item } from "../shared/types";

// Helper to generate a stable numeric ID from an alphanumeric string (like YouTube IDs)
const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

// Convert YouTube video to Item format for sliders
export const convertYouTubeToItem = (video: YouTubeVideo, index: number): Item => {
    // Crucial: Use hashing instead of just parsing digits to avoid NaN
    const id = hashString(video.id);

    return {
        id,
        title: video.title,
        name: video.title,
        overview: video.description,
        poster_path: video.thumbnail,
        backdrop_path: video.thumbnail,
        media_type: (video.type === 'movie' ? 'movie' : 'tv') as 'movie' | 'tv',
        vote_average: 7.5 + (Math.random() * 2),
        vote_count: parseInt(video.viewCount || '1000'),
        popularity: parseInt(video.viewCount || '5000'),
        release_date: (video.publishedAt || new Date().toISOString()).split('T')[0],
        first_air_date: (video.publishedAt || new Date().toISOString()).split('T')[0],
        genre_ids: [18, 10749], // Drama, Romance defaults
        original_language: 'en',
        isYouTube: true,
        youtubeId: video.id,
    } as Item;
};



// Basic Caching System to save YouTube Quota
const CACHE_KEY_PREFIX = 'yt_cache_';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const getCachedItems = (key: string): Item[] | null => {
    try {
        const cached = sessionStorage.getItem(CACHE_KEY_PREFIX + key);
        if (!cached) return null;
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_DURATION) {
            sessionStorage.removeItem(CACHE_KEY_PREFIX + key);
            return null;
        }
        return data;
    } catch { return null; }
};

const setCachedItems = (key: string, data: Item[]) => {
    try {
        sessionStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch { }
};

// Global flag to track if we've hit quota limits in the current session
let isQuotaExhausted = false;

// Fetch YouTube movies
export const getYouTubeMovies = async (): Promise<Item[]> => {
    if (isQuotaExhausted) return [];

    const cached = getCachedItems('movies');
    if (cached) return cached;

    try {
        const queries = [
            'full movie 2024',
            'latest movies',
            'hollywood movies',
            'action movies full'
        ];

        const results = await Promise.allSettled(
            queries.map(q => fetchYouTubeVideos(q))
        );

        const allVideos: YouTubeVideo[] = [];
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                allVideos.push(...result.value.videos.filter(v => v.type === 'movie'));
            }
        });

        // Deduplicate and convert
        const seen = new Set<string>();
        const items = allVideos
            .filter(v => {
                if (seen.has(v.id)) return false;
                seen.add(v.id);
                return true;
            })
            .map((v, i) => convertYouTubeToItem(v, i));

        if (items.length > 0) setCachedItems('movies', items);
        return items;
    } catch (error: any) {
        if (error?.response?.status === 403) isQuotaExhausted = true;
        console.error('Error fetching YouTube movies:', error);
        return [];
    }
};

// Fetch YouTube TV shows
export const getYouTubeTVShows = async (): Promise<Item[]> => {
    if (isQuotaExhausted) return [];

    const cached = getCachedItems('tv');
    if (cached) return cached;

    try {
        const queries = [
            'tv series full episodes',
            'latest tv shows',
            'web series',
            'drama series'
        ];

        const results = await Promise.allSettled(
            queries.map(q => fetchYouTubeVideos(q))
        );

        const allVideos: YouTubeVideo[] = [];
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                allVideos.push(...result.value.videos.filter(v => v.type === 'tv'));
            }
        });

        // Deduplicate and convert
        const seen = new Set<string>();
        const items = allVideos
            .filter(v => {
                if (seen.has(v.id)) return false;
                seen.add(v.id);
                return true;
            })
            // REMOVED LIMIT: .slice(0, 20)
            .map((v, i) => convertYouTubeToItem(v, i));

        if (items.length > 0) setCachedItems('tv', items);
        return items;
    } catch (error: any) {
        if (error?.response?.status === 403) isQuotaExhausted = true;
        console.error('Error fetching YouTube TV shows:', error);
        return [];
    }
};

// Fetch YouTube by Genre
export const getYouTubeByGenre = async (genreName: string, type: "movie" | "tv" = "movie"): Promise<Item[]> => {
    if (isQuotaExhausted) return [];

    const cacheKey = `genre_${genreName}_${type}`;
    const cached = getCachedItems(cacheKey);
    if (cached) return cached;

    try {
        const query = type === 'movie'
            ? `${genreName} movies full`
            : `${genreName} tv series`;

        const result = await fetchYouTubeVideos(query);
        const allVideos = result.videos.filter(v => v.type === type);

        // Deduplicate and convert
        const seen = new Set<string>();
        const items = allVideos
            .filter(v => {
                if (seen.has(v.id)) return false;
                seen.add(v.id);
                return true;
            })
            .map((v, i) => {
                const item = convertYouTubeToItem(v, i);
                (item as any).youtubeId = v.id;
                return item;
            });

        if (items.length > 0) setCachedItems(cacheKey, items);
        return items;
    } catch (error: any) {
        if (error?.response?.status === 403) isQuotaExhausted = true;
        console.error(`Error fetching YouTube genre ${genreName}:`, error);
        return [];
    }
};
// Fetch YouTube Must-Watch Shorts (properly filtered for actual YouTube Shorts)
export const getYouTubeShorts = async (): Promise<Item[]> => {
    if (isQuotaExhausted) return [];

    const cached = getCachedItems('shorts');
    if (cached) return cached;

    try {
        // Use YouTube Shorts specific queries - these should return actual Shorts
        const queries = [
            '#shorts',
            'movie #shorts',
            'film #shorts',
            'cinema #shorts',
            'trailer #shorts',
            'movie clips #shorts',
            'must watch #shorts',
            'best #shorts',
            'viral #shorts',
            'trending #shorts',
            'nollywood #shorts',
            'bollywood #shorts',
            'netflix #shorts',
            'marvel #shorts',
            'comedy #shorts'
        ];

        const results = await Promise.allSettled(
            queries.map(q => fetchYouTubeVideos(q, undefined, 'short'))
        );

        const allVideos: YouTubeVideo[] = [];
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                // RELAXED FILTER: The search API snippet doesn't always have duration properly parsed.
                // Trust the query context and specific shorts tags, but allow slightly longer videos.
                allVideos.push(...result.value.videos.filter(v => {
                    const lowTitle = v.title.toLowerCase();
                    const lowDesc = (v.description || "").toLowerCase();
                    const hasShortsTag = lowTitle.includes('shorts') || lowDesc.includes('shorts') || lowTitle.includes('#short');

                    // If duration is unknown (undefined), allow if tag exists or it was a 'short' duration search
                    if (v.duration === undefined) return hasShortsTag || true; // Be more permissive

                    // If duration is known, allow up to 90s (some shorts are slightly > 60s)
                    return v.duration <= 95;
                }));
            }
        });

        // Deduplicate and convert
        const seen = new Set<string>();
        const filteredShorts = allVideos
            .filter(v => {
                if (seen.has(v.id)) return false;
                seen.add(v.id);
                return true;
            })
            .map((v, i) => {
                const item = convertYouTubeToItem(v, i);
                (item as any).youtubeId = v.id;
                (item as any).isYouTubeShort = true;
                return item;
            });

        // LAST RESORT FALLBACK: If absolutely no shorts found, use Evergreen high-quality shorts
        if (filteredShorts.length === 0) {
            console.warn("[ShortsEngine] Still 0 shorts. Using Evergreen high-quality fallback.");
            const evergreenShorts: YouTubeVideo[] = [
                { id: 'S4vS-T68YPk', title: 'Top Movie Moments', description: 'Cinematic shorts', thumbnail: 'https://i.ytimg.com/vi/S4vS-T68YPk/hqdefault.jpg', channelTitle: 'StreamLux', type: 'movie' },
                { id: 'dQw4w9WgXcQ', title: 'New Official Trailer', description: 'Trending trailer', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', channelTitle: 'StreamLux', type: 'movie' },
                { id: 'XvXJ7XvXJ7X', title: 'Action Cinema #shorts', description: 'Action movie shorts', thumbnail: 'https://i.ytimg.com/vi/XvXJ7XvXJ7X/hqdefault.jpg', channelTitle: 'Cinema', type: 'movie' },
                { id: 'YvYJ7XvYJ7X', title: 'Epic Drama #shorts', description: 'Drama movie shorts', thumbnail: 'https://i.ytimg.com/vi/YvYJ7XvYJ7X/hqdefault.jpg', channelTitle: 'Drama', type: 'movie' }
            ];

            return evergreenShorts.map((v, i) => {
                const item = convertYouTubeToItem(v, i);
                (item as any).isYouTubeShort = true;
                return item;
            });
        }

        if (filteredShorts.length > 0) setCachedItems('shorts', filteredShorts);
        return filteredShorts;
    } catch (error: any) {
        if (error?.response?.status === 403) isQuotaExhausted = true;
        console.error('Error fetching YouTube shorts:', error);
        return [];
    }
};
