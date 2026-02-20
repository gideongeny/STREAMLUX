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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlLatest = exports.searchFzMovies = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// FzMovies Base URL (adjust if site domain changes)
const BASE_URL = 'https://www.fzmovies.ng';
const getHeaders = () => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': BASE_URL,
});
/**
 * Search FzMovies for a query
 */
const searchFzMovies = async (query) => {
    try {
        const searchUrl = `${BASE_URL}/search.php?search=${encodeURIComponent(query)}&submit=Search`;
        console.log(`Searching: ${searchUrl}`);
        const { data } = await axios_1.default.get(searchUrl, { headers: getHeaders() });
        const $ = cheerio.load(data);
        const results = [];
        // Note: Selectors depend on the actual FzMovies HTML structure, which changes often.
        // This is a generic robust selector strategy.
        $('div.mainbox').each((_, element) => {
            const link = $(element).find('a').first();
            const title = link.text().trim();
            const href = link.attr('href');
            const qualityText = $(element).text();
            let quality = 'Unknown';
            if (qualityText.includes('HD'))
                quality = 'HD';
            if (qualityText.includes('CAM'))
                quality = 'CAM';
            if (title && href) {
                results.push({
                    title,
                    url: href.startsWith('http') ? href : `${BASE_URL}/${href}`,
                    quality
                });
            }
        });
        return results;
    }
    catch (error) {
        console.error('Error searching FzMovies:', error);
        return [];
    }
};
exports.searchFzMovies = searchFzMovies;
/**
 * Crawl the latest updates page
 */
const crawlLatest = async () => {
    try {
        console.log(`Crawling latest movies from ${BASE_URL}...`);
        const { data } = await axios_1.default.get(BASE_URL, { headers: getHeaders(), timeout: 10000 });
        console.log(`Response received: ${data.length} bytes`);
        const $ = cheerio.load(data);
        const results = [];
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
    }
    catch (error) {
        console.error('Error crawling latest:', error);
        return [];
    }
};
exports.crawlLatest = crawlLatest;
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
        const results = await (0, exports.searchFzMovies)(query);
        console.log(`Found ${results.length} results for "${query}":`);
        console.log(JSON.stringify(results, null, 2));
    }
    else {
        const results = await (0, exports.crawlLatest)();
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
