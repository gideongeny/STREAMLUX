import axios from "../shared/axios";
import { Item } from "../shared/types";

export interface SerpShortVideo {
  title: string;
  link: string;
  source: string;
  thumbnail: string;
  extensions?: string[];
}

export const fetchSerpShorts = async (query: string = "trending shorts movie trailers"): Promise<Item[]> => {
  try {
    // Calling the unified gateway which handles the SerpApi key securely on the backend
    const response: any = await axios.get("/proxy/external", {
      params: {
        provider: "serpapi",
        q: query,
      },
    });

    const shortVideos: SerpShortVideo[] = response.short_videos || [];

    return shortVideos.map((video, index) => ({
      id: `serp-${index}-${Date.now()}`,
      title: video.title,
      name: video.title,
      poster_path: video.thumbnail,
      backdrop_path: video.thumbnail,
      media_type: "youtube", // Using youtube as a base media type for players
      url: video.link,
      isExternal: true,
      provider: video.source,
      vote_average: 8.0 + Math.random() * 2,
      vote_count: 1000 + Math.floor(Math.random() * 5000),
      popularity: 5000 + Math.floor(Math.random() * 10000),
      genre_ids: [],
      original_language: "en",
      overview: `A trending short from ${video.source}.`,
    } as Item));
  } catch (error) {
    console.error("Error fetching SerpApi shorts:", error);
    return [];
  }
};
