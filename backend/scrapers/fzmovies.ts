import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// FzMovies Base URL (adjust if site domain changes)
const BASE_URL = 'https://www.fzmovies.ng';

interface MovieResult {
    title: string;
    url: string;
    quality?: string;
    size?: string;
    downloadLink?: string;
}

const getHeaders = () => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': BASE_URL,
});

/**
 * Search FzMovies for a query
 */
export const searchFzMovies = async (query: string): Promise<MovieResult[]> => {
    try {
        const searchUrl = `${BASE_URL}/search.php?search=${encodeURIComponent(query)}&submit=Search`;
        console.log(`Searching: ${searchUrl}`);

        const { data } = await axios.get(searchUrl, { headers: getHeaders() });
        const $ = cheerio.load(data);
        const results: MovieResult[] = [];

        // Note: Selectors depend on the actual FzMovies HTML structure, which changes often.
        // This is a generic robust selector strategy.
        $('div.mainbox').each((_, element) => {
            const link = $(element).find('a').first();
            const title = link.text().trim();
            const href = link.attr('href');

            const qualityText = $(element).text();
            let quality = 'Unknown';
            if (qualityText.includes('HD')) quality = 'HD';
            if (qualityText.includes('CAM')) quality = 'CAM';

            if (title && href) {
                results.push({
                    title,
                    url: href.startsWith('http') ? href : `${BASE_URL}/${href}`,
                    quality
                });
            }
        });

        return results;
    } catch (error) {
        console.error('Error searching FzMovies:', error);
        return [];
    }
};

/**
 * Crawl the latest updates page
 */
export const crawlLatest = async (): Promise<MovieResult[]> => {
    try {
        console.log(`Crawling latest movies from ${BASE_URL}...`);
        const { data } = await axios.get(BASE_URL, { headers: getHeaders(), timeout: 10000 });
        console.log(`Response received: ${data.length} bytes`);
        const $ = cheerio.load(data);
        const results: MovieResult[] = [];

        $('a').each((_, element) => {
            const href = $(element).attr('href');
            const title = $(element).text().trim();

            // Heuristic to identify movie links
            if (href && title && (href.includes('movie-') || href.includes('download.php'))) {
                results.push({
                    title,
                    url: href.startsWith('http') ? href : `${BASE_URL}/${href}`,
                    quality: 'Latest'
                });
            }
        });

        return results.slice(0, 50); // Limit to 50
    } catch (error) {
        console.error('Error crawling latest:', error);
        return [];
    }
};

// --- Execution ---
// Run this directly with: ts-node fzmovies.ts [query]

const run = async () => {
    const args = process.argv.slice(2);
    const mode = args[0] || 'latest';

    if (mode === 'search') {
        const query = args[1];
        if (!query) {
            console.error('Please provide a search query: ts-node fzmovies.ts search "Matrix"');
            return;
        }
        const results = await searchFzMovies(query);
        console.log(`Found ${results.length} results for "${query}":`);
        console.log(JSON.stringify(results, null, 2));
    } else {
        const results = await crawlLatest();
        console.log(`Crawled ${results.length} latest movies:`);
        console.log(JSON.stringify(results, null, 2));

        // Save to file
        const outDir = path.join(process.cwd(), 'output');
        console.log(`Saving to directory: ${outDir}`);

        if (!fs.existsSync(outDir)) {
            console.log('Creating output directory...');
            fs.mkdirSync(outDir, { recursive: true });
        }

        const filePath = path.join(outDir, 'fzmovies_latest.json');
        fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
        console.log(`Saved to ${filePath}`);
    }
};

// Execute
run().catch(console.error);
