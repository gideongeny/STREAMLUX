import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-proxy': {
        target: 'https://vidsrc.me',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Adjust target dynamically based on custom headers if needed
            if (req.url?.includes('embed.su')) {
               options.target = 'https://embed.su';
            }
          });
        }
      }
    }
  }
});
