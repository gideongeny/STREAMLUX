import axios from "../shared/axios";

import { ConfigType, Item, ItemsPage } from "../shared/types";
import { getFZContentByGenre, getFZContentByCountry } from "./fzmovies";
import { getAllAPIContentByGenre } from "./movieAPIs";
import { getAllSourceContent } from "./contentSources";
import { searchIMDBContentEnhanced } from "./imdb";

// Helper function to generate search queries for regions
const getSearchQueriesForRegion = (region: string, type: "movie" | "tv"): string[] => {
  const queries: string[] = [];

  if (region.includes("NG") || region.includes("nollywood")) {
    queries.push("nollywood", "nigerian", "african");
  }
  if (region.includes("KE") || region.includes("kenya")) {
    queries.push("kenyan", "african");
  }
  if (region.includes("ZA") || region.includes("south africa")) {
    queries.push("south african", "african");
  }
  if (region.includes("IN") || region.includes("bollywood")) {
    queries.push("bollywood", "indian", "hindi");
  }
  if (region.includes("KR") || region.includes("korea")) {
    queries.push("korean", "k-drama", "korean drama");
  }
  if (region.includes("JP") || region.includes("japan")) {
    queries.push("japanese", "anime", "j-drama");
  }
  if (region.includes("CN") || region.includes("china")) {
    queries.push("chinese", "c-drama", "mandarin");
  }
  if (region.includes("TH") || region.includes("thailand")) {
    queries.push("thai", "thai drama", "thailand");
  }
  if (region.includes("PH") || region.includes("philippines")) {
    queries.push("filipino", "philippines", "pinoy");
  }
  if (region.includes("MX") || region.includes("mexico")) {
    queries.push("mexican", "latino", "spanish");
  }
  if (region.includes("BR") || region.includes("brazil")) {
    queries.push("brazilian", "portuguese", "brasil");
  }

  return queries.length > 0 ? queries : ["popular", "trending"];
};

export const getExploreMovie: (
  page: number,
  config?: ConfigType
) => Promise<ItemsPage> = async (page, config = {}) => {
  // If genre is specified, ensure proper filtering
  const genreId = config.with_genres ? Number(config.with_genres) : undefined;
  // Get origin_country filter if specified
  const originCountry = config.with_origin_country || (config as any).region;

  // Optimized: Fetch from fewer sources for faster loading
  // Only use essential sources, skip heavy ones for initial load
  const fetchPromises = [
    // Primary: TMDB discover (most reliable)
    axios.get("/discover/movie", {
      params: {
        ...config,
        page,
        // Ensure genre filtering is applied
        ...(genreId && { with_genres: genreId }),
        // Ensure origin_country filtering is applied
        ...(originCountry && { with_origin_country: originCountry }),
      },
      timeout: 4000, // Reduced timeout for faster loading
    }).catch(() => ({ data: { results: [] } })),

    // Fallback: TMDB popular (fast fallback)
    axios.get("/movie/popular", {
      params: { page },
      timeout: 3000, // Reduced timeout
    }).catch(() => ({ data: { results: [] } })),

    // Only load additional sources if region is specified (for World Cinema) AND not skipped
    ...(originCountry && !config.skipExternalSources ? [
      // FZMovies content (only for regional content)
      getFZContentByGenre(genreId || 0, "movie", page).catch(() => []),
      // Regional content sources (limited to 2 countries max)
      Promise.all(
        (typeof originCountry === 'string' ? originCountry.split('|') : [originCountry])
          .slice(0, 2) // Reduced from 3 to 2
          .map(country => getFZContentByCountry(country, "movie", page).catch(() => []))
      ).then(results => results.flat()).catch(() => []),
    ] : []),
  ];

  const results = await Promise.all(fetchPromises);
  const tmdbData = results[0] as { data?: ItemsPage };
  const popularData = results[1] as { data?: ItemsPage };
  const fzMovies = (originCountry && !config.skipExternalSources ? results[2] : []) as Item[];
  const regionalContent = (originCountry && !config.skipExternalSources ? results[3] : []) as Item[];

  // Combine all TMDB results (discover, popular)

  const allTmdbResults = [
    ...(tmdbData.data?.results ?? []),
    ...(popularData.data?.results ?? []),
  ];

  const tmdbItems = allTmdbResults
    .filter((item: Item) => {
      // If genre filter is applied, ensure item has that genre
      if (genreId && item.genre_ids) {
        if (!item.genre_ids.includes(genreId)) return false;
      }
      // If origin_country filter is applied, ensure item matches
      if (originCountry) {
        const countries = item.origin_country || [];
        const filterCountries = typeof originCountry === 'string' ? originCountry.split('|') : [originCountry];
        if (!countries.some((c: string) => filterCountries.includes(c))) {
          return false;
        }
      }
      return item.poster_path;
    })
    .map((item: Item) => ({
      ...item,
      media_type: "movie" as const,
    }));

  // Merge with FZMovies and regional content
  const combined = [...tmdbItems, ...(fzMovies || []), ...(regionalContent || [])];
  const seen = new Set<number>();
  const adjustedItems = combined.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    // Final genre check
    if (genreId && item.genre_ids && !item.genre_ids.includes(genreId)) {
      return false;
    }
    // Final origin_country check
    if (originCountry) {
      const countries = item.origin_country || [];
      const filterCountries = typeof originCountry === 'string' ? originCountry.split('|') : [originCountry];
      if (!countries.some((c: string) => filterCountries.includes(c))) {
        return false;
      }
    }
    return item.poster_path;
  });

  // Fallback: If no results after filtering, show popular content instead of empty page
  if (adjustedItems.length === 0) {
    console.log("No results for specific filters, falling back to popular content");
    try {
      // Get popular content as fallback
      const fallbackResponse = await axios.get("/movie/popular", {
        params: { page: 1 },
        timeout: 3000,
      }).catch(() => ({ data: { results: [] } }));

      const fallbackItems = (fallbackResponse.data?.results || []).slice(0, 20).map((item: any) => ({
        ...item,
        media_type: "movie" as const,
      })).filter((item: Item) => item.poster_path);

      if (fallbackItems.length > 0) {
        return {
          page: 1,
          total_pages: 1,
          results: fallbackItems,
          total_results: fallbackItems.length,
        };
      }
    } catch (err) {
      console.warn("Fallback to popular content failed:", err);
    }
  }

  return {
    page: tmdbData.data?.page ?? page,
    total_pages: tmdbData.data?.total_pages ?? 1,
    results: adjustedItems,
    total_results: adjustedItems.length, // Update total to reflect merged results
  };
};

export const getExploreTV: (
  page: number,
  config?: ConfigType
) => Promise<ItemsPage> = async (page, config = {}) => {
  // If genre is specified, ensure proper filtering
  const genreId = config.with_genres ? Number(config.with_genres) : undefined;
  // Get origin_country filter if specified
  const originCountry = config.with_origin_country || (config as any).region;

  // Optimized: Fetch from fewer sources for faster loading
  // Only use essential sources, skip heavy ones for initial load
  const fetchPromises = [
    // Primary: TMDB discover (most reliable)
    axios.get("/discover/tv", {
      params: {
        ...config,
        page,
        // Ensure genre filtering is applied
        ...(genreId && { with_genres: genreId }),
        // Ensure origin_country filtering is applied
        ...(originCountry && { with_origin_country: originCountry }),
      },
      timeout: 4000, // Reduced timeout for faster loading
    }).catch(() => ({ data: { results: [] } })),

    // Fallback: TMDB popular (fast fallback)
    axios.get("/tv/popular", {
      params: { page },
      timeout: 3000, // Reduced timeout
    }).catch(() => ({ data: { results: [] } })),

    // Only load additional sources if region is specified (for World Cinema) AND not skipped
    ...(originCountry && !config.skipExternalSources ? [
      // FZMovies content (only for regional content)
      getFZContentByGenre(genreId || 0, "tv", page).catch(() => []),
      // Regional content sources (limited to 2 countries max)
      Promise.all(
        (typeof originCountry === 'string' ? originCountry.split('|') : [originCountry])
          .slice(0, 2) // Reduced from 3 to 2
          .map(country => getFZContentByCountry(country, "tv", page).catch(() => []))
      ).then(results => results.flat()).catch(() => []),
    ] : []),
  ];

  const results = await Promise.all(fetchPromises);
  const tmdbData = results[0] as { data?: ItemsPage };
  const popularData = results[1] as { data?: ItemsPage };
  const fzTV = (originCountry && !config.skipExternalSources ? results[2] : []) as Item[];
  const regionalContent = (originCountry && !config.skipExternalSources ? results[3] : []) as Item[];

  // Combine all TMDB results (discover, popular, trending)
  // Type assertion to handle the union type from Promise.all

  const allTmdbResults = [
    ...(tmdbData.data?.results ?? []),
    ...(popularData.data?.results ?? []),
  ];

  const tmdbItems = allTmdbResults
    .filter((item: Item) => {
      // Must have poster
      if (!item.poster_path) return false;

      // If genre filter is applied, ensure item has that genre
      if (genreId && item.genre_ids) {
        if (!item.genre_ids.includes(genreId)) return false;
      }
      // If origin_country filter is applied, ensure item matches - STRICT FILTERING
      if (originCountry) {
        const countries = item.origin_country || [];
        const filterCountries = typeof originCountry === 'string' ? originCountry.split('|') : [originCountry];
        // Only include if at least one country matches
        const hasMatchingCountry = countries.some((c: string) => filterCountries.includes(c));
        if (!hasMatchingCountry) {
          return false; // Strictly filter out items that don't match
        }
      }
      return true;
    })
    .map((item: any) => ({
      ...item,
      media_type: "tv" as const,
    }));

  // Merge with FZMovies and regional content
  const combined = [...tmdbItems, ...(fzTV || []), ...(regionalContent || [])];
  const seen = new Set<number>();
  const adjustedItems = combined.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    // Final genre check
    if (genreId && item.genre_ids && !item.genre_ids.includes(genreId)) {
      return false;
    }
    // Final origin_country check
    if (originCountry) {
      const countries = item.origin_country || [];
      const filterCountries = typeof originCountry === 'string' ? originCountry.split('|') : [originCountry];
      if (!countries.some((c: string) => filterCountries.includes(c))) {
        return false;
      }
    }
    return item.poster_path;
  });

  // Fallback: If no results after filtering, show popular content instead of empty page
  if (adjustedItems.length === 0) {
    console.log("No results for specific filters, falling back to popular content");
    try {
      // Get popular content as fallback
      const fallbackResponse = await axios.get("/tv/popular", {
        params: { page: 1 },
        timeout: 3000,
      }).catch(() => ({ data: { results: [] } }));

      const fallbackItems = (fallbackResponse.data?.results || []).slice(0, 20).map((item: any) => ({
        ...item,
        media_type: "tv" as const,
      })).filter((item: Item) => item.poster_path);

      if (fallbackItems.length > 0) {
        return {
          page: 1,
          total_pages: 1,
          results: fallbackItems,
          total_results: fallbackItems.length,
        };
      }
    } catch (err) {
      console.warn("Fallback to popular content failed:", err);
    }
  }

  return {
    page: tmdbData.data?.page ?? page,
    total_pages: tmdbData.data?.total_pages ?? 1,
    results: adjustedItems,
    total_results: adjustedItems.length, // Update total to reflect merged results
  };
};
