// Subtitle Service — Uses OpenSubtitles.com REST API (free tier, no key needed for basic search)
// Falls back to a curated static list if the API is unavailable

export interface Subtitle {
    id: string;
    lang: string;
    language: string;
    url: string;
    format: "vtt" | "srt";
    source: string;
}

// OpenSubtitles.com public REST API — no API key needed for basic search
const OS_API = "https://api.opensubtitles.com/api/v1";
const OS_APP_NAME = "StreamLux";
const OS_HEADERS = {
    "Content-Type": "application/json",
    "X-User-Agent": `${OS_APP_NAME} v1.0`,
};

// Language name lookup
const LANG_NAMES: Record<string, string> = {
    en: "English", es: "Spanish", fr: "French", de: "German", ru: "Russian",
    ja: "Japanese", vi: "Vietnamese", ar: "Arabic", hi: "Hindi", id: "Indonesian",
    pt: "Portuguese", tl: "Filipino", ur: "Urdu", sw: "Swahili", zh: "Chinese",
    ko: "Korean", it: "Italian", tr: "Turkish", nl: "Dutch", pl: "Polish",
    ro: "Romanian", th: "Thai", uk: "Ukrainian", he: "Hebrew", fa: "Persian",
};

const langName = (code: string) => LANG_NAMES[code] ?? code.toUpperCase();

export const searchSubtitles = async (
    mediaType: "movie" | "tv",
    tmdbId: string | number,
    imdbId?: string,
    season?: number,
    episode?: number
): Promise<Subtitle[]> => {
    try {
        // Build OpenSubtitles search params
        const params: Record<string, string | number> = {
            type: mediaType,
        };

        if (imdbId) {
            // Prefer IMDb ID since it's more reliable
            params.imdb_id = imdbId.replace("tt", "");
        } else {
            params.tmdb_id = tmdbId;
        }

        if (mediaType === "tv" && season !== undefined) {
            params.season_number = season;
        }
        if (mediaType === "tv" && episode !== undefined) {
            params.episode_number = episode;
        }

        const queryString = Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join("&");

        const response = await fetch(`${OS_API}/subtitles?${queryString}`, {
            headers: OS_HEADERS,
        });

        if (!response.ok) throw new Error(`OpenSubtitles API error: ${response.status}`);

        const data = await response.json();
        const items = data?.data ?? [];

        if (items.length === 0) return getFallbackSubtitles();

        // Map to our Subtitle interface
        const seen = new Set<string>();
        const results: Subtitle[] = [];

        for (const item of items) {
            const attrs = item.attributes || {};
            const lang: string = attrs.language || "en";
            const files: any[] = attrs.files || [];
            const fileId = files[0]?.file_id;

            // Deduplicate by language
            if (seen.has(lang) || !fileId) continue;
            seen.add(lang);

            results.push({
                id: String(item.id || fileId),
                lang,
                language: attrs.language_name || langName(lang),
                // The actual download URL requires a POST to /download with the file_id
                // We store file_id and resolve lazily on select
                url: `opensubtitles:${fileId}`,
                format: (attrs.format?.toLowerCase() === "srt" ? "srt" : "vtt") as "vtt" | "srt",
                source: "OpenSubtitles",
            });

            if (results.length >= 20) break; // Cap at 20 languages
        }

        return results.length > 0 ? results : getFallbackSubtitles();
    } catch (error) {
        console.warn("[SubtitleService] OpenSubtitles API unavailable, using fallback:", error);
        return getFallbackSubtitles();
    }
};

/**
 * Resolve the actual VTT/SRT download URL for an OpenSubtitles file_id.
 * Call this when the user actually selects a subtitle track.
 */
export const resolveSubtitleUrl = async (subtitle: Subtitle): Promise<string> => {
    if (!subtitle.url.startsWith("opensubtitles:")) return subtitle.url;

    const fileId = subtitle.url.replace("opensubtitles:", "");

    try {
        const response = await fetch(`${OS_API}/download`, {
            method: "POST",
            headers: OS_HEADERS,
            body: JSON.stringify({ file_id: Number(fileId), sub_format: "vtt" }),
        });

        if (!response.ok) throw new Error("Download link fetch failed");
        const data = await response.json();
        return data.link || "";
    } catch (err) {
        console.warn("[SubtitleService] Could not resolve subtitle URL:", err);
        return "";
    }
};

// Fallback subtitles — sample VTT files for UI testing when API is down
const getFallbackSubtitles = (): Subtitle[] => [
    {
        id: "fallback-en",
        lang: "en",
        language: "English",
        url: "https://raw.githubusercontent.com/andreyvit/subtitle-examples/master/sample.vtt",
        format: "vtt",
        source: "Sample",
    },
    {
        id: "fallback-es",
        lang: "es",
        language: "Spanish",
        url: "https://raw.githubusercontent.com/andreyvit/subtitle-examples/master/sample.vtt",
        format: "vtt",
        source: "Sample",
    },
    {
        id: "fallback-fr",
        lang: "fr",
        language: "French",
        url: "https://raw.githubusercontent.com/andreyvit/subtitle-examples/master/sample.vtt",
        format: "vtt",
        source: "Sample",
    },
];

export const subtitleService = {
    searchSubtitles,
    resolveSubtitleUrl,
};
