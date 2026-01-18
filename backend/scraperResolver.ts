import express, { Request, Response } from 'express';
import { searchFzMovies } from './scrapers/fzmovies';
import { searchNetNaija } from './scrapers/netnaija';
import { scrapeSFlix } from './scrapers/sflix';

const router = express.Router();

/**
 * Scraper resolver endpoint
 * Returns direct video URLs from various scrapers
 */
router.get('/resolve', async (req: Request, res: Response) => {
    try {
        const { type, id, season, episode, title } = req.query;

        if (!type || (!id && !title)) {
            return res.status(400).json({
                error: 'Missing required parameters: type and (id or title)'
            });
        }

        const queryTitle = (title as string) || ""; // In real app, fetch from TMDB if missing

        // Run scrapers in parallel
        const [fzMovies, netNaija, sflixVal] = await Promise.allSettled([
            searchFzMovies(queryTitle),
            searchNetNaija(queryTitle),
            scrapeSFlix(queryTitle)
        ]);

        const response: any = {
            fzmovies: fzMovies.status === 'fulfilled' ? fzMovies.value : [],
            netnaija: netNaija.status === 'fulfilled' ? netNaija.value : [],
            sflix: sflixVal.status === 'fulfilled' ? sflixVal.value : []
        };

        res.json(response);
    } catch (error) {
        console.error('Scraper resolver error:', error);
        res.status(500).json({
            error: 'Failed to resolve scraper sources',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
