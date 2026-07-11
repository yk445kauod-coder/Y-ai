import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  resolve: {
    alias: {
      '@aila': resolve(__dirname, 'src'),
      '@aila/core': resolve(__dirname, 'src/core'),
      '@aila/providers': resolve(__dirname, 'src/providers'),
      '@aila/memory': resolve(__dirname, 'src/memory'),
      '@aila/tools': resolve(__dirname, 'src/tools'),
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
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          'aila-core': [
            'src/core/event-bus/EventBus.ts',
            'src/core/config/ConfigManager.ts',
            'src/core/logger/Logger.ts',
            'src/core/plugin-system/PluginManager.ts',
          ],
          'aila-ai': [
            'src/providers/ai/base/BaseAIProvider.ts',
            'src/providers/ai/ProviderFactory.ts',
          ],
          'aila-memory': [
            'src/memory/MemoryManager.ts',
            'src/memory/short-term/ShortTermMemory.ts',
            'src/memory/long-term/LongTermMemory.ts',
          ],
          'aila-tools': [
            'src/tools/core/ToolRegistry.ts',
            'src/tools/core/ToolExecutor.ts',
          ],
          'aila-voice': [
            'src/voice/wakeword/WakeWordEngine.ts',
            'src/voice/stt/STTEngine.ts',
            'src/voice/tts/TTSEngine.ts',
          ],
          'aila-ui': [
            'src/ui/components/AILAApp.ts',
          ],
        },
        format: 'esm',
        hoistTransitiveImports: false,
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
  },
  
  worker: {
    format: 'es',
    plugins: [],
  },
  
  optimizeDeps: {
    include: ['lit', 'lit/decorators.js', 'zustand', 'idb'],
    exclude: [],
  },
  
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'public/*',
          dest: '',
        },
      ],
    }),
  ],
  
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
  },
  
  preview: {
    port: 4173,
    host: true,
    cors: true,
  },
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/tests/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        'src/tests/**',
      ],
    },
  },
  
  esbuild: {
    target: 'esnext',
    supported: {
      'top-level-await': true,
    },
  },
});
