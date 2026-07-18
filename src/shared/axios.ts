import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { apiCache } from "./apiCache";
import { Capacitor } from "@capacitor/core";
import { fetchTmdbWithFallback } from "./tmdbGateway";

const FIREBASE_API = "https://streamlux-67a84.web.app/api";

/** Prefer same-origin /api on web (Firebase Hosting → Functions). Native app needs absolute URL. */
function resolveApiBase(): string {
  const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (envBase) return envBase.replace(/\/$/, "");
  if (Capacitor.isNativePlatform()) {
    return FIREBASE_API;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/api`;
  }
  return FIREBASE_API;
}

const instance = axios.create({
  baseURL: resolveApiBase(),
});

// For efficiency, we use a global variable for language to avoid leaking interceptors
let globalLang = 'en-US';

const TMDB_PATH_PREFIXES = [
  "/movie",
  "/tv",
  "/trending",
  "/discover",
  "/search",
  "/genre",
  "/person",
  "/collection",
  "/configuration",
];

// Request interceptor - Add caching, rate limiting, and format the proxy payload
instance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    // Normalize "TMDB native" calls like axios.get("/movie/123") to our gateway:
    //   /api/tmdb?endpoint=/movie/123
    // This keeps the existing app code working after moving all traffic behind Firebase Functions.
    const rawUrl = (config.url || "").toString();
    const isShortTmdbPath =
      rawUrl.startsWith("/") &&
      TMDB_PATH_PREFIXES.some((p) => rawUrl.startsWith(p));

    const isLegacyProxyTmdb =
      rawUrl === "/proxy/tmdb" || rawUrl.startsWith("/proxy/tmdb/");

    if (isShortTmdbPath || isLegacyProxyTmdb) {
      const endpoint = isLegacyProxyTmdb ? rawUrl.replace(/^\/proxy\/tmdb/, "") || "/" : rawUrl;
      
      // Route through cached gateway — API key stays server-side
      config.url = "/tmdb";
      config.params = { 
        ...(config.params || {}), 
        endpoint 
      };
    }

    const cacheKeyUrl = config.url || "";
    const cacheKeyParams = { ...config.params };

    const isSports = cacheKeyUrl.includes('/sports/') || cacheKeyUrl.includes('/external');

    const url = (config.url || "").toString();
    const isTmdb = url === "/tmdb" || url.startsWith("/tmdb/") || url.includes("tmdb");
    if (isTmdb) {
      config.params = { ...config.params, language: globalLang };
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
    const config = response.config;
    const reqUrl = (config.url || "").toString();

    // Unwrap gateway envelopes except sports (client checks both shapes)
    const isSportsEnvelope = reqUrl.includes("/sports/");
    if (!isSportsEnvelope && actualData && actualData.success === true && actualData.data !== undefined) {
        actualData = actualData.data;
    }

    // Set unpacked data back to response
    response.data = actualData;

    // Cache successful responses
    let url = cacheKeyUrlFromConfig(config);
    let params = cacheKeyParamsFromConfig(config);

    if (url) {
      let ttl = 5 * 60 * 1000;
      if (url.includes('/trending')) ttl = 10 * 60 * 1000;
      else if (url.includes('/popular') || url.includes('/top_rated')) ttl = 15 * 60 * 1000;
      else if (url.includes('/discover')) ttl = 5 * 60 * 1000;
      else if (url.includes('/search')) ttl = 2 * 60 * 1000;
      else if (url.includes('/sports/') || url.includes('/external')) ttl = 30 * 1000; // 30 seconds for sports

      apiCache.set(url, params, actualData, ttl);
    }

    return response;
  },
  async (error) => {
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

    const config = error.config as (AxiosRequestConfig & { __tmdbFallback?: boolean }) | undefined;
    const isTmdbProxy =
      config?.url === '/tmdb' ||
      (typeof config?.url === 'string' && config.url.includes('/tmdb'));
    const endpoint = config?.params?.endpoint as string | undefined;

    if (isTmdbProxy && endpoint && !config?.__tmdbFallback) {
      try {
        const data = await fetchTmdbWithFallback(endpoint, { ...(config?.params || {}) });
        return Promise.resolve({
          data,
          status: 200,
          statusText: 'OK (TMDB Fallback)',
          headers: {},
          config: { ...config, __tmdbFallback: true },
        });
      } catch (fallbackErr) {
        console.warn('TMDB gateway + direct fallback failed:', fallbackErr);
      }
    }

    // Handle quota failures from the proxy (or TMDB directly)
    if (error.response?.status === 429 || error.message?.includes('quota')) {
      console.error('API quota exceeded. Using cached data if available.');
      
      const config = error.config;
      const url = cacheKeyUrlFromConfig(config);
      const params = cacheKeyParamsFromConfig(config);
      
      const cachedData = url
        ? (apiCache.get(url, params) ?? apiCache.getStale(url, params))
        : null;

      if (cachedData) {
        return Promise.resolve({
          data: cachedData,
          status: 200,
          statusText: 'OK (Cached)',
          headers: {},
          config: config,
        });
      }

      // Reject so callers keep existing React Query / safeStorage cache instead of overwriting with empty rows
      return Promise.reject({
        __quotaExceeded: true,
        message: 'API quota exceeded',
        config,
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
