import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
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
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
})