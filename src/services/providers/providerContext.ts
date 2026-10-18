import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import { ProviderContext } from './types';
import { proxyUrl } from '../corsProxy';

// Standard desktop browser headers
const commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
};

// Create custom Axios client with automatic CORS proxy routing for web browser
const createWebAxios = (): AxiosInstance => {
    const instance = axios.create({
        headers: commonHeaders,
        timeout: 15000,
    });

    // Request interceptor: route cross-origin URLs through proxy
    instance.interceptors.request.use((config) => {
        if (config.url && typeof window !== 'undefined') {
            const url = config.url;
            const isAbsolute = url.startsWith('http://') || url.startsWith('https://');
            const isLocal = isAbsolute && url.includes(window.location.host);
            const isCORSAllowed =
                url.includes('raw.githubusercontent.com') ||
                url.includes('cdn.jsdelivr.net') ||
                url.includes('fastly.jsdelivr.net') ||
                url.includes('cinemeta-catalogs.strem.io');

            if (isAbsolute && !isLocal && !isCORSAllowed) {
                // Route through CORS proxy with referer parameter if provided
                const referer = config.headers?.['Referer'] || config.headers?.['referer'];
                config.url = proxyUrl(url) + (referer ? `&referer=${encodeURIComponent(String(referer))}` : '');
            }

            // Remove unsafe headers that browsers refuse or complain about
            if (config.headers) {
                delete (config.headers as any)['User-Agent'];
                delete (config.headers as any)['user-agent'];
                delete (config.headers as any)['Referer'];
                delete (config.headers as any)['referer'];
                delete (config.headers as any)['Host'];
                delete (config.headers as any)['host'];
            }
        }
        return config;
    });

    return instance;
};

// Cryptographic helpers for provider decryption
const Crypto = {
    digestStringAsync: async (algorithm: string, str: string): Promise<string> => {
        try {
            const enc = new TextEncoder();
            const data = enc.encode(str);
            const algoName = algorithm.toUpperCase().includes('256') ? 'SHA-256' : 
                             algorithm.toUpperCase().includes('512') ? 'SHA-512' : 'SHA-256';
            const hashBuffer = await window.crypto.subtle.digest(algoName, data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch {
            return str;
        }
    },
    randomUUID: (): string => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

// Provider Key-Value Store backed by localStorage
const kvStore = {
    get: async (key: string): Promise<any> => {
        try {
            const val = localStorage.getItem(`streamlux_prov_${key}`);
            return val ? JSON.parse(val) : undefined;
        } catch {
            return undefined;
        }
    },
    set: async (key: string, value: any): Promise<void> => {
        try {
            localStorage.setItem(`streamlux_prov_${key}`, JSON.stringify(value));
        } catch {}
    },
    delete: async (key: string): Promise<boolean> => {
        try {
            localStorage.removeItem(`streamlux_prov_${key}`);
            return true;
        } catch {
            return false;
        }
    },
    keys: async (): Promise<string[]> => {
        try {
            return Object.keys(localStorage)
                .filter(k => k.startsWith('streamlux_prov_'))
                .map(k => k.replace('streamlux_prov_', ''));
        } catch {
            return [];
        }
    },
    clear: async (): Promise<void> => {
        try {
            const keys = Object.keys(localStorage).filter(k => k.startsWith('streamlux_prov_'));
            keys.forEach(k => localStorage.removeItem(k));
        } catch {}
    }
};

let cachedUrls: Record<string, any> | null = null;
let lastUrlsFetch = 0;

const getProviderBaseUrl = async (providerValue?: string): Promise<string> => {
    if (!providerValue) return '';
    try {
        const now = Date.now();
        if (!cachedUrls || now - lastUrlsFetch > 60 * 60 * 1000) {
            const res = await fetch('https://raw.githubusercontent.com/Zenda-Cross/vega-providers/refs/heads/main/urls.json');
            if (res.ok) {
                cachedUrls = await res.json();
                lastUrlsFetch = now;
            }
        }
        if (cachedUrls) {
            const lower = providerValue.toLowerCase();
            for (const [k, v] of Object.entries(cachedUrls)) {
                if (k.toLowerCase() === lower || (v as any)?.name?.toLowerCase() === lower) {
                    return (v as any)?.url || '';
                }
            }
        }
    } catch (e) {
        console.warn('Failed to fetch provider URLs:', e);
    }
    return '';
};

export const providerContext: ProviderContext = {
    axios: createWebAxios(),
    cheerio,
    Crypto,
    commonHeaders,
    getBaseUrl: getProviderBaseUrl,
    kvStore,
};
