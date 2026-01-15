"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlYTS = void 0;
const axios_1 = __importDefault(require("axios"));
const YTS_API_URL = 'https://yts.mx/api/v2/list_movies.json';
const crawlYTS = async () => {
    try {
        console.log(`Fetching from YTS API (${YTS_API_URL})...`);
        // Fetch multiple pages for more content
        const pages = [1, 2, 3];
        const allResults = [];
        for (const page of pages) {
            const { data } = await axios_1.default.get(YTS_API_URL, {
                params: {
                    limit: 50,
                    page,
                    sort_by: 'date_added',
                    order_by: 'desc'
                },
                timeout: 15000
            });
            if (data.status === 'ok' && data.data.movies) {
                const movies = data.data.movies.map((movie) => {
                    var _a, _b;
                    return ({
                        title: `${movie.title} (${movie.year})`,
                        url: movie.url,
                        source: 'YTS',
                        category: 'Movie',
                        quality: ((_b = (_a = movie.torrents) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.quality) || 'HD',
                        year: movie.year,
                        rating: movie.rating,
                        date: movie.date_uploaded
                    });
                });
                allResults.push(...movies);
            }
        }
        console.log(`Found ${allResults.length} movies from YTS API.`);
        return allResults;
    }
    catch (error) {
        console.error('Error fetching from YTS API:', error);
        return [];
    }
};
exports.crawlYTS = crawlYTS;
