import axiosClient from '../shared/axios';
import { Item } from '../shared/types';
import { logger } from '../utils/logger';

interface ScrapedItem {
    title: string;
    url: string;
    source: string;
    category?: string;
    quality?: string;
    year?: number;
}

// Search TMDB for a title and return the best match
async function searchTMDB(title: string, mediaType: 'movie' | 'tv'): Promise<Item | null> {
    try {
        // Clean title for better matching
        const cleanTitle = title
            .replace(/\([0-9]{4}\)/g, '') // Remove year
            .replace(/\b(HD|CAM|720p|1080p|MP4|3GP)\b/gi, '') // Remove quality markers
            .trim();

        const endpoint = mediaType === 'movie' ? '/search/movie' : '/search/tv';
        const response = await axiosClient.get(endpoint, {
            params: {
                query: cleanTitle,
                page: 1
            }
        });

        if (response.data.results && response.data.results.length > 0) {
            const firstResult = response.data.results[0];
            return {
                ...firstResult,
                media_type: mediaType
            };
        }

        return null;
    } catch (error) {
        logger.warn(`Failed to search TMDB for "${title}":`, error);
        return null;
    }
}

// Convert scraped data to TMDB format with poster matching
export async function enrichScrapedContent(
    scrapedData: ScrapedItem[],
    limit: number = 50
): Promise<Item[]> {
    const enrichedItems: Item[] = [];
    const processedTitles = new Set<string>();

    // Process in batches to avoid overwhelming TMDB API
    const batchSize = 5;
    const itemsToProcess = scrapedData.slice(0, limit);

    for (let i = 0; i < itemsToProcess.length; i += batchSize) {
        const batch = itemsToProcess.slice(i, i + batchSize);

        const promises = batch.map(async (item) => {
            // Skip duplicates
            if (processedTitles.has(item.title)) return null;
            processedTitles.add(item.title);

            // Determine media type from category or title
            const isTV = item.category?.toLowerCase().includes('series') ||
                item.category?.toLowerCase().includes('tv') ||
                item.title.toLowerCase().includes('season') ||
                item.title.toLowerCase().includes('episode');

            const mediaType = isTV ? 'tv' : 'movie';

            // Search TMDB for matching content
            const tmdbMatch = await searchTMDB(item.title, mediaType);

            if (tmdbMatch) {
                // Enrich TMDB data with download link
                return {
                    ...tmdbMatch,
                    downloadUrl: item.url,
                    downloadSource: item.source,
                    downloadQuality: item.quality
                };
            }

            return null;
        });

        const results = await Promise.all(promises);
        const validResults = results.filter((item) => item !== null) as Item[];
        enrichedItems.push(...validResults);

        // Small delay between batches to respect rate limits
        if (i + batchSize < itemsToProcess.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    logger.log(`Enriched ${enrichedItems.length} scraped items with TMDB data`);
    return enrichedItems;
}

// Get enriched scraped content (cached)
let cachedEnrichedContent: Item[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function getEnrichedScrapedContent(): Promise<Item[]> {
    const now = Date.now();

    // Return cached data if still valid
    if (cachedEnrichedContent && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedEnrichedContent;
    }

    try {
        // Load scraped data
        const scrapedData = await import('../data/downloads.json');
        const items = (scrapedData.default || scrapedData) as ScrapedItem[];

        // Enrich with TMDB data - MAX LIMIT for better coverage
        const enriched = await enrichScrapedContent(items, 1000);

        // Cache results
        cachedEnrichedContent = enriched;
        cacheTimestamp = now;

        return enriched;
    } catch (error) {
        logger.error('Failed to load/enrich scraped content:', error);
        return [];
    }
}
