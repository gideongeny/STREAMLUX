import axios from "../shared/axios";
import { getRecommendGenres2Type, Item, ItemsPage } from "../shared/types";
import { searchFZMovies } from "./fzmovies";
import { searchYouTube } from "./youtubeContent";
import { safeStorage } from "../utils/safeStorage";
import Fuse from "fuse.js";

const BRANDS = [
  { id: "disney", name: "Disney", media_type: "brand" },
  { id: "pixar", name: "Pixar", media_type: "brand" },
  { id: "marvel", name: "Marvel", media_type: "brand" },
  { id: "starwars", name: "Star Wars", media_type: "brand" },
  { id: "natgeo", name: "National Geographic", media_type: "brand" },
  { id: "dc", name: "DC", media_type: "brand" },
  { id: "007", name: "James Bond", media_type: "brand" },
  { id: "nickelodeon", name: "Nickelodeon", media_type: "brand" },
  { id: "cartoonnetwork", name: "Cartoon Network", media_type: "brand" },
];

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

    const apiResults = response.data.results
      .filter((item: any) => item.media_type !== "person");

    // Enhance with Brand Shortcuts using Fuse.js fuzzy matching
    const fuse = new Fuse([...BRANDS, ...apiResults], {
      keys: ["name", "title", "original_title", "original_name"],
      threshold: 0.4,
    });

    const results = fuse.search(query).map(r => r.item).slice(0, 6);
    
    safeStorage.set(cacheKey, JSON.stringify(results));
    return results as Item[];
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

  const [tmdbData, fzResults, ytResults, nicheResponse] = await Promise.all([
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
    ),
    // Waterfall Fallback: Search Niche Sources (IA / MAL)
    axios.get(`/api/proxy/search/niche`, { params: { q: query } }).catch(() => ({ data: [] }))
  ]);

  const nicheResults: Item[] = nicheResponse.data || [];

  const tmdbResults = tmdbData.data.results
    .map((item: Item) => ({
      ...item,
      ...(typeSearch !== "multi" && { media_type: typeSearch }),
    }));

  // Merge with FZMovies, YouTube, and Niche results, deduplicate by ID
  const combined: Item[] = [...tmdbResults, ...ytResults, ...fzResults, ...nicheResults];
  const seen = new Set<string | number>();
  const filteredResults = combined.filter((item: Item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  const finalData = {
    ...tmdbData.data,
    results: filteredResults,
    total_results: filteredResults.length,
  };


  safeStorage.set(cacheKey, JSON.stringify(finalData));
  return finalData;
};
