// YouTube content integration for home sliders
import { fetchYouTubeVideos, getYouTubeVideoDetail, YouTubeVideo } from "./youtube";
import { Item } from "../shared/types";

// Convert YouTube video to Item format for sliders
export const convertYouTubeToItem = (video: YouTubeVideo, index: number): Item => {
    return {
        id: parseInt(video.id.replace(/\D/g, '').substring(0, 8)) || Date.now() + index,
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
    } as Item;
};

// Fetch YouTube movies
export const getYouTubeMovies = async (): Promise<Item[]> => {
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
        return allVideos
            .filter(v => {
                if (seen.has(v.id)) return false;
                seen.add(v.id);
                return true;
            })
            .slice(0, 20)
            .map((v, i) => convertYouTubeToItem(v, i));
    } catch (error) {
        console.error('Error fetching YouTube movies:', error);
        return [];
    }
};

// Fetch YouTube TV shows
export const getYouTubeTVShows = async (): Promise<Item[]> => {
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
        return allVideos
            .filter(v => {
                if (seen.has(v.id)) return false;
                seen.add(v.id);
                return true;
            })
            .slice(0, 20)
            .map((v, i) => convertYouTubeToItem(v, i));
    } catch (error) {
        console.error('Error fetching YouTube TV shows:', error);
        return [];
    }
};

// Fetch YouTube content by genre
export const getYouTubeByGenre = async (genre: string, mediaType: 'movie' | 'tv' = 'movie'): Promise<Item[]> => {
    try {
        const query = mediaType === 'movie'
            ? `${genre} movies full`
            : `${genre} tv series`;

        const result = await fetchYouTubeVideos(query);
        const filtered = result.videos.filter(v => v.type === mediaType);

        return filtered
            .slice(0, 20)
            .map((v, i) => convertYouTubeToItem(v, i));
    } catch (error) {
        console.error(`Error fetching YouTube ${genre}:`, error);
        return [];
    }
};
// Fetch YouTube Must-Watch Shorts
export const getYouTubeShorts = async (): Promise<Item[]> => {
    try {
        const queries = [
            'movie trailers shorts',
            'amazing movie clips shorts',
            'must watch movie shorts 2024'
        ];

        const results = await Promise.allSettled(
            queries.map(q => fetchYouTubeVideos(q))
        );

        const allVideos: YouTubeVideo[] = [];
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                allVideos.push(...result.value.videos);
            }
        });

        const seen = new Set<string>();
        return allVideos
            .filter(v => {
                if (seen.has(v.id)) return false;
                seen.add(v.id);
                return true;
            })
            .slice(0, 15)
            .map((v, i) => convertYouTubeToItem(v, i));
    } catch (error) {
        console.error('Error fetching YouTube shorts:', error);
        return [];
    }
};
