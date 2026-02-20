// RapidAPI Streaming Availability Integration
// API Key: 657ad5984dmshd705a0d17442ac1p1a4f55jsn028771a8955f

import axios from "axios";
import { Item } from "../shared/types";

const RAPIDAPI_KEY = "657ad5984dmshd705a0d17442ac1p1a4f55jsn028771a8955f";
const RAPIDAPI_BASE_URL = "https://streaming-availability.p.rapidapi.com";

export interface StreamingAvailabilityTitle {
  imdbId?: string;
  tmdbId?: number;
  title: string;
  type: "movie" | "series";
  year: number;
  overview?: string;
  posterURLs?: {
    original?: string;
    medium?: string;
    thumbnail?: string;
  };
  backdropURLs?: {
    original?: string;
    medium?: string;
    thumbnail?: string;
  };
  streamingInfo?: {
    [country: string]: {
      [service: string]: Array<{
        type?: string;
        quality?: string;
        link?: string;
      }>;
    };
  };
}

export interface StreamingSearchResponse {
  result: StreamingAvailabilityTitle[];
  hasMore?: boolean;
  nextCursor?: string;
}

// Convert Streaming Availability title to Item format
export const convertStreamingToItem = (title: StreamingAvailabilityTitle): Item => {
  return {
    id: title.tmdbId || parseInt(title.imdbId?.replace("tt", "") || "0") || Date.now(),
    title: title.title,
    name: title.title,
    overview: title.overview || "",
    poster_path: title.posterURLs?.original || title.posterURLs?.medium || title.posterURLs?.thumbnail || "",
    backdrop_path: title.backdropURLs?.original || title.backdropURLs?.medium || title.backdropURLs?.thumbnail || "",
    media_type: title.type === "movie" ? "movie" : "tv",
    vote_average: 0,
    vote_count: 0,
    popularity: 0,
    release_date: title.year ? `${title.year}-01-01` : undefined,
    first_air_date: title.year ? `${title.year}-01-01` : undefined,
    genre_ids: [],
    original_language: "en",
  } as Item;
};

// Search titles
export const searchStreamingTitles = async (
  query: string,
  type?: "movie" | "series",
  country: string = "us",
  page?: number
): Promise<Item[]> => {
  try {
    const response = await axios.get(`${RAPIDAPI_BASE_URL}/search/title`, {
      params: {
        title: query,
        country: country,
        show_type: type,
        output_language: "en",
      },
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "streaming-availability.p.rapidapi.com",
      },
      timeout: 10000,
    });

    if (response.data?.result && Array.isArray(response.data.result)) {
      return response.data.result.map(convertStreamingToItem);
    }

    return [];
  } catch (error) {
    console.error("RapidAPI Streaming Availability error:", error);
    return [];
  }
};

// Get titles by filters
export const getStreamingTitles = async (
  type?: "movie" | "series",
  country: string = "us",
  genre?: string,
  page?: number
): Promise<Item[]> => {
  try {
    const params: any = {
      country,
      output_language: "en",
      order_by: "original_title",
      show_type: type,
    };

    if (genre) {
      params.genres = genre;
    }

    const response = await axios.get(`${RAPIDAPI_BASE_URL}/search/filters`, {
      params,
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "streaming-availability.p.rapidapi.com",
      },
      timeout: 10000,
    });

    if (response.data?.result && Array.isArray(response.data.result)) {
      return response.data.result.map(convertStreamingToItem);
    }

    return [];
  } catch (error) {
    console.error("RapidAPI Streaming Availability error:", error);
    return [];
  }
};
