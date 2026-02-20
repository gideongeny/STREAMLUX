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
exports.crawlMP4Mania = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const BASE_URL = 'https://mp4mania.com';
const getHeaders = () => ({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': BASE_URL,
});
const crawlMP4Mania = async () => {
    try {
        console.log(`Crawling MP4Mania (${BASE_URL})...`);
        const { data } = await axios_1.default.get(BASE_URL, { headers: getHeaders(), timeout: 15000 });
        const $ = cheerio.load(data);
        const results = [];
        // MP4Mania structure
        $('article, .post, .movie-item, .entry').each((_, element) => {
            var _a;
            const titleElem = $(element).find('h2 a, h3 a, .entry-title a').first();
            const title = titleElem.text().trim();
            const href = titleElem.attr('href');
            const quality = (_a = $(element).text().match(/(MP4|3GP|720p|480p)/i)) === null || _a === void 0 ? void 0 : _a[0];
            if (title && href) {
                results.push({
                    title,
                    url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
                    source: 'MP4Mania',
                    category: 'Movie',
                    quality
                });
            }
        });
        console.log(`Found ${results.length} items on MP4Mania.`);
        return results.slice(0, 100);
    }
    catch (error) {
        console.error('Error crawling MP4Mania:', error);
        return [];
    }
};
exports.crawlMP4Mania = crawlMP4Mania;
