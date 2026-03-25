// Content Sources Integration
// Fetches movies and TV shows from multiple sources and merges with TMDB

import axios from "../shared/axios";
import { Item } from "../shared/types";

// Helper to convert any content item to our Item format
const convertToItem = (item: any, mediaType: "movie" | "tv"): Item => {
  return {
    id: item.id || item.tmdb_id || item.imdb_id || item.movie_id || item.drama_id || Math.random() * 1000000,
    poster_path: item.poster || item.poster_path || item.thumbnail || item.image || item.cover || "",
    backdrop_path: item.backdrop || item.backdrop_path || item.cover || item.banner || item.background || "",
    title: item.title || item.name || item.english_name || "",
    name: item.name || item.title || item.english_name || "",
    original_title: item.original_title || item.title || item.original_name || "",
    original_name: item.original_name || item.name || item.title || "",
    overview: item.overview || item.description || item.plot || item.synopsis || item.summary || "",
    release_date: item.release_date || item.year || item.released || item.date || "",
    first_air_date: item.first_air_date || item.release_date || item.year || item.released || item.date || "",
    vote_average: item.rating || item.vote_average || item.imdb_rating || item.score || item.rate || 0,
    vote_count: item.vote_count || item.ratings_count || item.views || 0,
    genre_ids: item.genre_ids || item.genres?.map((g: any) => g.id || g) || item.category?.map((c: any) => c.id || c) || [],
    original_language: item.original_language || item.language || "en",
    popularity: item.popularity || item.views || item.watch_count || 0,
    media_type: mediaType,
    origin_country: item.country || item.origin_country || [],
  };
};

// KissKH.com - Anime and Asian dramas
export const getKissKHContent = async (page: number = 1, type: "movie" | "tv" = "tv"): Promise<Item[]> => {
  try {
    // Try multiple endpoint formats
    const endpoints = [
      `https://kisskh.com/api/DramaList/DramaList?page=${page}&type=${type === "movie" ? 1 : 0}`,
      `https://kisskh.com/api/DramaList/List?page=${page}`,
      `https://kisskh.com/api/DramaList?page=${page}`,
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Referer': 'https://kisskh.com/',
          },
        });
        
        const results = response.data?.data || response.data?.results || response.data?.list || response.data || [];
        if (Array.isArray(results) && results.length > 0) {
          return results
            .filter((item: any) => item.poster || item.poster_path || item.thumbnail || item.image)
            .map((item: any) => convertToItem(item, type));
        }
      } catch (e) {
        continue; // Try next endpoint
      }
    }
    
    return [];
  } catch (error) {
    console.warn("KissKH API error:", error);
    return [];
  }
};

// UGC-Anime.com - Anime content
export const getUGCAnimeContent = async (page: number = 1): Promise<Item[]> => {
  try {
    const endpoints = [
      `https://ugc-anime.com/api/anime?page=${page}&limit=20`,
      `https://ugc-anime.com/api/v1/anime?page=${page}`,
      `https://ugc-anime.com/api/list?page=${page}`,
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
          },
        });
        
        const results = response.data?.data || response.data?.results || response.data?.anime || response.data || [];
        if (Array.isArray(results) && results.length > 0) {
          return results
            .filter((item: any) => item.poster || item.poster_path || item.thumbnail || item.image)
            .map((item: any) => convertToItem(item, "tv"));
        }
      } catch (e) {
        continue;
      }
    }
    
    return [];
  } catch (error) {
    console.warn("UGC-Anime API error:", error);
    return [];
  }
};

// Ailok.pe - Movies and TV shows
export const getAilokContent = async (page: number = 1, type: "movie" | "tv" = "movie"): Promise<Item[]> => {
  try {
    const endpoints = [
      `https://ailok.pe/api/${type === "movie" ? "movies" : "series"}?page=${page}`,
      `https://ailok.pe/api/v1/${type}?page=${page}`,
      `https://ailok.pe/api/list/${type}?page=${page}`,
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
          },
        });
        
        const results = response.data?.data || response.data?.results || response.data?.list || response.data || [];
        if (Array.isArray(results) && results.length > 0) {
          return results
            .filter((item: any) => item.poster || item.poster_path || item.thumbnail || item.image)
            .map((item: any) => convertToItem(item, type));
        }
      } catch (e) {
        continue;
      }
    }
    
    return [];
  } catch (error) {
    console.warn("Ailok API error:", error);
    return [];
  }
};

// SZ.Googotv.com - Movies and TV shows
export const getGoogotvContent = async (page: number = 1, type: "movie" | "tv" = "movie"): Promise<Item[]> => {
  try {
    const endpoints = [
      `https://sz.googotv.com/api/${type}?page=${page}`,
      `https://sz.googotv.com/api/v1/${type}?page=${page}`,
      `https://sz.googotv.com/api/list/${type}?page=${page}`,
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
          },
        });
        
        const results = response.data?.data || response.data?.results || response.data?.list || response.data || [];
        if (Array.isArray(results) && results.length > 0) {
          return results
            .filter((item: any) => item.poster || item.poster_path || item.thumbnail || item.image)
            .map((item: any) => convertToItem(item, type));
        }
      } catch (e) {
        continue;
      }
    }
    
    return [];
  } catch (error) {
    console.warn("Googotv API error:", error);
    return [];
  }
};

// FZMovies - Enhanced fetching with multiple methods
export const getFZMoviesContent = async (page: number = 1, type: "movie" | "tv" = "movie"): Promise<Item[]> => {
  try {
    // Try multiple FZMovies endpoints
    const baseUrls = [
      "https://fzmovies.cms",
      "https://fzmovies.net",
      "https://fzmovies.watch",
      "https://fzmovies.to",
    ];
    
    const endpoints = [
      `/api/${type}?page=${page}`,
      `/api/v1/${type}?page=${page}`,
      `/api/${type}s?page=${page}`,
      `/api/list/${type}?page=${page}`,
    ];
    
    for (const baseUrl of baseUrls) {
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${baseUrl}${endpoint}`, {
            timeout: 10000,
            headers: {
              'Accept': 'application/json',
              'Referer': baseUrl,
            },
          });
          
          const results = response.data?.data || response.data?.results || response.data?.movies || response.data?.tvshows || response.data || [];
          if (Array.isArray(results) && results.length > 0) {
            return results
              .filter((item: any) => item.poster || item.poster_path || item.thumbnail || item.image)
              .map((item: any) => convertToItem(item, type));
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    return [];
  } catch (error) {
    console.warn("FZMovies API error:", error);
    return [];
  }
};

// Merge content from all sources
export const mergeContentSources = async (
  tmdbContent: Item[],
  additionalSources: Item[][]
): Promise<Item[]> => {
  const allContent = [...tmdbContent];
  
  // Add content from additional sources
  additionalSources.forEach((sourceContent) => {
    allContent.push(...sourceContent);
  });
  
  // Remove duplicates by ID and title
  const uniqueContent = allContent.filter((item, index, self) =>
    index === self.findIndex((i) => 
      i.id === item.id || 
      (i.title?.toLowerCase() === item.title?.toLowerCase() && i.release_date === item.release_date)
    )
  );
  
  return uniqueContent;
};

// Get content from all sources for a specific category
export const getAllSourceContent = async (
  type: "movie" | "tv",
  page: number = 1
): Promise<Item[]> => {
  try {
    const [kisskh, ugcAnime, ailok, googotv, fzmovies] = await Promise.all([
      getKissKHContent(page, type),
      type === "tv" ? getUGCAnimeContent(page) : Promise.resolve([]),
      getAilokContent(page, type),
      getGoogotvContent(page, type),
      getFZMoviesContent(page, type),
    ]);
    
    return mergeContentSources([], [kisskh, ugcAnime, ailok, googotv, fzmovies]);
  } catch (error) {
    console.error("Error fetching all source content:", error);
    return [];
  }
};

// Functions are already exported above, no need to re-export
