// Enhanced features inspired by moviebox.ph
// This file contains additional features to surpass moviebox.ph

import axios from "../shared/axios";
import { Item } from "../shared/types";
import { searchFZMovies, getFZPopular } from "./fzmovies";

// Enhanced search with better ranking and suggestions
export const enhancedSearch = async (
  query: string,
  mediaType: "movie" | "tv" | "all" = "all"
): Promise<{
  results: Item[];
  suggestions: string[];
  related: Item[];
}> => {
  try {
    // Search from multiple sources
    const [tmdbResults, fzResults] = await Promise.all([
      axios.get(`/search/${mediaType === "all" ? "multi" : mediaType}`, {
        params: { query, page: 1 },
      }),
      searchFZMovies(query, mediaType),
    ]);

    // Combine and rank results
    const allResults = [
      ...(tmdbResults.data.results || []),
      ...fzResults,
    ];

    // Remove duplicates and rank by relevance
    const seen = new Set<number>();
    const uniqueResults = allResults
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return item.poster_path;
      })
      .sort((a, b) => {
        // Rank by popularity and vote average
        const scoreA = (a.popularity || 0) + (a.vote_average || 0) * 10;
        const scoreB = (b.popularity || 0) + (b.vote_average || 0) * 10;
        return scoreB - scoreA;
      });

    // Get suggestions (simplified - in production, use ML/AI)
    const suggestions = uniqueResults
      .slice(0, 5)
      .map((item) => item.title || item.name || "")
      .filter(Boolean);

    // Get related content (based on genres)
    const related = uniqueResults.slice(0, 10);

    return {
      results: uniqueResults,
      suggestions,
      related,
    };
  } catch (error) {
    console.error("Enhanced search error:", error);
    return { results: [], suggestions: [], related: [] };
  }
};

// Smart recommendations based on viewing history
export const getSmartRecommendations = async (
  watchedItems: Item[],
  limit: number = 20
): Promise<Item[]> => {
  try {
    if (watchedItems.length === 0) {
      // If no history, return popular content
      const [movies, tv] = await Promise.all([
        getFZPopular("movie", 1),
        getFZPopular("tv", 1),
      ]);
      return [...movies, ...tv].slice(0, limit);
    }

    // Extract genres from watched items
    const genreIds = new Set<number>();
    watchedItems.forEach((item) => {
      if (item.genre_ids) {
        item.genre_ids.forEach((id) => genreIds.add(id));
      }
    });

    // Get recommendations based on genres
    const recommendations: Item[] = [];
    for (const genreId of Array.from(genreIds).slice(0, 3)) {
      const [movies, tv] = await Promise.all([
        axios.get("/discover/movie", {
          params: { with_genres: genreId, sort_by: "popularity.desc", page: 1 },
        }),
        axios.get("/discover/tv", {
          params: { with_genres: genreId, sort_by: "popularity.desc", page: 1 },
        }),
      ]);

      recommendations.push(
        ...(movies.data.results || []).map((item: any) => ({
          ...item,
          media_type: "movie" as const,
        })),
        ...(tv.data.results || []).map((item: any) => ({
          ...item,
          media_type: "tv" as const,
        }))
      );
    }

    // Remove watched items and duplicates
    const watchedIds = new Set(watchedItems.map((item) => item.id));
    const seen = new Set<number>();
    return recommendations
      .filter((item) => {
        if (watchedIds.has(item.id) || seen.has(item.id)) return false;
        seen.add(item.id);
        return item.poster_path;
      })
      .slice(0, limit);
  } catch (error) {
    console.error("Smart recommendations error:", error);
    return [];
  }
};

// Advanced filtering with multiple criteria
export interface AdvancedFilter {
  genres?: number[];
  year?: { min?: number; max?: number };
  rating?: { min?: number; max?: number };
  runtime?: { min?: number; max?: number };
  countries?: string[];
  languages?: string[];
  sortBy?: string;
}

export const getFilteredContent = async (
  mediaType: "movie" | "tv",
  filter: AdvancedFilter,
  page: number = 1
): Promise<Item[]> => {
  try {
    const params: any = {
      page,
      sort_by: filter.sortBy || "popularity.desc",
    };

    if (filter.genres && filter.genres.length > 0) {
      params.with_genres = filter.genres.join(",");
    }

    if (filter.year) {
      if (mediaType === "movie") {
        if (filter.year.min) params["primary_release_date.gte"] = `${filter.year.min}-01-01`;
        if (filter.year.max) params["primary_release_date.lte"] = `${filter.year.max}-12-31`;
      } else {
        if (filter.year.min) params["first_air_date.gte"] = `${filter.year.min}-01-01`;
        if (filter.year.max) params["first_air_date.lte"] = `${filter.year.max}-12-31`;
      }
    }

    if (filter.rating) {
      if (filter.rating.min) params["vote_average.gte"] = filter.rating.min;
      if (filter.rating.max) params["vote_average.lte"] = filter.rating.max;
    }

    if (filter.runtime) {
      if (filter.runtime.min) params["with_runtime.gte"] = filter.runtime.min;
      if (filter.runtime.max) params["with_runtime.lte"] = filter.runtime.max;
    }

    if (filter.countries && filter.countries.length > 0) {
      params.with_origin_country = filter.countries.join("|");
    }

    if (filter.languages && filter.languages.length > 0 && filter.languages[0]) {
      params.with_original_language = filter.languages[0];
    }

    const response = await axios.get(`/discover/${mediaType}`, { params });
    return (response.data.results || []).map((item: any) => ({
      ...item,
      media_type: mediaType,
    }));
  } catch (error) {
    console.error("Filtered content error:", error);
    return [];
  }
};

// Get trending content across all categories
export const getTrendingAllCategories = async (): Promise<{
  movies: Item[];
  tv: Item[];
  all: Item[];
}> => {
  try {
    const [trendingMovies, trendingTV, fzTrending] = await Promise.all([
      axios.get("/trending/movie/day"),
      axios.get("/trending/tv/day"),
      getFZPopular("movie", 1),
    ]);

    const movies = (trendingMovies.data.results || []).map((item: any) => ({
      ...item,
      media_type: "movie" as const,
    }));

    const tv = (trendingTV.data.results || []).map((item: any) => ({
      ...item,
      media_type: "tv" as const,
    }));

    const all = [...movies, ...tv, ...fzTrending];
    const seen = new Set<number>();
    const uniqueAll = all.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return item.poster_path;
    });

    return {
      movies,
      tv,
      all: uniqueAll,
    };
  } catch (error) {
    console.error("Trending all categories error:", error);
    return { movies: [], tv: [], all: [] };
  }
};

// Get content by quality/format
export const getContentByQuality = async (
  mediaType: "movie" | "tv",
  quality: "4K" | "1080p" | "720p" | "480p" = "1080p",
  page: number = 1
): Promise<Item[]> => {
  try {
    // This is a simplified version - in production, you'd filter by actual quality metadata
    const response = await axios.get(`/discover/${mediaType}`, {
      params: {
        page,
        sort_by: "popularity.desc",
        "vote_count.gte": (() => {
          if (quality === "4K") return 1000;
          if (quality === "1080p") return 500;
          return 100;
        })(),
      },
    });

    return (response.data.results || []).map((item: any) => ({
      ...item,
      media_type: mediaType,
    }));
  } catch (error) {
    console.error("Content by quality error:", error);
    return [];
  }
};

