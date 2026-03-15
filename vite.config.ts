import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-proxy': {
        target: 'https://vidsrc.me',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Dynamically adjust headers or target if needed
            if (req.url && (req.url.includes('embed.su') || req.url.includes('vidsrc'))) {
                proxyReq.setHeader('Referer', 'https://vidsrc.me/');
                proxyReq.setHeader('Origin', 'https://vidsrc.me');
            }
          });
          proxy.on('error', (err, _req, _res) => {
            console.error('[Proxy Error]:', err);
          });
        }
      }
    }
  }
});
