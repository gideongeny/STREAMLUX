import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
  },
  server: {
    proxy: {
      '/api-proxy': {
        target: 'https://vidsrc.me', // Default target
        changeOrigin: true,
        secure: false,
        router: (req) => {
          // Dynamic Routing: Extract target from the path
          // Path format: /api-proxy/https://target-domain.com/path
          const urlPath = req.url || '';
          const match = urlPath.match(/\/api-proxy\/(https?:\/\/([^/]+)\/.*)/);
          if (match) {
            const targetUrl = match[1];
            const targetOrigin = `https://${match[2]}`;
            console.log(`[Proxy] Routing to: ${targetOrigin}`);
            return targetOrigin;
          }
          return 'https://vidsrc.me';
        },
        rewrite: (path) => {
            // Strip /api-proxy/ prefix but KEEP the protocol part for the internal fetch
            // The router handles the base target, so we just need the path part relative to it
            const match = path.match(/\/api-proxy\/https?:\/\/[^/]+(\/.*)/);
            return match ? match[1] : path.replace(/^\/api-proxy/, '');
        },
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Dynamically set Referer and Origin based on the actual target
            const urlPath = req.url || '';
            const match = urlPath.match(/\/api-proxy\/(https?:\/\/([^/]+)\/.*)/);
            if (match) {
                const targetOrigin = `https://${match[2]}`;
                proxyReq.setHeader('Referer', targetOrigin + '/');
                proxyReq.setHeader('Origin', targetOrigin);
                proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
            }
          });
          proxy.on('proxyRes', (proxyRes, _req, _res) => {
            // Aggressively strip security headers
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['frame-options'];
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = '*';
          });
          proxy.on('error', (err, _req, _res) => {
            console.error('[Proxy Error]:', err);
          });
        }
      }
    }
  }
});
