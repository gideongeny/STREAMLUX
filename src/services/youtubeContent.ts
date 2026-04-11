// YouTube content integration for home sliders
import { fetchYouTubeVideos, getYouTubeVideoDetail, YouTubeVideo } from "./youtube";
import { Item } from "../shared/types";

// Convert YouTube video to Item format for sliders
export const convertYouTubeToItem = (video: YouTubeVideo, index: number): Item => {
    return {
        id: video.id,
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



const CACHE_KEY_PREFIX = 'yt_cache_v3_'; // Bumping to v3 to enforce new duration
const CACHE_DURATION = 48 * 60 * 60 * 1000; // 48 hours (Massive Quota Savings)

const getCachedItems = (key: string): Item[] | null => {
    try {
        const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
        if (!cached) return null;
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_DURATION) {
            localStorage.removeItem(CACHE_KEY_PREFIX + key);
            return null;
        }
        return data;
    } catch { return null; }
};

const setCachedItems = (key: string, data: Item[]) => {
    try {
        localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch { }
};

// Fetch YouTube movies with strict enforcement
export const getYouTubeMovies = async (): Promise<Item[]> => {
    const cached = getCachedItems('movies_dynamic_v5');
    if (cached) return cached;

    try {
        const queries = [
            'official full movie english',
            'hollywood action movie full feature',
            'full length movie 2024',
            'movie central full movie'
        ];

        // Fetch using strictly "long" duration and "embeddable" flag
        const results = await Promise.allSettled(
            queries.map(q => fetchYouTubeVideos(q, undefined, 'long', 'movie', undefined, 'true'))
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

        if (items.length > 0) {
            setCachedItems('movies_dynamic_v5', items);
            return items;
        }
        
        // Final fallback if even dynamic search fails: High-quality evergreen verified IDs
        return getVerifiedMovieFallbacks();
    } catch (error: any) {
        console.error('Error fetching YouTube movies:', error);
        return getVerifiedMovieFallbacks();
    }
};

const getVerifiedMovieFallbacks = (): Item[] => {
    // These are verified professionally managed films that allow embedding (Movie Central / Boxoffice)
    const movies = [
        { id: 'PkzT5jIF3ks', title: 'FBI FORCE / Powerful Action Thriller', type: 'movie' },
        { id: 'W1D0puderfs', title: 'CHASE (Full Action Movie)', type: 'movie' },
        { id: 'B0yDySwOBWU', title: 'WOUNDED (Full Feature Film)', type: 'movie' },
        { id: '1_USx942C0o', title: 'ELITE SOLDIER (Action Thriller)', type: 'movie' },
        { id: 'M7TNrq4UaQg', title: 'NOTORIOUS KILLER (Full Movie)', type: 'movie' }
    ];
    return movies.map((v, i) => convertYouTubeToItem({
         ...v,
         description: 'A verified cinematic experience confirmed for playback on StreamLux.',
         thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
         channelTitle: 'StreamLux Verified' 
    } as any, i));
};

// Fetch YouTube TV shows with strict enforcement
export const getYouTubeTVShows = async (): Promise<Item[]> => {
    const cached = getCachedItems('tv_dynamic_v5');
    if (cached) return cached;

    try {
        const queries = [
            'official tv series full episode 1',
            'full episodes tv drama',
            'web series full episode',
            'cartoon full episode english'
        ];

        // Fetch using "any" duration but strict "embeddable" flag
        const results = await Promise.allSettled(
            queries.map(q => fetchYouTubeVideos(q, undefined, 'any', 'tv', undefined, 'true'))
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
            .map((v, i) => convertYouTubeToItem(v, i));

        if (items.length > 0) {
            setCachedItems('tv_dynamic_v5', items);
            return items;
        }
        return getVerifiedTVFallbacks();
    } catch (error: any) {
        console.error('Error fetching YouTube TV shows:', error);
        return getVerifiedTVFallbacks();
    }
};

const getVerifiedTVFallbacks = (): Item[] => {
    // Verified episodes from official channels that permit embedding (Blender, DUST, Cartoon Hubs)
    const shows = [
        { id: 't8LD0iUYv80', title: 'FTL (Sci-Fi Episode 1)', type: 'tv' },
        { id: 'W7h_BgLxAIc', title: 'CTRL Z (Cyber Series)', type: 'tv' },
        { id: 'kDVelBWmN98', title: 'Selvedge (Dark Future Episode)', type: 'tv' },
        { id: 'ScMzIvxBSi4', title: 'Spring (Fantasy Animation)', type: 'tv' },
        { id: 'eRsGyueVLvQ', title: 'Sintel (The Quest Episode 1)', type: 'tv' }
    ];
    return shows.map((v, i) => convertYouTubeToItem({
         ...v,
         description: 'An evergreen TV Show collection verified for playback on StreamLux.',
         thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
         channelTitle: 'StreamLux TV'
    } as any, i));
};

export const getYouTubeByGenre = async (genreName: string, type: "movie" | "tv" = "movie"): Promise<Item[]> => {
    const cacheKey = `genre_${genreName}_${type}_v5`;
    const cached = getCachedItems(cacheKey);
    if (cached) return cached;

    try {
        const query = type === 'movie'
            ? `${genreName} movies full feature`
            : `${genreName} tv series episode 1`;

        // Strict filters for Genre too
        const result = await fetchYouTubeVideos(
            query, 
            undefined, 
            type === 'movie' ? 'long' : 'any', 
            type === 'movie' ? 'movie' : 'tv',
            undefined, 
            'true'
        );
        
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
        console.error(`Error fetching YouTube genre ${genreName}:`, error);
        return [];
    }
};
export const getYouTubeShorts = async (): Promise<Item[]> => {
    const cached = getCachedItems('shorts_v5');
    if (cached) return cached;

    try {
        const queries = [
            'movie #shorts',
            'cinema #shorts',
            'trailer #shorts',
            'must watch #shorts',
            'action scene #shorts'
        ];

        const results = await Promise.allSettled(
            queries.map(q => fetchYouTubeVideos(q, undefined, 'short', 'movie', undefined, 'true'))
        );

        const allVideos: YouTubeVideo[] = [];
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                allVideos.push(...result.value.videos.filter(v => {
                    const lowTitle = v.title.toLowerCase();
                    const lowDesc = (v.description || "").toLowerCase();
                    return lowTitle.includes('shorts') || lowDesc.includes('shorts') || lowTitle.includes('#short');
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
                (item as any).isYouTubeShort = true;
                return item;
            });

        if (filteredShorts.length > 0) {
            setCachedItems('shorts_v4', filteredShorts);
            return filteredShorts;
        }

        // Final fallback: Verified high-quality cinematic shorts (Blender/DUST)
        const evergreenShorts: YouTubeVideo[] = [
            { id: 't8LD0iUYv80', title: 'FTL (Sci-Fi Short)', type: 'movie' },
            { id: 'W7h_BgLxAIc', title: 'CTRL Z (Sci-Fi Comedy)', type: 'movie' },
            { id: 'kDVelBWmN98', title: 'Selvedge (Cinematic Short)', type: 'movie' },
            { id: 'ScMzIvxBSi4', title: 'Spring (Award-Winning Animation)', type: 'movie' },
            { id: 'eRsGyueVLvQ', title: 'Sintel (Fantasy Quest)', type: 'movie' }
        ];

        return evergreenShorts.map((v, i) => {
            const item = convertYouTubeToItem({
                ...v,
                thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`
            } as any, i);
            (item as any).isYouTubeShort = true;
            return item;
        });
    } catch (error: any) {
        console.error('Error fetching YouTube shorts:', error);
        return [];
    }
};

// Search YouTube with strict embeddability enforcement
export const searchYouTube = async (query: string, type: "multi" | "movie" | "tv" = "multi"): Promise<Item[]> => {
    const cacheKey = `search_${query}_${type}_v5`;
    const cached = getCachedItems(cacheKey);
    if (cached) return cached;

    try {
        let ytQuery = query;
        if (type === 'movie') ytQuery += ' full movie';
        else if (type === 'tv') ytQuery += ' full episodes';

        const result = await fetchYouTubeVideos(
            ytQuery, 
            undefined, 
            type === 'movie' ? 'long' : 'any', 
            type === 'movie' ? 'movie' : (type === 'tv' ? 'tv' : 'general'),
            undefined,
            'true' // CRITICAL: Only searchable videos allowed for embedding
        );
        let allVideos = result.videos;

        if (type !== 'multi') {
            allVideos = allVideos.filter(v => v.type === type);
        }

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
        console.error(`Error searching YouTube for ${query}:`, error);
        return [];
    }
};
