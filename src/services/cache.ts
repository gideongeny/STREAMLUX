import { safeStorage } from "../utils/safeStorage";

export const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

interface CacheItem<T> {
    value: T;
    timestamp: number;
}

export const CacheService = {
    set: <T>(key: string, value: T): void => {
        const item: CacheItem<T> = {
            value,
            timestamp: Date.now(),
        };
        safeStorage.set(`yt_cache_${key}`, JSON.stringify(item));
    },

    get: <T>(key: string): T | null => {
        const stored = safeStorage.get(`yt_cache_${key}`);
        if (!stored) return null;

        try {
            const item: CacheItem<T> = JSON.parse(stored);
            // Check expiration
            if (Date.now() - item.timestamp > CACHE_DURATION) {
                safeStorage.remove(`yt_cache_${key}`);
                return null;
            }

            return item.value;
        } catch (error) {
            safeStorage.remove(`yt_cache_${key}`);
            return null;
        }
    },

    clean: (): void => {
        try {
            const now = Date.now();
            const keysToRemove: string[] = [];
            safeStorage.keys().forEach(key => {
                if (key && key.startsWith("yt_cache_")) {
                    const stored = safeStorage.get(key);
                    if (stored) {
                        try {
                            const item = JSON.parse(stored);
                            if (now - item.timestamp > CACHE_DURATION) {
                                keysToRemove.push(key);
                            }
                        } catch (e) {
                            keysToRemove.push(key);
                        }
                    }
                }
            });
            keysToRemove.forEach(key => safeStorage.remove(key));
        } catch (error) {
            console.warn("Cache cleanup failed:", error);
        }
    },
};
