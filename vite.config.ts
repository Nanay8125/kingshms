import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/', // Set to '/' for Vercel deployment
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          external: [], // Don't externalize any dependencies
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                return 'vendor';
              }
              if (id.includes('/components/')) {
                return 'components';
              }
              if (id.includes('/services/')) {
                return 'services';
              }
              if (id.includes('/types') || id.includes('/constants')) {
                return 'types';
              }
            }
          }
        },
        chunkSizeWarningLimit: 1000 // Increase limit to 1000 kB to suppress warnings
      },
      optimizeDeps: {
        include: ['react', 'react-dom', '@google/genai', 'lucide-react', 'recharts']
      }
    };
});
