import * as fs from 'fs';
import * as path from 'path';
import { crawlNetNaija } from './netnaija';
import { crawlO2TvSeries } from './o2tvseries';
import { crawlLatest as crawlFzMovies } from './fzmovies';

const OUTPUT_FILE = path.join(process.cwd(), '../src/data/downloads.json');

const runAll = async () => {
    console.log('Starting full scrape...');

    const [netnaija, o2tv, fzmovies] = await Promise.all([
        crawlNetNaija(),
        crawlO2TvSeries(),
        crawlFzMovies()
    ]);

    // Normalize FzMovies data to match common interface
    const normalizedFz = fzmovies.map(m => ({
        title: m.title,
        url: m.url,
        source: 'FzMovies',
        category: 'Movie',
        quality: m.quality
    }));

    const allData = [
        ...netnaija,
        ...o2tv,
        ...normalizedFz
    ];

    console.log(`Total items found: ${allData.length}`);

    // Ensure directory exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allData, null, 2));
    console.log(`Saved combined data to ${OUTPUT_FILE}`);
};

runAll().catch(console.error);
