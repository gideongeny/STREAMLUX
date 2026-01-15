"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const netnaija_1 = require("./netnaija");
const o2tvseries_1 = require("./o2tvseries");
const fzmovies_1 = require("./fzmovies");
const toxicwap_1 = require("./toxicwap");
const yts_1 = require("./yts");
const waploaded_1 = require("./waploaded");
const coolmoviez_1 = require("./coolmoviez");
const mp4mania_1 = require("./mp4mania");
const goojara_1 = require("./goojara");
const OUTPUT_FILE = path.join(process.cwd(), '../src/data/downloads.json');
const runAll = async () => {
    console.log('Starting full scrape across 9 sources...');
    // Use Promise.allSettled to continue even if some scrapers fail
    const results = await Promise.allSettled([
        (0, netnaija_1.crawlNetNaija)(),
        (0, o2tvseries_1.crawlO2TvSeries)(),
        (0, fzmovies_1.crawlLatest)(),
        (0, toxicwap_1.crawlToxicWap)(),
        (0, yts_1.crawlYTS)(),
        (0, waploaded_1.crawlWaploaded)(),
        (0, coolmoviez_1.crawlCoolMovieZ)(),
        (0, mp4mania_1.crawlMP4Mania)(),
        (0, goojara_1.crawlGoojara)()
    ]);
    // Extract successful results
    const [netnaija, o2tv, fzmovies, toxicwap, yts, waploaded, coolmoviez, mp4mania, goojara] = results.map((result, idx) => {
        if (result.status === 'fulfilled') {
            return result.value;
        }
        else {
            const sources = ['NetNaija', 'O2TvSeries', 'FzMovies', 'ToxicWap', 'YTS', 'Waploaded', 'CoolMovieZ', 'MP4Mania', 'Goojara'];
            console.warn(`${sources[idx]} scraper failed:`, result.reason);
            return [];
        }
    });
    // Normalize FzMovies data to match common interface
    const normalizedFz = fzmovies.map((m) => ({
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
