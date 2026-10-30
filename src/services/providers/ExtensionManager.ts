import defaultManifest from './defaultManifest.json';
import { ProviderExtension, StreamSource, MediaPlayRequest } from './types';
import { resolveProviderStream } from './providerRunner';

const ENABLED_PROVIDERS_KEY = 'streamlux_enabled_providers_v1';
const REMOTE_MANIFEST_KEY = 'streamlux_remote_manifest_v1';
const LAST_SYNC_KEY = 'streamlux_manifest_last_sync';
const SYNC_INTERVAL_MS = 12 * 60 * 60 * 1000; // Auto-sync every 12 hours
const REMOTE_MANIFEST_URL = 'https://raw.githubusercontent.com/Zenda-Cross/vega-providers/main/manifest.json';

export class ExtensionManager {
    private static instance: ExtensionManager;
    private providers: ProviderExtension[] = [];
    private isSyncing = false;

    private constructor() {
        this.initialize();
    }

    public static getInstance(): ExtensionManager {
        if (!ExtensionManager.instance) {
            ExtensionManager.instance = new ExtensionManager();
        }
        return ExtensionManager.instance;
    }

    private initialize() {
        let manifestData = defaultManifest as any[];

        // Check if we have cached a fresher remote manifest
        try {
            if (typeof window !== 'undefined') {
                const cached = localStorage.getItem(REMOTE_MANIFEST_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        manifestData = parsed;
                    }
                }
            }
        } catch {}

        this.applyManifest(manifestData);

        // Perform background sync with GitHub vega-providers on startup
        if (typeof window !== 'undefined') {
            setTimeout(() => {
                this.syncWithRemoteManifest().catch(() => {});
            }, 1000);
        }
    }

    private applyManifest(rawProviders: any[]) {
        this.providers = rawProviders.map((p) => ({
            display_name: p.display_name || p.name,
            value: p.value,
            version: p.version || '1.0',
            icon: p.icon || `https://cdn.jsdelivr.net/gh/Zenda-Cross/vega-providers@main/assets/${p.value}.png`,
            type: p.type || 'global',
            disabled: p.disabled ?? false,
            hasSettings: p.hasSettings ?? false,
        }));
    }

    /**
     * Auto-sync providers with the official Vega providers repository
     * Updates scraper scripts and versions automatically just like the Android app
     */
    public async syncWithRemoteManifest(force = false): Promise<boolean> {
        if (this.isSyncing || typeof window === 'undefined') return false;

        try {
            const lastSync = parseInt(localStorage.getItem(LAST_SYNC_KEY) || '0', 10);
            if (!force && Date.now() - lastSync < SYNC_INTERVAL_MS) {
                return false; // Already fresh
            }

            this.isSyncing = true;
            const res = await fetch(`${REMOTE_MANIFEST_URL}?t=${Date.now()}`, {
                cache: 'no-cache',
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const remoteProviders = await res.json();

            if (Array.isArray(remoteProviders) && remoteProviders.length > 0) {
                // Check if any versions changed to bust script cache
                const prevVersions = new Map(this.providers.map(p => [p.value, p.version]));

                for (const rp of remoteProviders) {
                    const prevVer = prevVersions.get(rp.value);
                    if (prevVer && prevVer !== rp.version) {
                        console.info(`[ExtensionManager] Provider ${rp.value} updated (${prevVer} -> ${rp.version}) - clearing cached modules`);
                        // Bust localStorage cache for this provider
                        try {
                            for (let i = localStorage.length - 1; i >= 0; i--) {
                                const k = localStorage.key(i);
                                if (k && k.startsWith(`streamlux_mod_${rp.value}_`)) {
                                    localStorage.removeItem(k);
                                }
                            }
                        } catch {}
                    }
                }

                this.applyManifest(remoteProviders);
                localStorage.setItem(REMOTE_MANIFEST_KEY, JSON.stringify(remoteProviders));
                localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());

                window.dispatchEvent(new CustomEvent('streamlux:providers-updated', { detail: this.providers }));
                console.info(`[ExtensionManager] Successfully synchronized ${remoteProviders.length} providers with Vega remote repo`);
                return true;
            }
        } catch (err) {
            console.warn('[ExtensionManager] Remote manifest sync failed, using cached manifest:', err);
        } finally {
            this.isSyncing = false;
        }
        return false;
    }

    public getProviders(): ProviderExtension[] {
        return this.providers;
    }

    public getProvider(value: string): ProviderExtension | undefined {
        return this.providers.find(p => p.value === value);
    }

    public getEnabledProviders(): ProviderExtension[] {
        try {
            const saved = localStorage.getItem(ENABLED_PROVIDERS_KEY);
            if (saved) {
                const disabledList: string[] = JSON.parse(saved);
                return this.providers.filter(p => !p.disabled && !disabledList.includes(p.value));
            }
        } catch {}
        // By default all non-disabled providers are enabled
        return this.providers.filter(p => !p.disabled);
    }

    public toggleProvider(providerValue: string, enabled: boolean) {
        try {
            let disabledList: string[] = [];
            const saved = localStorage.getItem(ENABLED_PROVIDERS_KEY);
            if (saved) disabledList = JSON.parse(saved);

            if (enabled) {
                disabledList = disabledList.filter(v => v !== providerValue);
            } else {
                if (!disabledList.includes(providerValue)) {
                    disabledList.push(providerValue);
                }
            }
            localStorage.setItem(ENABLED_PROVIDERS_KEY, JSON.stringify(disabledList));
        } catch {}
    }

    /**
     * Resolve direct ad-free streams across all enabled providers with parallel execution
     */
    public async resolveAllStreams(request: MediaPlayRequest): Promise<StreamSource[]> {
        const enabled = this.getEnabledProviders();
        if (enabled.length === 0) return [];

        // Prioritize top movie/global providers for fast response
        const topProviders = enabled.slice(0, 12); // Query top 12 providers concurrently
        const streams: StreamSource[] = [];

        const promises = topProviders.map(async (provider) => {
            try {
                // Timeout each provider after 8 seconds so slow ones never hang the user
                const timeoutPromise = new Promise<StreamSource[]>((resolve) =>
                    setTimeout(() => resolve([]), 8000)
                );
                const streamPromise = resolveProviderStream(provider, request);
                const result = await Promise.race([streamPromise, timeoutPromise]);
                if (result && result.length > 0) {
                    streams.push(...result);
                }
            } catch {
                // Ignore individual provider failures
            }
        });

        await Promise.all(promises);
        return streams;
    }
}

export const extensionManager = ExtensionManager.getInstance();
