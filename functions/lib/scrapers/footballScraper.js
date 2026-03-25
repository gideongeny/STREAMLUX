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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeSportsLiveToday = exports.scrapeAllSports = void 0;
const playwright = __importStar(require("playwright-core"));
const chrome_aws_lambda_1 = __importDefault(require("chrome-aws-lambda"));
/**
 * Scrape matches from multiple elite sources
 */
async function scrapeAllSports() {
    const sources = [
        { name: 'SportsLiveToday', url: 'https://sportslivetoday.com/live?sportType=football' },
        { name: 'VIPSportLive', url: 'https://www.vipsportlive.com' },
        { name: 'FoxTrend', url: 'https://foxtrend.net/' },
        { name: 'Sporty100', url: 'https://sporty100.com' },
        { name: 'SportSurge', url: 'https://sportsurge.ws/' },
        { name: 'CrackStreams', url: 'https://crackstreams.ms/' }
    ];
    let browser = null;
    const allMatches = [];
    try {
        browser = await playwright.chromium.launch({
            args: chrome_aws_lambda_1.default.args,
            executablePath: await chrome_aws_lambda_1.default.executablePath,
            headless: chrome_aws_lambda_1.default.headless,
        });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        });
        for (const source of sources) {
            try {
                const page = await context.newPage();
                await page.goto(source.url, { waitUntil: 'networkidle', timeout: 30000 });
                await page.waitForTimeout(3000);
                const sourceMatches = await page.evaluate((sourceName) => {
                    const results = [];
                    const items = Array.from(document.querySelectorAll('a, .match-item, .fixture, [class*="match"], [class*="fixture"]'));
                    items.forEach((el) => {
                        var _a, _b, _c, _d, _e;
                        const text = el.innerText || "";
                        if ((text.includes(' vs ') || text.includes(' - ')) && text.length < 200) {
                            const link = el.href || ((_a = el.closest('a')) === null || _a === void 0 ? void 0 : _a.href) || "";
                            if (link && link.startsWith('http')) {
                                const parts = text.split(/\s+vs\s+|\s+-\s+/);
                                results.push({
                                    home: ((_c = (_b = parts[0]) === null || _b === void 0 ? void 0 : _b.trim().split('\n').pop()) === null || _c === void 0 ? void 0 : _c.trim()) || "Match",
                                    away: ((_e = (_d = parts[1]) === null || _d === void 0 ? void 0 : _d.trim().split('\n')[0]) === null || _e === void 0 ? void 0 : _e.trim()) || "Live",
                                    link: link,
                                    source: sourceName
                                });
                            }
                        }
                    });
                    return results;
                }, source.name);
                sourceMatches.forEach((m) => {
                    if (!allMatches.some(existing => existing.link === m.link)) {
                        allMatches.push({
                            id: `scraped-${source.name}-${allMatches.length}-${Date.now()}`,
                            homeTeam: m.home,
                            awayTeam: m.away,
                            status: "live",
                            link: m.link,
                            league: source.name,
                            time: "Live Now"
                        });
                    }
                });
                await page.close();
            }
            catch (e) {
                console.warn(`Failed to scrape ${source.name}:`, e);
            }
        }
        await browser.close();
        return allMatches;
    }
    catch (error) {
        console.error('Error in multi-source scraping:', error);
        if (browser)
            await browser.close();
        return allMatches; // Return whatever we got
    }
}
exports.scrapeAllSports = scrapeAllSports;
/**
 * Legacy support for sportslivetoday
 */
async function scrapeSportsLiveToday() {
    return scrapeAllSports();
}
exports.scrapeSportsLiveToday = scrapeSportsLiveToday;
//# sourceMappingURL=footballScraper.js.map