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

    const apiResults = (response.data.results || [])
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
  return (suggestions || []).map(s => s.title || s.name || "");
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

import { interleaveArrays } from "../utils/array";

export const getSearchResult: (
  typeSearch: string,
  query: string,
  page: number
) => Promise<ItemsPage> = async (typeSearch, query, page) => {
  const cacheKey = `search-results-${typeSearch}-${query.toLowerCase()}-${page}`;
  const cached = safeStorage.get(cacheKey);
  if (cached) return JSON.parse(cached);

  let tmdbData: any = { data: { results: [], page: 1, total_pages: 1, total_results: 0 } };
  let musicResults: Item[] = [];
  let sportsResults: Item[] = [];
  let fzResults: Item[] = [];
  let ytResults: Item[] = [];
  let nicheResults: Item[] = [];

  const promises: Promise<any>[] = [];

  // 1. TMDB Search (Movies, TV, Multi)
  if (["multi", "movie", "tv", "person"].includes(typeSearch)) {
    promises.push(
      axios.get(`/search/${typeSearch}`, {
        params: { query, page },
      }).then(res => tmdbData = res)
    );
  }

  // 2. Music Search (Saavn)
  if (typeSearch === "music" || typeSearch === "multi") {
    promises.push(
      axios.get("/music/search", { params: { q: query } })
        .then(res => {
          const songs = res.data?.data?.songs?.results || res.data?.data?.results || [];
          musicResults = songs.map((s: any) => ({
            id: s.id,
            title: s.name || s.title,
            poster_path: s.image?.[s.image.length - 1]?.link || s.image?.[2]?.link || s.image,
            media_type: "music",
            vote_average: 0,
            genre_ids: [],
            release_date: s.year,
            overview: s.primaryArtists || s.artist || ""
          }));
        })
        .catch(() => [])
    );
  }

  // 3. Sports & Waterfall Search
  promises.push(
    searchFZMovies(query, typeSearch === "multi" ? "all" : typeSearch as "movie" | "tv").then(res => fzResults = res),
    searchYouTube(query, typeSearch as "multi" | "movie" | "tv").then(res => ytResults = res),
    axios.get(`/api/proxy/search/niche`, { params: { q: query } })
      .then(res => nicheResults = res.data || [])
      .catch(() => [])
  );

  await Promise.allSettled(promises);

  const tmdbResults = (tmdbData.data.results || [])
    .map((item: Item) => ({
      ...item,
      ...(typeSearch !== "multi" && { media_type: typeSearch }),
    }));

  // Interleave TMDB and YouTube results
  const blendedPrimary = interleaveArrays(
    Array.isArray(tmdbResults) ? tmdbResults : [],
    Array.isArray(ytResults) ? ytResults : [],
    3
  );

  // Merge with FZMovies, Music, Sports, and Niche results
  const combined: Item[] = [
    ...blendedPrimary,
    ...(Array.isArray(musicResults) ? musicResults : []),
    ...(Array.isArray(sportsResults) ? sportsResults : []),
    ...(Array.isArray(fzResults) ? fzResults : []),
    ...(Array.isArray(nicheResults) ? nicheResults : [])
  ];
  
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
