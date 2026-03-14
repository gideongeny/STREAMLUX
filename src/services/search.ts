import axios from "../shared/axios";
import { getRecommendGenres2Type, Item, ItemsPage } from "../shared/types";
import { searchFZMovies } from "./fzmovies";
import { searchYouTube } from "./youtubeContent";
import { safeStorage } from "../utils/safeStorage";

export const getSearchSuggestions = async (query: string): Promise<Item[]> => {
  const cacheKey = `search-suggestions-${query.toLowerCase()}`;
  const cached = safeStorage.get(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const response = await axios.get("/search/multi", {
      params: {
        query,
      },
    });

    const results = response.data.results
      .filter((item: any) => item.media_type !== "person")
      .slice(0, 5);
    
    safeStorage.set(cacheKey, JSON.stringify(results));
    return results;
  } catch (error) {
    console.error("Search suggestions error:", error);
    return [];
  }
};

export const getSearchKeyword = async (query: string): Promise<string[]> => {
  const suggestions = await getSearchSuggestions(query);
  return suggestions.map(s => s.title || s.name || "");
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
  const cacheKey = `search-results-${typeSearch}-${query.toLowerCase()}-${page}`;
  const cached = safeStorage.get(cacheKey);
  if (cached) return JSON.parse(cached);

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
    // Search YouTube as well
    searchYouTube(
      query,
      typeSearch as "multi" | "movie" | "tv"
    )
  ]);

  const tmdbResults = tmdbData.data.results
    .map((item: Item) => ({
      ...item,
      ...(typeSearch !== "multi" && { media_type: typeSearch }),
    }));

  // Merge with FZMovies and YouTube results, deduplicate by ID
  const combined = [...tmdbResults, ...ytResults, ...fzResults];
  const seen = new Set<string | number>();
  const results = combined.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  const finalData = {
    ...tmdbData.data,
    results,
    total_results: results.length,
  };

  safeStorage.set(cacheKey, JSON.stringify(finalData));
  return finalData;
};
