import { Item } from "../shared/types";
import axios from "axios";

// 9jarocks.net service for Nollywood and Ghollywood content
// This is a key source for MovieBox-style apps to get local African content

const NINJAROCKS_ENDPOINTS = [
    "https://9jarocks.net",
    "https://9jarocks.me",
    "https://9jarocks.com",
];

const fetch9jaRocks = async (endpoint: string, params?: any): Promise<any> => {
    const promises = NINJAROCKS_ENDPOINTS.map(baseUrl =>
        axios.get(`${baseUrl}${endpoint}`, {
            params,
            timeout: 8000,
            headers: {
                'Accept': 'application/json',
            }
        }).then(res => res.data).catch(() => null)
    );

    const results = await Promise.all(promises);
    return results.find(r => r && (r.results || r.data || Array.isArray(r))) || { results: [] };
};

const convertToItem = (item: any, mediaType: "movie" | "tv"): Item => ({
    id: item.id || item.tmdb_id || `9ja-${Math.random().toString(36).substr(2, 9)}`,
    poster_path: item.poster || item.thumbnail || item.image || "",
    backdrop_path: item.backdrop || item.cover || "",
    title: item.title || item.name || "",
    name: item.name || item.title || "",
    original_title: item.title || "",
    original_name: item.name || "",
    overview: item.description || item.plot || "Local African content via 9jarocks source.",
    release_date: item.year || item.release_date || "",
    first_air_date: item.year || item.first_air_date || "",
    vote_average: item.rating || 0,
    vote_count: item.votes || 0,
    popularity: item.views || 0,
    genre_ids: [],
    original_language: "en",
    media_type: mediaType,
    origin_country: ["NG"],
});

export const getNinjarocksTrending = async (mediaType: "movie" | "tv" | "all" = "all"): Promise<Item[]> => {
    try {
        const data = await fetch9jaRocks("/api/trending", { type: mediaType });
        const results = data.results || data.data || (Array.isArray(data) ? data : []);
        return results.map((item: any) => convertToItem(item, mediaType === "all" ? "movie" : mediaType));
    } catch (error) {
        return [];
    }
};

export const getNinjarocksNollywood = async (page: number = 1): Promise<Item[]> => {
    try {
        const data = await fetch9jaRocks("/api/category/nollywood", { page });
        const results = data.results || data.data || (Array.isArray(data) ? data : []);
        return results.map((item: any) => convertToItem(item, "movie"));
    } catch (error) {
        return [];
    }
};

export const searchNinjarocks = async (query: string): Promise<Item[]> => {
    try {
        const data = await fetch9jaRocks("/api/search", { q: query });
        const results = data.results || data.data || (Array.isArray(data) ? data : []);
        return results.map((item: any) => convertToItem(item, "movie"));
    } catch (error) {
        return [];
    }
};
