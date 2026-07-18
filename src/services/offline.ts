import { Filesystem, Directory } from '@capacitor/filesystem';
import { safeStorage } from '../utils/safeStorage';

export interface OfflineItem {
    id: string;
    title: string;
    type: 'movie' | 'tv';
    posterPath: string;
    localPath: string;
    size: number;
    duration?: number;
    addedAt: number;
    status: 'completed' | 'downloading' | 'failed';
    progress: number;
}

const STORAGE_KEY = 'streamlux_offline_library';

class OfflineService {
    private static instance: OfflineService;

    static getInstance(): OfflineService {
        if (!OfflineService.instance) {
            OfflineService.instance = new OfflineService();
        }
        return OfflineService.instance;
    }

    async getLibrary(): Promise<OfflineItem[]> {
        const stored = safeStorage.get(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    private async saveLibrary(library: OfflineItem[]) {
        safeStorage.set(STORAGE_KEY, JSON.stringify(library));
    }

    async startDownload(id: string, title: string, url: string, posterPath: string, type: 'movie' | 'tv'): Promise<void> {
        let library = await this.getLibrary();

        const newItem: OfflineItem = {
            id,
            title,
            type,
            posterPath,
            localPath: '',
            size: 0,
            addedAt: Date.now(),
            status: 'downloading',
            progress: 0
        };

        library.push(newItem);
        await this.saveLibrary(library);

        try {
            // Native Capacitor Download
            const fileName = `${id}.mp4`;

            // Progress listener
            const listener = await Filesystem.addListener('progress', (progress) => {
                if (progress.url === url) {
                    this.updateProgress(id, (progress.bytes / (progress.contentLength || 1)) * 100);
                }
            });

            const response = await Filesystem.downloadFile({
                url: url,
                path: `offline/vids/${fileName}`,
                directory: Directory.Data,
                recursive: true,
                progress: true
            });

            listener.remove();

            if (response.path) {
                library = await this.getLibrary();
                const item = library.find(i => i.id === id);
                if (item) {
                    item.status = 'completed';
                    item.localPath = response.path;
                    item.progress = 100;
                    await this.saveLibrary(library);
                }
            }
        } catch (error) {
            console.error('Download failed:', error);
            this.updateStatus(id, 'failed');
        }
    }

    private async updateProgress(id: string, progress: number) {
        const library = await this.getLibrary();
        const item = library.find(i => i.id === id);
        if (item) {
            item.progress = Math.round(progress);
            await this.saveLibrary(library);
        }
    }

    private async updateStatus(id: string, status: OfflineItem['status']) {
        const library = await this.getLibrary();
        const item = library.find(i => i.id === id);
        if (item) {
            item.status = status;
            await this.saveLibrary(library);
        }
    }

    async deleteItem(id: string): Promise<void> {
        let library = await this.getLibrary();
        const item = library.find(i => i.id === id);

        if (item && item.localPath) {
            try {
                await Filesystem.deleteFile({
                    path: item.localPath
                });
            } catch (e) {
                console.warn('File already deleted or missing');
            }
        }

        library = library.filter(i => i.id !== id);
        await this.saveLibrary(library);
    }

    async getLocalUrl(localPath: string): Promise<string> {
        const file = await Filesystem.getUri({
            path: localPath,
            directory: Directory.Data
        });
        return Capacitor.convertFileSrc(file.uri);
    }
}

// Global variable support for Capacitor
declare var Capacitor: any;

export const offlineService = OfflineService.getInstance();
