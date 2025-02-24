import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(() => {

  return {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          index: 'index.html',
          popup: 'popup.html',
          sandbox: 'sandbox.html',
          injection: 'src/injection/index.ts',
          main: 'src/main.tsx',
          'content-script': 'src/extensions/content-script.ts',
          'service-worker': 'src/extensions/service-worker.ts',
        },
        output: [
          {
            entryFileNames: '[name].js',
            dir: 'dist',
            format: 'es',
          },
        ],
      },
    },
    server: {
      host: '0.0.0.0',
    },
  } satisfies UserConfig;

});
