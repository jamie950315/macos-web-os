import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'path';

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  base: '/macos-web-os/',
  resolve: {
    alias: {
      '@macos/darwin-api': path.resolve(__dirname, '../../packages/darwin-api/src'),
      '@macos/windowserver': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..', '../../kernel/pkg'],
    },
  },
  build: {
    target: 'esnext',
    outDir: '.dist',
  },
});
