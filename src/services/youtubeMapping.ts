import { DetailMovie, DetailSeason, DetailTV, Episode, FilmInfo, getWatchReturnedType, Item, Reviews, Video } from "../shared/types";
import { getRelatedVideos, getYouTubeComments, getYouTubeSeriesEpisodes, getYouTubeVideoDetail, YouTubeVideo, YouTubeVideoExtended } from "./youtube";

// --- Helper Functions ---

const generateMockTMDBId = (youtubeId: string): number => {
    // Generate a consistent pseudo-random number from a string
    let hash = 0;
    for (let i = 0; i < youtubeId.length; i++) {
        const char = youtubeId.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

// --- Mappers ---

export const mapYouTubeToDetailMovie = (video: YouTubeVideoExtended): DetailMovie => {
    return {
        adult: false,
        backdrop_path: video.thumbnail,
        belongs_to_collection: null,
        budget: 0,
        genres: video.tags ? video.tags.slice(0, 3).map((tag, index) => ({ id: index, name: tag })) : [{ id: 1, name: "YouTube" }],
        homepage: `https://youtube.com/watch?v=${video.id}`,
        id: video.id as any, // Using string ID where number is expected, components should handle it
        imdb_id: video.id, // Storing YT ID here too just in case
        original_language: "en",
        original_title: video.title,
        overview: video.description || "No description available.",
        popularity: video.viewCount ? parseInt(video.viewCount) / 10000 : 0,
        poster_path: video.thumbnail,
        production_companies: [{ id: 1, logo_path: "", name: video.channelTitle, origin_country: "US" }],
        production_countries: [{ iso_3166_1: "US", name: "United States" }],
        release_date: video.publishedAt ? new Date(video.publishedAt).toISOString().split('T')[0] : "2024-01-01",
        revenue: 0,
        runtime: video.duration ? Math.floor(video.duration / 60) : 0,
        spoken_languages: [{ iso_639_1: "en", name: "English", english_name: "English" }],
        status: "Released",
        tagline: "Watch directly on StreamLux",
        title: video.title,
        video: true,
        vote_average: 8.5, // Mock high rating for YouTube highlights
        vote_count: video.likeCount ? parseInt(video.likeCount) : 0,
        media_type: "movie"
    };
};

export const mapYouTubeToDetailTV = (video: YouTubeVideoExtended, episodes: YouTubeVideo[]): DetailTV => {
    // Map episodes into the format expected by SeasonSelection
    const detailEpisodes: Episode[] = episodes.map((ep, index) => ({
        air_date: ep.publishedAt || "2024-01-01",
        episode_number: index + 1,
        id: generateMockTMDBId(ep.id),
        name: ep.title,
        overview: ep.description || "YouTube Episode",
        production_code: ep.id, // CRITICAL: WE STORE THE YOUTUBE ID IN PRODUCTION_CODE TO RETRIEVE IT LATER
        season_number: 1,
        still_path: ep.thumbnail,
        vote_average: 8.5,
        vote_count: 0,
        crew: [],
        guest_stars: []
    }));

    return {
        backdrop_path: video.thumbnail,
        created_by: [{ id: 1, credit_id: "yt_1", name: video.channelTitle, gender: 0, profile_path: "" }],
        episode_run_time: [video.duration ? Math.floor(video.duration / 60) : 15],
        first_air_date: video.publishedAt ? new Date(video.publishedAt).toISOString().split('T')[0] : "2024-01-01",
        genres: video.tags ? video.tags.slice(0, 3).map((tag, index) => ({ id: index, name: tag })) : [{ id: 1, name: "YouTube Series" }],
        homepage: `https://youtube.com/watch?v=${video.id}`,
        id: video.id as any,
        in_production: false,
        languages: ["en"],
        last_air_date: new Date().toISOString().split('T')[0],
        last_episode_to_air: detailEpisodes[0] || {} as any,
        name: video.title,
        next_episode_to_air: null,
        networks: [{ name: "YouTube", id: 1, logo_path: "", origin_country: "US" }],
        number_of_episodes: episodes.length,
        number_of_seasons: 1,
        origin_country: ["US"],
        original_language: "en",
        original_name: video.title,
        overview: video.description || "No description available.",
        popularity: video.viewCount ? parseInt(video.viewCount) / 10000 : 0,
        poster_path: video.thumbnail,
        production_companies: [{ id: 1, logo_path: "", name: video.channelTitle, origin_country: "US" }],
        production_countries: [{ iso_3166_1: "US", name: "United States" }],
        seasons: [{
            air_date: video.publishedAt ? new Date(video.publishedAt).toISOString().split('T')[0] : "2024-01-01",
            episode_count: episodes.length,
            id: generateMockTMDBId(video.id + "_season"),
            name: "Season 1",
            overview: "Full Episodes",
            poster_path: video.thumbnail,
            season_number: 1
        }],
        spoken_languages: [{ iso_639_1: "en", name: "English", english_name: "English" }],
        status: "Returning Series",
        tagline: "Watch directly on StreamLux",
        type: "Scripted",
        vote_average: 8.5,
        vote_count: video.likeCount ? parseInt(video.likeCount) : 0,
        media_type: "tv"
    };
};

export const mapYouTubeToItems = (videos: YouTubeVideo[]): Item[] => {
    return videos.map(v => ({
        id: v.id as any,
        youtubeId: v.id,
        isYouTube: true,
        title: v.title,
        name: v.title,
        poster_path: v.thumbnail,
        backdrop_path: v.thumbnail,
        vote_average: 8.5,
        media_type: v.type === "movie" ? "movie" : "tv",
        overview: v.description,
        genre_ids: [],
        original_language: "en",
        popularity: 100,
        vote_count: 100
    }));
};

// --- Fetchers ---

export const getYouTubeMovieFullDetail = async (youtubeId: string): Promise<FilmInfo> => {
    const video = await getYouTubeVideoDetail(youtubeId);
    if (!video) throw new Error("YouTube video not found");

    const similar = await getRelatedVideos(youtubeId);
    const reviews = await getYouTubeComments(youtubeId);

    return {
        detail: mapYouTubeToDetailMovie(video),
        similar: mapYouTubeToItems(similar),
        reviews: reviews as any[],
        videos: [{
            iso_639_1: "en", iso_3166_1: "US", name: "Native YouTube Trailer", key: video.id,
            site: "YouTube", size: 1080, type: "Trailer", official: true, published_at: new Date().toISOString(), id: video.id
        }] // So trailer plays in background!
    };
};

export const getYouTubeTVFullDetail = async (youtubeId: string): Promise<FilmInfo> => {
    const video = await getYouTubeVideoDetail(youtubeId);
    if (!video) throw new Error("YouTube video not found");

    const episodes = await getYouTubeSeriesEpisodes(video.title, video.channelId);
    const similar = await getRelatedVideos(youtubeId);
    const reviews = await getYouTubeComments(youtubeId);

    return {
        detail: mapYouTubeToDetailTV(video, episodes),
        similar: mapYouTubeToItems(similar),
        reviews: reviews as any[],
        videos: [{
            iso_639_1: "en", iso_3166_1: "US", name: "Native YouTube Trailer", key: video.id,
            site: "YouTube", size: 1080, type: "Trailer", official: true, published_at: new Date().toISOString(), id: video.id
        }]
    };
};

export const getYouTubeMovieWatch = async (youtubeId: string): Promise<getWatchReturnedType> => {
    const video = await getYouTubeVideoDetail(youtubeId);
    if (!video) throw new Error("YouTube video not found");

    const similar = await getRelatedVideos(youtubeId);

    return {
        detail: mapYouTubeToDetailMovie(video),
        recommendations: mapYouTubeToItems(similar),
        detailSeasons: []
    };
};

export const getYouTubeTVWatch = async (youtubeId: string, seasonId: number): Promise<getWatchReturnedType> => {
    const video = await getYouTubeVideoDetail(youtubeId);
    if (!video) throw new Error("YouTube video not found");

    const episodes = await getYouTubeSeriesEpisodes(video.title, video.channelId);
    const similar = await getRelatedVideos(youtubeId);

    const detailTV = mapYouTubeToDetailTV(video, episodes);
    
    // Create DetailSeason
    const detailSeason: DetailSeason = {
        _id: youtubeId + "_s1",
        air_date: detailTV.first_air_date,
        episodes: episodes.map((ep, index) => ({
            air_date: ep.publishedAt || "2024-01-01",
            episode_number: index + 1,
            id: generateMockTMDBId(ep.id), // Mock ID
            name: ep.title,
            overview: ep.description || "Episode",
            production_code: ep.id, // CRITICAL: This stores the real YouTube ID for playback
            season_number: 1,
            still_path: ep.thumbnail,
            vote_average: 8.5,
            vote_count: 0,
            crew: [],
            guest_stars: []
        })),
        name: "Season 1",
        overview: "Complete Season",
        id: generateMockTMDBId(youtubeId + "_s1"),
        poster_path: video.thumbnail,
        season_number: 1
    };

    return {
        detail: detailTV,
        recommendations: mapYouTubeToItems(similar),
        detailSeasons: [detailSeason]
    };
};
