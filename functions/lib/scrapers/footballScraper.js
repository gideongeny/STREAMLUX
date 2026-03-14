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
exports.scrapeSportsLiveToday = scrapeSportsLiveToday;
const playwright = __importStar(require("playwright-core"));
const chrome_aws_lambda_1 = __importDefault(require("chrome-aws-lambda"));
/**
 * Scrape matches from sportslivetoday.com
 */
async function scrapeSportsLiveToday() {
    let browser = null;
    try {
        browser = await playwright.chromium.launch({
            args: chrome_aws_lambda_1.default.args,
            executablePath: await chrome_aws_lambda_1.default.executablePath,
            headless: chrome_aws_lambda_1.default.headless,
        });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        });
        const page = await context.newPage();
        // Navigate with a generous timeout
        await page.goto('https://sportslivetoday.com/live?sportType=football', {
            waitUntil: 'networkidle',
            timeout: 60000
        });
        // Wait a bit for JS to render the lists
        await page.waitForTimeout(5000);
        // Heuristic-based extraction script
        const matches = await page.evaluate(() => {
            const results = [];
            // Look for common match card containers or links
            const items = Array.from(document.querySelectorAll('a, .match-item, .fixture, [class*="match"], [class*="fixture"]'));
            items.forEach((el) => {
                var _a;
                const text = el.innerText || "";
                if (text.includes(' vs ') || text.includes(' - ')) {
                    const teams = text.split(/\s+vs\s+|\s+-\s+/);
                    if (teams.length >= 2 && text.length < 250) {
                        const link = el.href || ((_a = el.closest('a')) === null || _a === void 0 ? void 0 : _a.href) || "";
                        if (link && !results.some(r => r.link === link)) {
                            results.push({
                                home: teams[0].trim().split('\n').pop().trim(),
                                away: teams[1].trim().split('\n')[0].trim(),
                                text: text.trim(),
                                link: link
                            });
                        }
                    }
                }
            });
            return results;
        });
        await browser.close();
        return matches.map((m, idx) => ({
            id: `scraped-${idx}-${Date.now()}`,
            homeTeam: m.home,
            awayTeam: m.away,
            status: "live",
            link: m.link,
            time: "Live Now"
        }));
    }
    catch (error) {
        console.error('Error scraping sportslivetoday:', error);
        if (browser)
            await browser.close();
        return [];
    }
}
//# sourceMappingURL=footballScraper.js.map