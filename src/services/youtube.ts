// src/services/youtube.ts
import axios from "axios";
import { classifyVideo, VideoType } from "../shared/videoClassification";
import { CacheService } from "./cache";
import { REGIONAL_CHANNELS, REGIONAL_SEARCH_QUERIES } from "../shared/regionalChannels";
import { pipedService } from "./piped";
import { logger } from "../utils/logger";

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  type: VideoType;
  duration?: number;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  publishedAt?: string;
  tags?: string[];
}

const getYouTubeApiKeys = (): string[] => {
  const primaryKey = process.env.REACT_APP_YOUTUBE_API_KEY;
  const fallbackKeys = process.env.REACT_APP_YOUTUBE_FALLBACK_KEYS
    ? process.env.REACT_APP_YOUTUBE_FALLBACK_KEYS.split(',').map(k => k.trim()).filter(Boolean)
    : [
        "AIzaSyDiVIkSR8xWqbAvMWVPLX6DHY6ak0Rv45o", // User provided key
        "AIzaSyDbTHAbBxPWdvKWjbWG_xcd8-09t3w-CCI",
        "AIzaSyD-a127DhdfAMABKkKwMOxfBZSG18RjAUU",
        "AIzaSyDa8q95gdMLye6qr3s2u8Kj-0AOnyZFlKM",
        "AIzaSyAU0j_L3w2nsH7_5qc56cPfBBBVlmqdikc"
      ];
  
  return [primaryKey, ...fallbackKeys].filter(Boolean) as string[];
};

const API_KEYS = getYouTubeApiKeys();

let currentKeyIndex = 0;

const getApiKey = () => {
  const userKey = typeof window !== 'undefined' ? localStorage.getItem("user_youtube_api_key") : null;
  // Check if this specific user key has failed recently (in memory)
  if (userKey && !failedUserKeys.has(userKey)) return userKey;
  return API_KEYS[currentKeyIndex];
};

// Track failed user keys in memory for the current session
const failedUserKeys = new Set<string>();

const rotateApiKey = () => {
  const userKey = typeof window !== 'undefined' ? localStorage.getItem("user_youtube_api_key") : null;

  // If we were using a user key and it failed
  if (userKey && !failedUserKeys.has(userKey)) {
    logger.warn("User provided key failed. Falling back to default pool for this session.");
    failedUserKeys.add(userKey);
    // Don't rotate index yet, just let the next call pick up the default key
    return;
  }

  // Otherwise rotate the default pool
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  logger.log(`Rotating to YouTube API Key index: ${currentKeyIndex}`);
};

/**
 * Validate a YouTube API key by making a minimal request.
 */
export async function validateYouTubeKey(key: string): Promise<boolean> {
  try {
    // Search for something generic and static with maxResults 1 to minimize cost
    await axios.get(`${BASE_URL}/search`, {
      params: {
        part: "snippet",
        q: "test",
        maxResults: 1,
        type: "video",
        key: key,
      },
    });
    return true;
  } catch (error) {
    logger.error("API Key Validation Failed:", error);
    return false;
  }
}

const BASE_URL = "https://www.googleapis.com/youtube/v3";

const youtube = axios.create({
  baseURL: BASE_URL,
  timeout: 5000, // 5 second timeout to prevent infinite loading
});



/**
 * Fetch video details (including duration) for a list of video IDs.
 */
export async function fetchVideosDetail(ids: string[]): Promise<any[]> {
  if (ids.length === 0) return [];
  try {
    const response = await youtube.get("/videos", {
      params: {
        part: "snippet,contentDetails,statistics,status",
        id: ids.join(","),
        key: getApiKey(),
      },
    });
    return response.data.items;
  } catch (error: unknown) {
    const isQuotaError = (error as { response?: { status?: number } })?.response?.status === 403 || 
                         (error as { response?: { status?: number } })?.response?.status === 429;
    if (isQuotaError) {
      logger.warn("YouTube API quota exhausted. Returning empty video details.");
    } else {
      logger.error("Error fetching video details:", error);
    }
    return [];
  }
}

/**
 * Converts ISO 8601 duration string (e.g. PT1H2M10S) to seconds.
 */
function parseDuration(duration: string | undefined | null): number {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  return hours * 3600 + minutes * 60 + seconds;
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
 * Fetch videos for a given keyword.
 */


/**
 * Fetch videos for a given keyword.
 * Strategy: Cache -> Piped (Unlimited) -> Official API (Backup) -> RSS (Last Resort)
 */
export async function fetchYouTubeVideos(
  query: string,
  pageToken?: string,
  type: "movie" | "tv" | "multi" | "all" = "movie",
  retryCount = 0
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string; error?: string }> {
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
  const cacheKey = `search_${optimizedQuery}_${pageToken || 'p0'}`;

  // 1. Check Cache First
  if (retryCount === 0) {
    const cachedData = CacheService.get<{ videos: YouTubeVideo[]; nextPageToken?: string }>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  // 2. Try Piped API (Unlimited Search) - Primary Source
  try {
    logger.log(`[Piped] Searching for: ${optimizedQuery}`);
    const pipedVideos = await pipedService.search(optimizedQuery);

    // Filter results
    const finalVideos = type === 'tv'
      ? pipedVideos.filter(v => v.type === 'tv')
      : type === 'movie'
        ? pipedVideos.filter(v => v.type === 'movie')
        : pipedVideos;

    if (finalVideos.length > 0) {
      const result = { videos: finalVideos, nextPageToken: undefined }; // Piped pagination is complex, treating as single page for now
      CacheService.set(cacheKey, result);
      return result;
    } else {
      throw new Error("Piped returned empty results, likely strict filtering or instance limits");
    }

  } catch (pipedError) {
    logger.warn("Piped API failed, falling back to Official YouTube API:", pipedError);
    // Proceed to Official API fallback below...
  }

  // 3. Fallback to Official YouTube Data API
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
      .map((item: any) => {
        const duration = parseDuration(item.contentDetails.duration);
        return {
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          channelTitle: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          type: classifyVideo(item.snippet.title, item.snippet.description, duration),
          duration: duration,
        };
      })
      .filter((video: any) => video.type !== "other" && !isLowQuality(video.title));

    const finalVideos = type === 'tv'
      ? videos.filter(v => v.type === 'tv')
      : type === 'movie'
        ? videos.filter(v => v.type === 'movie')
        : videos.filter(v => v.type !== 'shorts'); // Default: Exclude shorts to prevent mixing

    const result = { videos: finalVideos, nextPageToken: searchResponse.data.nextPageToken };

    if (finalVideos.length > 0) {
      CacheService.set(cacheKey, result);
    }

    return result;
  } catch (error: any) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    const isQuotaError = errorMsg?.toLowerCase().includes("quota") ||
      errorMsg?.toLowerCase().includes("unavailable") ||
      error.response?.status === 403 ||
      error.response?.status === 429;

    if (isQuotaError) {
      if (retryCount < API_KEYS.length) {
        logger.warn(`YouTube API quota exhausted. Rotating key...`);
        rotateApiKey();
        return fetchYouTubeVideos(query, pageToken, type, retryCount + 1);
      } else {
        // All Keys Exhausted - The ultimate backup is RSS if we had channel IDs, but for *search* we can't easily RSS fallback without a channel.
        // We could try Piped one last time with a fresh instance maybe?
        return { videos: [], nextPageToken: undefined, error: "QUOTA_EXCEEDED" };
      }
    }

    return { videos: [], nextPageToken: undefined, error: errorMsg };
  }
}

/**
 * Get a single video's full details for the Detail page.
 */
export async function getYouTubeVideoDetail(id: string): Promise<YouTubeVideo | null> {
  const cacheKey = `video_detail_${id}`;
  const cached = CacheService.get<YouTubeVideo>(cacheKey);
  if (cached) return cached;

  const details = await fetchVideosDetail([id]);
  if (!details || details.length === 0) return null;
  const item = details[0];
  const video: YouTubeVideo = {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    type: classifyVideo(item.snippet.title, item.snippet.description, parseDuration(item.contentDetails.duration)),
    duration: parseDuration(item.contentDetails.duration),
    viewCount: item.statistics.viewCount,
    likeCount: item.statistics.likeCount,
    commentCount: item.statistics.commentCount,
    publishedAt: item.snippet.publishedAt,
    tags: item.snippet.tags,
  };

  CacheService.set(cacheKey, video);
  return video;
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

    return details.map((item: any) => {
      const duration = parseDuration(item.contentDetails.duration);
      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        type: classifyVideo(item.snippet.title, item.snippet.description, duration),
        duration: duration,
      };
    });
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    const isQuotaError = err.response?.status === 403 || err.response?.status === 429;
    if (isQuotaError) {
      logger.warn("YouTube API quota exhausted. Returning empty related videos.");
    } else {
      logger.error("Error fetching related videos:", error);
    }
    return [];
  }
}

/**
 * Fetch episodes for a series (same channel, similar title).
 */
export async function getYouTubeSeriesEpisodes(title: string, channelId?: string): Promise<YouTubeVideo[]> {
  // Clean title: remove "Episode 1", "Season 1", "S1", date parts, etc. to get series base name
  const baseTitle = title
    .replace(/\b(Ep|Episode|Part|Season|S)\s*\d+/gi, "")
    .replace(/\|\s*/g, " ")
    .replace(/\s*-\s*/g, " ")
    .replace(/\b(Full Episode|Official)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const query = `${baseTitle} full episode`;

  try {
    const response = await youtube.get("/search", {
      params: {
        part: "snippet",
        maxResults: 50, // Fetch more for full season
        q: query,
        type: "video",
        ...(channelId && { channelId: channelId }), // Restrict to same channel if provided
        key: getApiKey(),
      },
    });

    if (!response.data.items || response.data.items.length === 0) return [];

    const ids = response.data.items.map((item: any) => item.id.videoId);
    const details = await fetchVideosDetail(ids);

    return details
      .filter((item: any) => {
        // 1. Strict Title Match: Must contain the base title (case-insensitive)
        const itemTitle = item.snippet.title.toLowerCase();
        // Only use words longer than 2 chars to avoid matching "in", "at", "the"
        const requiredTerms = baseTitle.toLowerCase().split(' ').filter(word => word.length > 2);
        const matchesTitle = requiredTerms.every(term => itemTitle.includes(term));

        // 2. Playability Check: Must be embeddable
        const isEmbeddable = item.status?.embeddable === true;

        return matchesTitle && isEmbeddable;
      })
      .map((item: any) => {
        const duration = parseDuration(item.contentDetails.duration);
        return {
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          channelTitle: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          type: classifyVideo(item.snippet.title, item.snippet.description, duration),
          duration: duration,
        };
      });
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    const isQuotaError = err.response?.status === 403 || err.response?.status === 429;
    if (isQuotaError) {
      logger.warn("YouTube API quota exhausted. Returning empty episodes.");
    } else {
      logger.error("Error fetching series episodes:", error);
    }
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
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    const isQuotaError = err.response?.status === 403 || err.response?.status === 429;
    if (isQuotaError) {
      logger.warn("YouTube API quota exhausted. Returning empty comments.");
    } else {
      logger.error("Error fetching YouTube comments:", error);
    }
    return [];
  }
}

/**
 * Map Explore page region codes to internal configuration keys
 */
const REGION_MAPPING: Record<string, keyof typeof REGIONAL_CHANNELS> = {
  "philippines": "filipino",
  "korea": "korean",
  "south-korea": "korean",
  "china": "chinese",
  "japan": "japanese",
  "latin": "latino",
  "bollywood": "indian",
  "india": "indian",
  "nollywood": "african",
  "africa": "african",
  "turkey": "turkish",
  "turkish": "turkish"
};

export async function fetchByRegion(
  region: string,
  pageToken?: string,
  type: "movie" | "tv" | "multi" | "all" = "movie"
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string; error?: string }> {
  const mappedRegion = REGION_MAPPING[region.toLowerCase()] || region.toLowerCase();

  // Check if we have specific channels for this region
  if (mappedRegion in REGIONAL_CHANNELS) {
    const channels = Object.values(REGIONAL_CHANNELS[mappedRegion as keyof typeof REGIONAL_CHANNELS]) as string[];

    // Use channel-based fetching for accuracy
    // Note: fetchFromChannels currently returns all videos without pagination token support in the return type
    // We might need to enhance it or accept that channel search is "best match" first
    const channelResult = await fetchFromChannels(channels, type === 'multi' || type === 'all' ? 'movie' : type);

    if (channelResult.videos.length > 0) {
      return { videos: channelResult.videos, nextPageToken: undefined };
    }
  }

  // Fallback to strict search queries if channel fetch fails or no channels defined
  let query = region;
  if (mappedRegion in REGIONAL_SEARCH_QUERIES) {
    const queries = REGIONAL_SEARCH_QUERIES[mappedRegion as keyof typeof REGIONAL_SEARCH_QUERIES];
    // Pick a random specific query for variety, or the first one
    query = queries[0];
  }

  return fetchYouTubeVideos(query, pageToken, type);
}

export const fetchByCategory = (category: string, pageToken?: string, type: "movie" | "tv" | "multi" | "all" = "movie") =>
  fetchYouTubeVideos(category, pageToken, type);

/**
 * Fetch videos from specific channels (for regional content like Filipino, Turkish, etc.)
 */
export async function fetchFromChannels(
  channelIds: string[],
  type: "movie" | "tv" = "movie",
  maxResults: number = 50
): Promise<{ videos: YouTubeVideo[]; error?: string }> {
  try {
    const allVideos: YouTubeVideo[] = [];

    for (const channelId of channelIds) {
      const cacheKey = `channel_${channelId}_${type}`;
      const cached = CacheService.get<YouTubeVideo[]>(cacheKey);

      if (cached) {
        allVideos.push(...cached);
        continue;
      }

      const response = await youtube.get("/search", {
        params: {
          part: "snippet",
          channelId: channelId,
          maxResults: Math.min(maxResults, 50),
          order: "date", // Latest uploads
          type: "video",
          key: getApiKey(),
        },
      });

      if (!response.data.items || response.data.items.length === 0) continue;

      const videoIds = response.data.items.map((item: any) => item.id.videoId);
      const details = await fetchVideosDetail(videoIds);

      const videos: YouTubeVideo[] = details
        .map((item: any) => {
          const duration = parseDuration(item.contentDetails.duration);
          return {
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            channelTitle: item.snippet.channelTitle,
            channelId: item.snippet.channelId,
            type: classifyVideo(item.snippet.title, item.snippet.description, duration),
            duration: duration,
            publishedAt: item.snippet.publishedAt,
          };
        })
        .filter((video: any) => {
          if (video.type === 'shorts') return false; // STRICT: No shorts in channels lists
          if (type === 'tv') return video.type === 'tv';
          if (type === 'movie') return video.type === 'movie';
          return true;
        });

      CacheService.set(cacheKey, videos);
      allVideos.push(...videos);
    }

    return { videos: allVideos };
  } catch (error: any) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    const isQuotaError = errorMsg?.toLowerCase().includes("quota") ||
      errorMsg?.toLowerCase().includes("unavailable") ||
      error.response?.status === 403 ||
      error.response?.status === 429;

    if (isQuotaError) {
      logger.warn("YouTube API Quota Exceeded in fetchFromChannels. Switching to RSS Fallback.");
      try {
        const rssPromises = channelIds.map(cid => fetchRSSVideos(cid, type));
        const rssResults = await Promise.all(rssPromises);
        const rssVideos = rssResults.flat();
        return { videos: rssVideos };
      } catch (rssError) {
        logger.error("RSS Fallback also failed:", rssError);
        return { videos: [], error: "API_AND_RSS_FAILED" };
      }
    }

    logger.error("Error fetching from channels:", errorMsg);
    return { videos: [], error: errorMsg };
  }
}

/**
 * Fallback: Fetch latest videos from YouTube RSS feed via CORS proxy
 * URL: https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}
 */
async function fetchRSSVideos(channelId: string, type: "movie" | "tv" = "movie"): Promise<YouTubeVideo[]> {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    // Use allorigins.win as a free CORS proxy
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;

    const response = await fetch(proxyUrl);
    if (!response.ok) return [];

    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    const entries = Array.from(xml.querySelectorAll("entry"));

    return entries.map(entry => {
      const videoId = entry.getElementsByTagName("yt:videoId")[0]?.textContent || "";
      const title = entry.getElementsByTagName("title")[0]?.textContent || "";
      const group = entry.getElementsByTagName("media:group")[0];
      const description = group?.getElementsByTagName("media:description")[0]?.textContent || "";
      const thumbnail = group?.getElementsByTagName("media:thumbnail")[0]?.getAttribute("url") || "";
      const community = group?.getElementsByTagName("media:community")[0];
      const views = community?.getElementsByTagName("media:statistics")[0]?.getAttribute("views") || "0";
      const rating = community?.getElementsByTagName("media:starRating")[0]?.getAttribute("count") || "0";
      const published = entry.getElementsByTagName("published")[0]?.textContent || "";
      const authorName = entry.getElementsByTagName("author")[0]?.getElementsByTagName("name")[0]?.textContent || "";

      return {
        id: videoId,
        title: title,
        description: description,
        thumbnail: thumbnail,
        channelTitle: authorName,
        channelId: channelId,
        type: classifyVideo(title, description),
        duration: 0, // RSS does not provide duration
        viewCount: views,
        likeCount: rating,
        publishedAt: published,
        tags: []
      } as YouTubeVideo;
    }).filter(video => {
      if (type === 'tv') return video.type === 'tv';
      if (type === 'movie') return video.type === 'movie';
      return true;
    });

  } catch (e) {
    logger.warn(`RSS Fetch failed for channel ${channelId}`, e);
    return [];
  }
}
