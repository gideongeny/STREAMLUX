/**
 * deviceFilePicker.ts — Real Native File Picker for StreamLux
 *
 * Uses the browser's native <input type="file"> API which on Android
 * triggers the full native Storage Access Framework (SAF) file picker.
 * This lets users browse ALL folders: Chrome Downloads, Downloads,
 * SD Card, Google Drive, etc. — with ZERO custom permissions required.
 *
 * When a file is picked:
 *  1. We read it as an ArrayBuffer
 *  2. Write it to Directory.Data using Capacitor Filesystem (private app storage)
 *  3. Return metadata + a persistent internal path for playback
 */

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { safeStorage } from '../utils/safeStorage';
import { logger } from '../utils/logger';

export interface ImportedVideoFile {
    id: string;
    originalName: string;
    title: string;           // Cleaned display title
    internalPath: string;    // Path inside Directory.Data
    localUrl: string;        // Capacitor.convertFileSrc() for playback
    sizeBytes: number;
    mediaType: 'movie' | 'tv';
    seasonNumber?: number;
    episodeNumber?: number;
    thumbnail?: string;
    importedAt: number;
    source: 'device_import';
}

const STORAGE_KEY = 'device_imported_videos';

/** Parse a filename into clean title + episode info */
function parseFilename(filename: string): {
    cleanTitle: string;
    season?: number;
    episode?: number;
    isTV: boolean;
} {
    const seMatch = filename.match(/[Ss](\d{1,2})[Ee](\d{1,2})/);
    if (seMatch) {
        const cleanTitle = filename
            .substring(0, seMatch.index!)
            .replace(/[._-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        return { cleanTitle, season: parseInt(seMatch[1]), episode: parseInt(seMatch[2]), isTV: true };
    }
    // Movie: strip quality tags and year
    const cleanTitle = filename
        .replace(/\.(mp4|mkv|avi|mov|m4v|webm)$/i, '')
        .replace(/[._-]/g, ' ')
        .replace(/\b(1080p|720p|480p|2160p|4K|BluRay|WEBRip|HDTV|x264|x265|AAC|HEVC|HDR|SDR)\b/gi, '')
        .replace(/\b(19|20)\d{2}\b/, '')
        .replace(/\s+/g, ' ')
        .trim();
    return { cleanTitle, isTV: false };
}

class DeviceFilePickerService {
    private imported: ImportedVideoFile[] = [];

    constructor() { this.load(); }

    /**
     * Opens the native Android/iOS file picker. The user can browse
     * any folder on their device (Chrome Downloads, Downloads, SD card…).
     * Returns the imported video metadata, or null if cancelled.
     */
    pickAndImport(): Promise<ImportedVideoFile | null> {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'video/*';
            input.style.display = 'none';
            document.body.appendChild(input);

            input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) { resolve(null); document.body.removeChild(input); return; }

                try {
                    logger.log(`[FilePicker] User picked: ${file.name} (${file.size} bytes)`);
                    const parsed = parseFilename(file.name);

                    // Read file as base64
                    const base64 = await this.readAsBase64(file);

                    // Write to private app storage
                    const filename = `import_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._]/g, '_')}`;
                    const internalPath = `imports/${filename}`;

                    await this.ensureImportsDir();
                    await Filesystem.writeFile({
                        path: internalPath,
                        directory: Directory.Data,
                        data: base64,
                    });

                    const uri = await Filesystem.getUri({
                        path: internalPath,
                        directory: Directory.Data,
                    });

                    const imported: ImportedVideoFile = {
                        id: `imp_${Date.now()}`,
                        originalName: file.name,
                        title: parsed.cleanTitle || file.name,
                        internalPath,
                        localUrl: Capacitor.convertFileSrc(uri.uri),
                        sizeBytes: file.size,
                        mediaType: parsed.isTV ? 'tv' : 'movie',
                        seasonNumber: parsed.season,
                        episodeNumber: parsed.episode,
                        importedAt: Date.now(),
                        source: 'device_import',
                    };

                    this.imported.push(imported);
                    this.save();
                    resolve(imported);
                } catch (err) {
                    logger.error('[FilePicker] Import error:', err);
                    resolve(null);
                } finally {
                    document.body.removeChild(input);
                }
            };

            input.oncancel = () => {
                resolve(null);
                document.body.removeChild(input);
            };

            input.click();
        });
    }

    getAll(): ImportedVideoFile[] { return [...this.imported].reverse(); }

    async remove(id: string): Promise<void> {
        const item = this.imported.find(i => i.id === id);
        if (item) {
            try {
                await Filesystem.deleteFile({ path: item.internalPath, directory: Directory.Data });
            } catch { /* already deleted */ }
        }
        this.imported = this.imported.filter(i => i.id !== id);
        this.save();
    }

    private readAsBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // Strip the data:video/...;base64, prefix
                resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    private async ensureImportsDir(): Promise<void> {
        try {
            await Filesystem.mkdir({ path: 'imports', directory: Directory.Data, recursive: true });
        } catch { /* already exists */ }
    }

    private save(): void { safeStorage.set(STORAGE_KEY, JSON.stringify(this.imported)); }
    private load(): void {
        try {
            const s = safeStorage.get(STORAGE_KEY);
            if (s) this.imported = JSON.parse(s);
        } catch { this.imported = []; }
    }
}

export const deviceFilePicker = new DeviceFilePickerService();
