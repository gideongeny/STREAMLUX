import axios from "axios";
import { YouTubeVideo } from "./youtube";
import { classifyVideo } from "../shared/videoClassification";

// List of reliable public Piped instances
const PIPED_INSTANCES = [
    "https://pipedapi.kavin.rocks",
    "https://api.piped.ot.ax",
    "https://pipedapi.drgns.space",
    "https://api.piped.privacy.com.de",
    "https://piped-api.lunar.icu",
    "https://pipedapi.ducks.party"
];

let currentInstanceIndex = 0;

/**
 * Get the current Piped instance URL
 */
const getInstance = () => PIPED_INSTANCES[currentInstanceIndex];

/**
 * Rotate to the next Piped instance in the pool
 */
const rotateInstance = () => {
    currentInstanceIndex = (currentInstanceIndex + 1) % PIPED_INSTANCES.length;
    console.log(`Switched to Piped Instance: ${getInstance()}`);
};

/**
 * Service to interact with Piped API (Unlimited YouTube)
 */
export const pipedService = {
    /**
     * Search for videos using Piped API
     */
    search: async (query: string, filter: "all" | "videos" | "channels" | "playlists" | "music_songs" | "music_videos" | "music_albums" | "music_playlists" = "all"): Promise<YouTubeVideo[]> => {
        // Try up to 3 instances before giving up
        for (let i = 0; i < 3; i++) {
            try {
                const baseUrl = getInstance();
                const response = await axios.get(`${baseUrl}/search`, {
                    params: {
                        q: query,
                        filter: filter
                    },
                    timeout: 5000 // 5s timeout
                });

                if (!response.data || !response.data.items) {
                    throw new Error("Invalid response format");
                }

                // Map Piped format to our YouTubeVideo format
                return response.data.items
                    .filter((item: any) => item.type === "stream") // Only want videos
                    .map((item: any) => ({
                        id: item.url.split("v=")[1],
                        title: item.title,
                        description: item.shortDescription || "",
                        thumbnail: item.thumbnail,
                        channelTitle: item.uploaderName,
                        channelId: item.uploaderUrl?.split("/channel/")[1] || "",
                        type: classifyVideo(item.title, item.shortDescription || "", item.duration),
                        duration: item.duration, // Piped gives duration in seconds directly!
                        viewCount: item.views.toString(),
                        publishedAt: item.uploadedDate,
                        isPiped: true // Marker for debugging
                    }));

            } catch (error) {
                console.warn(`Piped instance ${getInstance()} failed:`, error);
                rotateInstance();
            }
        }
        // If all attempts fail
        throw new Error("All Piped instances failed");
    },

    /**
     * Get video streams (mp4/webm) directly
     * Useful if we want to bypass YouTube embeds entirely in the future
     */
    getStreams: async (videoId: string) => {
        for (let i = 0; i < 3; i++) {
            try {
                const baseUrl = getInstance();
                const response = await axios.get(`${baseUrl}/streams/${videoId}`, { timeout: 5000 });
                return response.data;
            } catch (error) {
                console.warn(`Piped stream fetch failed on ${getInstance()}`, error);
                rotateInstance();
            }
        }
        return null;
    }
};
