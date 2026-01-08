import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Y-ai/', // Matches repository name: https://github.com/yk445kauod-coder/Y-ai
  define: {
    // Vite does not polyfill process.env by default. 
    // This allows the existing code using process.env.API_KEY to work in production.
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY || '')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-markdown'],
        },
      },
    },
  },
});