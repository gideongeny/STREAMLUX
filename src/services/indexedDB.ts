/**
 * IndexedDB wrapper for offline media storage
 * Stores media blobs with metadata for offline playback
 */

const DB_NAME = 'StreamLuxOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offlineMedia';

export interface OfflineMediaMetadata {
    id: string;
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    posterPath?: string;
    backdropPath?: string;
    overview?: string;
    releaseDate?: string;
    runtime?: number;
    seasonNumber?: number;
    episodeNumber?: number;
    episodeTitle?: string;
    directUrl: string;
    mimeType: string;
    quality?: string;
    downloadedAt: number;
    lastWatchedAt?: number;
    watchProgress?: number; // Percentage watched
    fileSize?: number;
}

export interface OfflineMediaEntry extends OfflineMediaMetadata {
    blob?: Blob;
}

class IndexedDBService {
    private db: IDBDatabase | null = null;

    /**
     * Initialize the IndexedDB database
     */
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

                    // Create indexes
                    objectStore.createIndex('tmdbId', 'tmdbId', { unique: false });
                    objectStore.createIndex('mediaType', 'mediaType', { unique: false });
                    objectStore.createIndex('downloadedAt', 'downloadedAt', { unique: false });
                    objectStore.createIndex('lastWatchedAt', 'lastWatchedAt', { unique: false });
                }
            };
        });
    }

    /**
     * Save media blob with metadata to IndexedDB
     */
    async saveMedia(metadata: OfflineMediaMetadata, blob: Blob): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(STORE_NAME);

            const entry: OfflineMediaEntry = {
                ...metadata,
                blob,
                fileSize: blob.size,
            };

            const request = objectStore.put(entry);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to save media to IndexedDB'));
        });
    }

    /**
     * Get media by ID
     */
    async getMedia(id: string): Promise<OfflineMediaEntry | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.get(id);

            request.onsuccess = () => {
                resolve(request.result || null);
            };
            request.onerror = () => reject(new Error('Failed to get media from IndexedDB'));
        });
    }

    /**
     * Get all offline media metadata (without blobs for performance)
     */
    async getAllMediaMetadata(): Promise<OfflineMediaMetadata[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.getAll();

            request.onsuccess = () => {
                const entries: OfflineMediaEntry[] = request.result || [];
                // Remove blob from metadata for performance
                const metadata = entries.map(({ blob, ...meta }) => meta);
                resolve(metadata);
            };
            request.onerror = () => reject(new Error('Failed to get all media from IndexedDB'));
        });
    }

    /**
     * Delete media by ID
     */
    async deleteMedia(id: string): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to delete media from IndexedDB'));
        });
    }

    /**
     * Update watch progress for a media item
     */
    async updateWatchProgress(id: string, progress: number): Promise<void> {
        if (!this.db) await this.init();

        const media = await this.getMedia(id);
        if (!media) throw new Error('Media not found');

        media.watchProgress = progress;
        media.lastWatchedAt = Date.now();

        return this.saveMedia(media, media.blob!);
    }

    /**
     * Get total storage used (in bytes)
     */
    async getTotalStorageUsed(): Promise<number> {
        const allMedia = await this.getAllMediaMetadata();
        return allMedia.reduce((total, media) => total + (media.fileSize || 0), 0);
    }

    /**
     * Clear all offline media
     */
    async clearAll(): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(STORE_NAME);
            const request = objectStore.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to clear IndexedDB'));
        });
    }
}

// Export singleton instance
export const indexedDBService = new IndexedDBService();
