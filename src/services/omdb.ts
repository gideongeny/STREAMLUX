// OMDB API Integration
// Free tier available at https://www.omdbapi.com/

import axios from "axios";
import { Item } from "../shared/types";

const OMDB_BASE_URL = "https://www.omdbapi.com";
// Using public OMDB API (free tier) - user can add their own key via env var if needed
const OMDB_API_KEY = process.env.REACT_APP_OMDB_API_KEY || "demo"; // Demo key, replace with your own

export interface OMDBTitle {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
  Plot?: string;
  Genre?: string;
  Director?: string;
  Actors?: string;
  imdbRating?: string;
  imdbVotes?: string;
  BoxOffice?: string;
  Metascore?: string;
  Awards?: string;
  Language?: string;
  Country?: string;
  Runtime?: string;
  Released?: string;
  Rated?: string;
}

export interface OMDBSearchResponse {
  Search?: OMDBTitle[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

// Convert OMDB title to Item format
export const convertOMDBToItem = (title: OMDBTitle, index: number = 0): Item => {
  const year = parseInt(title.Year?.substring(0, 4) || new Date().getFullYear().toString());
  
  return {
    id: parseInt(title.imdbID?.replace(/\D/g, '').substring(0, 8)) || Date.now() + index,
    title: title.Title,
    name: title.Title,
    overview: title.Plot || "",
    poster_path: title.Poster && title.Poster !== "N/A" ? title.Poster : "",
    backdrop_path: "",
    media_type: title.Type === "movie" ? "movie" : "tv",
    vote_average: parseFloat(title.imdbRating || "0") || 0,
    vote_count: parseInt(title.imdbVotes?.replace(/,/g, "") || "0") || 0,
    popularity: parseInt(title.imdbVotes?.replace(/,/g, "") || "0") || 0,
    release_date: title.Released && title.Released !== "N/A" ? title.Released : (year ? `${year}-01-01` : undefined),
    first_air_date: title.Released && title.Released !== "N/A" ? title.Released : (year ? `${year}-01-01` : undefined),
    genre_ids: title.Genre ? title.Genre.split(",").map(() => Math.floor(Math.random() * 30) + 1) : [],
    original_language: title.Language?.split(",")[0]?.toLowerCase() || "en",
  } as Item;
};

// Search titles
export const searchOMDBTitles = async (
  query: string,
  type?: "movie" | "series",
  page: number = 1
): Promise<Item[]> => {
  try {
    if (!OMDB_API_KEY || OMDB_API_KEY === "demo") {
      console.warn("OMDB API key not configured. Add REACT_APP_OMDB_API_KEY to .env");
      return [];
    }

    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        s: query,
        type: type,
        page: page,
      },
      timeout: 10000,
    });

    if (response.data?.Response === "True" && response.data?.Search) {
      return response.data.Search.map((title: OMDBTitle, index: number) => 
        convertOMDBToItem(title, index)
      );
    }

    return [];
  } catch (error) {
    console.error("OMDB API error:", error);
    return [];
  }
};

// Get popular titles by year
export const getOMDBPopular = async (
  type?: "movie" | "series",
  year?: number
): Promise<Item[]> => {
  try {
    if (!OMDB_API_KEY || OMDB_API_KEY === "demo") {
      console.warn("OMDB API key not configured");
      return [];
    }

    // Popular search queries for OMDB
    const queries = year 
      ? [`${year} popular ${type}`]
      : type === "movie"
        ? ["popular movies", "top movies", "best movies", "latest movies"]
        : ["popular series", "top series", "best series", "latest series"];

    const allResults: Item[] = [];
    
    for (const query of queries.slice(0, 2)) { // Limit to 2 queries
      try {
        const response = await axios.get(OMDB_BASE_URL, {
          params: {
            apikey: OMDB_API_KEY,
            s: query,
            type: type,
            page: 1,
          },
          timeout: 5000,
        });

        if (response.data?.Response === "True" && response.data?.Search) {
          const items = response.data.Search.map((title: OMDBTitle, index: number) => 
            convertOMDBToItem(title, index)
          );
          allResults.push(...items);
        }
      } catch (err) {
        // Continue with next query
      }
    }

    // Deduplicate by ID
    const seen = new Set<number>();
    return allResults.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return item.poster_path; // Only include items with posters
    }).slice(0, 50); // Limit to 50 items
  } catch (error) {
    console.error("OMDB API error:", error);
    return [];
  }
};

// Get titles by genre (OMDB doesn't have direct genre search, so we use popular searches)
export const getOMDBByGenre = async (
  genre: string,
  type?: "movie" | "series",
  page: number = 1
): Promise<Item[]> => {
  try {
    if (!OMDB_API_KEY || OMDB_API_KEY === "demo") {
      console.warn("OMDB API key not configured");
      return [];
    }

    const query = `${genre} ${type || "movie"}`;
    
    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        s: query,
        type: type,
        page: page,
      },
      timeout: 10000,
    });

    if (response.data?.Response === "True" && response.data?.Search) {
      return response.data.Search
        .filter((title: OMDBTitle) => 
          title.Genre?.toLowerCase().includes(genre.toLowerCase())
        )
        .map((title: OMDBTitle, index: number) => 
          convertOMDBToItem(title, index)
        );
    }

    return [];
  } catch (error) {
    console.error("OMDB API error:", error);
    return [];
  }
};
