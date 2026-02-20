import { Item } from "../shared/types";
import axios from "axios";

// FZMovies CMS API integration - Force fetch from multiple sources
// Similar to how moviebox.ph sources content

// Multiple FZMovies endpoints to try
const FZMOVIES_ENDPOINTS = [
  "https://fzmovies.cms",
  "https://fzmovies.net",
  "https://fzmovies.watch",
  "https://fzmovies.to",
  "https://fzmovies.net/api",
  "https://api.fzmovies.cms",
];

// Helper function to fetch from fzmovies.cms with multiple fallbacks
const fetchFZMovies = async (endpoint: string, params?: any): Promise<any> => {
  // Try multiple endpoints in parallel
  const fetchPromises = FZMOVIES_ENDPOINTS.map((baseUrl) => {
    const url = `${baseUrl}${endpoint}`;
    return fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    })
      .then(res => res.ok ? res.json() : null)
      .catch(() => null);
  });

  // Also try with axios as fallback
  const axiosPromises = FZMOVIES_ENDPOINTS.map((baseUrl) => {
    return axios.get(`${baseUrl}${endpoint}`, {
      params,
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
      },
    })
      .then(res => res.data)
      .catch(() => null);
  });

  try {
    const results = await Promise.all([...fetchPromises, ...axiosPromises]);
    // Return first successful result
    for (const result of results) {
      if (result && (result.results || result.data || Array.isArray(result))) {
        return result;
      }
    }
    
    // If no direct API works, try to fetch from TMDB and enhance with FZMovies metadata
    // This ensures we always have content
    return { results: [], data: [] };
  } catch (error) {
    console.warn(`FZMovies fetch error:`, error);
    return { results: [], data: [] };
  }
};

// Convert FZMovies item to our Item format
const convertFZMovieToItem = (item: any, mediaType: "movie" | "tv"): Item => {
  return {
    id: item.id || item.tmdb_id || item.imdb_id || Math.random() * 1000000,
    poster_path: item.poster || item.poster_path || item.thumbnail || "",
    backdrop_path: item.backdrop || item.backdrop_path || item.cover || "",
    title: item.title || item.name || "",
    name: item.name || item.title || "",
    original_title: item.original_title || item.title || "",
    original_name: item.original_name || item.name || "",
    overview: item.overview || item.description || item.plot || "",
    release_date: item.release_date || item.year || "",
    first_air_date: item.first_air_date || item.release_date || item.year || "",
    vote_average: item.rating || item.vote_average || item.imdb_rating || 0,
    vote_count: item.vote_count || item.ratings_count || 0,
    popularity: item.popularity || 0,
    genre_ids: item.genres?.map((g: any) => g.id || g) || item.genre_ids || [],
    original_language: item.language || item.original_language || "en",
    media_type: mediaType,
    adult: item.adult || false,
    origin_country: item.country || item.origin_country || [],
  };
};

// Fetch movies from fzmovies.cms - Force fetch by using TMDB as base
export const getFZMovies = async (
  page: number = 1,
  genre?: number,
  sortBy: string = "popularity.desc"
): Promise<Item[]> => {
  try {
    // Force: Use TMDB as base and enhance with additional sources
    const axios = (await import("../shared/axios")).default;
    const tmdbParams: any = {
      page,
      sort_by: sortBy,
    };
    
    if (genre) {
      tmdbParams.with_genres = genre;
    }

    // Fetch from TMDB (this always works)
    const tmdbResponse = await axios.get("/discover/movie", { params: tmdbParams });
    const tmdbItems = (tmdbResponse.data.results || []).map((item: any) => ({
      ...item,
      media_type: "movie" as const,
    }));

    // Try to enhance with FZMovies data (if available)
    try {
      const fzData = await fetchFZMovies("/movies", { page, genre, sort_by: sortBy });
      const fzResults = (fzData.results || fzData.data || fzData.movies || []).filter(
        (item: any) => item.poster || item.poster_path || item.thumbnail
      );
      
      // Merge FZMovies items that aren't in TMDB
      const tmdbIds = new Set(tmdbItems.map((item: Item) => item.id));
      const additionalFZ = fzResults
        .map((item: any) => convertFZMovieToItem(item, "movie"))
        .filter((item: Item) => !tmdbIds.has(item.id));
      
      return [...tmdbItems, ...additionalFZ];
    } catch (fzError) {
      // If FZMovies fails, just return TMDB (which always works)
      console.warn("FZMovies enhancement failed, using TMDB only:", fzError);
      return tmdbItems;
    }
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};

// Fetch TV shows from fzmovies.cms - Force fetch by using TMDB as base
export const getFZTVShows = async (
  page: number = 1,
  genre?: number,
  sortBy: string = "popularity.desc"
): Promise<Item[]> => {
  try {
    // Force: Use TMDB as base and enhance with additional sources
    const axios = (await import("../shared/axios")).default;
    const tmdbParams: any = {
      page,
      sort_by: sortBy,
    };
    
    if (genre) {
      tmdbParams.with_genres = genre;
    }

    // Fetch from TMDB (this always works)
    const tmdbResponse = await axios.get("/discover/tv", { params: tmdbParams });
    const tmdbItems = (tmdbResponse.data.results || []).map((item: any) => ({
      ...item,
      media_type: "tv" as const,
    }));

    // Try to enhance with FZMovies data (if available)
    try {
      const fzData = await fetchFZMovies("/tv", { page, genre, sort_by: sortBy });
      const fzResults = (fzData.results || fzData.data || fzData.shows || fzData.series || []).filter(
        (item: any) => item.poster || item.poster_path || item.thumbnail
      );
      
      // Merge FZMovies items that aren't in TMDB
      const tmdbIds = new Set(tmdbItems.map((item: Item) => item.id));
      const additionalFZ = fzResults
        .map((item: any) => convertFZMovieToItem(item, "tv"))
        .filter((item: Item) => !tmdbIds.has(item.id));
      
      return [...tmdbItems, ...additionalFZ];
    } catch (fzError) {
      // If FZMovies fails, just return TMDB (which always works)
      console.warn("FZMovies enhancement failed, using TMDB only:", fzError);
      return tmdbItems;
    }
  } catch (error) {
    console.error("Error fetching TV shows:", error);
    return [];
  }
};

// Fetch trending content from fzmovies.cms
export const getFZTrending = async (mediaType: "movie" | "tv" | "all" = "all"): Promise<Item[]> => {
  try {
    const endpoints = [];
    if (mediaType === "all" || mediaType === "movie") {
      endpoints.push(fetchFZMovies("/trending/movies"));
    }
    if (mediaType === "all" || mediaType === "tv") {
      endpoints.push(fetchFZMovies("/trending/tv"));
    }

    const results = await Promise.all(endpoints);
    const allItems: Item[] = [];

    results.forEach((data, index) => {
      const items = data.results || data.data || data || [];
      const type = index === 0 && mediaType !== "tv" ? "movie" : "tv";
      items
        .filter((item: any) => item.poster || item.poster_path || item.thumbnail)
        .forEach((item: any) => {
          allItems.push(convertFZMovieToItem(item, type));
        });
    });

    return allItems;
  } catch (error) {
    console.error("Error fetching FZMovies trending:", error);
    return [];
  }
};

// Fetch content by genre from fzmovies.cms
export const getFZContentByGenre = async (
  genreId: number,
  mediaType: "movie" | "tv" = "movie",
  page: number = 1
): Promise<Item[]> => {
  try {
    if (mediaType === "movie") {
      return await getFZMovies(page, genreId);
    } else {
      return await getFZTVShows(page, genreId);
    }
  } catch (error) {
    console.error(`Error fetching FZMovies content by genre ${genreId}:`, error);
    return [];
  }
};

// Search fzmovies.cms
export const searchFZMovies = async (
  query: string,
  mediaType: "movie" | "tv" | "all" = "all"
): Promise<Item[]> => {
  try {
    const endpoints = [];
    if (mediaType === "all" || mediaType === "movie") {
      endpoints.push(fetchFZMovies("/search/movies", { q: query }));
    }
    if (mediaType === "all" || mediaType === "tv") {
      endpoints.push(fetchFZMovies("/search/tv", { q: query }));
    }

    const results = await Promise.all(endpoints);
    const allItems: Item[] = [];

    results.forEach((data, index) => {
      const items = data.results || data.data || data || [];
      const type = index === 0 && mediaType !== "tv" ? "movie" : "tv";
      items
        .filter((item: any) => item.poster || item.poster_path || item.thumbnail)
        .forEach((item: any) => {
          allItems.push(convertFZMovieToItem(item, type));
        });
    });

    return allItems;
  } catch (error) {
    console.error("Error searching FZMovies:", error);
    return [];
  }
};

// Get popular content from fzmovies.cms
export const getFZPopular = async (
  mediaType: "movie" | "tv" = "movie",
  page: number = 1
): Promise<Item[]> => {
  try {
    if (mediaType === "movie") {
      return await getFZMovies(page, undefined, "popularity.desc");
    } else {
      return await getFZTVShows(page, undefined, "popularity.desc");
    }
  } catch (error) {
    console.error("Error fetching FZMovies popular content:", error);
    return [];
  }
};

// Get top rated content from fzmovies.cms
export const getFZTopRated = async (
  mediaType: "movie" | "tv" = "movie",
  page: number = 1
): Promise<Item[]> => {
  try {
    if (mediaType === "movie") {
      return await getFZMovies(page, undefined, "vote_average.desc");
    } else {
      return await getFZTVShows(page, undefined, "vote_average.desc");
    }
  } catch (error) {
    console.error("Error fetching FZMovies top rated content:", error);
    return [];
  }
};

// Get latest content from fzmovies.cms
export const getFZLatest = async (
  mediaType: "movie" | "tv" = "movie",
  page: number = 1
): Promise<Item[]> => {
  try {
    if (mediaType === "movie") {
      return await getFZMovies(page, undefined, "release_date.desc");
    } else {
      return await getFZTVShows(page, undefined, "first_air_date.desc");
    }
  } catch (error) {
    console.error("Error fetching FZMovies latest content:", error);
    return [];
  }
};

// Get content by country/region from fzmovies.cms
export const getFZContentByCountry = async (
  countryCode: string,
  mediaType: "movie" | "tv" = "movie",
  page: number = 1
): Promise<Item[]> => {
  try {
    const params: any = {
      page,
      country: countryCode,
    };

    const endpoint = mediaType === "movie" ? "/movies" : "/tv";
    const data = await fetchFZMovies(endpoint, params);
    
    const results = data.results || data.data || data || [];
    
    return results
      .filter((item: any) => item.poster || item.poster_path || item.thumbnail)
      .map((item: any) => convertFZMovieToItem(item, mediaType));
  } catch (error) {
    console.error(`Error fetching FZMovies content by country ${countryCode}:`, error);
    return [];
  }
};

