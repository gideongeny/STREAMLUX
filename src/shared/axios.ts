import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { API_URL } from "./constants";
import { apiCache } from "./apiCache";

import { getBackendBase } from "../services/download";

// Use the new Vercel Serverless Proxy for all TMDB requests
const PROXY_URL = `${getBackendBase()}/api/proxy/tmdb`;

const instance = axios.create({
  baseURL: PROXY_URL,
});

// Request interceptor - Add caching, rate limiting, and format the proxy payload
instance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    // 1. Transform the standard TMDB config to the Proxy Payload format
    // proxyTMDB expects { data: { endpoint: string, params: object } }
    
    // Only wrap if it's a request to the TMDB proxy (default baseURL or empty URL)
    const isTmdbProxy = !config.url || config.url === PROXY_URL || config.url.startsWith('/tmdb');
    
    // Recovery of original endpoint for caching purposes
    let cacheKeyUrl = config.url || '';
    let cacheKeyParams = { ...config.params };

    if (isTmdbProxy) {
        // Extract the original endpoint (e.g., /movie/popular)
        const originalEndpoint = config.url || config.data?.endpoint || '';
        
        if (originalEndpoint && !config.data?.endpoint) {
            config.data = {
                endpoint: originalEndpoint,
                params: { ...config.params }
            };
            // For TMDB proxy requests, the endpoint is what we want to cache, NOT the proxy path
            cacheKeyUrl = originalEndpoint;
        }
        
        // Clear the URL and Params since they are now in the POST body for the proxy
        if (config.data?.endpoint) {
            config.url = ''; 
            config.params = {};
            config.method = 'POST';
        }
    }

    // Check cache first
    const cachedData = apiCache.get(cacheKeyUrl, cacheKeyParams);

    if (cachedData) {
      // Return cached data by throwing a special error that will be caught
      return Promise.reject({ __cached: true, data: cachedData, config });
    }

    // Check rate limiting
    await apiCache.checkRateLimit(cacheKeyUrl);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Cache successful responses and handle errors
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    let actualData = response.data;
    
    // Our proxy might return raw data or { success: true, data: { ... } }
    if (actualData && actualData.success === true && actualData.data) {
        // Only unwrap if it looks like a wrapped proxy response
        // Check if there's any other indicator this is a proxy response
        actualData = actualData.data;
    }

    // Set unpacked data back to response
    response.data = actualData;

    // Cache successful responses
    const config = response.config;
    // Recover original endpoint for caching from the payload we built
    let url = cacheKeyUrlFromConfig(config);
    let params = cacheKeyParamsFromConfig(config);

    if (url) {
      let ttl = 5 * 60 * 1000;
      if (url.includes('/trending')) ttl = 10 * 60 * 1000;
      else if (url.includes('/popular') || url.includes('/top_rated')) ttl = 15 * 60 * 1000;
      else if (url.includes('/discover')) ttl = 5 * 60 * 1000;
      else if (url.includes('/search')) ttl = 2 * 60 * 1000;

      apiCache.set(url, params, actualData, ttl);
    }

    return response;
  },
  (error) => {
    // Handle cached data shortcut
    if (error.__cached) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      });
    }

    // Handle quota failures from the proxy (or TMDB directly)
    if (error.response?.status === 429 || error.message?.includes('quota')) {
      console.error('API quota exceeded. Using cached data if available.');
      
      const config = error.config;
      const url = cacheKeyUrlFromConfig(config);
      const params = cacheKeyParamsFromConfig(config);
      
      const cachedData = url ? apiCache.get(url, params) : null;

      if (cachedData) {
        return Promise.resolve({
          data: cachedData,
          status: 200,
          statusText: 'OK (Cached)',
          headers: {},
          config: config,
        });
      }

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

// Helper to recover original URL for caching
function cacheKeyUrlFromConfig(config: AxiosRequestConfig): string {
    if (config.data) {
        try {
            const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
            return data.endpoint || '';
        } catch (e) {
            return '';
        }
    }
    return config.url || '';
}

// Helper to recover original params for caching
function cacheKeyParamsFromConfig(config: AxiosRequestConfig): any {
    if (config.data) {
        try {
            const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
            return data.params || {};
        } catch (e) {
            return {};
        }
    }
    return config.params || {};
}

export const setLanguage = (lang: string) => {
  instance.interceptors.request.use((config) => {
      if (config.data && config.data.params) {
          config.data.params.language = lang;
      } else if (config.params) {
          config.params.language = lang;
      }
      return config;
  });
};

export default instance;
