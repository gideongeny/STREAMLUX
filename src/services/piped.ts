import axios from "../shared/axios";
import { pipedSearch } from "../shared/musicGateway";
import { YouTubeVideo } from "./youtube";
import { classifyVideo } from "../shared/videoClassification";

/**
 * Piped search/stream via our API proxy (avoids browser CORS on public Piped instances).
 */
export const pipedService = {
    search: async (
        query: string,
        filter: "all" | "videos" | "channels" | "playlists" | "music_songs" | "music_videos" | "music_albums" | "music_playlists" = "all"
    ): Promise<YouTubeVideo[]> => {
        try {
            const response = await axios.get("/piped-search", {
                params: { q: query, filter },
                timeout: 12000,
            });

            if (!response.data?.items) {
                throw new Error("Invalid Piped response");
            }

            return response.data.items
                .filter((item: any) => item.type === "stream")
                .map((item: any) => ({
                    id: item.url?.split("v=")[1] || item.id,
                    title: item.title,
                    description: item.shortDescription || "",
                    thumbnail: item.thumbnail,
                    channelTitle: item.uploaderName,
                    channelId: item.uploaderUrl?.split("/channel/")[1] || "",
                    type: classifyVideo(item.title, item.shortDescription || "", item.duration),
                    duration: item.duration,
                    viewCount: String(item.views ?? 0),
                    publishedAt: item.uploadedDate,
                    isPiped: true,
                }));
        } catch (error) {
            console.warn("[Piped] Proxy search failed, trying direct:", error);
            try {
                const data = await pipedSearch(query, filter);
                if (!data?.items) throw new Error("No items");
                return (data.items as any[])
                    .filter((item: any) => item.type === "stream")
                    .map((item: any) => ({
                        id: item.url?.split("v=")[1] || item.id,
                        title: item.title,
                        description: item.shortDescription || "",
                        thumbnail: item.thumbnail,
                        channelTitle: item.uploaderName,
                        channelId: item.uploaderUrl?.split("/channel/")[1] || "",
                        type: classifyVideo(item.title, item.shortDescription || "", item.duration),
                        duration: item.duration,
                        viewCount: String(item.views ?? 0),
                        publishedAt: item.uploadedDate,
                        isPiped: true,
                    }));
            } catch {
                throw error;
            }
        }
    },

    getStreams: async (videoId: string) => {
        try {
            const response = await axios.get("/piped-streams", {
                params: { videoId },
                timeout: 12000,
            });
            return response.data;
        } catch (error) {
            console.warn("[Piped] Proxy streams failed:", error);
            return null;
        }
    },
};
