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
exports.crawlGoojara = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const BASE_URL = 'https://www.goojara.to';
const getHeaders = () => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': BASE_URL,
});
const crawlGoojara = async () => {
    try {
        console.log(`Crawling Goojara (${BASE_URL})...`);
        const { data } = await axios_1.default.get(BASE_URL, { headers: getHeaders(), timeout: 15000 });
        const $ = cheerio.load(data);
        const results = [];
        // Goojara structure (simplified for example - actual site structure may vary)
        $('.dflex').each((_, element) => {
            const titleElem = $(element).find('.m-title a, .it');
            const title = titleElem.text().trim();
            const href = titleElem.attr('href');
            const quality = $(element).find('.quality, .q').text().trim() || 'HD';
            const year = $(element).find('.year, .y').text().trim();
            if (title && href) {
                results.push({
                    title: year ? `${title} (${year})` : title,
                    url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
                    source: 'Goojara',
                    category: 'Movie', // Simplification, could be series
                    quality
                });
            }
        });
        console.log(`Found ${results.length} items on Goojara.`);
        return results.slice(0, 100);
    }
    catch (error) {
        console.error('Error crawling Goojara:', error);
        return [];
    }
};
exports.crawlGoojara = crawlGoojara;
