// API Caching and Rate Limiting
// Prevents quota exceeded errors by caching responses and limiting requests
// Persistent: Saves to localStorage to survive app restarts and work offline

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class APICache {
  private cache: Map<string, CacheEntry> = new Map();
  private rateLimits: Map<string, RateLimitEntry> = new Map();
  private readonly DEFAULT_TTL = 15 * 60 * 1000; // 15 minutes default cache for persistent feel
  private readonly MAX_REQUESTS_PER_MINUTE = 40;
  private readonly REQUEST_DELAY = 150;
  private readonly STORAGE_KEY = 'streamlux_api_cache_v2';

  constructor() {
    this.loadFromDisk();
  }

  // Load cache from localStorage on startup
  private loadFromDisk(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();

        // Only load non-expired entries
        Object.entries(parsed).forEach(([key, value]) => {
          const entry = value as CacheEntry;
          if (now < entry.expiresAt) {
            this.cache.set(key, entry);
          }
        });
        console.log(`[APICache] Loaded ${this.cache.size} entries from disk`);
      }
    } catch (e) {
      console.warn('[APICache] Failed to load from disk:', e);
    }
  }

  // Save cache back to localStorage (throttled to avoid heavy disk IO)
  private saveTimer: NodeJS.Timeout | null = null;
  private saveToDisk(): void {
    if (typeof window === 'undefined') return;
    if (this.saveTimer) return;

    this.saveTimer = setTimeout(() => {
      try {
        const obj: Record<string, CacheEntry> = {};
        this.cache.forEach((value, key) => {
          obj[key] = value;
        });
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
      } catch (e) {
        console.warn('[APICache] Failed to save to disk:', e);
      } finally {
        this.saveTimer = null;
      }
    }, 2000); // Wait 2s before saving to batch updates
  }

  private getCacheKey(url: string, params?: any): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${url}${paramStr}`;
  }

  private shouldRateLimit(key: string): boolean {
    const now = Date.now();
    const limit = this.rateLimits.get(key);

    if (!limit) {
      this.rateLimits.set(key, { count: 1, resetAt: now + 60000 });
      return false;
    }

    if (now > limit.resetAt) {
      this.rateLimits.set(key, { count: 1, resetAt: now + 60000 });
      return false;
    }

    if (limit.count >= this.MAX_REQUESTS_PER_MINUTE) return true;

    limit.count++;
    return false;
  }

  get(url: string, params?: any): any | null {
    const key = this.getCacheKey(url, params);
    const entry = this.cache.get(key);

    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      this.saveToDisk();
      return null;
    }

    return entry.data;
  }

  set(url: string, params: any, data: any, ttl: number = this.DEFAULT_TTL): void {
    const key = this.getCacheKey(url, params);
    const now = Date.now();

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });

    // Clean up if cache gets too large
    if (this.cache.size > 200) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      entries.slice(0, 50).forEach(([k]) => this.cache.delete(k));
    }

    this.saveToDisk();
  }

  async checkRateLimit(url: string): Promise<void> {
    const key = this.getCacheKey(url);
    if (this.shouldRateLimit(key)) {
      const limit = this.rateLimits.get(key);
      if (limit) {
        const waitTime = limit.resetAt - Date.now();
        if (waitTime > 0) {
          console.warn(`[RateLimit] reached for ${url}, waiting ${waitTime}ms`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    await new Promise(resolve => setTimeout(resolve, this.REQUEST_DELAY));
  }

  clear(): void {
    this.cache.clear();
    this.rateLimits.clear();
    try { localStorage.removeItem(this.STORAGE_KEY); } catch { }
  }

  clearExpired(): void {
    const now = Date.now();
    let hasDeleted = false;
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        hasDeleted = true;
      }
    });
    if (hasDeleted) this.saveToDisk();
  }
}

export const apiCache = new APICache();

if (globalThis.window !== undefined) {
  setInterval(() => {
    apiCache.clearExpired();
  }, 10 * 60 * 1000);
}

