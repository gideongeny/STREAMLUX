/**
 * Utility to classify a YouTube video as a movie, TV show, or unknown/other
 * based on its title and description.
 */

export type VideoType = "movie" | "tv" | "other";

export function classifyVideo(title: string, description: string, duration?: number): VideoType {
    const combined = (title + " " + description).toLowerCase();

    // 1. Junk/Other filter (non-cinematic content)
    const junkKeywords = [
        "gameplay", "walkthrough", "let's play", "lets play", "roblox", "minecraft", "fortnite",
        "review", "unboxing", "tutorial", "reaction", "reaction video", "reacting",
        "clip", "promo", "teaser", "scene", "compilation", "best moments", "funny moments",
        "behind the scenes", "vlog", "blog", "how to", "diy", "trailer only", "teaser only",
        "official trailer", "official teaser", "teaser trailer", "movie review", "film review",
        "news", "leak", "update", "interview", "podcast"
    ];

    if (junkKeywords.some(keyword => combined.includes(keyword))) {
        // Only classify as movie if it explicitly says "full movie" or "full feature film"
        // to avoid filtering out legitimate movies with a review or teaser keyword in description
        const hasFullMovie = combined.includes("full movie") || combined.includes("full feature") || combined.includes("complete film");
        if (!hasFullMovie) {
            return "other";
        }
    }

    // Heuristics based on duration if available
    if (duration !== undefined) {
        // Less than 24 minutes (1440 seconds) is almost certainly other/junk (clips, vlogs, etc.)
        // User strictly requested episodes should not be less than 24 minutes.
        if (duration < 1440) {
            // Check if explicitly marked as short film
            if (combined.includes("short film") || combined.includes("animated short")) {
                return "movie";
            }
            return "other"; // Cannot be 'tv' episode if under 24 minutes
        }

        // Under 35 minutes
        if (duration < 2100) {
            // Check for TV episode patterns
            const tvKeywords = [
                "episode", "ep.", "ep ", "season", "series", "part", "ch.", "chapter", "s0", "s1", "s2"
            ];
            if (tvKeywords.some(keyword => combined.includes(keyword))) {
                return "tv";
            }
            // Check if short film
            if (combined.includes("short film") || combined.includes("animated short") || combined.includes("movie")) {
                return "movie";
            }
            return "other";
        }
    }

    // Keywords for TV shows/Episodes
    const tvKeywords = [
        "episode",
        "full episode",
        "season",
        "series",
        "s01", "s02", "s03", "s1", "s2", "s3",
        "ep 1", "ep 2", "ep 3", "ep 01", "ep 02",
        "kdrama", "cdrama", "tdrama", "turkish drama",
        "tv show", "tv series", "part 1", "part 2", "part 3"
    ];

    // Keywords for Movies
    const movieKeywords = [
        "full movie", "full feature", "feature film", "complete film", "full length movie",
        "official film", "animated movie", "cinema film", "full film"
    ];

    // Heuristic: If duration is long (> 35 mins), it's more likely a movie or full show
    if (duration && duration > 2100) {
        if (tvKeywords.some(keyword => combined.includes(keyword))) return "tv";
        return "movie";
    }

    if (tvKeywords.some(keyword => combined.includes(keyword))) {
        return "tv";
    }

    if (movieKeywords.some(keyword => combined.includes(keyword))) {
        return "movie";
    }

    // Default to 'other' if it doesn't match cinematic parameters, to avoid cluttering sliders
    // with random clips, unless duration is significant (> 20 mins)
    if (duration && duration > 1200) {
        return "movie";
    }

    return "other";
}
