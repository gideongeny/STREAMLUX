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
exports.crawlO2TvSeries = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const BASE_URL = 'https://o2tvseries.com';
const crawlO2TvSeries = async () => {
    try {
        // O2 often redirects or has specific landing pages. We'll try the recently updated page or home.
        const url = `${BASE_URL}/search/list_all_tv_series`; // Or just base
        console.log(`Crawling O2TvSeries (${url})...`);
        const { data } = await axios_1.default.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });
        const $ = cheerio.load(data);
        const results = [];
        // O2 structure is often simple lists
        $('.data_list div').each((_, element) => {
            const link = $(element).find('a');
            const title = link.text().trim();
            const href = link.attr('href');
            if (title && href) {
                results.push({
                    title,
                    url: href,
                    source: 'O2TvSeries',
                    category: 'Series'
                });
            }
        });
        console.log(`Found ${results.length} items on O2TvSeries.`);
        return results.slice(0, 50); // Limit
    }
    catch (error) {
        console.error('Error crawling O2TvSeries:', error);
        return [];
    }
};
exports.crawlO2TvSeries = crawlO2TvSeries;
