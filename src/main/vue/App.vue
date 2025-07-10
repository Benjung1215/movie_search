<template>
  <div id="app" class="min-h-screen bg-dark-900 text-white">
    <!-- 頂部導航欄 -->
    <nav class="bg-dark-800 border-b border-dark-600 sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo 和主導航 -->
          <div class="flex items-center gap-8">
            <router-link to="/" class="flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors">
              <span class="text-2xl">🎬</span>
              <span class="font-bold text-lg hidden sm:block">Vue Movie Search</span>
            </router-link>
            
            <!-- 主要導航鏈接 -->
            <div class="hidden md:flex items-center gap-6">
              <router-link 
                to="/search" 
                class="text-gray-300 hover:text-white transition-colors"
                active-class="text-primary-500"
              >
                搜尋
              </router-link>
              
              <router-link 
                to="/genres" 
                class="text-gray-300 hover:text-white transition-colors"
                active-class="text-primary-500"
              >
                類型
              </router-link>
              
              <router-link 
                to="/favorites" 
                class="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                active-class="text-primary-500"
              >
                收藏
                <span v-if="favoritesStore.favoriteCount > 0" class="bg-primary-500 text-white px-2 py-1 rounded-full text-xs">
                  {{ favoritesStore.favoriteCount }}
                </span>
              </router-link>
              
              <router-link 
                to="/watchlist" 
                class="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                active-class="text-primary-500"
              >
                觀看清單
                <span v-if="watchlistStore.watchlistCount > 0" class="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                  {{ watchlistStore.watchlistCount }}
                </span>
              </router-link>
              
              <router-link 
                to="/ratings" 
                class="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                active-class="text-primary-500"
              >
                我的評分
                <span v-if="ratingsStore.ratingsCount > 0" class="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                  {{ ratingsStore.ratingsCount }}
                </span>
              </router-link>
            </div>
          </div>

          <!-- 用戶區域 -->
          <div class="flex items-center gap-4">
            <!-- 載入狀態 -->
            <div v-if="!authStore.isInitialized" class="flex items-center gap-2 text-gray-400">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
              <span class="text-sm hidden sm:block">初始化中...</span>
            </div>
            
            <!-- 桌面版登入組件 -->
            <LoginButton v-else class="hidden md:block" />
            
            <!-- 行動版菜單按鈕 -->
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要內容 -->
    <main>
      <PageTransition name="fade">
        <router-view v-slot="{ Component }">
          <div class="min-h-screen bg-dark-900">
            <div class="container mx-auto px-4 py-8">
              <!-- 麵包屑導航 -->
              <Breadcrumb />
              
              <!-- 頁面內容 -->
              <component :is="Component" />
            </div>
          </div>
        </router-view>
      </PageTransition>
    </main>

    <!-- 通知中心 -->
    <NotificationCenter />
  </div>
</template>

<script>
import { onMounted, watch } from 'vue'
import { useAuthStore } from './stores/auth.js'
import { useFavoritesStore } from './stores/favorites.js'
import { useWatchlistStore } from './stores/watchlist.js'
import { useRatingsStore } from './stores/ratings.js'
import LoginButton from './components/auth/LoginButton.vue'
import MobileMenu from './components/layout/MobileMenu.vue'
import Breadcrumb from './components/layout/Breadcrumb.vue'
import PageTransition from './components/ui/PageTransition.vue'
import NotificationCenter from './components/ui/NotificationCenter.vue'

export default {
  name: 'App',
  components: {
    LoginButton,
    MobileMenu,
    Breadcrumb,
    PageTransition,
    NotificationCenter
  },
  setup() {
    const authStore = useAuthStore()
    const favoritesStore = useFavoritesStore()
    const watchlistStore = useWatchlistStore()
    const ratingsStore = useRatingsStore()

    // 初始化應用
    onMounted(async () => {
      // 初始化 Firebase Auth
      await authStore.initializeAuth()
      
      // 根據認證狀態初始化收藏功能
      if (authStore.isAuthenticated) {
        await favoritesStore.initWithUser()
        await watchlistStore.initWithUser()
        await ratingsStore.initWithUser()
      } else {
        favoritesStore.init()
        watchlistStore.init()
        ratingsStore.init()
      }
    })

    // 監聽認證狀態變化
    watch(
      () => authStore.isAuthenticated,
      async (isAuthenticated, wasAuthenticated) => {
        if (isAuthenticated && !wasAuthenticated) {
          // 用戶剛登入 - 初始化雲端同步
          console.log('用戶登入，開始同步收藏')
          await favoritesStore.initWithUser()
          await watchlistStore.initWithUser()
          await ratingsStore.initWithUser()
        } else if (!isAuthenticated && wasAuthenticated) {
          // 用戶剛登出 - 清理雲端同步
          console.log('用戶登出，停止同步收藏')
          favoritesStore.cleanup()
          watchlistStore.cleanup()
          ratingsStore.cleanup()
        }
      }
    )

    return {
      authStore,
      favoritesStore,
      watchlistStore,
      ratingsStore
    }
  }
}
</script>