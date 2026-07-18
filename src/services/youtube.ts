// src/services/youtube.ts
import axios from "axios";
import api from "../shared/axios";
import { classifyVideo, VideoType } from "../shared/videoClassification";
import { getCachedYouTubeResults, setCachedYouTubeResults } from "./youtubeCache";
import { getBackendBase } from "./download";
import { pipedService } from "./piped";

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

/**
 * Extract and parse InnerTube response structure safely for general videos
 */
const extractInnerTubeVideos = (data: any): YouTubeVideo[] => {
    if (!data) return [];
    try {
        const allItems: any[] = [];
        
        // Helper to recursively find videoRenderer
        const findItems = (obj: any) => {
            if (!obj) return;
            if (Array.isArray(obj)) {
                obj.forEach(findItems);
            } else if (typeof obj === 'object') {
                if (obj.videoRenderer) {
                    allItems.push(obj.videoRenderer);
                }
                Object.values(obj).forEach(findItems);
            }
        };
        
        findItems(data.contents || data);

        return allItems.map((item: any) => {
            const videoId = item.videoId;
            if (!videoId) return null;
            
            const title = item.title?.runs?.[0]?.text || item.title?.simpleText || 'Unknown Video';
            const description = item.descriptionSnippet?.runs?.map((r: any) => r.text).join('') || '';
            
            const thumbnails = item.thumbnail?.thumbnails || [];
            const thumbnail = thumbnails[thumbnails.length - 1]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
            
            const channelTitle = item.ownerText?.runs?.[0]?.text || 'YouTube Channel';
            
            // Duration parsing from lengthText (e.g. "1:24:05" or "4:32")
            let durationSeconds = 0;
            const lengthText = item.lengthText?.simpleText;
            if (lengthText) {
                const parts = lengthText.split(':').map((p: string) => parseInt(p));
                if (parts.length === 2) {
                    durationSeconds = parts[0] * 60 + parts[1];
                } else if (parts.length === 3) {
                    durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                }
            }

            return {
                id: videoId,
                title,
                description,
                thumbnail,
                channelTitle,
                type: classifyVideo(title, description, durationSeconds),
                duration: durationSeconds,
                publishedAt: item.publishedTimeText?.simpleText || new Date().toISOString(),
                viewCount: item.viewCountText?.simpleText || '0 views'
            } as YouTubeVideo;
        }).filter(Boolean) as YouTubeVideo[];
    } catch (e) {
        console.error('[YouTube InnerTube] Failed to parse InnerTube response', e);
        return [];
    }
};

/**
 * Fetch videos from InnerTube Proxy (limitless search)
 */
async function fetchYouTubeVideosInnerTube(query: string): Promise<YouTubeVideo[]> {
    try {
        const response = await api.post('/innertube', {
            endpoint: '/search',
            query: query,
            client: 'WEB'
        });
        const songs = extractInnerTubeVideos(response.data);
        if (songs.length > 0) {
            console.log(`[YouTube InnerTube] Search returned ${songs.length} videos`);
            return songs;
        }
    } catch (e) {
        console.warn('[YouTube InnerTube] Search failed:', e);
    }
    return [];
}

/**
 * Build a proxy execution payload for a given region or genre.
 */
async function executeYouTubeProxy(endpoint: string, params: Record<string, string | number>, context?: string) {
    const response = await api.get('/youtube', {
        params: {
            ...params,
            endpoint,
            context
        }
    });
    
    return response.data;
}

/**
 * Fetch videos for a given keyword (region, genre, or custom query).
 * Returns an array of YouTubeVideo objects.
 */
export async function fetchYouTubeVideos(
    query: string,
    pageToken?: string,
    videoDuration?: 'any' | 'long' | 'medium' | 'short',
    context?: string,
    videoCategoryId?: string,
    videoEmbeddable?: 'true' | 'false'
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
    try {
        // Only cache the first page of broad searches
        if (!pageToken && !videoDuration && !videoCategoryId) {
            const cachedParams = await getCachedYouTubeResults(query);
            if (cachedParams) {
                console.log(`[YouTube Cache Hit]: ${query}`);
                return cachedParams;
            }
        }

        // 1. Attempt InnerTube search first (Music-page limitless method spoofed to general YouTube)
        try {
            let itQuery = query;
            if (videoDuration === 'long') {
                itQuery += ' full movie';
            }
            const itVideos = await fetchYouTubeVideosInnerTube(itQuery);
            if (itVideos && itVideos.length > 0) {
                // Cache the successful result if it's a first-page broad search
                if (!pageToken && !videoDuration) {
                    await setCachedYouTubeResults(query, itVideos, undefined);
                }
                return { videos: itVideos, nextPageToken: undefined };
            }
        } catch (itError) {
            console.warn("[YouTube InnerTube Failed] Falling back to Piped:", itError);
        }

        // 2. Attempt Piped search second (Limitless fallback)
        try {
            const pipedVideos = await pipedService.search(query, "videos");
            if (pipedVideos && pipedVideos.length > 0) {
                console.log(`[YouTube Piped Success] Fetched ${pipedVideos.length} videos for: ${query}`);
                
                // Cache the successful result if it's a first-page broad search
                if (!pageToken && !videoDuration) {
                    await setCachedYouTubeResults(query, pipedVideos, undefined);
                }

                return { videos: pipedVideos, nextPageToken: undefined };
            }
        } catch (pipedError) {
            console.warn("[YouTube Piped Failed] Falling back to backend proxy:", pipedError);
        }

        // 3. Fallback to standard Google proxy (subject to quota limits)
        const params: Record<string, string | number> = { 
            q: query,
            part: "snippet",
            type: "video",
            maxResults: 20
        };
        
        if (pageToken) params["pageToken"] = pageToken;
        if (videoDuration) params["videoDuration"] = videoDuration;
        if (videoCategoryId) params["videoCategoryId"] = videoCategoryId;
        if (videoEmbeddable) params["videoEmbeddable"] = videoEmbeddable;

        const raw = await executeYouTubeProxy("/search", params, context);
        const data = raw?.items ? raw : raw?.data;
        
        if (!data || !data.items) {
             console.warn("YouTube proxy returned empty items for query: ", query);
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
                thumbnail: thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
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

/**
 * Fetch video details from InnerTube Proxy
 */
async function getYouTubeVideoDetailInnerTube(videoId: string): Promise<YouTubeVideoExtended | null> {
    try {
        let title = "YouTube Content";
        let description = "";
        try {
            if (typeof window !== 'undefined') {
                title = localStorage.getItem(`yt_meta_title_${videoId}`) || title;
                description = localStorage.getItem(`yt_meta_desc_${videoId}`) || description;
            }
        } catch(e) {}
        
        let channelTitle = "YouTube Channel";
        let channelId = "UC";
        let views = "0";
        let duration = 5400;

        // Query /player to get duration and stream info
        try {
            const playerRes = await api.post('/innertube', {
                endpoint: '/player',
                videoId: videoId,
                client: 'WEB'
            });
            const playerData = playerRes.data;
            if (playerData && playerData.videoDetails) {
                title = playerData.videoDetails.title || title;
                channelTitle = playerData.videoDetails.author || channelTitle;
                description = playerData.videoDetails.shortDescription || description;
                duration = parseInt(playerData.videoDetails.lengthSeconds) || duration;
                views = playerData.videoDetails.viewCount || views;
            }
        } catch (e) {
            console.warn('[YouTube InnerTube Details] /player query failed:', e);
        }

        // Query /next endpoint to get rich metadata
        try {
            const nextRes = await api.post('/innertube', {
                endpoint: '/next',
                videoId: videoId,
                client: 'WEB'
            });
            const nextData = nextRes.data;
            const results = nextData.contents?.singleColumnWatchNextResults?.results?.results?.contents || [];
            const info = results.find((c: any) => c.videoPrimaryInfoRenderer)?.videoPrimaryInfoRenderer;
            const secondaryInfo = results.find((c: any) => c.videoSecondaryInfoRenderer)?.videoSecondaryInfoRenderer;
            
            if (info) {
                title = info.title?.runs?.[0]?.text || title;
                views = info.viewCount?.videoViewCountRenderer?.viewCount?.simpleText || views;
            }
            if (secondaryInfo) {
                channelTitle = secondaryInfo.owner?.videoOwnerRenderer?.title?.runs?.[0]?.text || channelTitle;
                channelId = secondaryInfo.owner?.videoOwnerRenderer?.navigationEndpoint?.browseEndpoint?.browseId || channelId;
                description = secondaryInfo.attributedDescriptionBodyText?.content || 
                              secondaryInfo.description?.runs?.map((r: any) => r.text).join('') || description;
            }
        } catch (e) {
            console.warn('[YouTube InnerTube Details] /next query failed:', e);
        }

        return {
            id: videoId,
            title,
            description,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            channelTitle,
            channelId,
            publishedAt: new Date().toISOString(),
            duration,
            viewCount: views,
            likeCount: "1000",
            commentCount: "10",
            type: classifyVideo(title, description, duration),
            tags: []
        } as YouTubeVideoExtended;
    } catch (e) {
        console.warn('[YouTube InnerTube Details] Overall retrieval failed:', e);
        return null;
    }
}

export async function getYouTubeVideoDetail(videoId: string): Promise<YouTubeVideoExtended | null> {
    try {
        // 1. Attempt InnerTube details first
        try {
            const itDetails = await getYouTubeVideoDetailInnerTube(videoId);
            if (itDetails) return itDetails;
        } catch (itError) {
            console.warn("[YouTube InnerTube Detail Failed] Falling back to Piped:", itError);
        }

        // 2. Attempt Piped second
        try {
            const data = await pipedService.getStreams(videoId);
            if (data) {
                console.log(`[YouTube Piped Detail Success] Fetched detail for video: ${videoId}`);
                return {
                    id: videoId,
                    title: data.title || "YouTube Content",
                    description: data.description || "",
                    thumbnail: data.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    channelTitle: data.uploader || "YouTube Channel",
                    channelId: data.uploaderUrl?.split("/channel/")[1] || "UC",
                    publishedAt: data.uploadDate || new Date().toISOString(),
                    duration: data.duration || 5400,
                    viewCount: (data.views || 0).toString(),
                    likeCount: (data.likes || 0).toString(),
                    commentCount: "10",
                    type: classifyVideo(data.title, data.description || "", data.duration),
                    tags: []
                } as YouTubeVideoExtended;
            }
        } catch (pipedError) {
            console.warn("[YouTube Piped Detail Failed] Falling back to backend proxy:", pipedError);
        }

        // 3. Fallback to standard Google proxy
        const params = {
            part: "snippet,statistics,contentDetails",
            id: videoId
        };
        const data = await executeYouTubeProxy("/videos", params);
        const item = data.items?.[0];
        
        if (!item) {
             console.warn("[Quota/Visibility Alert] YouTube API returned no items for", videoId, ". Triggering Invincible Failsafe...");
             let fallbackTitle = "StreamLux Cinema Experience";
             let fallbackDesc = "This high-quality title is available for streaming. While official metadata is temporarily loading from our global mirrors, you can enjoy the full feature film right now in the player above.";
             try {
                 if (typeof window !== 'undefined') {
                     fallbackTitle = localStorage.getItem(`yt_meta_title_${videoId}`) || fallbackTitle;
                     fallbackDesc = localStorage.getItem(`yt_meta_desc_${videoId}`) || fallbackDesc;
                 }
             } catch(e) {}
             return {
                 id: videoId,
                 title: fallbackTitle,
                 description: fallbackDesc,
                 thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                 channelTitle: "StreamLux Verified",
                 channelId: "UC",
                 publishedAt: new Date().toISOString(),
                 type: "movie",
                 duration: 7200,
                 viewCount: "500000",
                 likeCount: "15000",
                 commentCount: "450",
                 tags: ["Cinema", "Featured", "StreamLux"]
              } as YouTubeVideoExtended;
        }

        const { title, description, thumbnails, channelTitle, channelId, publishedAt, tags } = item.snippet;
        const { viewCount, likeCount, commentCount } = item.statistics;
        const { duration } = item.contentDetails;

        return {
            id: videoId,
            title,
            description,
            thumbnail: thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
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
        let fallbackTitle = "YouTube Content";
        let fallbackDesc = "This video details are temporarily restricted by API quotas, but you can still watch the video below.";
        try {
            if (typeof window !== 'undefined') {
                fallbackTitle = localStorage.getItem(`yt_meta_title_${videoId}`) || fallbackTitle;
                fallbackDesc = localStorage.getItem(`yt_meta_desc_${videoId}`) || fallbackDesc;
            }
        } catch(e) {}
        return {
            id: videoId,
            title: fallbackTitle,
            description: fallbackDesc,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            channelTitle: "YouTube Stream",
            channelId: "UC",
            publishedAt: new Date().toISOString(),
            type: "movie",
            duration: 5400,
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

export function cleanSeriesTitle(title: string): string {
    let clean = title;
    
    // 1. Remove bracketed / parenthesized text: [Full Episode], (Sci-Fi Episode 1), etc.
    clean = clean.replace(/\[[^\]]*\]/g, '');
    clean = clean.replace(/\([^)]*\)/g, '');
    
    // 2. Remove common season/episode/part patterns (case-insensitive)
    const epPatterns = [
        /episode\s*\d+/i,
        /ep\.?\s*\d+/i,
        /season\s*\d+/i,
        /s\d+e\d+/i,
        /s\d+/i,
        /e\d+/i,
        /part\s*\d+/i,
        /ch(?:apter)?\.?\s*\d+/i,
        /vol(?:ume)?\s*\d+/i,
        /#\d+/i,
        /-\s*\d+/i
    ];
    for (const pat of epPatterns) {
        clean = clean.replace(pat, '');
    }
    
    // 3. Remove common suffix terms
    const suffixes = [
        /full episode/i,
        /complete series/i,
        /web series/i,
        /sci-fi short/i,
        /cyber series/i,
        /fantasy animation/i,
        /animation short/i,
        /short film/i,
        /official film/i,
        /full movie/i,
        /free movie/i,
        /4k/i,
        /1080p/i,
        /hd/i
    ];
    for (const suf of suffixes) {
        clean = clean.replace(suf, '');
    }
    
    // 4. Clean up trailing colons, hyphens, pipeline chars, spaces
    clean = clean.replace(/[:\-|\/\\~]+/g, ' ');
    clean = clean.trim().replace(/\s+/g, ' ');
    
    return clean;
}

function extractEpisodeNumber(title: string): number | null {
    const regexes = [
        /s\d+e(\d+)/i,
        /episode\s*(\d+)/i,
        /ep\.?\s*(\d+)/i,
        /part\s*(\d+)/i,
        /ch(?:apter)?\.?\s*(\d+)/i,
        /#\s*(\d+)/i
    ];
    for (const regex of regexes) {
        const match = title.match(regex);
        if (match && match[1]) {
            return parseInt(match[1]);
        }
    }
    return null;
}

export async function getYouTubeSeriesEpisodes(seriesTitle: string, channelId: string): Promise<YouTubeVideo[]> {
    try {
        const cleanedTitle = cleanSeriesTitle(seriesTitle);
        console.log(`[YouTube Series Resolver] Original: "${seriesTitle}" | Cleaned: "${cleanedTitle}"`);

        const isChannelValid = channelId && channelId.startsWith("UC") && channelId.length > 10;
        const query = isChannelValid 
            ? `${cleanedTitle} channel:${channelId}` 
            : `${cleanedTitle} full series episodes`;

        let rawVideos: YouTubeVideo[] = [];

        // 1. Attempt InnerTube search first (Music-page limitless method spoofed to general YouTube)
        try {
            const itVideos = await fetchYouTubeVideosInnerTube(query);
            if (itVideos && itVideos.length > 0) {
                console.log(`[YouTube InnerTube Episodes Success] Fetched ${itVideos.length} episodes raw`);
                rawVideos = itVideos;
            }
        } catch (itError) {
            console.warn("[YouTube InnerTube Episodes Failed] Falling back to Piped:", itError);
        }

        // 2. Attempt Piped search second
        if (rawVideos.length === 0) {
            try {
                const pipedVideos = await pipedService.search(query, "videos");
                if (pipedVideos && pipedVideos.length > 0) {
                    console.log(`[YouTube Piped Episodes Success] Fetched ${pipedVideos.length} episodes raw`);
                    rawVideos = pipedVideos;
                }
            } catch (pipedError) {
                console.warn("[YouTube Piped Episodes Failed] Falling back to backend proxy:", pipedError);
            }
        }

        // 3. Fallback to standard Google proxy
        if (rawVideos.length === 0) {
            const params = {
                part: "snippet",
                ...(isChannelValid && { channelId }),
                q: isChannelValid ? cleanedTitle : `${cleanedTitle} full series episodes`,
                type: "video",
                maxResults: 50,
                order: "date"
            };
            const data = await executeYouTubeProxy("/search", params);
            const items = data.items as any[];
            rawVideos = items.map((item) => {
                const { videoId } = item.id;
                const { title, description, thumbnails, channelTitle, publishedAt } = item.snippet;
                return {
                    id: videoId,
                    title,
                    description,
                    thumbnail: thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    channelTitle,
                    channelId: isChannelValid ? channelId : "UC",
                    publishedAt,
                    type: 'tv' as VideoType,
                };
            });
        }

        // Filter episodes: Must contain the cleaned series title in its video title to keep only genuine series episodes!
        const lowCleanedTitle = cleanedTitle.toLowerCase();
        let filtered = rawVideos.filter(v => {
            const lowTitle = v.title.toLowerCase();
            return lowTitle.includes(lowCleanedTitle);
        });

        // Fallback filter: if title filter is too aggressive, try description
        if (filtered.length === 0) {
            filtered = rawVideos.filter(v => {
                const combined = (v.title + " " + v.description).toLowerCase();
                return combined.includes(lowCleanedTitle);
            });
        }

        // Apply strict duration filter: episodes must be >= 24 minutes (1440 seconds)
        filtered = filtered.filter(v => {
            if (v.duration !== undefined && v.duration < 1440) return false;
            return true;
        });

        // Map and sort chronologically/by episode number
        const mappedEpisodes = filtered.map(v => {
            const epNum = extractEpisodeNumber(v.title);
            return {
                video: v,
                epNum,
                date: v.publishedAt ? new Date(v.publishedAt).getTime() : 0
            };
        });

        // Check if we have explicit episode numbers
        const hasExplicitNumbers = mappedEpisodes.some(x => x.epNum !== null);

        if (hasExplicitNumbers) {
            // Sort by parsed episode number, fallback to date
            mappedEpisodes.sort((a, b) => {
                const numA = a.epNum ?? 999;
                const numB = b.epNum ?? 999;
                if (numA !== numB) return numA - numB;
                return a.date - b.date;
            });
        } else {
            // Sort chronologically (oldest upload first = Episode 1 onwards)
            mappedEpisodes.sort((a, b) => a.date - b.date);
        }

        return mappedEpisodes.map((item, index) => {
            // Enforce sequential episode numbering in metadata
            const cleanTitle = item.video.title;
            return {
                ...item.video,
                title: cleanTitle.includes(`Episode`) || cleanTitle.includes(`Ep `) ? cleanTitle : `Episode ${index + 1}: ${cleanTitle}`,
                type: 'tv' as VideoType
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

