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
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // 將 Vue 相關庫分離
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 將 UI 相關庫分離
          'ui-vendor': ['@tanstack/vue-query', '@vueuse/core'],
          // 將 Firebase 相關庫分離
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // 將大型組件分離
          'views': [
            'src/main/vue/views/MovieDetail.vue',
            'src/main/vue/views/AdvancedSearch.vue',
            'src/main/vue/views/Profile.vue'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})