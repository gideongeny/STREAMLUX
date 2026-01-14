/**
 * Safe LocalStorage utility that prevents crashes in private mode or restricted environments
 */
export const safeStorage = {
    get: (key: string): string | null => {
        try {
            if (typeof window === "undefined" || !window.localStorage) return null;
            return localStorage.getItem(key);
        } catch (e) {
            console.warn(`SafeStorage: Failed to get ${key}`, e);
            return null;
        }
    },

    set: (key: string, value: string): boolean => {
        try {
            if (typeof window === "undefined" || !window.localStorage) return false;
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.warn(`SafeStorage: Failed to set ${key}`, e);
            return false;
        }
    },

    remove: (key: string): void => {
        try {
            if (typeof window === "undefined" || !window.localStorage) return;
            localStorage.removeItem(key);
        } catch (e) {
            console.warn(`SafeStorage: Failed to remove ${key}`, e);
        }
    },

    clear: (): void => {
        try {
            if (typeof window === "undefined" || !window.localStorage) return;
            localStorage.clear();
        } catch (e) {
            console.warn("SafeStorage: Failed to clear storage", e);
        }
    },

    /**
     * Parse JSON safely from storage
     */
    getParsed: <T>(key: string, defaultValue: T): T => {
        const stored = safeStorage.get(key);
        if (!stored) return defaultValue;
        try {
            return JSON.parse(stored) as T;
        } catch (e) {
            console.warn(`SafeStorage: Failed to parse ${key}`, e);
            return defaultValue;
        }
    },

    /**
     * Get all storage keys
     */
    keys: (): string[] => {
        try {
            if (typeof window === "undefined" || !window.localStorage) return [];
            return Object.keys(localStorage);
        } catch (e) {
            console.warn("SafeStorage: Failed to get keys", e);
            return [];
        }
    }
};

export const safeSession = {
    get: (key: string): string | null => {
        try {
            if (typeof window === "undefined" || !window.sessionStorage) return null;
            return sessionStorage.getItem(key);
        } catch (e) {
            return null;
        }
    },

    set: (key: string, value: string): void => {
        try {
            if (typeof window === "undefined" || !window.sessionStorage) return;
            sessionStorage.setItem(key, value);
        } catch (e) { }
    }
};
