import { defineConfig, mergeConfig } from 'vite';
import type { UserConfig } from 'vite';
import sharedConfig from './vite.config.shared';

// https://vite.dev/config/
export default defineConfig(() => {

  return mergeConfig<UserConfig, UserConfig>(sharedConfig, {
    base: '/',
    build: {
      rollupOptions: {
        input: {
          index: 'index.html',
          sandbox: 'extensions/sandbox/index.html',
          'panel-trigger': 'extensions/panel-trigger/main.tsx',
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
