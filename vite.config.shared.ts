import type { UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default {
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    emptyOutDir: false,
  },
} satisfies UserConfig;
