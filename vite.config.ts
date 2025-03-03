import { defineConfig, mergeConfig } from 'vite';
import sharedConfig from './vite.config.shared';

// https://vite.dev/config/
export default defineConfig(() => {

  return mergeConfig(sharedConfig, {
    build: {
      rollupOptions: {
        input: {
          index: 'index.html',
          popup: 'extensions/popup/index.html',
          sandbox: 'extensions/sandbox/index.html',
          injection: 'src/injection/index.ts',
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
