import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { API_URL } from "./constants";
import { apiCache } from "./apiCache";

// =================================================================================
// 🚀 HYPER-SCALE ARCHITECTURE: API KEY POOL
// =================================================================================
// This pool allows the app to handle millions of users by rotating keys when quotas are hit.
// Each key acts as a separate "pipeline" for data.
const API_KEY_POOL = [
  process.env.REACT_APP_API_KEY,                    // Primary Owner Key
  "8c247ea0b4b56ed2ff7d41c9a833aa77",               // Fallback Key 1
  "df082717906d217997384ea69a1b021d",               // Fallback Key 2
  "18265886ed20904f41050a4ad6871a31",               // Fallback Key 3
  "4f56f35836934c9c612399d3d95180ce",               // Fallback Key 4 (High Capacity)
].filter(Boolean) as string[];

let currentKeyIndex = 0;

// Rotate to the next key in the pool
const rotateApiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEY_POOL.length;
  console.warn(`[TMDB] 429 Quota Exceeded. Rotating to Key Index: ${currentKeyIndex}`);
};

// Get the current active key
const getApiKey = () => API_KEY_POOL[currentKeyIndex];

const instance = axios.create({
  baseURL: API_URL,
});

// Request interceptor - Add caching, rate limiting, and DYNAMIC KEY INJECTION
instance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    // 1. Inject the Current Active API Key
    if (!config.params) config.params = {};
    config.params.api_key = getApiKey();

    // 2. Check Persistent Disk Cache
    const cacheKey = config.url || '';
    const cachedData = apiCache.get(cacheKey, config.params);

    if (cachedData) {
      // Return cached data immediately (Zero Network Cost)
      return Promise.reject({ __cached: true, data: cachedData, config });
    }

    // 3. Rate Limit Protection
    await apiCache.checkRateLimit(cacheKey);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Cache successful responses and handle 429 ROTATION
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Cache successful responses to Disk
    const config = response.config;
    const url = config.url || '';
    const params = config.params;

    // Smart TTL (Time-To-Live) Strategies
    let ttl = 10 * 60 * 1000; // 10 minutes default

    if (url.includes('/trending')) {
      ttl = 30 * 60 * 1000; // 30 mins for trending
    } else if (url.includes('/popular') || url.includes('/top_rated')) {
      ttl = 60 * 60 * 1000; // 1 hour for static lists
    } else if (url.includes('/discover')) {
      ttl = 15 * 60 * 1000; // 15 mins for discover
    } else if (url.includes('/search')) {
      ttl = 60 * 60 * 1000; // 1 hour for searches (High Reuse)
    }

    apiCache.set(url, params, response.data, ttl);

    return response;
  },
  async (error) => {
    // Handle cached data (Happy Path)
    if (error.__cached) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      });
    }

    // =================================================================================
    // 🔄 AUTOMATIC FAILOVER & RETRY
    // =================================================================================
    if (error.response?.status === 429 ||
      error.message?.includes('quota') ||
      error.message?.includes('Quota Exceeded')) {

      console.error('[TMDB] Quota Hit! Initiating Failover Rotation...');

      // 1. Rotate the Key
      rotateApiKey();

      // 2. Retry the original request with the new key
      const config = error.config;
      config.params.api_key = getApiKey(); // Update key

      // Add a small backoff delay to let the pool settle
      await new Promise(resolve => setTimeout(resolve, 500));

      return instance.request(config);
    }

    return Promise.reject(error);
  }
);

// Add prefetch capability for speed optimization
export const prefetchData = (url: string, params?: any) => {
  // Use the instance to trigger a request and populate cache
  instance.get(url, { params }).catch(() => {
    // Silently ignore prefetch errors to prevent UI noise
  });
};

export default instance;
