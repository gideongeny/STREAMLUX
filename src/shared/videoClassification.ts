/**
 * Utility to classify a YouTube video as a movie, TV show, or unknown/other
 * based on its title and description.
 */

export type VideoType = "movie" | "tv" | "other";

export function classifyVideo(title: string, description: string): VideoType {
    const combined = (title + " " + description).toLowerCase();

    // TV/Series keywords (highly specific)
    const tvKeywords = [
        "episode",
        "full episode",
        "season",
        "series",
        "teleserye",
        "pinoy series",
        "pinoy drama",
        "tagalog",
        "s01", "s02", "s03", "s1", "s2", "s3",
        "ep 1", "ep 2", "ep 3", "ep 01", "ep 02",
        "kdrama", "cdrama", "tdrama", "turkish drama",
        "telenovela", "drama series"
    ];

    // Movie keywords
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

    // Check for TV shows first as they are often part of larger studio channels
    if (tvKeywords.some(keyword => combined.includes(keyword))) {
        return "tv";
    }

    if (movieKeywords.some(keyword => combined.includes(keyword))) {
        return "movie";
    }

    // Strict EXCLUSION keywords (Songs, Trailers, Random clips)
    // We are more careful now: only exclude if it's JUST a song/trailer
    const exclusionKeywords = [
        "karaoke",
        "music video",
        "lyric video",
        "official lyrics",
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
        // Double check it's not actually a full video disguised with a trailer tag or something
        if (combined.includes("full movie") || combined.includes("full episode")) {
            // Keep it if it says "full"
        } else {
            return "other";
        }
    }

    // Heuristic: If it's a long description and contains "full" and "movie" it might be a movie
    if (combined.includes("full") && (combined.includes("movie") || combined.includes("film"))) {
        return "movie";
    }

    // If it's from a known studio channel and it's long, we usually want to keep it
    if (combined.includes("abs-cbn") || combined.includes("startimes") || combined.includes("gma network")) {
        // Studio uploads often don't have "full movie" in title but are full episodes
        return "tv";
    }

    return "other";
}
