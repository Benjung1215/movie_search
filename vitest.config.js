import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.js',
        '**/*.config.ts',
        '**/coverage/**'
      ]
    },
    setupFiles: ['./src/test/setup.js']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/main/vue'),
      '@/components': resolve(__dirname, 'src/main/vue/components'),
      '@/views': resolve(__dirname, 'src/main/vue/views'),
      '@/composables': resolve(__dirname, 'src/main/vue/composables'),
      '@/stores': resolve(__dirname, 'src/main/vue/stores'),
      '@/assets': resolve(__dirname, 'src/main/resources/assets'),
      '@/config': resolve(__dirname, 'src/main/resources/config'),
    }
  }
})