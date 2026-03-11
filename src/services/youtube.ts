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
    publishedAt?: string;
    viewCount?: string;
}

// Fallback to Firebase API key if dedicated YouTube key is missing
// The user provided multiple keys to rotate when quota limits are reached
const API_KEYS = [
    "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc",
    "AIzaSyAQOFn1SVkbrQDJn7VeRMs5vAV1mYErImM",
    "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
    process.env.REACT_APP_YOUTUBE_API_KEY || "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY" // Default fallback
];
let currentKeyIndex = 0;

const getActiveKey = () => API_KEYS[currentKeyIndex];

const rotateKey = () => {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    console.warn(`[YouTube API] Quota exceeded. Rotating to key index ${currentKeyIndex}`);
};

const BASE_URL = "https://www.googleapis.com/youtube/v3";

if (!process.env.REACT_APP_YOUTUBE_API_KEY) {
    console.info("[ShortsEngine] Using fallback API keys for YouTube services.");
}

/**
 * Build a search query for a given region or genre.
 * The `region` parameter maps to a YouTube channel or a search keyword.
 */
function buildQueryParams(params: Record<string, string | number>, keyOverride?: string) {
    const url = new URL(BASE_URL + "/search");
    url.searchParams.append("key", keyOverride || getActiveKey());
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
    pageToken?: string,
    videoDuration?: 'any' | 'long' | 'medium' | 'short',
    retryCount = 0
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
    try {
        const params: Record<string, string | number> = { q: query };
        if (pageToken) params["pageToken"] = pageToken;
        if (videoDuration) params["videoDuration"] = videoDuration;

        const url = buildQueryParams(params);
        const response = await axios.get(url, { timeout: 10000 });
        const items = response.data.items as any[];
        const videos: YouTubeVideo[] = items.map((item) => {
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
        });
        return { videos, nextPageToken: response.data.nextPageToken };
    } catch (error: any) {
        if (error?.response?.status === 403 && retryCount < API_KEYS.length) {
            rotateKey();
            // Wait briefly before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
            return fetchYouTubeVideos(query, pageToken, videoDuration, retryCount + 1);
        }
        console.error('YouTube API error:', error?.message || error);
        // Return empty array instead of throwing
        return { videos: [], nextPageToken: undefined };
    }
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

// Additional YouTube service functions

export interface YouTubeVideoExtended extends YouTubeVideo {
    channelId: string;
    publishedAt: string;
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
    duration?: number;
    tags?: string[];
}

function parseDuration(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = parseInt(match?.[1] || "0");
    const minutes = parseInt(match?.[2] || "0");
    const seconds = parseInt(match?.[3] || "0");
    return hours * 3600 + minutes * 60 + seconds;
}

export async function getYouTubeVideoDetail(videoId: string): Promise<YouTubeVideoExtended | null> {
    try {
        if (!getActiveKey()) {
            console.warn('YouTube API key not configured');
            return null;
        }
        const url = `${BASE_URL}/videos?key=${getActiveKey()}&part=snippet,statistics,contentDetails&id=${videoId}`;
        const response = await axios.get(url, { timeout: 10000 });
        const item = response.data.items[0];
        if (!item) return null;

        const { title, description, thumbnails, channelTitle, channelId, publishedAt, tags } = item.snippet;
        const { viewCount, likeCount, commentCount } = item.statistics;
        const { duration } = item.contentDetails;

        return {
            id: videoId,
            title,
            description,
            thumbnail: thumbnails?.high?.url ?? thumbnails?.default?.url ?? "",
            channelTitle,
            channelId,
            publishedAt,
            tags,
            viewCount,
            likeCount,
            commentCount,
            duration: parseDuration(duration),
            type: classifyVideo(title, description, parseDuration(duration)),
        };
    } catch (error) {
        console.error("Error fetching video detail", error);
        return null;
    }
}

export async function getRelatedVideos(videoId: string): Promise<YouTubeVideo[]> {
    try {
        const detail = await getYouTubeVideoDetail(videoId);
        if (!detail) return [];
        const result = await fetchYouTubeVideos(detail.title);
        return result.videos.filter(v => v.id !== videoId);
    } catch (error) {
        return [];
    }
}

export async function getYouTubeComments(videoId: string): Promise<any[]> {
    try {
        const url = `${BASE_URL}/commentThreads?key=${getActiveKey()}&part=snippet&videoId=${videoId}&maxResults=10`;
        const response = await axios.get(url);
        return response.data.items.map((item: any) => ({
            id: item.id,
            author: item.snippet.topLevelComment.snippet.authorDisplayName,
            content: item.snippet.topLevelComment.snippet.textDisplay,
            createdAt: item.snippet.topLevelComment.snippet.publishedAt,
            avatar: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
        }));
    } catch (error) {
        return [];
    }
}

export async function getYouTubeSeriesEpisodes(seriesTitle: string, channelId: string): Promise<YouTubeVideo[]> {
    try {
        const url = `${BASE_URL}/search?key=${getActiveKey()}&part=snippet&channelId=${channelId}&q=${encodeURIComponent(seriesTitle)}&type=video&maxResults=50&order=date`;
        const response = await axios.get(url);
        const items = response.data.items as any[];
        return items.map((item) => {
            const { videoId } = item.id;
            const { title, description, thumbnails, channelTitle, publishedAt } = item.snippet;
            return {
                id: videoId,
                title,
                description,
                thumbnail: thumbnails?.high?.url ?? thumbnails?.default?.url ?? "",
                channelTitle,
                channelId,
                publishedAt,
                type: 'tv' as VideoType,
            };
        });
    } catch (error) {
        console.error("Error fetching series episodes", error);
        return [];
    }
}

export function calculateRating(views?: string, likes?: string): number {
    if (!views || !likes) return 7.5;
    const v = parseInt(views);
    const l = parseInt(likes);
    if (v === 0) return 7.5;

    const ratio = l / v;
    let rating = 5 + (ratio * 100);
    return Math.min(10, Math.max(1, parseFloat(rating.toFixed(1))));
}

export async function validateYouTubeKey(key: string): Promise<boolean> {
    try {
        const url = `${BASE_URL}/videos?key=${key}&part=snippet&chart=mostPopular&maxResults=1`;
        await axios.get(url);
        return true;
    } catch (error) {
        return false;
    }
}
