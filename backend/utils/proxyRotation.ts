
// Basic Proxy Rotation Service
// In a production environment, this should connect to a paid proxy provider like BrightData or ScraperAPI
// For this implementation, we'll try to use a list of free public proxies + some direct connection fallback

export const PROXY_LIST = [
    // Add free working proxies here if found, or leave empty to default to direct connection
    // Format: 'http://user:pass@host:port' or 'http://host:port'
];

export const getRandomProxy = () => {
    if (PROXY_LIST.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * PROXY_LIST.length);
    return PROXY_LIST[randomIndex];
};

// Returns an axios config object with proxy integration if available
export const getAxiosConfigWithProxy = (url: string) => {
    const proxy = getRandomProxy();
    const config: any = {
        timeout: 15000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': new URL(url).origin,
        }
    };

    if (proxy) {
        // Parse proxy string
        try {
            const proxyUrl = new URL(proxy);
            config.proxy = {
                host: proxyUrl.hostname,
                port: parseInt(proxyUrl.port),
                protocol: proxyUrl.protocol.replace(':', ''),
            };

            if (proxyUrl.username && proxyUrl.password) {
                config.proxy.auth = {
                    username: proxyUrl.username,
                    password: proxyUrl.password,
                };
            }
        } catch (e) {
            console.warn('Invalid proxy format:', proxy);
        }
    }

    return config;
};
