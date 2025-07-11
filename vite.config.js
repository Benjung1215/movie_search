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
    sourcemap: false, // 在生產環境中關閉 sourcemap
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console.log
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // 將 Vue 相關庫分離
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 將 UI 相關庫分離
          'ui-vendor': ['@tanstack/vue-query', '@vueuse/core'],
          // 將 Firebase 相關庫分離
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // 將國際化相關分離
          'i18n-vendor': ['vue-i18n'],
          // 將大型組件分離
          'views': [
            './src/main/vue/views/MovieDetail.vue',
            './src/main/vue/views/AdvancedSearch.vue',
            './src/main/vue/views/Profile.vue'
          ]
        },
        // 優化檔案名稱
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'media';
          } else if (/\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'img';
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'fonts';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})