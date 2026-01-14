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
  private cache: Map<string, CacheEntry> = new Map();
  private rateLimits: Map<string, RateLimitEntry> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default cache
  private readonly MAX_REQUESTS_PER_MINUTE = 30; // Limit to 30 requests per minute per endpoint
  private readonly REQUEST_DELAY = 200; // 200ms delay between requests

  // Get cache key from URL and params
  private getCacheKey(url: string, params?: any): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${url}${paramStr}`;
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
    const key = this.getCacheKey(url, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Set cache entry
  set(url: string, params: any, data: any, ttl: number = this.DEFAULT_TTL): void {
    const key = this.getCacheKey(url, params);
    const now = Date.now();

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });

    // Clean up old cache entries (keep cache size manageable)
    if (this.cache.size > 100) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      // Remove oldest 20 entries
      entries.slice(0, 20).forEach(([key]) => this.cache.delete(key));
    }
  }

  // Check if request should be delayed due to rate limiting
  async checkRateLimit(url: string): Promise<void> {
    const key = this.getCacheKey(url);
    
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

    // Add small delay between requests to prevent burst
    await new Promise(resolve => setTimeout(resolve, this.REQUEST_DELAY));
  }

  // Clear cache
  clear(): void {
    this.cache.clear();
    this.rateLimits.clear();
  }

  // Clear expired entries
  clearExpired(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
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

