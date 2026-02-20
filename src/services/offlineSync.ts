/**
 * Offline Sync Service
 * Handles downloading media for offline viewing using Firebase Functions resolver
 * and Background Fetch API
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { indexedDBService, OfflineMediaMetadata } from './indexedDB';
import { DetailMovie, DetailTV } from '../shared/types';

export interface SyncProgress {
    id: string;
    status: 'pending' | 'resolving' | 'downloading' | 'complete' | 'error';
    progress: number; // 0-100
    downloadedBytes: number;
    totalBytes: number;
    error?: string;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

class OfflineSyncService {
    private activeSyncs: Map<string, SyncProgress> = new Map();
    private progressCallbacks: Map<string, SyncProgressCallback[]> = new Map();

    /**
     * Sync media for offline viewing
     */
    async syncMedia(
        detail: DetailMovie | DetailTV,
        mediaType: 'movie' | 'tv',
        providerUrl: string,
        seasonNumber?: number,
        episodeNumber?: number,
        episodeTitle?: string,
        onProgress?: SyncProgressCallback
    ): Promise<void> {
        const id = this.generateMediaId(detail.id, mediaType, seasonNumber, episodeNumber);

        // Check if already syncing
        if (this.activeSyncs.has(id)) {
            throw new Error('This media is already being synced');
        }

        // Register progress callback
        if (onProgress) {
            this.addProgressCallback(id, onProgress);
        }

        // Initialize progress
        const progress: SyncProgress = {
            id,
            status: 'pending',
            progress: 0,
            downloadedBytes: 0,
            totalBytes: 0,
        };
        this.activeSyncs.set(id, progress);
        this.notifyProgress(id, progress);

        try {
            // Step 1: Resolve direct media URL using Firebase Function
            progress.status = 'resolving';
            progress.progress = 10;
            this.notifyProgress(id, progress);

            const functions = getFunctions(undefined, 'us-central1');
            const resolveStream = httpsCallable(functions, 'resolveStream');

            const result = await resolveStream({
                providerUrl,
                mediaType,
                tmdbId: detail.id,
            });

            const { directUrl, mimeType, quality } = result.data as any;

            if (!directUrl) {
                throw new Error('Failed to resolve direct media URL');
            }

            // Step 2: Download the media file
            progress.status = 'downloading';
            progress.progress = 20;
            this.notifyProgress(id, progress);

            const blob = await this.downloadWithProgress(directUrl, (downloaded, total) => {
                progress.downloadedBytes = downloaded;
                progress.totalBytes = total;
                progress.progress = 20 + Math.floor((downloaded / total) * 70); // 20-90%
                this.notifyProgress(id, progress);
            });

            // Step 3: Save to IndexedDB
            progress.status = 'complete';
            progress.progress = 95;
            this.notifyProgress(id, progress);

            const metadata: OfflineMediaMetadata = {
                id,
                tmdbId: detail.id,
                mediaType,
                title: (detail as DetailMovie).title || (detail as DetailTV).name,
                posterPath: detail.poster_path,
                backdropPath: detail.backdrop_path,
                overview: detail.overview,
                releaseDate: (detail as DetailMovie).release_date || (detail as DetailTV).first_air_date,
                runtime: (detail as DetailMovie).runtime,
                seasonNumber,
                episodeNumber,
                episodeTitle,
                directUrl,
                mimeType,
                quality,
                downloadedAt: Date.now(),
            };

            await indexedDBService.saveMedia(metadata, blob);

            progress.progress = 100;
            progress.status = 'complete';
            this.notifyProgress(id, progress);

            // Clean up
            this.activeSyncs.delete(id);
            this.progressCallbacks.delete(id);

        } catch (error: any) {
            progress.status = 'error';
            progress.error = error.message || 'Unknown error occurred';
            this.notifyProgress(id, progress);

            // Clean up
            this.activeSyncs.delete(id);
            this.progressCallbacks.delete(id);

            throw error;
        }
    }

    /**
     * Download a file with progress tracking
     */
    private async downloadWithProgress(
        url: string,
        onProgress: (downloaded: number, total: number) => void
    ): Promise<Blob> {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to download: ${response.statusText}`);
        }

        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Response body is not readable');
        }

        const chunks: Uint8Array[] = [];
        let downloaded = 0;

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            chunks.push(value);
            downloaded += value.length;

            if (total > 0) {
                onProgress(downloaded, total);
            }
        }

        // Combine chunks into a single blob
        const blob = new Blob(chunks);
        return blob;
    }

    /**
     * Check if media is already synced offline
     */
    async isMediaSynced(
        tmdbId: number,
        mediaType: 'movie' | 'tv',
        seasonNumber?: number,
        episodeNumber?: number
    ): Promise<boolean> {
        const id = this.generateMediaId(tmdbId, mediaType, seasonNumber, episodeNumber);
        const media = await indexedDBService.getMedia(id);
        return media !== null;
    }

    /**
     * Get all synced media
     */
    async getAllSyncedMedia(): Promise<OfflineMediaMetadata[]> {
        return indexedDBService.getAllMediaMetadata();
    }

    /**
     * Delete synced media
     */
    async deleteSyncedMedia(id: string): Promise<void> {
        await indexedDBService.deleteMedia(id);
    }

    /**
     * Get total storage used
     */
    async getTotalStorageUsed(): Promise<number> {
        return indexedDBService.getTotalStorageUsed();
    }

    /**
     * Get available storage quota
     */
    async getStorageQuota(): Promise<{ usage: number; quota: number }> {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                usage: estimate.usage || 0,
                quota: estimate.quota || 0,
            };
        }
        return { usage: 0, quota: 0 };
    }

    /**
     * Generate unique media ID
     */
    private generateMediaId(
        tmdbId: number,
        mediaType: 'movie' | 'tv',
        seasonNumber?: number,
        episodeNumber?: number
    ): string {
        if (mediaType === 'tv' && seasonNumber && episodeNumber) {
            return `${mediaType}-${tmdbId}-s${seasonNumber}e${episodeNumber}`;
        }
        return `${mediaType}-${tmdbId}`;
    }

    /**
     * Add progress callback
     */
    private addProgressCallback(id: string, callback: SyncProgressCallback): void {
        if (!this.progressCallbacks.has(id)) {
            this.progressCallbacks.set(id, []);
        }
        this.progressCallbacks.get(id)!.push(callback);
    }

    /**
     * Notify progress to all callbacks
     */
    private notifyProgress(id: string, progress: SyncProgress): void {
        const callbacks = this.progressCallbacks.get(id) || [];
        callbacks.forEach(callback => callback(progress));
    }
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncService();
