/**
 * Utility to classify a YouTube video as a movie, TV show, or unknown/other
 * based on its title and description.
 */

export type VideoType = "movie" | "tv" | "other";

export function classifyVideo(title: string, description: string): VideoType {
    const combined = (title + " " + description).toLowerCase();

    // Strict EXCLUSION keywords (Songs, Trailers, Random clips)
    const exclusionKeywords = [
        "karaoke",
        "official video",
        "music video",
        "lyric video",
        "official lyrics",
        "song",
        "soundtrack",
        "teaser",
        "trailer",
        "behind the scenes",
        "making of",
        "interview",
        "review",
        "reaction",
        "highlight",
        "best of",
        "top 10",
        "gameplay",
        "tutorial",
        "how to"
    ];

    if (exclusionKeywords.some(keyword => combined.includes(keyword))) {
        return "other";
    }

    // Keywords for TV shows/Episodes
    const tvKeywords = [
        "episode",
        "full episode",
        "season",
        "series",
        "s01", "s02", "s03", "s1", "s2", "s3",
        "ep 1", "ep 2", "ep 3", "ep 01", "ep 02",
        "kdrama", "cdrama", "tdrama", "turkish drama"
    ];

    // Keywords for Movies
    const movieKeywords = [
        "full movie",
        "official movie",
        "animated film",
        "film complete",
        "complete movie",
        "full duration movie",
        "hd movie",
        "4k movie",
        "movie 2024", "movie 2025"
    ];

    if (tvKeywords.some(keyword => combined.includes(keyword))) {
        return "tv";
    }

    if (movieKeywords.some(keyword => combined.includes(keyword))) {
        return "movie";
    }

    // Heuristic: If it's a long description and contains "full" and "movie" it might be a movie
    if (combined.includes("full") && (combined.includes("movie") || combined.includes("film"))) {
        return "movie";
    }

    return "other";
}
