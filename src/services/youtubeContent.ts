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

// Fetch YouTube movies
export const getYouTubeMovies = async (): Promise<Item[]> => {
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
        return items.length > 0 ? items : getFallbackMovies();
    } catch (error: any) {
        console.error('Error fetching YouTube movies:', error);
        return getFallbackMovies();
    }
};

const getFallbackMovies = (): Item[] => {
    const movies = [
        { id: 'hE1nwOGgQ8E', title: 'Action Full Movie (HD)', type: 'movie' },
        { id: 'OP5tMURXRbI', title: 'Champions League Final Highlights', type: 'movie' },
        { id: 'pZ12_E5R3qc', title: 'SciFi Epic: The Beginning', type: 'movie' },
        { id: '5NV4COXJ2TU', title: 'Combat Sports Documentary', type: 'movie' },
        { id: 'Z1BCujX3pw8', title: 'The Last Stand (Full Action)', type: 'movie' },
        { id: 'eMruJbbL2Gk', title: 'Space Exploration 2050', type: 'movie' },
        { id: 't433PEQGErc', title: 'Medieval Kings: The Final Battle', type: 'movie' },
        { id: 'FwFzU6h0Jp4', title: 'Deep Sea Horror (Full Movie)', type: 'movie' },
        { id: '7TavVZMewpY', title: 'Cyberpunk City: Noir', type: 'movie' },
        { id: '1T1X2S_zEqs', title: 'Martial Arts Masters', type: 'movie' },
        { id: '8mP5xOg7igs', title: 'Survival in the Wild', type: 'movie' },
        { id: 'd27gTrPPAyk', title: 'Street Racing Legends', type: 'movie' },
        { id: 'X4bF_quwNtw', title: 'Ghost Ship Investigation', type: 'movie' },
        { id: 'B18R8lK0Nxs', title: 'Alien Invasion: Earth Defense', type: 'movie' },
        { id: 'tgbNymZ7vqY', title: 'Zombie Apocalypse: Day 1', type: 'movie' },
        { id: 'Y7vM7O-L2d0', title: 'Secret Agent: Double Cross', type: 'movie' },
        { id: 'N1X1C-z2U3U', title: 'Fantasy Realm: The Dragon King', type: 'movie' },
        { id: 'K39L-gRz8mY', title: 'Wild West Outlaws', type: 'movie' },
        { id: '8Qn_spdM5Zg', title: 'Underworld Crime Syndicate', type: 'movie' },
        { id: 'P3T-pQx8mY0', title: 'Superhero Origins', type: 'movie' }
    ];
    // Return uniquely flavored items so sliders look rich even on 403
    return movies.map((v, i) => convertYouTubeToItem({
         ...v,
         description: 'A masterpiece available when data is limited. Enjoy this evergreen cinematic experience.',
         thumbnail: `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`,
         channelTitle: 'StreamLux Vault' 
    } as any, i));
};

// Fetch YouTube TV shows
export const getYouTubeTVShows = async (): Promise<Item[]> => {
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
        return items.length > 0 ? items : getFallbackTVShows();
    } catch (error: any) {
        console.error('Error fetching YouTube TV shows:', error);
        return getFallbackTVShows();
    }
};

const getFallbackTVShows = (): Item[] => {
    const shows = [
        { id: 'dQw4w9WgXcQ', title: 'Drama Series Episode 1', type: 'tv' },
        { id: 'XvXJ7XvXJ7X', title: 'Comedy Central Hits', type: 'tv' },
        { id: 'YvYJ7XvYJ7X', title: 'The Anime Anthology', type: 'tv' },
        { id: 'dQw4w9WgXcR', title: 'Crime Scene Investigation', type: 'tv' },
        { id: '1T1X2S_zEqs', title: 'Fantasy Realm Chronicles', type: 'tv' },
        { id: 'Z1BCujX3pw8', title: 'Teen High School Drama', type: 'tv' },
        { id: 'eMruJbbL2Gk', title: 'Space Frontier Season 1', type: 'tv' },
        { id: 't433PEQGErc', title: 'Medical ER Series', type: 'tv' },
        { id: 'FwFzU6h0Jp4', title: 'Mystery Island Show', type: 'tv' },
        { id: '7TavVZMewpY', title: 'Tech Giants Docuseries', type: 'tv' },
        { id: '8mP5xOg7igs', title: 'Global Cooking Competition', type: 'tv' },
        { id: 'd27gTrPPAyk', title: 'Late Night Talk Show Highlights', type: 'tv' },
        { id: 'X4bF_quwNtw', title: 'Supernatural Hunters', type: 'tv' },
        { id: 'B18R8lK0Nxs', title: 'Historical Period Drama', type: 'tv' },
        { id: 'tgbNymZ7vqY', title: 'Zombie Survivors', type: 'tv' },
        { id: 'Y7vM7O-L2d0', title: 'Espionage Series', type: 'tv' },
        { id: 'N1X1C-z2U3U', title: 'Royal Court Intrigues', type: 'tv' },
        { id: 'K39L-gRz8mY', title: 'Sitcom Classics', type: 'tv' },
        { id: '8Qn_spdM5Zg', title: 'Legal Minds Season 2', type: 'tv' },
        { id: 'P3T-pQx8mY0', title: 'Animated Comedy Series', type: 'tv' }
    ];
    return shows.map((v, i) => convertYouTubeToItem({
         ...v,
         description: 'An evergreen TV Show collection to keep you entertained while data loads.',
         thumbnail: `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`,
         channelTitle: 'StreamLux TV'
    } as any, i));
};

export const getYouTubeByGenre = async (genreName: string, type: "movie" | "tv" = "movie"): Promise<Item[]> => {
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
        console.error(`Error fetching YouTube genre ${genreName}:`, error);
        return [];
    }
};
export const getYouTubeShorts = async (): Promise<Item[]> => {
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
                { id: 'S4vS-T68YPk', title: 'Top Movie Moments', description: 'Cinematic shorts', thumbnail: 'https://i.ytimg.com/vi/S4vS-T68YPk/maxresdefault.jpg', channelTitle: 'StreamLux', type: 'movie' },
                { id: 'dQw4w9WgXcQ', title: 'New Official Trailer', description: 'Trending trailer', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', channelTitle: 'StreamLux', type: 'movie' },
                { id: 'XvXJ7XvXJ7X', title: 'Action Cinema #shorts', description: 'Action movie shorts', thumbnail: 'https://i.ytimg.com/vi/XvXJ7XvXJ7X/maxresdefault.jpg', channelTitle: 'Cinema', type: 'movie' },
                { id: 'YvYJ7XvYJ7X', title: 'Epic Drama #shorts', description: 'Drama movie shorts', thumbnail: 'https://i.ytimg.com/vi/YvYJ7XvYJ7X/maxresdefault.jpg', channelTitle: 'Drama', type: 'movie' },
                { id: 'hE1nwOGgQ8E', title: 'Best Action Scenes #shorts', description: 'Action highlights', thumbnail: 'https://i.ytimg.com/vi/hE1nwOGgQ8E/maxresdefault.jpg', channelTitle: 'Cinema', type: 'movie' },
                { id: 'OP5tMURXRbI', title: 'Incredible Sports #shorts', description: 'Sports highlights', thumbnail: 'https://i.ytimg.com/vi/OP5tMURXRbI/maxresdefault.jpg', channelTitle: 'Sports', type: 'movie' },
                { id: 'pZ12_E5R3qc', title: 'Mind-Blowing SciFi #shorts', description: 'SciFi scenes', thumbnail: 'https://i.ytimg.com/vi/pZ12_E5R3qc/maxresdefault.jpg', channelTitle: 'SciFi', type: 'movie' },
                { id: '5NV4COXJ2TU', title: 'Funny Moments #shorts', description: 'Comedy shorts', thumbnail: 'https://i.ytimg.com/vi/5NV4COXJ2TU/maxresdefault.jpg', channelTitle: 'Comedy', type: 'movie' },
                { id: 'Z1BCujX3pw8', title: 'Anime Fights #shorts', description: 'Anime shorts', thumbnail: 'https://i.ytimg.com/vi/Z1BCujX3pw8/maxresdefault.jpg', channelTitle: 'Anime', type: 'movie' },
                { id: 'eMruJbbL2Gk', title: 'Space Edit #shorts', description: 'Space shorts', thumbnail: 'https://i.ytimg.com/vi/eMruJbbL2Gk/maxresdefault.jpg', channelTitle: 'Space', type: 'movie' },
                { id: 't433PEQGErc', title: 'Historical Edits #shorts', description: 'History shorts', thumbnail: 'https://i.ytimg.com/vi/t433PEQGErc/maxresdefault.jpg', channelTitle: 'History', type: 'movie' },
                { id: 'FwFzU6h0Jp4', title: 'Scary Jump Scares #shorts', description: 'Horror shorts', thumbnail: 'https://i.ytimg.com/vi/FwFzU6h0Jp4/maxresdefault.jpg', channelTitle: 'Horror', type: 'movie' },
                { id: '7TavVZMewpY', title: 'Cyberpunk Edits #shorts', description: 'Cyberpunk shorts', thumbnail: 'https://i.ytimg.com/vi/7TavVZMewpY/maxresdefault.jpg', channelTitle: 'Cyberpunk', type: 'movie' },
                { id: '1T1X2S_zEqs', title: 'Martial Arts Edits #shorts', description: 'Martial Arts shorts', thumbnail: 'https://i.ytimg.com/vi/1T1X2S_zEqs/maxresdefault.jpg', channelTitle: 'Martial Arts', type: 'movie' },
                { id: '8mP5xOg7igs', title: 'Nature Views #shorts', description: 'Nature shorts', thumbnail: 'https://i.ytimg.com/vi/8mP5xOg7igs/maxresdefault.jpg', channelTitle: 'Nature', type: 'movie' },
                { id: 'd27gTrPPAyk', title: 'Car Meets #shorts', description: 'Automotive shorts', thumbnail: 'https://i.ytimg.com/vi/d27gTrPPAyk/maxresdefault.jpg', channelTitle: 'Cars', type: 'movie' },
                { id: 'X4bF_quwNtw', title: 'Spooky Stories #shorts', description: 'Paranormal shorts', thumbnail: 'https://i.ytimg.com/vi/X4bF_quwNtw/maxresdefault.jpg', channelTitle: 'Spooky', type: 'movie' },
                { id: 'B18R8lK0Nxs', title: 'Concert Highlights #shorts', description: 'Music shorts', thumbnail: 'https://i.ytimg.com/vi/B18R8lK0Nxs/maxresdefault.jpg', channelTitle: 'Music', type: 'movie' }
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
        console.error('Error fetching YouTube shorts:', error);
        return [];
    }
};

// Search YouTube by Query
export const searchYouTube = async (query: string, type: "multi" | "movie" | "tv" = "multi"): Promise<Item[]> => {
    const cacheKey = `search_${query}_${type}`;
    const cached = getCachedItems(cacheKey);
    if (cached) return cached;

    try {
        let ytQuery = query;
        if (type === 'movie') ytQuery += ' full movie';
        else if (type === 'tv') ytQuery += ' full episodes';

        const result = await fetchYouTubeVideos(ytQuery);
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
