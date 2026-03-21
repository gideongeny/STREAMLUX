/**
 * deviceFilePicker.ts — Persistent Video Importer for StreamLux
 *
 * FIXES:
 *  - 404 error: blob: URLs die on navigation. We now copy each selected
 *    video into Directory.Data (private app storage) using Capacitor's
 *    Filesystem, then generate a permanent capacitor:// URI.
 *  - Multi-select: user can pick several videos at once.
 *  - TMDB enrichment: filename is parsed and searched on TMDB for poster art.
 *
 * The original video stays in the user's gallery untouched.
 */

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { safeStorage } from '../utils/safeStorage';
import { logger } from '../utils/logger';
import axios from '../shared/axios';

export interface ImportedVideoFile {
    id: string;
    originalName: string;
    title: string;
    internalPath: string;   // Path inside Directory.Data
    localUrl: string;       // capacitor:// URI — persistent across sessions
    sizeBytes: number;
    mediaType: 'movie' | 'tv';
    seasonNumber?: number;
    episodeNumber?: number;
    episodeTitle?: string;
    thumbnail?: string;     // TMDB poster URL
    backdrop?: string;
    overview?: string;
    voteAverage?: number;
    importedAt: number;
    source: 'device_import';
}

const STORAGE_KEY = 'device_imported_videos_v2';
const VIDEO_EXTS = /\.(mp4|mkv|avi|mov|m4v|webm|ts|flv)$/i;

/* ─── Filename parser ─────────────────────────────────────────────────────── */

function parseFilename(filename: string) {
    const seMatch = filename.match(/[Ss](\d{1,2})[Ee](\d{1,2})/);
    if (seMatch) {
        const cleanTitle = filename
            .substring(0, seMatch.index!)
            .replace(/[._\-\[\]()]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return { cleanTitle: cleanTitle || filename, season: parseInt(seMatch[1]), episode: parseInt(seMatch[2]), isTV: true };
    }
    const cleanTitle = filename
        .replace(/\.(mp4|mkv|avi|mov|m4v|webm|ts|flv)$/i, '')
        .replace(/[._\-\[\]()]/g, ' ')
        .replace(/\b(1080p|720p|480p|2160p|4K|UHD|BluRay|WEBRip|WEB-DL|HDTV|x264|x265|HEVC|AAC|AC3|HDR|REMUX)\b/gi, '')
        .replace(/\b(19|20)\d{2}\b/, '')
        .replace(/\s+/g, ' ')
        .trim();
    return { cleanTitle: cleanTitle || filename, isTV: false };
}

/* ─── TMDB search ─────────────────────────────────────────────────────────── */

async function enrichWithTMDB(cleanTitle: string, isTV: boolean, season?: number, episode?: number) {
    try {
        const type = isTV ? 'tv' : 'movie';
        const res = await axios.get('/tmdb', {
            params: { endpoint: `/search/${type}`, query: cleanTitle, page: 1 },
            timeout: 8000,
        });
        const best = res.data?.results?.[0];
        if (!best) return {};
        const base: Partial<ImportedVideoFile> = {
            tmdbId: best.id,
            title: best.name || best.title || cleanTitle,
            thumbnail: best.poster_path ? `https://image.tmdb.org/t/p/w500${best.poster_path}` : undefined,
            backdrop: best.backdrop_path ? `https://image.tmdb.org/t/p/w780${best.backdrop_path}` : undefined,
            overview: best.overview,
            voteAverage: best.vote_average,
        } as any;

        // Fetch episode title for TV
        if (isTV && best.id && season && episode) {
            try {
                const epRes = await axios.get('/tmdb', {
                    params: { endpoint: `/tv/${best.id}/season/${season}/episode/${episode}` },
                    timeout: 6000,
                });
                base.episodeTitle = epRes.data?.name;
            } catch { /* no episode title */ }
        }
        return base;
    } catch {
        return {};
    }
}

/* ─── File copy to persistent storage ────────────────────────────────────── */

function readAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function ensureDir(path: string) {
    try { await Filesystem.mkdir({ path, directory: Directory.Data, recursive: true }); } catch { /* exists */ }
}

/* ─── Service ─────────────────────────────────────────────────────────────── */

class DeviceFilePickerService {
    private imported: ImportedVideoFile[] = [];

    constructor() { this.load(); }

    /**
     * Opens the native video picker with multi-select support.
     * Each selected video is:
     *   1. Read as base64
     *   2. Written to Directory.Data/imports/ for persistence
     *   3. Converted to a capacitor:// URI that survives navigation
     *   4. Matched on TMDB for poster art
     * Returns array of newly imported files.
     */
    pickAndImport(onProgress?: (done: number, total: number) => void): Promise<ImportedVideoFile[]> {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'video/*';
            input.multiple = true;
            input.style.display = 'none';
            document.body.appendChild(input);

            input.onchange = async () => {
                const files = Array.from(input.files || []).filter(f => VIDEO_EXTS.test(f.name));
                document.body.removeChild(input);
                if (files.length === 0) { resolve([]); return; }

                await ensureDir('imports');
                const results: ImportedVideoFile[] = [];
                const existingNames = new Set(this.imported.map(i => i.originalName));

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    onProgress?.(i, files.length);

                    // Skip duplicates
                    if (existingNames.has(file.name)) continue;

                    try {
                        logger.log(`[FilePicker] Importing ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`);

                        // Copy to app storage
                        const base64 = await readAsBase64(file);
                        const safeFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._]/g, '_')}`;
                        const internalPath = `imports/${safeFilename}`;

                        await Filesystem.writeFile({
                            path: internalPath,
                            directory: Directory.Data,
                            data: base64,
                        });

                        // Get persistent capacitor:// URI
                        const uriResult = await Filesystem.getUri({ path: internalPath, directory: Directory.Data });
                        const localUrl = Capacitor.convertFileSrc(uriResult.uri);

                        // Parse filename
                        const parsed = parseFilename(file.name);

                        // Build entry
                        const entry: ImportedVideoFile = {
                            id: `imp_${Date.now()}_${i}`,
                            originalName: file.name,
                            title: parsed.cleanTitle,
                            internalPath,
                            localUrl,
                            sizeBytes: file.size,
                            mediaType: parsed.isTV ? 'tv' : 'movie',
                            seasonNumber: (parsed as any).season,
                            episodeNumber: (parsed as any).episode,
                            importedAt: Date.now(),
                            source: 'device_import',
                        };

                        // TMDB enrichment
                        const tmdb = await enrichWithTMDB(
                            parsed.cleanTitle,
                            parsed.isTV,
                            (parsed as any).season,
                            (parsed as any).episode
                        );
                        Object.assign(entry, tmdb);
                        if ((tmdb as any).title) entry.title = (tmdb as any).title;

                        this.imported.push(entry);
                        existingNames.add(file.name);
                        results.push(entry);
                    } catch (err) {
                        logger.error('[FilePicker] Error importing file:', err);
                    }
                }

                onProgress?.(files.length, files.length);
                this.save();
                logger.log(`[FilePicker] Imported ${results.length} new files`);
                resolve(results);
            };

            input.oncancel = () => { document.body.removeChild(input); resolve([]); };
            input.click();
        });
    }

    getAll(): ImportedVideoFile[] { return [...this.imported].reverse(); }

    /** Group by series for TV, flat list for movies */
    getGrouped(): { movies: ImportedVideoFile[]; tvGroups: Map<string, ImportedVideoFile[]> } {
        const movies: ImportedVideoFile[] = [];
        const tvGroups = new Map<string, ImportedVideoFile[]>();

        for (const file of this.imported) {
            if (file.mediaType === 'tv') {
                const key = file.title;
                if (!tvGroups.has(key)) tvGroups.set(key, []);
                tvGroups.get(key)!.push(file);
            } else {
                movies.push(file);
            }
        }

        // Sort episodes within each group
        tvGroups.forEach((eps) => {
            eps.sort((a, b) => {
                const aKey = (a.seasonNumber ?? 0) * 1000 + (a.episodeNumber ?? 0);
                const bKey = (b.seasonNumber ?? 0) * 1000 + (b.episodeNumber ?? 0);
                return aKey - bKey;
            });
        });

        return { movies, tvGroups };
    }

    async remove(id: string): Promise<void> {
        const item = this.imported.find(i => i.id === id);
        if (item) {
            try { await Filesystem.deleteFile({ path: item.internalPath, directory: Directory.Data }); } catch { /* ok */ }
        }
        this.imported = this.imported.filter(i => i.id !== id);
        this.save();
    }

    private save() { safeStorage.set(STORAGE_KEY, JSON.stringify(this.imported)); }
    private load() {
        try {
            const s = safeStorage.get(STORAGE_KEY);
            this.imported = s ? JSON.parse(s) : [];
        } catch { this.imported = []; }
    }
}

// Extend the type with optional tmdbId for internal use
declare module './deviceFilePicker' {
    interface ImportedVideoFile { tmdbId?: number; }
}

export const deviceFilePicker = new DeviceFilePickerService();
