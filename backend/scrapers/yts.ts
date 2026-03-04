import axios from 'axios';

const YTS_API_URL = 'https://yts.mx/api/v2/list_movies.json';

export interface DownloadResult {
    title: string;
    url: string;
    source: 'NetNaija' | 'FzMovies' | 'O2TvSeries' | 'ToxicWap' | 'YTS' | 'Waploaded' | 'CoolMovieZ' | 'MP4Mania';
    category?: string;
    quality?: string;
    date?: string;
    year?: number;
    rating?: number;
}

export const crawlYTS = async (): Promise<DownloadResult[]> => {
    try {
        console.log(`Fetching from YTS API (${YTS_API_URL})...`);

        // Fetch multiple pages for more content
        const pages = [1, 2, 3];
        const allResults: DownloadResult[] = [];

        for (const page of pages) {
            const { data } = await axios.get(YTS_API_URL, {
                params: {
                    limit: 50,
                    page,
                    sort_by: 'date_added',
                    order_by: 'desc'
                },
                timeout: 15000
            });

            if (data.status === 'ok' && data.data.movies) {
                const movies = data.data.movies.map((movie: any) => ({
                    title: `${movie.title} (${movie.year})`,
                    url: movie.url,
                    source: 'YTS' as const,
                    category: 'Movie',
                    quality: movie.torrents?.[0]?.quality || 'HD',
                    year: movie.year,
                    rating: movie.rating,
                    date: movie.date_uploaded
                }));

                allResults.push(...movies);
            }
        }

        console.log(`Found ${allResults.length} movies from YTS API.`);
        return allResults;
    } catch (error) {
        console.error('Error fetching from YTS API:', error);
        return [];
    }
};
