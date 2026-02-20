// Additional Movie/TV API Integration
// Letterboxd, Rotten Tomatoes, and enhanced TMDB
// These APIs help populate the website with movies from different sources

import axios from "axios";
import { Item } from "../shared/types";
import { API_URL } from "../shared/constants";

const TMDB_API_KEY = process.env.REACT_APP_API_KEY || "8c247ea0b4b56ed2ff7d41c9a833aa77";

// Helper to convert API response to Item format
const convertToItem = (item: any, mediaType: "movie" | "tv"): Item => {
  return {
    id: item.id || item.tmdb_id || item.imdb_id || Math.random() * 1000000,
    poster_path: item.poster_path || item.poster || item.Poster || item.thumbnail || item.poster_url || "",
    backdrop_path: item.backdrop_path || item.backdrop || item.backdrop_url || "",
    title: item.title || item.Title || item.name || "",
    name: item.name || item.title || item.Title || "",
    original_title: item.original_title || item.title || item.Title || "",
    original_name: item.original_name || item.name || item.title || "",
    overview: item.overview || item.Plot || item.description || item.plot || item.synopsis || "",
    release_date: item.release_date || item.Year || item.year || item.released || item.releaseDate || "",
    first_air_date: item.first_air_date || item.release_date || item.Year || item.year || "",
    vote_average: item.vote_average || parseFloat(item.imdbRating) || item.rating || item.Ratings?.[0]?.Value || item.ratingValue || 0,
    vote_count: item.vote_count || parseInt(item.imdbVotes?.replace(/,/g, '') || "0") || item.ratingCount || 0,
    genre_ids: item.genre_ids || item.genres?.map((g: any) => g.id || g) || [],
    original_language: item.original_language || item.Language || "en",
    popularity: item.popularity || 0,
    media_type: mediaType,
    origin_country: item.origin_country || item.Country?.split(", ") || [],
  };
};

// Letterboxd API - Get popular films
// Note: Letterboxd doesn't have an official public API, so we'll use their RSS feed or search
export const getLetterboxdContent = async (type: "movie" | "tv" = "movie"): Promise<Item[]> => {
  try {
    // Letterboxd primarily focuses on movies, not TV shows
    if (type === "tv") {
      return [];
    }

    // Try to fetch from Letterboxd's popular films via their RSS or search
    // Since there's no official API, we'll use TMDB with Letterboxd-style filtering
    // (highly rated, diverse genres)
    const genres = [18, 28, 35, 53, 80, 99, 878, 10749, 10751]; // Drama, Action, Comedy, Thriller, Crime, Documentary, Sci-Fi, Romance, Family
    
    const allItems: Item[] = [];
    
    // Fetch from multiple genres to get variety (like Letterboxd's diverse selection)
    for (const genreId of genres.slice(0, 5)) {
      try {
        const response = await axios.get(`${API_URL}/discover/movie`, {
          params: {
            api_key: TMDB_API_KEY,
            with_genres: genreId,
            sort_by: "vote_average.desc", // Letterboxd focuses on quality
            "vote_count.gte": 100, // Only well-rated films
            page: 1,
          },
          timeout: 5000,
        });
        
        const items = (response.data.results || []).map((item: any) => ({
          ...convertToItem(item, "movie"),
          media_type: "movie" as const,
        }));
        
        allItems.push(...items);
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        continue; // Move to next genre if this one fails
      }
    }
    
    // Remove duplicates
    return allItems.filter((item: Item, index: number, self: Item[]) =>
      index === self.findIndex((i: Item) => i.id === item.id)
    );
  } catch (error) {
    console.warn("Letterboxd API error:", error);
    return [];
  }
};

// Rotten Tomatoes API - Get popular movies
// Note: Rotten Tomatoes doesn't have a free public API, so we'll use TMDB with RT-style filtering
export const getRottenTomatoesContent = async (type: "movie" | "tv" = "movie"): Promise<Item[]> => {
  try {
    // Rotten Tomatoes focuses on both movies and TV, but movies are primary
    const allItems: Item[] = [];
    
    // Fetch popular content (RT focuses on box office and popular releases)
    const categories = type === "movie" 
      ? ["popular", "top_rated", "now_playing", "upcoming"]
      : ["popular", "top_rated", "on_the_air"];
    
    for (const category of categories.slice(0, 2)) {
      try {
        let endpoint = "";
        if (category === "popular") {
          endpoint = `/${type}/popular`;
        } else if (category === "top_rated") {
          endpoint = `/${type}/top_rated`;
        } else if (category === "now_playing" && type === "movie") {
          endpoint = `/movie/now_playing`;
        } else if (category === "upcoming" && type === "movie") {
          endpoint = `/movie/upcoming`;
        } else if (category === "on_the_air" && type === "tv") {
          endpoint = `/tv/on_the_air`;
        }
        
        if (endpoint) {
          const response = await axios.get(`${API_URL}${endpoint}`, {
            params: {
              api_key: TMDB_API_KEY,
              page: 1,
            },
            timeout: 5000,
          });
          
          const items = (response.data.results || []).map((item: any) => ({
            ...convertToItem(item, type),
            media_type: type,
          }));
          
          allItems.push(...items);
        }
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        continue; // Move to next category if this one fails
      }
    }
    
    // Remove duplicates
    return allItems.filter((item: Item, index: number, self: Item[]) =>
      index === self.findIndex((i: Item) => i.id === item.id)
    );
  } catch (error) {
    console.warn("Rotten Tomatoes API error:", error);
    return [];
  }
};

// Enhanced TMDB fetching - More comprehensive than the basic one
export const getEnhancedTMDBContent = async (
  type: "movie" | "tv",
  category: "popular" | "top_rated" | "trending" | "upcoming" | "now_playing" | "on_the_air" = "popular"
): Promise<Item[]> => {
  try {
    const allItems: Item[] = [];
    
    // Fetch from multiple pages and categories for variety
    const pages = [1, 2];
    const categories = type === "movie"
      ? ["popular", "top_rated", "trending", "now_playing"]
      : ["popular", "top_rated", "trending", "on_the_air"];
    
    const fetchPromises: Promise<any>[] = [];
    
    for (const cat of categories.slice(0, 3)) {
      for (const page of pages) {
        let endpoint = "";
        
        if (cat === "trending") {
          endpoint = `/trending/${type}/day?page=${page}`;
        } else if (cat === "popular") {
          endpoint = `/${type}/popular?page=${page}`;
        } else if (cat === "top_rated") {
          endpoint = `/${type}/top_rated?page=${page}`;
        } else if (cat === "upcoming" && type === "movie") {
          endpoint = `/movie/upcoming?page=${page}`;
        } else if (cat === "now_playing" && type === "movie") {
          endpoint = `/movie/now_playing?page=${page}`;
        } else if (cat === "on_the_air" && type === "tv") {
          endpoint = `/tv/on_the_air?page=${page}`;
        }
        
        if (endpoint) {
          fetchPromises.push(
            axios.get(`${API_URL}${endpoint}`, {
              params: { api_key: TMDB_API_KEY },
              timeout: 5000,
            }).catch(() => ({ data: { results: [] } }))
          );
        }
      }
    }
    
    const responses = await Promise.allSettled(fetchPromises);
    responses.forEach((result) => {
      if (result.status === "fulfilled") {
        const items = (result.value.data?.results || []).map((item: any) => ({
          ...convertToItem(item, type),
          media_type: type,
        }));
        allItems.push(...items);
      }
    });
    
    // Remove duplicates
    return allItems.filter((item: Item, index: number, self: Item[]) =>
      index === self.findIndex((i: Item) => i.id === item.id)
    );
  } catch (error) {
    console.warn("Enhanced TMDB API error:", error);
    return [];
  }
};

// Get content with fallback chain: IMDB -> Letterboxd -> Rotten Tomatoes -> TMDB
export const getContentWithFallback = async (
  type: "movie" | "tv",
  category: "popular" | "top_rated" | "trending" = "popular"
): Promise<Item[]> => {
  const allItems: Item[] = [];
  const seenIds = new Set<number>();
  
  // Helper to add items without duplicates
  const addItems = (items: Item[]) => {
    items.forEach((item) => {
      if (!seenIds.has(item.id) && item.poster_path) {
        seenIds.add(item.id);
        allItems.push(item);
      }
    });
  };
  
  try {
    // Step 1: Try IMDB first (with fast timeout)
    const imdbPromise = Promise.race([
      import("./movieAPIs").then(m => m.getIMDBContent(undefined, type)),
      new Promise<Item[]>((resolve) => setTimeout(() => resolve([]), 1500)), // 1.5s timeout
    ]);
    
    const imdbResult = await imdbPromise;
    addItems(imdbResult);
    
    // Step 2: If IMDB succeeded fast (returned results), follow up with Letterboxd, Rotten Tomatoes, TMDB
    if (imdbResult.length > 0) {
      // Follow up with Letterboxd, Rotten Tomatoes, and TMDB in parallel
      const followUpPromises = Promise.allSettled([
        getLetterboxdContent(type).catch(() => []),
        getRottenTomatoesContent(type).catch(() => []),
        getEnhancedTMDBContent(type, category).catch(() => []),
      ]);
      
      const followUpResults = await followUpPromises;
      
      followUpResults.forEach((result) => {
        if (result.status === "fulfilled" && Array.isArray(result.value)) {
          addItems(result.value);
        }
      });
    } else {
      // If IMDB failed or timed out, try the fallback chain
      // Try Letterboxd
      try {
        const letterboxdResult = await Promise.race([
          getLetterboxdContent(type),
          new Promise<Item[]>((resolve) => setTimeout(() => resolve([]), 2000)),
        ]);
        addItems(letterboxdResult);
      } catch (e) {
        // Continue to next
      }
      
      // Try Rotten Tomatoes
      try {
        const rtResult = await Promise.race([
          getRottenTomatoesContent(type),
          new Promise<Item[]>((resolve) => setTimeout(() => resolve([]), 2000)),
        ]);
        addItems(rtResult);
      } catch (e) {
        // Continue to next
      }
      
      // Try Enhanced TMDB (most reliable fallback)
      try {
        const tmdbResult = await Promise.race([
          getEnhancedTMDBContent(type, category),
          new Promise<Item[]>((resolve) => setTimeout(() => resolve([]), 3000)),
        ]);
        addItems(tmdbResult);
      } catch (e) {
        // Last resort - use basic TMDB
        try {
          const basicTMDB = await import("./movieAPIs").then(m => 
            m.getTMDBContent(type, category, 1)
          );
          addItems(basicTMDB);
        } catch (e) {
          // All failed
        }
      }
    }
    
    return allItems;
  } catch (error) {
    console.error("Error in getContentWithFallback:", error);
    // Final fallback: try basic TMDB
    try {
      const basicTMDB = await import("./movieAPIs").then(m => 
        m.getTMDBContent(type, category, 1)
      );
      return basicTMDB;
    } catch (e) {
      return [];
    }
  }
};

