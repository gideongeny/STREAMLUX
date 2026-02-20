/**
 * Continue Watching Service
 * Tracks playback position and enables resume functionality
 */

import { db } from '../shared/firebase';
import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, deleteDoc } from 'firebase/firestore';

export interface ContinueWatchingItem {
    id: string;
    title: string;
    type: 'movie' | 'tv';
    thumbnail: string;
    progress: number; // 0-100
    currentTime: number; // seconds
    duration: number; // seconds
    lastWatched: number; // timestamp
    seasonNumber?: number;
    episodeNumber?: number;
    episodeTitle?: string;
}

class ContinueWatchingService {
    private userId: string | null = null;

    setUserId(userId: string): void {
        this.userId = userId;
    }

    /**
     * Update playback position
     */
    async updatePosition(item: Omit<ContinueWatchingItem, 'lastWatched'>): Promise<void> {
        if (!this.userId) return;

        try {
            const docRef = doc(db, 'continueWatching', this.userId, 'items', item.id);

            const data: ContinueWatchingItem = {
                ...item,
                lastWatched: Date.now(),
                progress: (item.currentTime / item.duration) * 100,
            };

            await setDoc(docRef, data);
        } catch (error) {
            console.error('Error updating continue watching:', error);
        }
    }

    /**
     * Get continue watching items
     */
    async getContinueWatching(maxItems: number = 10): Promise<ContinueWatchingItem[]> {
        if (!this.userId) return [];

        try {
            const q = query(
                collection(db, 'continueWatching', this.userId, 'items'),
                orderBy('lastWatched', 'desc'),
                limit(maxItems)
            );

            const querySnapshot = await getDocs(q);
            const items: ContinueWatchingItem[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data() as ContinueWatchingItem;

                // Only include items with < 95% progress (not finished)
                if (data.progress < 95) {
                    items.push(data);
                }
            });

            return items;
        } catch (error) {
            console.error('Error getting continue watching:', error);
            return [];
        }
    }

    /**
     * Get playback position for specific item
     */
    async getPosition(itemId: string): Promise<number> {
        if (!this.userId) return 0;

        try {
            const docRef = doc(db, 'continueWatching', this.userId, 'items', itemId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as ContinueWatchingItem;
                return data.currentTime;
            }

            return 0;
        } catch (error) {
            console.error('Error getting playback position:', error);
            return 0;
        }
    }

    /**
     * Remove item from continue watching
     */
    async removeItem(itemId: string): Promise<void> {
        if (!this.userId) return;

        try {
            const docRef = doc(db, 'continueWatching', this.userId, 'items', itemId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error removing continue watching item:', error);
        }
    }

    /**
     * Clear all continue watching items
     */
    async clearAll(): Promise<void> {
        if (!this.userId) return;

        try {
            const items = await this.getContinueWatching(100);

            const deletePromises = items.map(item =>
                deleteDoc(doc(db, 'continueWatching', this.userId!, 'items', item.id))
            );

            await Promise.all(deletePromises);
        } catch (error) {
            console.error('Error clearing continue watching:', error);
        }
    }
}

export const continueWatchingService = new ContinueWatchingService();
