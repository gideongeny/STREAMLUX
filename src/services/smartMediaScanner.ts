/**
 * SmartMediaScanner — StreamLux Smart Download Detection
 * 
 * Scans the device's Downloads/Movies/DCIM folders for video files
 * that match known StreamLux content (by title & episode metadata).
 * Matched files are surfaced in the Downloads page as "Device Videos"
 * WITHOUT moving or copying them — the original file stays in the
 * user's gallery/phone storage.
 * 
 * Permissions required (added to AndroidManifest.xml):
 *   - READ_MEDIA_VIDEO  (Android 13+)
 *   - READ_EXTERNAL_STORAGE  (Android ≤ 12)
 */

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { safeStorage } from '../utils/safeStorage';
import { logger } from '../utils/logger';

export interface DeviceVideoFile {
    id: string;               // Unique ID (hash of path)
    title: string;            // Matched StreamLux title
    displayName: string;      // Raw filename from device
    path: string;             // Absolute path on device
    localUrl: string;         // Capacitor-safe playback URL
    mediaType: 'movie' | 'tv';
    seasonNumber?: number;
    episodeNumber?: number;
    thumbnail?: string;       // TMDB poster if matched
    sizeBytes: number;
    matchedAt: number;        // Timestamp of scan match
    source: 'device_scan';    // Discriminator
}

/**
 * Parse episode info from common filename patterns:
 *   "Breaking.Bad.S01E05.1080p.mkv"
 *   "Game of Thrones - Season 1 Episode 3.mp4"
 *   "Avengers Endgame 2019.mp4"
 */
function parseFilename(filename: string): {
    cleanTitle: string;
    season?: number;
    episode?: number;
    isTV: boolean;
} {
    // Match S01E05 pattern
    const seMatch = filename.match(/[Ss](\d{1,2})[Ee](\d{1,2})/);
    if (seMatch) {
        const cleanTitle = filename
            .substring(0, seMatch.index)
            .replace(/[._-]/g, ' ')
            .trim();
        return {
            cleanTitle,
            season: parseInt(seMatch[1]),
            episode: parseInt(seMatch[2]),
            isTV: true,
        };
    }

    // Match "Season X Episode Y" pattern
    const longMatch = filename.match(/[Ss]eason\s*(\d+)\s*[Ee]pisode\s*(\d+)/i);
    if (longMatch) {
        const cleanTitle = filename
            .substring(0, longMatch.index)
            .replace(/[._-]/g, ' ')
            .trim();
        return {
            cleanTitle,
            season: parseInt(longMatch[1]),
            episode: parseInt(longMatch[2]),
            isTV: true,
        };
    }

    // Movie (no episode info)
    const cleanTitle = filename
        .replace(/\.(mp4|mkv|avi|mov|m4v|webm)$/i, '')
        .replace(/[._-]/g, ' ')
        .replace(/\b(1080p|720p|480p|BluRay|WEBRip|HDTV|x264|AAC|HEVC|HDR)\b/gi, '')
        .replace(/\b(19|20)\d{2}\b/, '')
        .trim();

    return { cleanTitle, isTV: false };
}

/** Simple string similarity (0–1) for fuzzy title matching */
function similarity(a: string, b: string): number {
    const sa = a.toLowerCase().replace(/\s+/g, ' ').trim();
    const sb = b.toLowerCase().replace(/\s+/g, ' ').trim();
    if (sa === sb) return 1;
    const longer = sa.length > sb.length ? sa : sb;
    const shorter = sa.length > sb.length ? sb : sa;
    if (longer.includes(shorter)) return shorter.length / longer.length;
    // Simple character-overlap score
    const set = new Set(shorter.split(''));
    const overlap = longer.split('').filter(c => set.has(c)).length;
    return overlap / longer.length;
}

interface KnownContent {
    id: number;
    title: string;
    mediaType: 'movie' | 'tv';
    thumbnail?: string;
}

class SmartMediaScannerService {
    private readonly STORAGE_KEY = 'smart_scan_results';
    private scannedFiles: DeviceVideoFile[] = [];

    constructor() {
        this.load();
    }

    /** 
     * Request storage permission and scan common video folders.
     * knownContent: array of titles/IDs from your watchlist/explore history.
     */
    async scan(knownContent: KnownContent[]): Promise<DeviceVideoFile[]> {
        if (!Capacitor.isNativePlatform()) {
            logger.log('[SmartScanner] Web platform – scanning not available');
            return [];
        }

        // On Android 13+, the OS will automatically prompt the user
        // when we try to read external storage via Filesystem.readdir()
        // No explicit pre-request needed with Capacitor's Filesystem plugin.

        const foldersToScan = [
            'Downloads',
            'Movies',
            'Video',
            'DCIM',
        ];

        const found: DeviceVideoFile[] = [];
        const videoExtensions = /\.(mp4|mkv|avi|mov|m4v|webm)$/i;

        for (const folder of foldersToScan) {
            try {
                const result = await Filesystem.readdir({
                    path: folder,
                    directory: Directory.ExternalStorage,
                });

                for (const file of result.files) {
                    const name = typeof file === 'string' ? file : (file as any).name;
                    if (!videoExtensions.test(name)) continue;

                    const filePath = `${folder}/${name}`;
                    const parsed = parseFilename(name);

                    // Try to match against known content
                    let bestMatch: KnownContent | null = null;
                    let bestScore = 0;

                    for (const content of knownContent) {
                        const score = similarity(parsed.cleanTitle, content.title);
                        if (score > bestScore && score > 0.55) {
                            bestScore = score;
                            bestMatch = content;
                        }
                    }

                    if (bestMatch) {
                        const uri = await Filesystem.getUri({
                            path: filePath,
                            directory: Directory.ExternalStorage,
                        });

                        const fileId = btoa(filePath).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
                        found.push({
                            id: fileId,
                            title: bestMatch.title,
                            displayName: name,
                            path: filePath,
                            localUrl: Capacitor.convertFileSrc(uri.uri),
                            mediaType: bestMatch.mediaType,
                            seasonNumber: parsed.season,
                            episodeNumber: parsed.episode,
                            thumbnail: bestMatch.thumbnail,
                            sizeBytes: 0,
                            matchedAt: Date.now(),
                            source: 'device_scan',
                        });
                    }
                }
            } catch (err) {
                // Folder doesn't exist or no permission – skip silently
                logger.log(`[SmartScanner] Skipping folder ${folder}:`, err);
            }
        }

        // Merge with existing, deduplicating by ID
        const existingIds = new Set(this.scannedFiles.map(f => f.id));
        const newFiles = found.filter(f => !existingIds.has(f.id));
        this.scannedFiles = [...this.scannedFiles, ...newFiles];
        this.save();

        logger.log(`[SmartScanner] Found ${found.length} matches (${newFiles.length} new)`);
        return this.scannedFiles;
    }

    /** Get all previously scanned & matched files */
    getAll(): DeviceVideoFile[] {
        return this.scannedFiles;
    }

    /** Remove a single matched file from the list (does NOT delete the actual file) */
    remove(id: string): void {
        this.scannedFiles = this.scannedFiles.filter(f => f.id !== id);
        this.save();
    }

    /** Clear all scan results */
    clearAll(): void {
        this.scannedFiles = [];
        safeStorage.set(this.STORAGE_KEY, '[]');
    }

    private save(): void {
        safeStorage.set(this.STORAGE_KEY, JSON.stringify(this.scannedFiles));
    }

    private load(): void {
        try {
            const stored = safeStorage.get(this.STORAGE_KEY);
            if (stored) this.scannedFiles = JSON.parse(stored);
        } catch {
            this.scannedFiles = [];
        }
    }
}

export const smartMediaScanner = new SmartMediaScannerService();
