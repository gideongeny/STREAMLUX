import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { API_URL } from "./constants";
import { apiCache } from "./apiCache";

const instance = axios.create({
  baseURL: API_URL,
  params: {
    api_key: process.env.REACT_APP_API_KEY || "8c247ea0b4b56ed2ff7d41c9a833aa77", // TMDB API key
  },
});

// Request interceptor - Add caching and rate limiting
instance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    // Check cache first
    const cacheKey = config.url || '';
    const cachedData = apiCache.get(cacheKey, config.params);
    
    if (cachedData) {
      // Return cached data by throwing a special error that will be caught
      // This is a workaround since we can't return data directly from interceptor
      return Promise.reject({ __cached: true, data: cachedData, config });
    }

    // Check rate limiting
    await apiCache.checkRateLimit(cacheKey);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Cache successful responses and handle errors
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Cache successful responses
    const config = response.config;
    const url = config.url || '';
    const params = config.params;
    
    // Different TTL for different endpoints
    let ttl = 5 * 60 * 1000; // 5 minutes default
    
    if (url.includes('/trending')) {
      ttl = 10 * 60 * 1000; // 10 minutes for trending (changes less frequently)
    } else if (url.includes('/popular') || url.includes('/top_rated')) {
      ttl = 15 * 60 * 1000; // 15 minutes for popular/top rated
    } else if (url.includes('/discover')) {
      ttl = 5 * 60 * 1000; // 5 minutes for discover
    } else if (url.includes('/search')) {
      ttl = 2 * 60 * 1000; // 2 minutes for search (more dynamic)
    }

    apiCache.set(url, params, response.data, ttl);
    
    return response;
  },
  (error) => {
    // Handle cached data
    if (error.__cached) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      });
    }

    // Handle quota exceeded errors
    if (error.response?.status === 429 || 
        error.message?.includes('quota') || 
        error.message?.includes('Quota Exceeded')) {
      console.error('API quota exceeded. Using cached data if available.');
      
      // Try to get cached data as fallback
      const config = error.config;
      const url = config?.url || '';
      const cachedData = apiCache.get(url, config?.params);
      
      if (cachedData) {
        return Promise.resolve({
          data: cachedData,
          status: 200,
          statusText: 'OK (Cached)',
          headers: {},
          config: config,
        });
      }
      
      // If no cache, return empty results to prevent app crash
      return Promise.resolve({
        data: { results: [], page: 1, total_pages: 1, total_results: 0 },
        status: 200,
        statusText: 'OK (Fallback)',
        headers: {},
        config: config,
      });
    }

    return Promise.reject(error);
  }
);

export default instance;
