"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTitle = normalizeTitle;
exports.calculateSimilarity = calculateSimilarity;
exports.matchScrapedToTMDB = matchScrapedToTMDB;
// Title matcher using fuzzy string matching
function normalizeTitle(title) {
    return title
        .toLowerCase()
        .replace(/\([0-9]{4}\)/g, '') // Remove year
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
}
function calculateSimilarity(str1, str2) {
    const norm1 = normalizeTitle(str1);
    const norm2 = normalizeTitle(str2);
    // Exact match after normalization
    if (norm1 === norm2)
        return 1.0;
    // Contains match
    if (norm1.includes(norm2) || norm2.includes(norm1))
        return 0.8;
    // Levenshtein distance (simplified)
    const longer = norm1.length > norm2.length ? norm1 : norm2;
    const shorter = norm1.length > norm2.length ? norm2 : norm1;
    if (longer.length === 0)
        return 1.0;
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}
function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
    }
    return matrix[str2.length][str1.length];
}
function matchScrapedToTMDB(scrapedTitle, tmdbTitle) {
    const similarity = calculateSimilarity(scrapedTitle, tmdbTitle);
    return similarity >= 0.7; // 70% similarity threshold
}
