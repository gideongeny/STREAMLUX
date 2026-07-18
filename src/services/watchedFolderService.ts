/**
 * watchedFolderService.ts — Plex-Style Watched Folder for StreamLux
 *
 * Flow:
 * 1. User picks a folder via the native picker (SAF intent via webkitdirectory)
 * 2. Service stores metadata for every video file it discovers
 * 3. Each filename is parsed for title/season/episode, then matched on TMDB
 * 4. Results are stored persistently so they survive app restarts
 * 5. Every time the Downloads page opens, scanSavedFolder() is called to pick
 *    up any new files added since the last scan
 *
 * GroupedContent:
 *   - movies[]   → one item per movie file
 *   - tvShows[]  → one item per series, with nested episodes[] sorted by S×E
 */

import axios from '../shared/axios';
import { safeStorage } from '../utils/safeStorage';
import { logger } from '../utils/logger';

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface WatchedFile {
    id: string;             // Stable hash of filename + size
    filename: string;       // Original filename
    localUrl: string;       // blob: URL (ephemeral) or empty until re-picked
    sizeBytes: number;
    addedAt: number;

    // TMDB result — filled after search
    tmdbId?: number;
    mediaType?: 'movie' | 'tv';
    title?: string;         // Movie title / Series name
    posterPath?: string;    // TMDB poster_path
    backdropPath?: string;
    overview?: string;
    releaseDate?: string;
    voteAverage?: number;

    // Episode-specific
    seasonNumber?: number;
    episodeNumber?: number;
    episodeTitle?: string;
    episodeStillPath?: string;  // TMDB episode still image
}

export interface WatchedTVShow {
    tmdbId: number;
    title: string;
    posterPath?: string;
    backdropPath?: string;
    overview?: string;
    episodes: WatchedFile[];  // Sorted by S×E
}

export interface GroupedContent {
    movies: WatchedFile[];
    tvShows: WatchedTVShow[];
}

/* ─── Filename parser ─────────────────────────────────────────────────────── */

function parseFilename(filename: string): {
    cleanTitle: string;
    season?: number;
    episode?: number;
    isTV: boolean;
} {
    // S01E05 pattern
    const seMatch = filename.match(/[Ss](\d{1,2})[Ee](\d{1,2})/);
    if (seMatch) {
        const cleanTitle = filename
            .substring(0, seMatch.index!)
            .replace(/[._\-\[\]()]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return {
            cleanTitle: cleanTitle || filename,
            season: parseInt(seMatch[1]),
            episode: parseInt(seMatch[2]),
            isTV: true,
        };
    }
    // "Season X Episode Y" pattern
    const longMatch = filename.match(/[Ss]eason\s*(\d+)\s*[Ee]pisode\s*(\d+)/i);
    if (longMatch) {
        const cleanTitle = filename
            .substring(0, longMatch.index!)
            .replace(/[._\-\[\]()]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return {
            cleanTitle: cleanTitle || filename,
            season: parseInt(longMatch[1]),
            episode: parseInt(longMatch[2]),
            isTV: true,
        };
    }
    // Movie
    const cleanTitle = filename
        .replace(/\.(mp4|mkv|avi|mov|m4v|webm|ts|flv)$/i, '')
        .replace(/[._\-\[\]()]/g, ' ')
        .replace(/\b(1080p|720p|480p|2160p|4K|UHD|BluRay|BDRip|WEBRip|WEB-DL|HDTV|x264|x265|H264|H265|HEVC|AAC|AC3|DTS|HDR|SDR|10bit|REMUX|PROPER|REPACK)\b/gi, '')
        .replace(/\b(19|20)\d{2}\b/, '')
        .replace(/\s+/g, ' ')
        .trim();
    return { cleanTitle: cleanTitle || filename, isTV: false };
}

/* ─── TMDB search ─────────────────────────────────────────────────────────── */

async function searchTMDB(title: string, isTV: boolean): Promise<Partial<WatchedFile>> {
    try {
        const mediaType = isTV ? 'tv' : 'movie';
        const response = await axios.get('/tmdb', {
            params: {
                endpoint: `/search/${mediaType}`,
                query: title,
                page: 1,
            },
            timeout: 8000,
        });
        const results = response.data?.results;
        if (!results || results.length === 0) return {};
        const best = results[0];
        return {
            tmdbId: best.id,
            mediaType,
            title: best.name || best.title || title,
            posterPath: best.poster_path || undefined,
            backdropPath: best.backdrop_path || undefined,
            overview: best.overview || undefined,
            releaseDate: best.first_air_date || best.release_date || undefined,
            voteAverage: best.vote_average || undefined,
        };
    } catch {
        return {};
    }
}

async function fetchEpisodeDetails(
    tmdbId: number,
    season: number,
    episode: number
): Promise<{ episodeTitle?: string; episodeStillPath?: string }> {
    try {
        const response = await axios.get('/tmdb', {
            params: {
                endpoint: `/tv/${tmdbId}/season/${season}/episode/${episode}`,
            },
            timeout: 8000,
        });
        const ep = response.data;
        return {
            episodeTitle: ep?.name || undefined,
            episodeStillPath: ep?.still_path || undefined,
        };
    } catch {
        return {};
    }
}

/* ─── Stable file ID ──────────────────────────────────────────────────────── */

function makeFileId(filename: string, size: number): string {
    const str = `${filename}-${size}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return `wf_${Math.abs(hash).toString(16)}`;
}

/* ─── Service ─────────────────────────────────────────────────────────────── */

const STORAGE_KEY_FILES = 'watched_folder_files';
const STORAGE_KEY_FOLDERINFO = 'watched_folder_info';
const VIDEO_EXTS = /\.(mp4|mkv|avi|mov|m4v|webm|ts|flv)$/i;

class WatchedFolderService {
    private files: WatchedFile[] = [];

    constructor() {
        this.load();
    }

    /** 
     * Opens the native folder picker (webkitdirectory). 
     * Reads all video files in the chosen folder, matches them to TMDB,
     * and saves the folder name as a reminder for the user.
     * Returns the number of NEW files found.
     */
    pickFolderAndScan(): Promise<number> {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            (input as any).webkitdirectory = true;
            (input as any).multiple = true;
            input.accept = 'video/*';
            input.style.display = 'none';
            document.body.appendChild(input);

            input.onchange = async () => {
                const files = Array.from(input.files || []).filter(f => VIDEO_EXTS.test(f.name));
                document.body.removeChild(input);

                if (files.length === 0) { resolve(0); return; }

                // Save folder name hint from first file's path
                const folderPath = (files[0] as any).webkitRelativePath?.split('/')?.[0] || 'Downloads';
                safeStorage.set(STORAGE_KEY_FOLDERINFO, JSON.stringify({ folderName: folderPath, pickedAt: Date.now() }));

                let newCount = 0;
                const existingIds = new Set(this.files.map(f => f.id));

                for (const file of files) {
                    const id = makeFileId(file.name, file.size);
                    if (existingIds.has(id)) continue;  // Already imported

                    const parsed = parseFilename(file.name);
                    const localUrl = URL.createObjectURL(file);

                    // Build the base entry
                    const entry: WatchedFile = {
                        id,
                        filename: file.name,
                        localUrl,
                        sizeBytes: file.size,
                        addedAt: Date.now(),
                        seasonNumber: parsed.season,
                        episodeNumber: parsed.episode,
                    };

                    // Enrich with TMDB (non-blocking, best-effort)
                    try {
                        const tmdb = await searchTMDB(parsed.cleanTitle, parsed.isTV);
                        Object.assign(entry, tmdb);

                        // Fetch episode title/still for TV
                        if (parsed.isTV && tmdb.tmdbId && parsed.season && parsed.episode) {
                            const epDetails = await fetchEpisodeDetails(
                                tmdb.tmdbId,
                                parsed.season,
                                parsed.episode
                            );
                            Object.assign(entry, epDetails);
                        }
                    } catch {
                        // Continues without TMDB data
                    }

                    this.files.push(entry);
                    existingIds.add(id);
                    newCount++;
                }

                this.save();
                logger.log(`[WatchedFolder] +${newCount} new files`);
                resolve(newCount);
            };

            input.oncancel = () => {
                document.body.removeChild(input);
                resolve(0);
            };

            input.click();
        });
    }

    /** Returns { folderName, pickedAt } or null if no folder chosen yet */
    getFolderInfo(): { folderName: string; pickedAt: number } | null {
        try {
            const raw = safeStorage.get(STORAGE_KEY_FOLDERINFO);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    /** Clears the watched folder and all its files */
    clearAll(): void {
        this.files = [];
        safeStorage.set(STORAGE_KEY_FILES, '[]');
        safeStorage.set(STORAGE_KEY_FOLDERINFO, '');
    }

    /** Remove a single file from the library */
    removeFile(id: string): void {
        this.files = this.files.filter(f => f.id !== id);
        this.save();
    }

    /** All raw files */
    getAll(): WatchedFile[] {
        return [...this.files];
    }

    /** 
     * Returns content grouped into Movies + TV Shows.
     * TV shows are deduplicated by TMDB ID with their episodes nested.
     */
    getGrouped(): GroupedContent {
        const movies: WatchedFile[] = [];
        const showMap = new Map<number, WatchedTVShow>();
        const unknownShows: WatchedFile[] = [];

        for (const file of this.files) {
            if (file.mediaType === 'movie' || (!file.mediaType && !file.seasonNumber)) {
                movies.push(file);
            } else if (file.tmdbId) {
                if (!showMap.has(file.tmdbId)) {
                    showMap.set(file.tmdbId, {
                        tmdbId: file.tmdbId,
                        title: file.title || file.filename,
                        posterPath: file.posterPath,
                        backdropPath: file.backdropPath,
                        overview: file.overview,
                        episodes: [],
                    });
                }
                showMap.get(file.tmdbId)!.episodes.push(file);
            } else {
                // Has season/episode info but no TMDB match
                unknownShows.push(file);
            }
        }

        // Sort episodes within each show
        showMap.forEach((show: WatchedTVShow) => {
            show.episodes.sort((a: WatchedFile, b: WatchedFile) => {
                const aKey = (a.seasonNumber ?? 0) * 1000 + (a.episodeNumber ?? 0);
                const bKey = (b.seasonNumber ?? 0) * 1000 + (b.episodeNumber ?? 0);
                return aKey - bKey;
            });
        });

        return {
            movies,
            tvShows: Array.from(showMap.values()),
        };
    }

    private save(): void {
        // Save without blob URLs (those are ephemeral)
        const serializable = this.files.map(f => ({ ...f, localUrl: '' }));
        safeStorage.set(STORAGE_KEY_FILES, JSON.stringify(serializable));
    }

    private load(): void {
        try {
            const raw = safeStorage.get(STORAGE_KEY_FILES);
            this.files = raw ? JSON.parse(raw) : [];
        } catch {
            this.files = [];
        }
    }
}

export const watchedFolderService = new WatchedFolderService();
