export const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

interface CacheItem<T> {
    value: T;
    timestamp: number;
}

export const CacheService = {
    set: <T>(key: string, value: T): void => {
        try {
            const item: CacheItem<T> = {
                value,
                timestamp: Date.now(),
            };
            localStorage.setItem(`yt_cache_${key}`, JSON.stringify(item));
        } catch (error) {
            console.warn("LocalStorage caching failed:", error);
        }
    },

    get: <T>(key: string): T | null => {
        try {
            const stored = localStorage.getItem(`yt_cache_${key}`);
            if (!stored) return null;

            const item: CacheItem<T> = JSON.parse(stored);
            // Check expiration
            if (Date.now() - item.timestamp > CACHE_DURATION) {
                localStorage.removeItem(`yt_cache_${key}`);
                return null;
            }

            return item.value;
        } catch (error) {
            return null;
        }
    },

    clean: (): void => {
        try {
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith("yt_cache_")) {
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        const item = JSON.parse(stored);
                        if (Date.now() - item.timestamp > CACHE_DURATION) {
                            localStorage.removeItem(key);
                        }
                    }
                }
            });
        } catch (error) {
            console.warn("Cache cleanup failed:", error);
        }
    },
};
