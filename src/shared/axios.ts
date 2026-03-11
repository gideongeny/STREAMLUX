import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { API_URL } from "./constants";
import { apiCache } from "./apiCache";

// Use the new Firebase Cloud Function proxy for all TMDB requests
// This secures the API key on the backend
const FIREBASE_REGION = "us-central1"; // Matches functions deployment
const PROJECT_ID = "streamlux-67a84"; // Ensure this matches your Firebase project ID
const PROXY_URL = `https://${FIREBASE_REGION}-${PROJECT_ID}.cloudfunctions.net/proxyTMDB`;

const instance = axios.create({
  baseURL: PROXY_URL,
});

// Request interceptor - Add caching, rate limiting, and format the proxy payload
instance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    // 1. Transform the standard TMDB config to the Proxy Payload format
    // proxyTMDB expects { data: { endpoint: string, params: object } }
    
    // Extract the original endpoint (e.g., /movie/popular)
    const originalEndpoint = config.url || '';
    
    // Only wrap it if it hasn't been wrapped yet (avoid double wrapping on retries)
    if (!config.data?.endpoint) {
        config.data = {
            endpoint: originalEndpoint,
            params: { ...config.params } // Pass the frontend params (like language, page)
        };
        
        // Clear the URL and Params since they are now in the POST body to the proxy
        config.url = ''; 
        config.params = {};
        
        // HttpsCallable functions must be POST requests
        config.method = 'POST'; 
    }
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
// Response interceptor - Handle successful responses, unwrap proxy data, and handle errors
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Firebase HttpsCallable functions return data wrapped in { data: { result } }
    // Our proxy returns { data: { success: true, data: { TMDB_RESULTS } } }
    
    let actualData = response.data;
    
    // Unwrap Firebase Callable layer
    if (actualData?.result) {
        actualData = actualData.result;
    }
    
    // Unwrap our custom Proxy layer
    if (actualData && actualData.success && actualData.data) {
        actualData = actualData.data;
    }

    // Set unpacked data back to response so frontend services don't break
    response.data = actualData;

    // Cache successful responses
    const config = response.config;
    // Recover original endpoint for caching from the payload we built
    const url = typeof config.data === 'string' ? JSON.parse(config.data).data?.endpoint : config.data?.data?.endpoint || '';
    const params = typeof config.data === 'string' ? JSON.parse(config.data).data?.params : config.data?.data?.params || {};

    let ttl = 5 * 60 * 1000;
    if (url.includes('/trending')) ttl = 10 * 60 * 1000;
    else if (url.includes('/popular') || url.includes('/top_rated')) ttl = 15 * 60 * 1000;
    else if (url.includes('/discover')) ttl = 5 * 60 * 1000;
    else if (url.includes('/search')) ttl = 2 * 60 * 1000;

    apiCache.set(url, params, actualData, ttl);

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
      const url = typeof config.data === 'string' ? JSON.parse(config.data).data?.endpoint : '';
      const params = typeof config.data === 'string' ? JSON.parse(config.data).data?.params : {};
      
      const cachedData = apiCache.get(url, params);

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

export const setLanguage = (lang: string) => {
  // Since we removed instance.defaults.params to use POST bodies,
  // we add an Axios interceptor to globally append language to every request payload
  instance.interceptors.request.use((config) => {
      if (config.data && config.data.params) {
          config.data.params.language = lang;
      }
      return config;
  });
};

export default instance;
