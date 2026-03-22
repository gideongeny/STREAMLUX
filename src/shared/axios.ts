import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { API_URL } from "./constants";
import { apiCache } from "./apiCache";

import { getBackendBase } from "../services/download";

// Use the new Vercel Serverless Proxy for all TMDB requests
const PROXY_URL = `${getBackendBase()}/api/proxy/tmdb`;

const instance = axios.create({
  baseURL: PROXY_URL,
});

// For efficiency, we use a global variable for language to avoid leaking interceptors
let globalLang = 'en-US';

// Request interceptor - Add caching, rate limiting, and format the proxy payload
instance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    // 1. Transform the standard TMDB config to the Proxy Payload format
    // proxyTMDB expects { data: { endpoint: string, params: object } }
    
    // Hard check: If the URL starts with / find the baseURL is PROXY_URL, it's a TMDB request
    const isTmdbProxy = !config.url || config.url === PROXY_URL || config.url.startsWith('/') || config.url.startsWith('tmdb');
    
    // Recovery of original endpoint for caching purposes
    let cacheKeyUrl = config.url || '';
    let cacheKeyParams = { ...config.params, language: globalLang };

    if (isTmdbProxy) {
        // Extract the original endpoint (e.g., /movie/popular)
        const originalEndpoint = config.url || config.data?.endpoint || '';
        
        if (originalEndpoint && !config.data?.endpoint) {
            config.data = {
                endpoint: originalEndpoint,
                params: { ...config.params, language: globalLang }
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
    
    if (actualData && actualData.success === true && actualData.data) {
        actualData = actualData.data;
    }

    // Set unpacked data back to response
    response.data = actualData;

    // Cache successful responses
    const config = response.config;
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

// Maps short i18n codes → TMDB full locale codes
// TMDB uses ISO 639-1 + ISO 3166-1 format (e.g. en-US, fr-FR)
const TMDB_LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ru: 'ru-RU',
  ja: 'ja-JP',
  vi: 'vi-VN',
  ar: 'ar-SA',
  hi: 'hi-IN',
  id: 'id-ID',
  pt: 'pt-BR',
  tl: 'tl-PH',
  ur: 'ur-PK',
  sw: 'sw-KE',
  zh: 'zh-CN',
};

/**
 * Convert a short app language code to a TMDB-compatible locale string.
 * Falls back to "en-US" if the code is not in the map.
 */
export const toTmdbLocale = (lang: string): string =>
  TMDB_LOCALE_MAP[lang] ?? `${lang}-${lang.toUpperCase()}`;

export const setLanguage = (lang: string) => {
  globalLang = toTmdbLocale(lang);
};

export default instance;
