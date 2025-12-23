// IMDB/OMDB API Integration for movies and TV shows
// OMDB API provides IMDB data

import axios from "axios";
import { Item } from "../shared/types";

const OMDB_API_KEY = process.env.REACT_APP_OMDB_API_KEY || "";
const OMDB_BASE = "https://www.omdbapi.com";

// Search movies/TV shows by title
export const searchIMDBContent = async (
  query: string,
  type: "movie" | "series" = "movie",
  page: number = 1
): Promise<Item[]> => {
  if (!OMDB_API_KEY) {
    console.warn("OMDB API key not configured");
    return [];
  }

  try {
    const response = await axios.get(OMDB_BASE, {
      params: {
        apikey: OMDB_API_KEY,
        s: query,
        type: type === "movie" ? "movie" : "series",
        page,
      },
      timeout: 10000,
    });

    if (response.data?.Search && Array.isArray(response.data.Search)) {
      return response.data.Search.map((item: any) => ({
        id: Number.parseInt(item.imdbID?.replace("tt", "") || "0") || Math.random(),
        title: item.Title,
        name: item.Title,
        poster_path: item.Poster === "N/A" ? undefined : item.Poster,
        backdrop_path: undefined,
        overview: "",
        release_date: item.Year,
        first_air_date: item.Year,
        vote_average: 0,
        vote_count: 0,
        genre_ids: [],
        media_type: type === "movie" ? ("movie" as const) : ("tv" as const),
        popularity: 0,
        origin_country: [],
        adult: false,
        original_language: "en",
        original_title: item.Title,
        original_name: item.Title,
      }));
    }
  } catch (error) {
    console.warn("OMDB API error:", error);
  }

  return [];
};

// Get content by IMDB ID
export const getIMDBContentById = async (imdbId: string): Promise<any> => {
  if (!OMDB_API_KEY) {
    return null;
  }

  try {
    const response = await axios.get(OMDB_BASE, {
      params: {
        apikey: OMDB_API_KEY,
        i: imdbId,
        plot: "full",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    console.warn("OMDB API error:", error);
    return null;
  }
};

// Enhanced search with multiple queries for better results
export const searchIMDBContentEnhanced = async (
  queries: string[],
  type: "movie" | "series" = "movie"
): Promise<Item[]> => {
  const allResults: Item[] = [];
  const seenIds = new Set<string>();

  for (const query of queries) {
    try {
      const results = await searchIMDBContent(query, type);
      for (const item of results) {
        const uniqueId = item.title || item.name;
        if (uniqueId && !seenIds.has(uniqueId)) {
          seenIds.add(uniqueId);
          allResults.push(item);
        }
      }
    } catch (error) {
      continue;
    }
  }

  return allResults;
};

