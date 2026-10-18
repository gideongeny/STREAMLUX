export interface ProviderExtension {
    display_name: string;
    value: string;
    version: string;
    icon: string;
    type: 'global' | 'movie' | 'tv' | 'anime';
    disabled?: boolean;
    hasSettings?: boolean;
}

export interface TextTrack {
    title: string;
    language: string;
    type?: string;
    uri: string;
}

export interface SkipInterval {
    title?: string;
    from: number;
    to: number;
}

export interface StreamSource {
    server: string;
    link: string;
    type: 'm3u8' | 'mp4' | 'hls' | 'direct' | string;
    quality?: '360' | '480' | '720' | '1080' | '2160' | '4K' | string;
    subtitles?: TextTrack[];
    headers?: Record<string, string>;
    skip?: SkipInterval[];
    providerValue?: string;
}

export interface ProviderContext {
    axios: any;
    cheerio: any;
    Crypto: {
        digestStringAsync: (algorithm: string, str: string) => Promise<string>;
        randomUUID: () => string;
    };
    commonHeaders: Record<string, string>;
    getBaseUrl: (providerValue?: string) => Promise<string>;
    openWebView?: (url: string, options?: any) => Promise<string>;
    kvStore: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any) => Promise<void>;
        delete: (key: string) => Promise<boolean>;
        keys: () => Promise<string[]>;
        clear: () => Promise<void>;
    };
}

export interface MediaPlayRequest {
    tmdbId: number | string;
    mediaType: 'movie' | 'tv';
    title?: string;
    releaseYear?: string;
    season?: number;
    episode?: number;
    imdbId?: string;
}
