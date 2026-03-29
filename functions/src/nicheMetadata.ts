import axios from 'axios';

/**
 * Internet Archive Metadata Fetcher
 * Optimized for finding 1980s indie/obscure films.
 */
export const fetchInternetArchiveMetadata = async (query: string) => {
    try {
        const response = await axios.get('https://archive.org/advancedsearch.php', {
            params: {
                q: `${query} AND mediatype:movies`,
                output: 'json',
                fl: 'identifier,title,description,year,mediatype',
                rows: 10
            },
            timeout: 10000
        });

        const docs = response.data?.response?.docs || [];
        return docs.map((doc: any) => ({
            id: `ia-${doc.identifier}`,
            title: doc.title,
            name: doc.title,
            overview: doc.description || "Rare title from the Internet Archive.",
            release_date: doc.year ? `${doc.year}-01-01` : "Unknown",
            poster_path: `https://archive.org/services/img/${doc.identifier}`,
            backdrop_path: `https://archive.org/services/img/${doc.identifier}`,
            media_type: "movie",
            source: "internet_archive"
        }));
    } catch (error) {
        console.error("Internet Archive Fetch Error:", error);
        return [];
    }
};

/**
 * Jikan API (MyAnimeList) Fetcher
 * For niche/classic anime titles.
 */
export const fetchJikanMetadata = async (query: string) => {
    try {
        const response = await axios.get('https://api.jikan.moe/v4/anime', {
            params: { q: query, limit: 10 },
            timeout: 10000
        });

        const data = response.data?.data || [];
        return data.map((item: any) => ({
            id: `mal-${item.mal_id}`,
            title: item.title,
            name: item.title,
            overview: item.synopsis,
            release_date: item.aired?.from ? item.aired.from.split('T')[0] : "Unknown",
            poster_path: item.images?.jpg?.image_url,
            backdrop_path: item.images?.jpg?.large_image_url,
            media_type: "tv",
            source: "jikan"
        }));
    } catch (error) {
        console.error("Jikan Fetch Error:", error);
        return [];
    }
};

/**
 * Comprehensive Waterfall Search
 */
export const comprehensiveWaterfallSearch = async (query: string) => {
    // 1. We assume TMDB already failed if this is called
    // 2. Try Internet Archive
    const iaResults = await fetchInternetArchiveMetadata(query);
    if (iaResults.length > 0) return iaResults;

    // 3. Try Jikan
    const jikanResults = await fetchJikanMetadata(query);
    return jikanResults;
};
