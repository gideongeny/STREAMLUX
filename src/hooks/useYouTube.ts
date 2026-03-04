// src/hooks/useYouTube.ts
import { useEffect, useState } from "react";
import { fetchByRegion, YouTubeVideo } from "../services/youtube";

export interface UseYouTubeOptions {
    region?: string;
    category?: string;
    pageToken?: string;
    type?: "movie" | "tv";
}

export function useYouTubeVideos(options: UseYouTubeOptions) {
    const { region, category, pageToken, type } = options;
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const fetchVideos = async () => {
            setLoading(true);
            setError(null);
            try {
                const query = region || category || "";
                if (!query) {
                    setVideos([]);
                    setLoading(false);
                    return;
                }
                const result = await fetchByRegion(query, pageToken);
                if (!cancelled) {
                    // Filter videos by type if specified
                    const filteredVideos = type
                        ? result.videos.filter(v =>
                            type === "movie" ? v.type !== "tv" : v.type === "tv"
                        )
                        : result.videos;

                    setVideos(filteredVideos);
                    setNextPageToken(result.nextPageToken);
                }
            } catch (e: any) {
                if (!cancelled) {
                    setError(e.message || "Failed to fetch YouTube videos");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchVideos();
        return () => {
            cancelled = true;
        };
    }, [region, category, pageToken, type]);

    return { videos, nextPageToken, loading, error };
}
