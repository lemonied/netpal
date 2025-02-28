import { defineConfig, mergeConfig } from 'vite';
import sharedConfig from './vite.config.shared';

// https://vite.dev/config/
export default defineConfig(() => {

  return mergeConfig(sharedConfig, {
    build: {
      rollupOptions: {
        input: {
          index: 'index.html',
          popup: 'popup.html',
          sandbox: 'sandbox.html',
          injection: 'src/injection/index.ts',
          main: 'src/main.tsx',
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
  });

});
