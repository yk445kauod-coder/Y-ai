import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@aila': resolve(__dirname, 'src'),
      '@aila/core': resolve(__dirname, 'src/core'),
      '@aila/providers': resolve(__dirname, 'src/providers'),
      '@aila/tools': resolve(__dirname, 'src/tools'),
      '@aila/skills': resolve(__dirname, 'src/skills'),
      '@aila/voice': resolve(__dirname, 'src/voice'),
      '@aila/security': resolve(__dirname, 'src/security'),
      '@aila/ui': resolve(__dirname, 'src/ui'),
      '@aila/iot': resolve(__dirname, 'src/iot'),
      '@aila/types': resolve(__dirname, 'src/types'),
    },
  },
  
  build: {
    target: 'esnext',
    modulePreload: {
      polyfill: false,
    },
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
  },
  
  optimizeDeps: {
    include: ['lit', 'lit/decorators.js', 'zustand', 'idb'],
    exclude: [],
  },
  
  server: {
    port: 3000,
    host: true,
    cors: true,
  },
  
  preview: {
    port: 4173,
    host: true,
    cors: true,
  },
  
  esbuild: {
    target: 'esnext',
    supported: {
      'top-level-await': true,
    },
  },
});
