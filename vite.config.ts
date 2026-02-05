/// <reference types="vitest" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**'],
      },
      base: '/', // Deployed to root domain on Netlify
      server: {
        port: 3000,
        host: '0.0.0.0',
        strictPort: false, // Allow port fallback if 3000 is in use
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          },
        },
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
                if (id.includes('firebase')) {
                  return 'firebase-vendor';
                }
                if (id.includes('lucide-react')) {
                  return 'lucide-vendor';
                }
                if (id.includes('recharts')) {
                  return 'recharts-vendor';
                }
                if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/scheduler/')) {
                  return 'react-vendor';
                }
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
