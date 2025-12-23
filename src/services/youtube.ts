// src/services/youtube.ts
import axios from "axios";
import { classifyVideo, VideoType } from "../shared/videoClassification";

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  type: VideoType;
}

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

/**
 * Build a search query for a given region or genre.
 * The `region` parameter maps to a YouTube channel or a search keyword.
 */
function buildQueryParams(params: Record<string, string | number>) {
  const url = new URL(BASE_URL + "/search");
  url.searchParams.append("key", API_KEY ?? "");
  url.searchParams.append("part", "snippet");
  url.searchParams.append("type", "video");
  url.searchParams.append("maxResults", "20");
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, String(v)));
  return url.toString();
}

/**
 * Fetch videos for a given keyword (region, genre, or custom query).
 * Returns an array of YouTubeVideo objects.
 */
export async function fetchYouTubeVideos(
  query: string,
  pageToken?: string
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
  // Enhance query to find full movies/episodes specifically
  const enhancedQuery = `${query} full movie official`;
  const params: Record<string, string | number> = { q: enhancedQuery };
  if (pageToken) params["pageToken"] = pageToken;

  const url = buildQueryParams(params);
  const response = await axios.get(url);
  const items = response.data.items as any[];
  const videos: YouTubeVideo[] = items
    .map((item) => {
      const { videoId } = item.id;
      const { title, description, thumbnails, channelTitle } = item.snippet;
      return {
        id: videoId,
        title,
        description,
        thumbnail: thumbnails?.high?.url ?? thumbnails?.default?.url ?? "",
        channelTitle,
        type: classifyVideo(title, description),
      };
    })
    .filter((video) => video.type !== "other"); // Strict filtering
  return { videos, nextPageToken: response.data.nextPageToken };
}

/**
 * Helper to fetch videos by region name.
 */
export const fetchByRegion = (region: string, pageToken?: string) =>
  fetchYouTubeVideos(region, pageToken);

/**
 * Helper to fetch videos by genre/category.
 */
export const fetchByCategory = (category: string, pageToken?: string) =>
  fetchYouTubeVideos(category, pageToken);
