import axios from "../shared/axios";
import { getRecommendGenres2Type, Item, ItemsPage } from "../shared/types";
import { searchFZMovies } from "./fzmovies";

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
  const [tmdbData, fzResults] = await Promise.all([
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
  ]);

  const tmdbResults = tmdbData.data.results
    .map((item: Item) => ({
      ...item,
      ...(typeSearch !== "multi" && { media_type: typeSearch }),
    }))
    .filter((item: Item) => item.poster_path || item.profile_path);

  // Merge with FZMovies results
  const combined = [...tmdbResults, ...fzResults];
  const seen = new Set<number>();
  const results = combined.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return item.poster_path || item.profile_path;
  });

  return {
    ...tmdbData.data,
    results,
    total_results: results.length, // Update total to reflect merged results
  };
};
