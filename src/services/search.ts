import axios from "../shared/axios";
import { getRecommendGenres2Type, Item, ItemsPage } from "../shared/types";
import { searchFZMovies } from "./fzmovies";
import { fetchYouTubeVideos, YouTubeVideo } from "./youtube";

export const getSearchKeyword = async (query: string): Promise<string[]> => {
  return (
    await axios.get("/search/keyword", {
      params: {
        query,
      },
    })
  ).data.results
    .map((item: any) => item.name)
    .filter((_: any, index: number) => index < 5);
};


export const getRecommendGenres2 =
  async (): Promise<getRecommendGenres2Type> => {
    const movieGenres = (await axios.get("/genre/movie/list")).data.genres;
    const tvGenres = (await axios.get("/genre/tv/list")).data.genres;

    return {
      movieGenres,
      tvGenres,
    };
  };

export const getSearchResult: (
  typeSearch: string,
  query: string,
  page: number
) => Promise<ItemsPage> = async (typeSearch, query, page) => {
  // If explicitly searching youtube
  if (typeSearch === "youtube") {
    const ytResults = await fetchYouTubeVideos(query);
    const results: Item[] = ytResults.videos.map((video: YouTubeVideo) => ({
      id: video.id as any,
      title: video.title,
      name: video.title,
      overview: video.description,
      poster_path: video.thumbnail,
      backdrop_path: video.thumbnail,
      media_type: video.type === "movie" ? "movie" : "tv",
      vote_average: 0,
      vote_count: 0,
      popularity: 0,
      genre_ids: [],
      original_language: "en",
      youtubeId: video.id,
    } as any));

    return {
      page: 1,
      results,
      total_results: results.length,
      total_pages: 1,
    };
  }

  const [tmdbData, fzResults, ytResults] = await Promise.all([
    axios.get(`/search/${typeSearch}`, {
      params: {
        query,
        page,
      },
    }),
    // Search FZMovies as well
    searchFZMovies(
      query,
      typeSearch === "multi" ? "all" : typeSearch as "movie" | "tv"
    ),
    // Search YouTube as well (only for first page of multi/movie/tv)
    page === 1 ? fetchYouTubeVideos(query) : Promise.resolve({ videos: [] }),
  ]);

  // FALLBACK: If YouTube results are sparse or missing, fetch an extra page of TMDB content to "cover" the gap
  let fallbackTMDBResults: Item[] = [];
  if (page === 1 && ytResults.videos.length < 5) {
    try {
      const fallbackResponse = await axios.get(`/search/${typeSearch}`, {
        params: {
          query,
          page: 2, // Fetch second page as fallback
        },
      });
      fallbackTMDBResults = fallbackResponse.data.results.map((item: Item) => ({
        ...item,
        ...(typeSearch !== "multi" && { media_type: typeSearch }),
      }));
    } catch (e) {
      console.error("TMDB Fallback fetch failed", e);
    }
  }

  const tmdbResults = tmdbData.data.results
    .map((item: Item) => ({
      ...item,
      ...(typeSearch !== "multi" && { media_type: typeSearch }),
    }))
    .filter((item: Item) => (item.media_type === "movie" || item.media_type === "tv") && item.poster_path);

  // Map YouTube results to Item format
  const ytMappedResults: Item[] = ytResults.videos.map((video: YouTubeVideo) => ({
    id: video.id as any, // Cast string ID to any to bypass number restriction for now
    title: video.title,
    name: video.title, // for TV/All
    overview: video.description,
    poster_path: video.thumbnail,
    backdrop_path: video.thumbnail,
    media_type: video.type === "movie" ? "movie" : "tv",
    vote_average: 0,
    vote_count: 0,
    popularity: 0,
    genre_ids: [],
    original_language: "en",
    youtubeId: video.id, // Keep the original string ID
  } as any));

  // Merge with FZMovies, YouTube results, and fallback TMDB results
  const combined = [...tmdbResults, ...fzResults, ...ytMappedResults, ...fallbackTMDBResults];
  const seen = new Set<string | number>();
  const results = combined.filter((item) => {
    const itemKey = item.youtubeId || item.id;
    if (seen.has(itemKey)) return false;
    seen.add(itemKey);
    return item.poster_path || item.profile_path || item.youtubeId;
  });

  return {
    ...tmdbData.data,
    results,
    total_results: results.length, // Update total to reflect merged results
  };
};
