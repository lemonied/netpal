import { defineConfig, mergeConfig } from 'vite';
import sharedConfig from './vite.config.shared';

// https://vite.dev/config/
export default defineConfig(() => {

  return mergeConfig(sharedConfig, {
    publicDir: false,
    build: {
      rollupOptions: {
        input: {
          'content-script': 'src/extensions/content-script/index.ts',
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
