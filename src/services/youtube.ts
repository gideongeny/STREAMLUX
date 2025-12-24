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
  duration?: number;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  publishedAt?: string;
  tags?: string[];
}

const API_KEYS = [
  process.env.REACT_APP_YOUTUBE_API_KEY,
  "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
  "AIzaSyD-a127DhdfAMABKkKwMOxfBZSG18RjAUU",
  "AIzaSyDa8q95gdMLye6qr3s2u8Kj-0AOnyZFlKM",
  "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc"
].filter(Boolean) as string[];

let currentKeyIndex = 0;

const getApiKey = () => API_KEYS[currentKeyIndex];

const rotateApiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  console.log(`Rotating to YouTube API Key index: ${currentKeyIndex}`);
};

const BASE_URL = "https://www.googleapis.com/youtube/v3";

const youtube = axios.create({
  baseURL: BASE_URL,
  timeout: 5000, // 5 second timeout to prevent infinite loading
});

const STUDIOS = ["ABS-CBN Entertainment", "StarTimes", "GMA Network", "FilmRise", "Viu"];

/**
 * Fetch video details (including duration) for a list of video IDs.
 */
export async function fetchVideosDetail(ids: string[]): Promise<any[]> {
  if (ids.length === 0) return [];
  try {
    const response = await youtube.get("/videos", {
      params: {
        part: "snippet,contentDetails,statistics",
        id: ids.join(","),
        key: getApiKey(),
      },
    });
    return response.data.items;
  } catch (error) {
    console.error("Error fetching video details:", error);
    return [];
  }
}

/**
 * Converts ISO 8601 duration string (e.g. PT1H2M10S) to seconds.
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Fetch videos for a given keyword.
 */
export async function fetchYouTubeVideos(
  query: string,
  pageToken?: string,
  type: "movie" | "tv" | "multi" | "all" = "movie"
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string; error?: string }> {
  // Combine keywords for a single efficient search call to save quota
  // Heuristic: Search for both "Movie" and "Official" in one go
  // If the query is just a region or genre, append specifics. If it's a specific search, respect it.
  const isSpecificSearch = query.includes("ABS-CBN") || query.includes("StarTimes") || query.includes("GMA");

  let suffix = "";
  if (!isSpecificSearch) {
    if (type === 'tv') {
      suffix = " full episode series";
    } else if (type === 'movie') {
      suffix = " full movie official";
    } else {
      suffix = " full movie official";
    }
  }

  const optimizedQuery = `${query}${suffix}`;

  try {
    const searchResponse = await youtube.get("/search", {
      params: {
        part: "snippet",
        maxResults: 50,
        q: optimizedQuery,
        type: "video",
        pageToken: pageToken,
        key: getApiKey(),
      },
    });

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return { videos: [], nextPageToken: undefined };
    }

    const videoIds = searchResponse.data.items.map((item: any) => item.id.videoId);
    const details = await fetchVideosDetail(videoIds);

    const videos: YouTubeVideo[] = details
      .map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        type: classifyVideo(item.snippet.title, item.snippet.description),
        duration: parseDuration(item.contentDetails.duration),
      }))
      .filter((video: any) => video.type !== "other" && !isLowQuality(video.title));

    // strict post-filtering
    const finalVideos = type === 'tv'
      ? videos.filter(v => v.type === 'tv')
      : type === 'movie'
        ? videos.filter(v => v.type === 'movie')
        : videos;

    return { videos: finalVideos, nextPageToken: searchResponse.data.nextPageToken };
  } catch (error: any) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    const isQuotaError = errorMsg?.toLowerCase().includes("quota") || error.response?.status === 403;

    if (isQuotaError && API_KEYS.length > 1) {
      rotateApiKey();
      // Retry once with the new key
      return fetchYouTubeVideos(query, pageToken, type);
    }

    console.error("YouTube API Error:", errorMsg);

    if (isQuotaError) {
      return { videos: [], nextPageToken: undefined, error: "QUOTA_EXCEEDED" };
    }

    return { videos: [], nextPageToken: undefined, error: errorMsg };
  }
}

// Helper to detect potential vlogs/low quality content
const isLowQuality = (title: string) => {
  const lower = title.toLowerCase();
  return lower.includes("vlog") ||
    lower.includes("reaction") ||
    lower.includes("review") ||
    lower.includes("gameplay") ||
    lower.includes("tutorial") ||
    lower.includes("unboxing");
};

/**
 * Get a single video's full details for the Detail page.
 */
export async function getYouTubeVideoDetail(id: string): Promise<YouTubeVideo | null> {
  const details = await fetchVideosDetail([id]);
  if (!details || details.length === 0) return null;
  const item = details[0];
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    channelTitle: item.snippet.channelTitle,
    type: classifyVideo(item.snippet.title, item.snippet.description),
    duration: parseDuration(item.contentDetails.duration),
    viewCount: item.statistics.viewCount,
    likeCount: item.statistics.likeCount,
    commentCount: item.statistics.commentCount,
    publishedAt: item.snippet.publishedAt,
    tags: item.snippet.tags,
  };
}

/**
 * Fetch related videos for a given video ID.
 */
export async function getRelatedVideos(videoId: string): Promise<YouTubeVideo[]> {
  try {
    const response = await youtube.get("/search", {
      params: {
        part: "snippet",
        maxResults: 6,
        relatedToVideoId: videoId,
        type: "video",
        key: getApiKey(),
      },
    });

    const ids = response.data.items.map((item: any) => item.id.videoId);
    const details = await fetchVideosDetail(ids);

    return details.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      type: classifyVideo(item.snippet.title, item.snippet.description),
      duration: parseDuration(item.contentDetails.duration),
    }));
  } catch (error) {
    console.error("Error fetching related videos:", error);
    return [];
  }
}

/**
 * Estimate a 1-10 rating based on view/like ratio or just return a default "StreamLux Certified" 9.5
 */
export function calculateRating(viewCount?: string, likeCount?: string): number {
  if (!viewCount || !likeCount) return 9.5;
  const views = parseInt(viewCount);
  const likes = parseInt(likeCount);
  if (views === 0) return 9.0;
  // Heuristic: Likes/Views usually around 2-5%. 5% = 10/10.
  const ratio = (likes / views) * 100;
  const rating = Math.min(10, 8 + (ratio / 2));
  return parseFloat(rating.toFixed(1));
}

/**
 * Fetch top comments for a video and map to StreamLux Reviews format.
 */
export async function getYouTubeComments(videoId: string): Promise<any[]> {
  try {
    const response = await youtube.get("/commentThreads", {
      params: {
        part: "snippet",
        videoId: videoId,
        maxResults: 10,
        order: "relevance",
        key: getApiKey(),
      },
    });

    return response.data.items.map((item: any) => ({
      author: item.snippet.topLevelComment.snippet.authorDisplayName,
      content: item.snippet.topLevelComment.snippet.textDisplay,
      created_at: item.snippet.topLevelComment.snippet.publishedAt,
      author_details: {
        name: item.snippet.topLevelComment.snippet.authorDisplayName,
        username: item.snippet.topLevelComment.snippet.authorDisplayName,
        avatar_path: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
        rating: null
      }
    }));
  } catch (error) {
    console.error("Error fetching YouTube comments:", error);
    return [];
  }
}

export const fetchByRegion = (region: string, pageToken?: string, type: "movie" | "tv" | "multi" | "all" = "movie") =>
  fetchYouTubeVideos(region, pageToken, type);

export const fetchByCategory = (category: string, pageToken?: string, type: "movie" | "tv" | "multi" | "all" = "movie") =>
  fetchYouTubeVideos(category, pageToken, type);
