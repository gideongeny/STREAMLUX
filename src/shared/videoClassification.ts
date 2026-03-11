/**
 * Utility to classify a YouTube video as a movie, TV show, or unknown/other
 * based on its title and description.
 */

export type VideoType = "movie" | "tv" | "other";

export function classifyVideo(title: string, description: string, duration?: number): VideoType {
    const combined = (title + " " + description).toLowerCase();

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
        "full", "official", "animated", "complete", "movie", "film", "cinema", "trailer", "teaser"
    ];

    // Heuristic: If duration is long (> 3600s / 1 hour), it's more likely a movie or full show
    if (duration && duration > 3600) {
        if (tvKeywords.some(keyword => combined.includes(keyword))) return "tv";
        return "movie";
    }

    if (tvKeywords.some(keyword => combined.includes(keyword))) {
        return "tv";
    }

    if (movieKeywords.some(keyword => combined.includes(keyword))) {
        return "movie";
    }

    // Default to 'movie' so we don't accidentally drop valid YouTube content from the UI lists
    return "movie";
}
