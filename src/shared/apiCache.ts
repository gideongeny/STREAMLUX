// API Caching and Rate Limiting
// Prevents quota exceeded errors by caching responses and limiting requests

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
  // Rate limits can stay in memory as they are short-lived (1 minute)
  private rateLimits: Map<string, RateLimitEntry> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default cache
  private readonly MAX_REQUESTS_PER_MINUTE = 60; // Increased limit (assuming key rotation)
  private readonly REQUEST_DELAY = 100; // Reduced delay
  private readonly CACHE_PREFIX = "tmdb_cache_";

  // Get cache key from URL and params
  private getCacheKey(url: string, params?: any): string {
    // Sort params to ensure consistency
    const sortedParams = params ? Object.keys(params).sort().reduce((acc: any, key) => {
      acc[key] = params[key];
      return acc;
    }, {}) : {};

    const paramStr = JSON.stringify(sortedParams);
    return `${this.CACHE_PREFIX}${url}${paramStr}`;
  }

  // Check if request should be rate limited
  private shouldRateLimit(key: string): boolean {
    const now = Date.now();
    const limit = this.rateLimits.get(key);

    if (!limit) {
      this.rateLimits.set(key, {
        count: 1,
        resetAt: now + 60000, // Reset after 1 minute
      });
      return false;
    }

    // Reset if minute has passed
    if (now > limit.resetAt) {
      this.rateLimits.set(key, {
        count: 1,
        resetAt: now + 60000,
      });
      return false;
    }

    // Check if limit exceeded
    if (limit.count >= this.MAX_REQUESTS_PER_MINUTE) {
      return true;
    }

    // Increment count
    limit.count++;
    return false;
  }

  // Get cached data if available and not expired
  get(url: string, params?: any): any | null {
    try {
      const key = this.getCacheKey(url, params);
      const stored = localStorage.getItem(key);

      if (!stored) {
        return null;
      }

      const entry: CacheEntry = JSON.parse(stored);
      const now = Date.now();

      if (now > entry.expiresAt) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch (e) {
      return null;
    }
  }

  // Set cache entry
  set(url: string, params: any, data: any, ttl: number = this.DEFAULT_TTL): void {
    try {
      const key = this.getCacheKey(url, params);
      const now = Date.now();

      const entry: CacheEntry = {
        data,
        timestamp: now,
        expiresAt: now + ttl,
      };

      localStorage.setItem(key, JSON.stringify(entry));

      // Cleanup if storage gets too full (simple check)
      // In a real app we might want LRU, but for now just rely on clearExpired
    } catch (e) {
      console.warn("LocalStorage failed (quota exceeded?):", e);
    }
  }

  // Check if request should be delayed due to rate limiting
  async checkRateLimit(url: string): Promise<void> {
    const key = url; // Rate limit by URL, not params

    if (this.shouldRateLimit(key)) {
      // Wait until rate limit resets
      const limit = this.rateLimits.get(key);
      if (limit) {
        const waitTime = limit.resetAt - Date.now();
        if (waitTime > 0) {
          console.warn(`Rate limit reached for ${url}, waiting ${waitTime}ms`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // Add small delay between requests
    await new Promise(resolve => setTimeout(resolve, this.REQUEST_DELAY));
  }

  // Clear cache
  clear(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      this.rateLimits.clear();
    } catch (e) {
      console.warn("Clear cache failed", e);
    }
  }

  // Clear expired entries
  clearExpired(): void {
    try {
      const now = Date.now();
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry: CacheEntry = JSON.parse(stored);
            if (now > entry.expiresAt) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (e) {
      console.warn("Clear expired failed", e);
    }
  }
}

// Singleton instance
export const apiCache = new APICache();

// Clean up expired entries every 5 minutes
if (globalThis.window !== undefined) {
  setInterval(() => {
    apiCache.clearExpired();
  }, 5 * 60 * 1000);
}
