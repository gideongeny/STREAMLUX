/**
 * Offline Download Manager Service
 * Handles downloading movies/shows for offline viewing
 */

import { Filesystem, Directory, Encoding, DownloadFileResult } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { logger } from '../utils/logger';

export interface DownloadItem {
    id: string;
    title: string;
    type: 'movie' | 'tv';
    thumbnail: string;
    url: string;
    quality: '480p' | '720p' | '1080p';
    size: number; // bytes
    progress: number; // 0-100
    status: 'queued' | 'downloading' | 'paused' | 'completed' | 'failed';
    downloadedBytes: number;
    totalBytes: number;
    filePath?: string;
    addedAt: number;
    completedAt?: number;
    seasonNumber?: number;
    episodeNumber?: number;
}

class OfflineDownloadService {
    private downloads: Map<string, DownloadItem> = new Map();
    private activeDownloads: Set<string> = new Set();
    private maxConcurrentDownloads = 2;

    constructor() {
        this.loadDownloads();
    }

    /**
     * Add item to download queue
     */
    async addToQueue(item: Omit<DownloadItem, 'progress' | 'status' | 'downloadedBytes' | 'totalBytes' | 'addedAt'>): Promise<void> {
        if (!Capacitor.isNativePlatform()) {
            throw new Error('Downloads only available on native platforms');
        }

        const downloadItem: DownloadItem = {
            ...item,
            progress: 0,
            status: 'queued',
            downloadedBytes: 0,
            totalBytes: item.size,
            addedAt: Date.now(),
        };

        this.downloads.set(item.id, downloadItem);
        this.saveDownloads();

        // Start download if under concurrent limit
        if (this.activeDownloads.size < this.maxConcurrentDownloads) {
            this.startDownload(item.id);
        }
    }

    /**
     * Start downloading an item
     */
    private async startDownload(itemId: string): Promise<void> {
        const item = this.downloads.get(itemId);
        if (!item || item.status === 'completed') return;

        this.activeDownloads.add(itemId);
        item.status = 'downloading';
        this.saveDownloads();

        try {
            // Create downloads directory if it doesn't exist
            await this.ensureDownloadsDirectory();

            // Generate filename
            const filename = `${item.id}_${item.quality}.mp4`;
            const filePath = `downloads/${filename}`;

            // Download file with progress tracking
            const result: DownloadFileResult = await Filesystem.downloadFile({
                url: item.url,
                path: filePath,
                directory: Directory.Data,
                // Filesystem.downloadFile automatically handles progress in native core
            });

            if (result.path) {
                item.status = 'completed';
                item.progress = 100;
                item.filePath = result.path;
                item.completedAt = Date.now();

                // Send notification
                this.notifyDownloadComplete(item);
            } else {
                throw new Error('Download failed');
            }
        } catch (error) {
            logger.error('Download error:', error);
            item.status = 'failed';
        } finally {
            this.activeDownloads.delete(itemId);
            this.saveDownloads();

            // Start next queued download
            this.startNextQueuedDownload();
        }
    }

    /**
     * Pause download
     */
    pauseDownload(itemId: string): void {
        const item = this.downloads.get(itemId);
        if (item && item.status === 'downloading') {
            item.status = 'paused';
            this.activeDownloads.delete(itemId);
            this.saveDownloads();
        }
    }

    /**
     * Resume download
     */
    resumeDownload(itemId: string): void {
        const item = this.downloads.get(itemId);
        if (item && item.status === 'paused') {
            this.startDownload(itemId);
        }
    }

    /**
     * Cancel and remove download
     */
    async cancelDownload(itemId: string): Promise<void> {
        const item = this.downloads.get(itemId);
        if (!item) return;

        // Delete file if exists
        if (item.filePath) {
            try {
                await Filesystem.deleteFile({
                    path: item.filePath,
                    directory: Directory.Data,
                });
            } catch (error) {
                logger.error('Error deleting file:', error);
            }
        }

        this.downloads.delete(itemId);
        this.activeDownloads.delete(itemId);
        this.saveDownloads();

        // Start next queued download
        this.startNextQueuedDownload();
    }

    /**
     * Get all downloads
     */
    getDownloads(): DownloadItem[] {
        return Array.from(this.downloads.values()).sort((a, b) => b.addedAt - a.addedAt);
    }

    /**
     * Get completed downloads
     */
    getCompletedDownloads(): DownloadItem[] {
        return this.getDownloads().filter(item => item.status === 'completed');
    }

    /**
     * Check if item is downloaded
     */
    isDownloaded(itemId: string): boolean {
        const item = this.downloads.get(itemId);
        return item?.status === 'completed' && !!item.filePath;
    }

    /**
     * Get download file path
     */
    getDownloadPath(itemId: string): string | null {
        const item = this.downloads.get(itemId);
        return item?.filePath || null;
    }

    /**
     * Get total storage used
     */
    getTotalStorageUsed(): number {
        return Array.from(this.downloads.values())
            .filter(item => item.status === 'completed')
            .reduce((total, item) => total + item.size, 0);
    }

    /**
     * Clear all completed downloads
     */
    async clearCompleted(): Promise<void> {
        const completed = this.getCompletedDownloads();

        for (const item of completed) {
            await this.cancelDownload(item.id);
        }
    }

    /**
     * Ensure downloads directory exists
     */
    private async ensureDownloadsDirectory(): Promise<void> {
        try {
            await Filesystem.mkdir({
                path: 'downloads',
                directory: Directory.Data,
                recursive: true,
            });
        } catch (error) {
            // Directory might already exist
            logger.log('Downloads directory check:', error);
        }
    }

    /**
     * Start next queued download
     */
    private startNextQueuedDownload(): void {
        if (this.activeDownloads.size >= this.maxConcurrentDownloads) return;

        const queued = Array.from(this.downloads.values())
            .find(item => item.status === 'queued');

        if (queued) {
            this.startDownload(queued.id);
        }
    }

    /**
     * Save downloads to storage
     */
    private saveDownloads(): void {
        const data = Array.from(this.downloads.values());
        localStorage.setItem('offline_downloads', JSON.stringify(data));
    }

    /**
     * Load downloads from storage
     */
    private loadDownloads(): void {
        try {
            const stored = localStorage.getItem('offline_downloads');
            if (stored) {
                const items: DownloadItem[] = JSON.parse(stored);
                items.forEach(item => {
                    // Reset downloading status to queued on app restart
                    if (item.status === 'downloading') {
                        item.status = 'queued';
                    }
                    this.downloads.set(item.id, item);
                });
            }
        } catch (error) {
            logger.error('Error loading downloads:', error);
        }
    }

    /**
     * Notify download complete
     */
    private notifyDownloadComplete(item: DownloadItem): void {
        // This would integrate with push notification service
        logger.log('Download complete:', item.title);

        // TODO: Send local notification
        // pushNotificationService.scheduleLocalNotification(
        //   'Download Complete',
        //   `${item.title} is ready to watch offline`,
        //   { itemId: item.id, type: 'download_complete' }
        // );
    }
}

export const offlineDownloadService = new OfflineDownloadService();
