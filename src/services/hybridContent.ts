import { Item } from '../shared/types';

interface DownloadLink {
    source: string;
    url: string;
    quality?: string;
}

export interface HybridItem extends Item {
    downloads?: DownloadLink[];
}

// Load scraped downloads data
let scrapedData: any[] = [];

try {
    scrapedData = require('../data/downloads.json');
} catch (e) {
    console.warn('downloads.json not found, hybrid content will not include download links');
}

// Simple title normalization for matching
function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/\([0-9]{4}\)/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Match scraped content to TMDB item
function findDownloads(tmdbTitle: string): DownloadLink[] {
    const normalized = normalizeTitle(tmdbTitle);
    const matches: DownloadLink[] = [];

    for (const item of scrapedData) {
        const scrapedNormalized = normalizeTitle(item.title);

        // Check if titles match (contains or exact)
        if (scrapedNormalized.includes(normalized) || normalized.includes(scrapedNormalized)) {
            matches.push({
                source: item.source,
                url: item.url,
                quality: item.quality
            });
        }
    }

    return matches;
}

// Enrich TMDB items with download links
export function enrichWithDownloads(items: Item[]): HybridItem[] {
    return items.map(item => {
        const title = item.title || item.name || '';
        const downloads = findDownloads(title);

        return {
            ...item,
            downloads: downloads.length > 0 ? downloads : undefined
        };
    });
}

// Get download count for a specific item
export function getDownloadCount(title: string): number {
    return findDownloads(title).length;
}

// Check if item has downloads
export function hasDownloads(title: string): boolean {
    return findDownloads(title).length > 0;
}
