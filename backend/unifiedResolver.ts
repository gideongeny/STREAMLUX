import express from 'express';
import { scrapeGogoAnime, scrapeDramacool, scrapeOkRu } from './scrapers/consumet';
import { searchFzMovies } from './scrapers/fzmovies';
// Import other scrapers as needed (NetNaija etc need to be adapted to export search functions)

const router = express.Router();

interface UnifiedResult {
    source: string;
    title: string;
    url: string;
    quality?: string;
    isSeries?: boolean;
}

export const unifiedResolver = async (req: express.Request, res: express.Response) => {
    const { title, year, type, season, episode } = req.query;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const searchQuery = `${title} ${year || ''}`.trim();
    console.log(`[UnifiedResolver] resolving for: ${searchQuery} (${type})`);

    try {
        // Run all scrapers in parallel
        const results = await Promise.allSettled([
            searchFzMovies(searchQuery).then(res => res.map(r => ({ ...r, source: 'FZMovies', isSeries: false }))),
            scrapeGogoAnime(String(title)).then(res => res.map(r => ({ ...r, source: 'GogoAnime' }))),
            scrapeDramacool(String(title)).then(res => res.map(r => ({ ...r, source: 'Dramacool' }))),
            scrapeOkRu(searchQuery).then(res => res.map(r => ({ ...r, source: 'OK.ru' })))
        ]);

        let combinedResults: UnifiedResult[] = [];

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                combinedResults = [...combinedResults, ...result.value];
            }
        });

        // Basic deduplication and sorting could be added here

        // Return 
        res.json({
            query: searchQuery,
            count: combinedResults.length,
            results: combinedResults
        });

    } catch (error) {
        console.error('[UnifiedResolver] Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default unifiedResolver;
