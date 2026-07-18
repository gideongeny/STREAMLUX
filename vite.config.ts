import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,           // CRITICAL: was true — was including full debug maps in APK (~20MB wasted)
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/streamlux-67a84/us-central1/gateway/api'),
      },
    },
  },
});


