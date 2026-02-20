// import axios from "axios";

export interface Subtitle {
    id: string;
    lang: string;
    language: string;
    url: string;
    format: "vtt" | "srt";
    source: string;
}

// const SUBTITLE_PROXY = "https://subtitles.streamlux.workers.dev"; // We can set up a Cloudflare worker later if needed
// For now, we'll use a public OpenSubtitles wrapper if available, or fallback to mock data for UI testing

export const searchSubtitles = async (
    mediaType: "movie" | "tv",
    tmdbId: string | number,
    imdbId?: string,
    season?: number,
    episode?: number
): Promise<Subtitle[]> => {
    try {
        console.log(`[SubtitleService] Searching for ${mediaType} ${tmdbId} (IMDb: ${imdbId})`);

        // In a real scenario, we'd query something like:
        // const response = await axios.get(`${SUBTITLE_PROXY}/search`, { params: { imdbId, season, episode } });

        // For the purpose of this implementation, we will simulate a robust search 
        // that returns high-quality English and Kiswahili (user preference) subtitles.

        // Mocking some results to verify UI integration first
        const mockSubs: Subtitle[] = [
            {
                id: "1",
                lang: "en",
                language: "English",
                url: `https://raw.githubusercontent.com/andreyvit/subtitle-examples/master/sample.vtt`, // Real working sample VTT
                format: "vtt",
                source: "OpenSubtitles"
            },
            {
                id: "2",
                lang: "sw",
                language: "Kiswahili",
                url: `https://raw.githubusercontent.com/andreyvit/subtitle-examples/master/sample.vtt`, // Mock for now
                format: "vtt",
                source: "OpenSubtitles"
            },
            {
                id: "3",
                lang: "es",
                language: "Spanish",
                url: `https://raw.githubusercontent.com/andreyvit/subtitle-examples/master/sample.vtt`,
                format: "vtt",
                source: "OpenSubtitles"
            },
            {
                id: "4",
                lang: "fr",
                language: "French",
                url: `https://raw.githubusercontent.com/andreyvit/subtitle-examples/master/sample.vtt`,
                format: "vtt",
                source: "OpenSubtitles"
            }
        ];

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        return mockSubs;
    } catch (error) {
        console.error("[SubtitleService] Error searching subtitles:", error);
        return [];
    }
};

export const subtitleService = {
    searchSubtitles
};
