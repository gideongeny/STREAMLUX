import defaultManifest from './defaultManifest.json';
import { ProviderExtension, StreamSource, MediaPlayRequest } from './types';
import { resolveProviderStream } from './providerRunner';

const ENABLED_PROVIDERS_KEY = 'streamlux_enabled_providers_v1';

export class ExtensionManager {
    private static instance: ExtensionManager;
    private providers: ProviderExtension[] = [];

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
        // Load bundled 36 providers from defaultManifest
        this.providers = (defaultManifest as any[]).map((p) => ({
            display_name: p.display_name || p.name,
            value: p.value,
            version: p.version || '1.0',
            icon: p.icon || `https://cdn.jsdelivr.net/gh/Zenda-Cross/vega-providers@main/assets/${p.value}.png`,
            type: p.type || 'global',
            disabled: p.disabled ?? false,
            hasSettings: p.hasSettings ?? false,
        }));
    }

    public getProviders(): ProviderExtension[] {
        return this.providers;
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
