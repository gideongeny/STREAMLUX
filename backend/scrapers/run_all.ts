import * as fs from 'fs';
import * as path from 'path';
import { crawlNetNaija } from './netnaija';
import { crawlO2TvSeries } from './o2tvseries';
import { crawlLatest as crawlFzMovies } from './fzmovies';
import { crawlToxicWap } from './toxicwap';
import { crawlYTS } from './yts';
import { crawlWaploaded } from './waploaded';
import { crawlCoolMovieZ } from './coolmoviez';
import { crawlMP4Mania } from './mp4mania';
import { crawlGoojara } from './goojara';

const OUTPUT_FILE = path.join(process.cwd(), '../src/data/downloads.json');

const runAll = async () => {
    console.log('Starting full scrape across 9 sources...');

    // Use Promise.allSettled to continue even if some scrapers fail
    const results = await Promise.allSettled([
        crawlNetNaija(),
        crawlO2TvSeries(),
        crawlFzMovies(),
        crawlToxicWap(),
        crawlYTS(),
        crawlWaploaded(),
        crawlCoolMovieZ(),
        crawlMP4Mania(),
        crawlGoojara()
    ]);

    // Extract successful results
    const [netnaija, o2tv, fzmovies, toxicwap, yts, waploaded, coolmoviez, mp4mania, goojara] = results.map(
        (result, idx) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                const sources = ['NetNaija', 'O2TvSeries', 'FzMovies', 'ToxicWap', 'YTS', 'Waploaded', 'CoolMovieZ', 'MP4Mania', 'Goojara'];
                console.warn(`${sources[idx]} scraper failed:`, result.reason);
                return [];
            }
        }
    );

    // Normalize FzMovies data to match common interface
    const normalizedFz = fzmovies.map((m: any) => ({
        title: m.title,
        url: m.url,
        source: 'FzMovies',
        category: 'Movie',
        quality: m.quality
    }));

    const allData = [
        ...netnaija,
        ...o2tv,
        ...normalizedFz,
        ...toxicwap,
        ...yts,
        ...waploaded,
        ...coolmoviez,
        ...mp4mania,
        ...goojara
    ];

    console.log(`Total items found: ${allData.length}`);
    console.log(`Breakdown: NetNaija=${netnaija.length}, O2TV=${o2tv.length}, FzMovies=${fzmovies.length}, ToxicWap=${toxicwap.length}, YTS=${yts.length}, Waploaded=${waploaded.length}, CoolMovieZ=${coolmoviez.length}, MP4Mania=${mp4mania.length}, Goojara=${goojara.length}`);

    // Ensure directory exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allData, null, 2));
    console.log(`Saved combined data to ${OUTPUT_FILE}`);
};

runAll().catch(console.error);
