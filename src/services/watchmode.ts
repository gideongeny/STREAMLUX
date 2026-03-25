// WatchMode API Integration
// API Key: hYQoz7vtpJ0hp4vysj5KuZlmSN1PcxWwEklLGquM

import axios from "axios";
import { Item } from "../shared/types";

const WATCHMODE_API_KEY = "hYQoz7vtpJ0hp4vysj5KuZlmSN1PcxWwEklLGquM";
const WATCHMODE_BASE_URL = "https://api.watchmode.com/v1";

export interface WatchModeTitle {
  id: number;
  title: string;
  type: "movie" | "tv_series";
  year: number;
  imdb_id?: string;
  tmdb_id?: number;
  tmdb_type?: "movie" | "tv";
  poster?: string;
  backdrop?: string;
  plot_overview?: string;
  source_ids?: number[];
  rating?: number;
  vote_count?: number;
}

export interface WatchModeSearchResponse {
  titles: WatchModeTitle[];
  page?: number;
  page_size?: number;
  total_results?: number;
}

// Convert WatchMode title to Item format
export const convertWatchModeToItem = (title: WatchModeTitle): Item => {
  return {
    id: title.tmdb_id || title.id,
    title: title.title,
    name: title.title,
    overview: title.plot_overview || "",
    poster_path: title.poster || "",
    backdrop_path: title.backdrop || "",
    media_type: title.type === "movie" ? "movie" : "tv",
    vote_average: title.rating || 0,
    vote_count: title.vote_count || 0,
    popularity: title.vote_count || 0,
    release_date: title.year ? `${title.year}-01-01` : undefined,
    first_air_date: title.year ? `${title.year}-01-01` : undefined,
    genre_ids: [],
    original_language: "en",
  } as Item;
};

// Search titles
export const searchWatchModeTitles = async (
  query: string,
  type?: "movie" | "tv_series",
  page: number = 1
): Promise<Item[]> => {
  try {
    const params: any = {
      apiKey: WATCHMODE_API_KEY,
      search_field: "name",
      search_value: query,
      page,
    };

    if (type) {
      params.types = type;
    }

    const response = await axios.get(`${WATCHMODE_BASE_URL}/autocomplete-search/`, {
      params,
      timeout: 10000,
    });

    if (response.data?.titles && Array.isArray(response.data.titles)) {
      return response.data.titles.map(convertWatchModeToItem);
    }

    return [];
  } catch (error) {
    console.error("WatchMode API error:", error);
    return [];
  }
};

// Get popular titles
export const getWatchModePopular = async (
  type?: "movie" | "tv_series",
  page: number = 1
): Promise<Item[]> => {
  try {
    const params: any = {
      apiKey: WATCHMODE_API_KEY,
      sort_by: "popularity_score",
      sort_order: "desc",
      page,
      limit: 50,
    };

    if (type) {
      params.types = type;
    }

    const response = await axios.get(`${WATCHMODE_BASE_URL}/list-titles/`, {
      params,
      timeout: 10000,
    });

    if (response.data?.titles && Array.isArray(response.data.titles)) {
      return response.data.titles.map(convertWatchModeToItem);
    }

    return [];
  } catch (error) {
    console.error("WatchMode API error:", error);
    return [];
  }
};

// Get titles by genre
export const getWatchModeByGenre = async (
  genreId: number,
  type?: "movie" | "tv_series",
  page: number = 1
): Promise<Item[]> => {
  try {
    const params: any = {
      apiKey: WATCHMODE_API_KEY,
      genres: genreId,
      page,
      limit: 50,
    };

    if (type) {
      params.types = type;
    }

    const response = await axios.get(`${WATCHMODE_BASE_URL}/list-titles/`, {
      params,
      timeout: 10000,
    });

    if (response.data?.titles && Array.isArray(response.data.titles)) {
      return response.data.titles.map(convertWatchModeToItem);
    }

    return [];
  } catch (error) {
    console.error("WatchMode API error:", error);
    return [];
  }
};
