import { defineConfig, mergeConfig } from 'vite';
import type { UserConfig } from 'vite';
import sharedConfig from './vite.config.shared';

// https://vite.dev/config/
export default defineConfig(() => {

  return mergeConfig<UserConfig, UserConfig>(sharedConfig, {
    publicDir: false,
    build: {
      rollupOptions: {
        input: {
          'content-script': 'extensions/content-script/index.ts',
        },
        output: [
          {
            entryFileNames: '[name].js',
            dir: 'dist',
            format: 'umd',
          },
        ],
      },
    },
  });

});
