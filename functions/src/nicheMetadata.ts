import axios from 'axios';

/**
 * Jikan API (MyAnimeList) Integration
 */
export const fetchJikanMetadata = async (query: string) => {
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime`, {
            params: { q: query, limit: 1 },
            timeout: 5000
        });
        return response.data?.data?.[0] || null;
    } catch (e) {
        console.error('Jikan API error:', e);
        return null;
    }
};

/**
 * Internet Archive Metadata Integration
 */
export const fetchInternetArchiveMetadata = async (query: string) => {
    try {
        const response = await axios.get(`https://archive.org/advancedsearch.php`, {
            params: {
                q: `title:(${query}) AND mediatype:(movies)`,
                output: 'json',
                rows: 1
            },
            timeout: 5000
        });
        const doc = response.data?.response?.docs?.[0];
        if (doc) {
            return {
                title: doc.title,
                id: doc.identifier,
                year: doc.date,
                description: doc.description || doc.subject
            };
        }
        return null;
    } catch (e) {
        console.error('Internet Archive error:', e);
        return null;
    }
};

/**
 * Comprehensive Waterfall Search
 * Rotates through niche sources if TMDB fails
 */
export const comprehensiveWaterfallSearch = async (query: string) => {
    // 1. Try Jikan (Anime)
    const anime = await fetchJikanMetadata(query);
    if (anime) return { source: 'jikan', data: anime };

    // 2. Try Internet Archive (Indie/Public Domain)
    const archive = await fetchInternetArchiveMetadata(query);
    if (archive) return { source: 'archive', data: archive };

    return null;
};
