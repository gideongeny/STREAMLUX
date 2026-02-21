import axios from "../shared/axios";
import { ConfigType, Item, ItemsPage } from "../shared/types";
import { getFZContentByGenre, getFZContentByCountry } from "./fzmovies";
import {
  getAfricanCinema,
  getAsianDrama,
  getNollywoodMovies,
  getBollywoodContent,
  getEnhancedKenyanContent,
  getLatinAmericanContent,
  getMiddleEasternContent,
  getKDrama
} from "./home";

// Helper to map UI region names to specialized regional functions
const getRegionalContent = async (region: string, mediaType: "movie" | "tv"): Promise<Item[]> => {
  const r = region.toLowerCase();

  if (r === "africa") return await getAfricanCinema(mediaType);
  if (r === "asia") return await getAsianDrama(mediaType);
  if (r === "nollywood") return await getNollywoodMovies();
  if (r === "kenya") return await getEnhancedKenyanContent();
  if (r === "bollywood" || r === "india") return await getBollywoodContent();
  if (r === "korea") return await getKDrama(); // KDrama is usually TV, but home.ts implementation is specific
  if (r === "latin") return await getLatinAmericanContent();
  if (r === "middleeast") return await getMiddleEasternContent();

  return [];
};

export const getExploreMovie: (
  page: number,
  config?: ConfigType
) => Promise<ItemsPage> = async (page, config = {}) => {
  const genreId = config.with_genres ? Number(config.with_genres) : undefined;
  const rawRegion = (config as any).region || config.with_origin_country;

  // PRIMARY SOURCE: Specialized regional functions from home.ts
  const regionalItems = rawRegion ? await getRegionalContent(rawRegion, "movie") : [];

  const fetchPromises = [
    axios.get("/discover/movie", {
      params: { ...config, page, ...(genreId && { with_genres: genreId }) },
      timeout: 5000,
    }).catch(() => ({ data: { results: [] } })),
    axios.get("/movie/popular", { params: { page }, timeout: 3000 }).catch(() => ({ data: { results: [] } })),
    axios.get("/trending/movie/day", { params: { page }, timeout: 3000 }).catch(() => ({ data: { results: [] } })),
    ...(rawRegion ? [
      getFZContentByGenre(genreId || 0, "movie", page).catch(() => []),
      // Multi-page TMDB discovery
      Promise.all([1, 2, 3].map(p =>
        axios.get("/discover/movie", { params: { ...config, page: p } })
          .then(res => res.data.results || []).catch(() => [])
      )).then(results => results.flat()).catch(() => []),
    ] : []),
  ];

  const tmdbResults = await Promise.all(fetchPromises);
  const tmdbData = tmdbResults[0];
  const popularData = tmdbResults[1];
  const trendingData = tmdbResults[2];
  const fzMovies = tmdbResults[3] || [];
  const multiPageDiscover = tmdbResults[4] || [];

  const allResults = [
    ...regionalItems,
    ...(tmdbData as any).data?.results ?? [],
    ...(popularData as any).data?.results ?? [],
    ...(trendingData as any).data?.results ?? [],
    ...(fzMovies as Item[]),
    ...(multiPageDiscover as Item[]),
  ];

  const seen = new Set<number>();
  const adjustedItems = allResults
    .filter((item: Item) => {
      if (!item || !item.poster_path || seen.has(item.id)) return false;
      seen.add(item.id);
      if (genreId && item.genre_ids && !item.genre_ids.includes(genreId)) return false;
      return true;
    })
    .map((item: Item) => ({ ...item, media_type: "movie" as const }));

  if (adjustedItems.length === 0) {
    const fallback = await axios.get("/movie/popular", { params: { page: 1 } }).catch(() => ({ data: { results: [] } }));
    return { page: 1, total_pages: 1, results: fallback.data.results.map((i: any) => ({ ...i, media_type: "movie" })), total_results: fallback.data.results.length };
  }

  return {
    page: (tmdbData as any).data?.page ?? page,
    total_pages: (tmdbData as any).data?.total_pages ?? 1,
    results: adjustedItems,
    total_results: adjustedItems.length,
  };
};

export const getExploreTV: (
  page: number,
  config?: ConfigType
) => Promise<ItemsPage> = async (page, config = {}) => {
  const genreId = config.with_genres ? Number(config.with_genres) : undefined;
  const rawRegion = (config as any).region || config.with_origin_country;

  // PRIMARY SOURCE: Specialized regional functions from home.ts
  const regionalItems = rawRegion ? await getRegionalContent(rawRegion, "tv") : [];

  const fetchPromises = [
    axios.get("/discover/tv", {
      params: { ...config, page, ...(genreId && { with_genres: genreId }) },
      timeout: 5000,
    }).catch(() => ({ data: { results: [] } })),
    axios.get("/tv/popular", { params: { page }, timeout: 3000 }).catch(() => ({ data: { results: [] } })),
    ...(rawRegion ? [
      getFZContentByGenre(genreId || 0, "tv", page).catch(() => []),
      Promise.all([1, 2, 3].map(p =>
        axios.get("/discover/tv", { params: { ...config, page: p } })
          .then(res => res.data.results || []).catch(() => [])
      )).then(results => results.flat()).catch(() => []),
    ] : []),
  ];

  const tmdbResults = await Promise.all(fetchPromises);
  const tmdbData = tmdbResults[0];
  const popularData = tmdbResults[1];
  const fzTV = tmdbResults[2] || [];
  const multiPageDiscover = tmdbResults[3] || [];

  const allResults = [
    ...regionalItems,
    ...(tmdbData as any).data?.results ?? [],
    ...(popularData as any).data?.results ?? [],
    ...(fzTV as Item[]),
    ...(multiPageDiscover as Item[]),
  ];

  const seen = new Set<number>();
  const adjustedItems = allResults
    .filter((item: Item) => {
      if (!item || !item.poster_path || seen.has(item.id)) return false;
      seen.add(item.id);
      if (genreId && item.genre_ids && !item.genre_ids.includes(genreId)) return false;
      return true;
    })
    .map((item: Item) => ({ ...item, media_type: "tv" as const }));

  if (adjustedItems.length === 0) {
    const fallback = await axios.get("/tv/popular", { params: { page: 1 } }).catch(() => ({ data: { results: [] } }));
    return { page: 1, total_pages: 1, results: fallback.data.results.map((i: any) => ({ ...i, media_type: "tv" })), total_results: fallback.data.results.length };
  }

  return {
    page: (tmdbData as any).data?.page ?? page,
    total_pages: (tmdbData as any).data?.total_pages ?? 1,
    results: adjustedItems,
    total_results: adjustedItems.length,
  };
};
