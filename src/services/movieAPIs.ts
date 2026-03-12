// Comprehensive Movie/TV API Integration
// Integrates TMDB, OMDB, and MUBI to populate website with content

import axios from "../shared/axios";
import { Item } from "../shared/types";
import { API_URL } from "../shared/constants";
import { fetchYouTubeVideos } from "./youtube";

const TMDB_API_KEY = process.env.REACT_APP_API_KEY || "8c247ea0b4b56ed2ff7d41c9a833aa77";
// OMDB API key moved to Firebase functions to ensure security
// 💥 Phase 8: Hardened Data Pipeline 💥

/**
 * Searches YouTube for metadata/trailers when TMDB data is sparse
 */
export const getMovieYouTubeSupplements = async (item: Item): Promise<Partial<Item>> => {
  try {
    const query = `${item.title || item.name} ${item.release_date?.split("-")[0] || ""} official trailer`;
    const { videos } = await fetchYouTubeVideos(query).catch(() => ({ videos: [] }));

    if (videos && videos.length > 0) {
      return {
        youtubeId: videos[0].id,
        isYouTube: true
      };
    }
    return {};
  } catch (error) {
    return {};
  }
};

// Helper to convert API response to Item format
const convertToItem = (item: any, mediaType: "movie" | "tv"): Item => {
  return {
    id: item.id || item.tmdb_id || item.imdb_id || Math.random() * 1000000,
    poster_path: item.poster_path || item.poster || item.Poster || item.thumbnail || "",
    backdrop_path: item.backdrop_path || item.backdrop || item.backdrop || "",
    title: item.title || item.Title || item.name || "",
    name: item.name || item.title || item.Title || "",
    original_title: item.original_title || item.title || item.Title || "",
    original_name: item.original_name || item.name || item.title || "",
    overview: item.overview || item.Plot || item.description || item.plot || "",
    release_date: item.release_date || item.Year || item.year || item.Released || "",
    first_air_date: item.first_air_date || item.release_date || item.Year || item.year || "",
    vote_average: item.vote_average || parseFloat(item.imdbRating) || item.rating || item.Ratings?.[0]?.Value || 0,
    vote_count: item.vote_count || parseInt(item.imdbVotes?.replace(/,/g, '') || "0") || 0,
    genre_ids: item.genre_ids || item.genres?.map((g: any) => g.id || g) || [],
    original_language: item.original_language || item.Language || "en",
    popularity: item.popularity || 0,
    media_type: mediaType,
    origin_country: item.origin_country || item.Country?.split(", ") || [],
  };
};

import { getBackendBase } from "./download";

// Use the project's unified backend entry point
const getApiBase = () => getBackendBase() + "/api";

// Enhanced TMDB fetching - fetch multiple pages for more content
export const getTMDBContent = async (
  type: "movie" | "tv",
  category: "popular" | "top_rated" | "trending" | "upcoming" | "now_playing" | "on_the_air",
  pages: number = 3,
  language: string = "en-US"
): Promise<Item[]> => {
  try {
    const allItems: Item[] = [];

    // Fetch multiple pages in parallel
    const fetchPromises = [];
    for (let page = 1; page <= pages; page++) {
      let endpoint = "";

      if (category === "trending") {
        endpoint = `/trending/${type}/day?page=${page}`;
      } else if (category === "popular") {
        endpoint = `/${type}/popular?page=${page}`;
      } else if (category === "top_rated") {
        endpoint = `/${type}/top_rated?page=${page}`;
      } else if (category === "upcoming" && type === "movie") {
        endpoint = `/movie/upcoming?page=${page}`;
      } else if (category === "now_playing" && type === "movie") {
        endpoint = `/movie/now_playing?page=${page}`;
      } else if (category === "on_the_air" && type === "tv") {
        endpoint = `/tv/on_the_air?page=${page}`;
      }

      if (endpoint) {
        fetchPromises.push(
          axios.get("", {
            params: {
              endpoint,
              language
            },
            timeout: 8000,
          })
        );
      }
    }

    const responses = await Promise.all(fetchPromises);
    responses.forEach((response) => {
      const items = (response.data.results || []).map((item: any) => ({
        ...item,
        media_type: type,
      }));
      allItems.push(...items);
    });

    // Remove duplicates
    const unique = allItems.filter((item: Item, index: number, self: Item[]) =>
      index === self.findIndex((i: Item) => i.id === item.id)
    );

    return unique;
  } catch (error) {
    console.error(`Error fetching TMDB ${type} ${category}:`, error);
    return [];
  }
};

// OMDB API - Search and get movie/TV details via Firebase Proxy
export const getOMDBContent = async (
  searchQuery: string,
  type: "movie" | "tv" = "movie"
): Promise<Item[]> => {
  try {
    const response = await axios.post(`${getBackendBase()}/api/proxy/external`, {
      provider: "omdb",
      params: {
        s: searchQuery,
        type: type === "movie" ? "movie" : "series",
        page: 1,
      }
    }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.Response === "True" && response.data.Search) {
      const items = response.data.Search.map((item: any) => convertToItem(item, type));
      return items.filter((item: Item) => item.poster_path);
    }

    return [];
  } catch (error) {
    console.warn("OMDB API Proxy error:", error);
    return [];
  }
};

// OMDB - Get popular movies by searching common terms
export const getOMDBPopular = async (type: "movie" | "tv" = "movie"): Promise<Item[]> => {
  try {

    // Search for popular titles
    const searchTerms = type === "movie"
      ? ["action", "comedy", "drama", "thriller", "horror", "sci-fi", "romance"]
      : ["drama", "comedy", "action", "thriller", "mystery"];

    const allItems: Item[] = [];

    for (const term of searchTerms.slice(0, 3)) { // Limit to avoid rate limits
      try {
        const items = await getOMDBContent(term, type);
        allItems.push(...items);
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        continue;
      }
    }

    // Remove duplicates
    return allItems.filter((item: Item, index: number, self: Item[]) =>
      index === self.findIndex((i: Item) => i.id === item.id || i.title === item.title)
    );
  } catch (error) {
    console.warn("OMDB Popular error:", error);
    return [];
  }
};

// IMDB Integration - Uses OMDB API which sources from IMDB
// OMDB provides IMDB ratings, IDs, and metadata
export const getIMDBContent = async (
  searchQuery?: string,
  type: "movie" | "tv" = "movie"
): Promise<Item[]> => {
  try {

    // If search query provided, search for it
    if (searchQuery) {
      return await getOMDBContent(searchQuery, type);
    }

    // Otherwise, get popular content by searching common terms
    const searchTerms = type === "movie"
      ? ["action", "comedy", "drama", "thriller", "horror", "sci-fi", "romance", "adventure", "fantasy"]
      : ["drama", "comedy", "action", "thriller", "mystery", "crime"];

    const allItems: Item[] = [];

    // Search multiple terms to get diverse content
    for (const term of searchTerms.slice(0, 5)) {
      try {
        const items = await getOMDBContent(term, type);
        allItems.push(...items);
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        continue;
      }
    }

    // Remove duplicates by title and year
    return allItems.filter((item: Item, index: number, self: Item[]) =>
      index === self.findIndex((i: Item) =>
        i.id === item.id ||
        (i.title?.toLowerCase() === item.title?.toLowerCase() &&
          i.release_date === item.release_date)
      )
    );
  } catch (error) {
    console.warn("IMDB/OMDB API error:", error);
    return [];
  }
};

// MUBI API - Get curated films (if available)
export const getMUBIContent = async (): Promise<Item[]> => {
  // MUBI doesn't have a public API, but we can try to fetch from their website
  // For now, return empty - would need scraping or official API
  return [];
};

// Get content by genre from TMDB
export const getTMDBByGenre = async (
  genreId: number,
  type: "movie" | "tv",
  pages: number = 2
): Promise<Item[]> => {
  try {
    const allItems: Item[] = [];

    const fetchPromises = [];
    for (let page = 1; page <= pages; page++) {
      fetchPromises.push(
        axios.get(`${getApiBase()}/tmdb`, {
          params: {
            endpoint: `/discover/${type}`,
            with_genres: genreId,
            sort_by: "popularity.desc",
            page,
          },
          timeout: 10000,
        })
      );
    }

    const responses = await Promise.all(fetchPromises);
    responses.forEach((response) => {
      const items = (response.data.results || []).map((item: any) => ({
        ...item,
        media_type: type,
      }));
      allItems.push(...items);
    });

    // Remove duplicates
    return allItems.filter((item: Item, index: number, self: Item[]) =>
      index === self.findIndex((i: Item) => i.id === item.id)
    );
  } catch (error) {
    console.error(`Error fetching TMDB by genre ${genreId}:`, error);
    return [];
  }
};

// Get all content from all APIs (TMDB, OMDB/IMDB, Letterboxd, Rotten Tomatoes)
export const getAllAPIContent = async (
  type: "movie" | "tv",
  category: "popular" | "top_rated" | "trending" = "popular"
): Promise<Item[]> => {
  try {
    // Use the new fallback chain: IMDB -> Letterboxd -> Rotten Tomatoes -> TMDB
    const { getContentWithFallback } = await import("./additionalAPIs");
    const fallbackContent = await getContentWithFallback(type, category);

    // Also fetch from basic TMDB and OMDB in parallel for additional variety
    const [tmdbContent, omdbContent] = await Promise.allSettled([
      getTMDBContent(type, category, 2),
      Promise.race([
        getOMDBPopular(type),
        new Promise<Item[]>((resolve) => setTimeout(() => resolve([]), 2000)),
      ]),
    ]);

    // Merge all sources
    const allContent: Item[] = [...fallbackContent];

    if (tmdbContent.status === "fulfilled") {
      allContent.push(...tmdbContent.value);
    }
    if (omdbContent.status === "fulfilled") {
      allContent.push(...omdbContent.value);
    }

    // Deduplicate
    return allContent.filter((item: Item, index: number, self: Item[]) =>
      index === self.findIndex((i: Item) =>
        i.id === item.id ||
        (i.title?.toLowerCase() === item.title?.toLowerCase() &&
          i.release_date === item.release_date)
      )
    );
  } catch (error) {
    console.error("Error fetching all API content:", error);
    // Fallback to basic TMDB
    try {
      return await getTMDBContent(type, category, 1);
    } catch (e) {
      return [];
    }
  }
};

// Get content by genre from all APIs (TMDB, OMDB/IMDB)
export const getAllAPIContentByGenre = async (
  genreId: number,
  type: "movie" | "tv"
): Promise<Item[]> => {
  try {
    // Reduce pages and add timeouts for faster loading
    const [tmdbContent, omdbContent, imdbContent] = await Promise.all([
      getTMDBByGenre(genreId, type, 2), // Reduced from 3 to 2 pages
      Promise.race([
        getOMDBPopular(type),
        new Promise<Item[]>((resolve) => setTimeout(() => resolve([]), 2000)), // 2s timeout
      ]),
      Promise.race([
        getIMDBContent(undefined, type),
        new Promise<Item[]>((resolve) => setTimeout(() => resolve([]), 2000)), // 2s timeout
      ]),
    ]);

    // Merge and deduplicate
    const allContent = [...tmdbContent, ...omdbContent, ...imdbContent];
    return allContent.filter((item: Item, index: number, self: Item[]) =>
      index === self.findIndex((i: Item) =>
        i.id === item.id ||
        (i.title?.toLowerCase() === item.title?.toLowerCase())
      )
    );
  } catch (error) {
    console.error(`Error fetching all API content by genre ${genreId}:`, error);
    return [];
  }
};

/**
 * Vision AI 3.0: High-Precision Content Discovery
 * Analyzes the user's watch history (recently watched items) to extract
 * favorite genres and cast members, then queries TMDB for highly tailored content.
 */
export const getPersonalizedRecommendations = async (
  history: Item[],
  type: "movie" | "tv"
): Promise<Item[]> => {
  if (!history || history.length === 0) {
    // Fallback: If no history, return trending
    return getTMDBContent(type, "trending", 1);
  }

  try {
    // 1. Core Learning: Extract Favorite Genres
    const genreFrequency: Record<number, number> = {};
    const recentHistory = history.slice(0, 10); // Focus on recent mood (last 10 items)

    recentHistory.forEach(item => {
      if (item.genre_ids) {
        // Weight recent items slightly higher (decay factor)
        item.genre_ids.forEach(genreId => {
          genreFrequency[genreId] = (genreFrequency[genreId] || 0) + 1;
        });
      }
    });

    // Sort genres by frequency to find top 3
    const topGenres = Object.entries(genreFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    if (topGenres.length === 0) {
      return getTMDBContent(type, "popular", 1);
    }

    // 2. Query TMDB Discover API with top genres
    // Using an OR condition (pipe '|') for genres to get diverse but relevant results
    const genreQuery = topGenres.join('|');
    
    // Get unique IDs from history to filter out things they've already watched
    const watchedIds = new Set(history.map(item => item.id));

    const response = await axios.get(`${getApiBase()}/proxy/tmdb`, {
      params: {
        endpoint: `/discover/${type}`,
        with_genres: genreQuery,
        sort_by: "popularity.desc",
        "vote_count.gte": 100, // Quality filter
        page: 1,
      },
      timeout: 10000,
    });

    const items = (response.data.results || []).map((item: any) => ({
      ...convertToItem(item, type),
      media_type: type,
    })) as Item[];

    // 3. Filter out items the user has already watched
    const freshRecommendations = items.filter(item => !watchedIds.has(item.id));

    // If filtering removed everything, just return the raw results
    return freshRecommendations.length > 0 ? freshRecommendations : items;

  } catch (error) {
    console.warn("Vision AI Recommendation Error:", error);
    // Gradeful degradation
    return getTMDBContent(type, "trending", 1);
  }
};

