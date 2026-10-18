import { extensionManager } from './ExtensionManager';
import { fetchProviderModule, executeProvider } from './providerRunner';
import { providerContext } from './providerContext';
import { ProviderExtension, StreamSource } from './types';
import { proxyUrl } from '../corsProxy';

export interface CatalogRow {
    title: string;
    filter: string;
}

export interface ProviderPost {
    title: string;
    link: string;
    image: string;
    tag?: string;
    providerValue?: string;
}

export interface ProviderMetaLink {
    title: string;
    directLinks: {
        title: string;
        type: string;
        link: string;
    }[];
}

export interface ProviderMeta {
    title: string;
    synopsis: string;
    image: string;
    poster: string;
    logo?: string;
    imdbId?: string;
    tmdbId?: string;
    type: 'movie' | 'series' | 'tv';
    tags?: string[];
    cast?: string[];
    rating?: string;
    year?: string;
    linkList?: ProviderMetaLink[];
}

const ACTIVE_PROVIDER_KEY = 'streamlux_active_provider_v1';

export class ProviderCatalogService {
    private static instance: ProviderCatalogService;
    private activeProviderValue: string = 'autoEmbed';

    private constructor() {
        try {
            const saved = localStorage.getItem(ACTIVE_PROVIDER_KEY);
            if (saved) {
                this.activeProviderValue = saved;
            }
        } catch {}
    }

    public static getInstance(): ProviderCatalogService {
        if (!ProviderCatalogService.instance) {
            ProviderCatalogService.instance = new ProviderCatalogService();
        }
        return ProviderCatalogService.instance;
    }

    public getActiveProvider(): ProviderExtension {
        const all = extensionManager.getProviders();
        return all.find(p => p.value === this.activeProviderValue) || all[0];
    }

    public setActiveProvider(providerValue: string): void {
        this.activeProviderValue = providerValue;
        try {
            localStorage.setItem(ACTIVE_PROVIDER_KEY, providerValue);
        } catch {}
    }

    public getAllProviders(): ProviderExtension[] {
        return extensionManager.getProviders();
    }

    /**
     * Get catalog categories (e.g. "Popular Movies", "Latest TV", "4K")
     */
    public async getCatalog(providerValue?: string): Promise<CatalogRow[]> {
        const val = providerValue || this.activeProviderValue;
        try {
            const code = await fetchProviderModule(val, 'catalog');
            if (!code) return [{ title: 'Latest', filter: '' }];

            const exportsObj = await executeProvider(code, 'catalog', {});
            if (Array.isArray(exportsObj) && exportsObj.length > 0) {
                return exportsObj;
            }
            if (exportsObj?.catalog && Array.isArray(exportsObj.catalog)) {
                return exportsObj.catalog;
            }
        } catch (e) {
            console.warn(`[Catalog] Failed to load catalog for ${val}:`, e);
        }
        return [{ title: 'Featured', filter: '' }];
    }

    /**
     * Get posts for a catalog category row
     */
    public async getPosts(filter: string = '', page: number = 1, providerValue?: string): Promise<ProviderPost[]> {
        const val = providerValue || this.activeProviderValue;
        try {
            const code = await fetchProviderModule(val, 'posts');
            if (!code) return [];

            const result = await executeProvider(code, 'getPosts', {
                filter,
                page,
                providerValue: val,
                providerContext,
            });

            if (Array.isArray(result)) {
                return result.map(p => ({
                    title: p.title || 'Untitled',
                    link: p.link || '',
                    image: p.image || p.poster || '',
                    tag: p.tag || '',
                    providerValue: val,
                })).filter(p => p.link && p.image);
            }
        } catch (e) {
            console.warn(`[Catalog] Failed to load posts for ${val} (${filter}):`, e);
        }
        return [];
    }

    /**
     * Search across provider or active provider
     */
    public async searchPosts(query: string, page: number = 1, providerValue?: string): Promise<ProviderPost[]> {
        const val = providerValue || this.activeProviderValue;
        try {
            const code = await fetchProviderModule(val, 'posts');
            if (!code) return [];

            const result = await executeProvider(code, 'getSearchPosts', {
                searchQuery: query,
                page,
                providerValue: val,
                providerContext,
            });

            if (Array.isArray(result)) {
                return result.map(p => ({
                    title: p.title || 'Untitled',
                    link: p.link || '',
                    image: p.image || p.poster || '',
                    tag: p.tag || '',
                    providerValue: val,
                })).filter(p => p.link);
            }
        } catch (e) {
            console.warn(`[Catalog] Search failed for ${val} (${query}):`, e);
        }
        return [];
    }

    /**
     * Get full movie/series metadata and stream/episode links
     */
    public async getMeta(link: string, providerValue?: string): Promise<ProviderMeta | null> {
        const val = providerValue || this.activeProviderValue;
        try {
            const code = await fetchProviderModule(val, 'meta');
            if (!code) return null;

            const result = await executeProvider(code, 'getMeta', {
                link,
                providerValue: val,
                providerContext,
            });

            if (result) {
                return {
                    title: result.title || '',
                    synopsis: result.synopsis || result.overview || '',
                    image: result.image || result.backdrop || result.poster || '',
                    poster: result.poster || result.image || '',
                    logo: result.logo || '',
                    imdbId: result.imdbId || '',
                    tmdbId: result.tmdbId || '',
                    type: result.type || (result.linkList && result.linkList.length > 1 ? 'series' : 'movie'),
                    tags: result.tags || [],
                    cast: result.cast || [],
                    rating: result.rating || '',
                    year: result.year || '',
                    linkList: result.linkList || [],
                };
            }
        } catch (e) {
            console.warn(`[Catalog] Failed to load meta for ${link}:`, e);
        }
        return null;
    }

    /**
     * Get episodes list for a series season or audio track
     */
    public async getEpisodes(url: string, providerValue?: string): Promise<{ title: string; link: string; image?: string }[]> {
        const val = providerValue || this.activeProviderValue;
        try {
            const code = await fetchProviderModule(val, 'episodes');
            if (!code) return [];

            const result = await executeProvider(code, 'getEpisodes', {
                url,
                providerContext,
            });

            if (Array.isArray(result)) {
                return result.map((ep, i) => ({
                    title: ep.title || `Episode ${i + 1}`,
                    link: typeof ep.link === 'string' ? ep.link : JSON.stringify(ep.link),
                    image: ep.image || '',
                }));
            }
        } catch (e) {
            console.warn(`[Catalog] Failed to load episodes for ${val}:`, e);
        }
        return [];
    }

    /**
     * Extract direct raw .m3u8 / .mp4 streams for playback
     */
    public async getStream(link: string, type: 'movie' | 'tv' | 'series' = 'movie', providerValue?: string): Promise<StreamSource[]> {
        const val = providerValue || this.activeProviderValue;
        try {
            const code = await fetchProviderModule(val, 'stream');
            if (!code) return [];

            const result = await executeProvider(code, 'getStream', {
                link,
                type: type === 'series' ? 'tv' : type,
                providerContext,
            });

            if (result) {
                const list = Array.isArray(result) ? result : [result];
                return list.map(s => {
                    const rawLink = s.link;
                    const reqReferer = s.headers?.['Referer'] || s.headers?.['referer'] || s.headers?.['Origin'] || s.headers?.['origin'] || (rawLink.includes('hakunaymatata') ? 'https://officialmoviebox.com/' : undefined);
                    const needsProxy = (reqReferer || /hakunaymatata|hubcloud|vcloud|gdflix|fastdl|moviesdrive/i.test(rawLink)) && typeof window !== 'undefined';

                    const streamLink = (needsProxy && !rawLink.includes('/api/proxy'))
                        ? `${proxyUrl(rawLink)}${reqReferer ? `&referer=${encodeURIComponent(reqReferer)}` : ''}`
                        : rawLink;

                    return {
                        server: s.server || `Stream ${s.quality || 'HD'}`,
                        link: streamLink,
                        type: s.type || (streamLink?.includes('.m3u8') ? 'm3u8' : 'mp4'),
                        quality: s.quality || '1080p',
                        subtitles: s.subtitles || [],
                        headers: s.headers,
                        skip: s.skip,
                        providerValue: val,
                    };
                }).filter(s => s.link && typeof s.link === 'string' && s.link.startsWith('http'));
            }
        } catch (e) {
            console.warn(`[Catalog] Failed to getStream for ${val}:`, e);
        }
        return [];
    }
}

export const providerCatalog = ProviderCatalogService.getInstance();
