// src/services/youtube.ts
import axios from "axios";
import { classifyVideo, VideoType } from "../shared/videoClassification";
import { getCachedYouTubeResults, setCachedYouTubeResults } from "./youtubeCache";

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

// Redirect all YouTube requests to the secure Firebase Proxy
const FIREBASE_REGION = "us-central1";
const PROJECT_ID = "streamlux-67a84"; 
const PROXY_URL = `https://${FIREBASE_REGION}-${PROJECT_ID}.cloudfunctions.net/proxyYouTube`;

/**
 * Build a proxy execution payload for a given region or genre.
 */
async function executeYouTubeProxy(endpoint: string, params: Record<string, string | number>) {
    const payload = {
        data: {
            endpoint,
            params
        }
    };
    
    // HttpsCallable functions require POST
    const response = await axios.post(PROXY_URL, payload);
    
    // Unwrap Firebase wrapper
    let actualData = response.data;
    if (actualData?.result) actualData = actualData.result;
    
    // Unwrap Proxy Wrapper
    if (actualData && actualData.success && actualData.data) {
        return actualData.data;
    }
    
    return actualData;
}

/**
 * Fetch videos for a given keyword (region, genre, or custom query).
 * Returns an array of YouTubeVideo objects.
 */
export async function fetchYouTubeVideos(
    query: string,
    pageToken?: string,
    videoDuration?: 'any' | 'long' | 'medium' | 'short'
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
    try {
        // Only cache the first page of broad searches
        if (!pageToken && !videoDuration) {
            const cachedParams = await getCachedYouTubeResults(query);
            if (cachedParams) {
                console.log(`[YouTube Cache Hit]: ${query}`);
                return cachedParams;
            }
        }

        const params: Record<string, string | number> = { 
            q: query,
            part: "snippet",
            type: "video",
            maxResults: 20
        };
        
        if (pageToken) params["pageToken"] = pageToken;
        if (videoDuration) params["videoDuration"] = videoDuration;

        const data = await executeYouTubeProxy("/search", params);
        if (!data || !data.items) {
             console.warn("YouTube proxy returned empty items for queries: ", query);
             return { videos: [], nextPageToken: undefined };
        }
        const items = data.items as any[];
        
        const videos: YouTubeVideo[] = items.map((item) => {
            const { videoId } = item.id;
            const { title, description, thumbnails, channelTitle } = item.snippet;
            return {
                id: videoId || Math.random().toString(36).substring(7),
                title,
                description,
                thumbnail: thumbnails?.high?.url ?? thumbnails?.default?.url ?? "",
                channelTitle,
                type: classifyVideo(title, description),
            };
        });
        
        // Cache the successful result if it's a first-page broad search
        if (!pageToken && !videoDuration && videos.length > 0) {
            await setCachedYouTubeResults(query, videos, data.nextPageToken);
        }

        return { videos, nextPageToken: data.nextPageToken };
    } catch (error: any) {
        console.error('YouTube Proxy API error:', error?.message || error);
        // Quota rotation is now handled automatically on the backend!
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
        const params = {
            part: "snippet,statistics,contentDetails",
            id: videoId
        };
        const data = await executeYouTubeProxy("/videos", params);
        
        const item = data.items?.[0];
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
    } catch (error: any) {
        console.warn("[Quota Failsafe] Returning mock detail for", videoId);
        
        // Failsafe: Return a mock valid YouTubeVideoExtended so the watch page doesn't crash on 403/404
        return {
            id: videoId,
            title: "YouTube Content", // Basic fallback title
            description: "This video details are temporarily restricted by API quotas, but you can still watch the video below.",
            thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            channelTitle: "YouTube Stream",
            channelId: "UC",
            publishedAt: new Date().toISOString(),
            type: "movie",
            duration: 5400, // 1.5 hr fallback
            viewCount: "1000",
            likeCount: "100",
            commentCount: "10",
        } as YouTubeVideoExtended;
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
        const params = {
            part: "snippet",
            videoId: videoId,
            maxResults: 10
        };
        const data = await executeYouTubeProxy("/commentThreads", params);
        
        return data.items.map((item: any) => ({
            id: item.id,
            author: item.snippet.topLevelComment.snippet.authorDisplayName,
            content: item.snippet.topLevelComment.snippet.textDisplay,
            createdAt: item.snippet.topLevelComment.snippet.publishedAt,
            avatar: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
        }));
    } catch (error: any) {
        console.error("YouTube Proxy Comments Error:", error.message);
        return [];
    }
}

export async function getYouTubeSeriesEpisodes(seriesTitle: string, channelId: string): Promise<YouTubeVideo[]> {
    try {
        const params = {
            part: "snippet",
            channelId: channelId,
            q: seriesTitle,
            type: "video",
            maxResults: 50,
            order: "date"
        };
        const data = await executeYouTubeProxy("/search", params);
        
        const items = data.items as any[];
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
    } catch (error: any) {
        console.error("YouTube Proxy Episodes Error:", error.message);
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
        const url = `https://www.googleapis.com/youtube/v3/videos?key=${key}&part=snippet&chart=mostPopular&maxResults=1`;
        await axios.get(url);
        return true;
    } catch (error) {
        return false;
    }
}
