/**
 * Utility to classify a YouTube video as a movie, TV show, short, or unknown/other
 * based on its title, description, and duration.
 */

export type VideoType = "movie" | "tv" | "shorts" | "other";

export function classifyVideo(title: string, description: string, duration?: number): VideoType {
    const combined = (title + " " + description).toLowerCase();

    // 1. SHORTS & CLIPS DETECTION (Highest Priority)
    // User Request: "shorts should be videos less than 10 minutes"
    // We treat anything under 10 minutes (600s) as a "short/clip" into the excluded bucket
    if (duration && duration > 0 && duration <= 600) {
        return "shorts";
    }
    if (combined.includes("#shorts") || title.toLowerCase().includes("shorts")) {
        return "shorts";
    }

    // 2. TV/SERIES DETECTION
    // Specific keywords that strongly indicate a series
    const tvKeywords = [
        "episode", "ep 1", "ep 2", "ep 3", "ep 01", "ep 02", "ep.",
        "season", "s01", "s02", "s03", "s1", "s2", "s3",
        "series", "teleserye", "novela", "drama series",
        "full episode", "telenovela", "kdrama", "cdrama",
        "pinoy series", "pinoy drama"
    ];

    if (tvKeywords.some(keyword => combined.includes(keyword))) {
        return "tv";
    }
    // Studio channels often upload full episodes without "full movie" keywords
    if (combined.includes("abs-cbn") || combined.includes("gma network") || combined.includes("startimes")) {
        if (!combined.includes("full movie") && !combined.includes("film")) {
            return "tv";
        }
    }

    // 3. MOVIE DETECTION
    // Strict rules: Must look like a movie
    const movieKeywords = [
        "full movie", "full film", "official movie", "entire movie",
        "movie 202", "film complete", "complete movie",
        "hd movie", "4k movie", "animated film"
    ];

    if (movieKeywords.some(keyword => combined.includes(keyword))) {
        return "movie";
    }

    // Duration-based fallback for Movies
    // If it's over 40 minutes (2400 seconds), it's likely a movie or compilation (treated as movie)
    // unless it was already caught as TV above.
    if (duration && duration > 2400) {
        return "movie";
    }

    // 4. EXCLUSION / OTHER
    // If it's short-ish and not marked otherwise, or contains specific exclusion terms
    const exclusionKeywords = [
        "trailer", "teaser", "promo", "clip",
        "interview", "review", "reaction", "bloopers",
        "making of", "behind the scenes", "soundtrack",
        "lyric video", "music video", "song", "karaoke",
        "gameplay", "walkthrough", "tutorial"
    ];

    if (exclusionKeywords.some(keyword => combined.includes(keyword))) {
        // If it explicitly says "Full Movie" we might accept it, but otherwise reject
        if (!combined.includes("full movie")) {
            return "other";
        }
    }

    // 5. FINAL FALLBACK
    // If we really don't know, and it's not short, default to 'other' to keep lists clean.
    // However, for the sake of discovery, if it contains "movie" or "film", we give it a pass.
    if (combined.includes("movie") || combined.includes("film")) {
        return "movie";
    }

    return "other";
}
