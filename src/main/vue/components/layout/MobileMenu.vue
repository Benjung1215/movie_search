<template>
  <!-- 行動版漢堡菜單按鈕 -->
  <button
    @click="toggleMenu"
    class="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
    aria-label="開啟選單"
  >
    <div class="relative w-6 h-6">
      <span
        :class="[
          'absolute top-1 left-0 w-6 h-0.5 bg-white rounded transition-all duration-300',
          isOpen ? 'rotate-45 translate-y-2.5' : ''
        ]"
      ></span>
      <span
        :class="[
          'absolute top-3 left-0 w-6 h-0.5 bg-white rounded transition-all duration-300',
          isOpen ? 'opacity-0' : ''
        ]"
      ></span>
      <span
        :class="[
          'absolute top-5 left-0 w-6 h-0.5 bg-white rounded transition-all duration-300',
          isOpen ? '-rotate-45 -translate-y-2.5' : ''
        ]"
      ></span>
    </div>
  </button>

  <!-- 行動版側邊菜單 -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 md:hidden"
      @click="closeMenu"
    >
      <!-- 背景遮罩 -->
      <div 
        class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        :class="isOpen ? 'animate-fade-in' : 'animate-fade-out'"
      ></div>
      
      <!-- 側邊菜單 -->
      <div 
        class="absolute top-0 left-0 w-80 max-w-[80vw] h-full bg-dark-800 shadow-2xl transform transition-transform duration-300"
        :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
        @click.stop
      >
        <!-- 菜單頂部 -->
        <div class="flex items-center justify-between p-6 border-b border-dark-600">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🎬</span>
            <span class="font-bold text-xl text-white">Vue Movie Search</span>
          </div>
          <button
            @click="closeMenu"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-700 transition-colors"
            aria-label="關閉選單"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 導航項目 -->
        <nav class="p-6 space-y-2">
          <router-link
            to="/"
            @click="closeMenu"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-dark-700 transition-all duration-200"
            active-class="text-primary-500 bg-primary-500/10"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="font-medium">首頁</span>
          </router-link>

          <router-link
            to="/search"
            @click="closeMenu"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-dark-700 transition-all duration-200"
            active-class="text-primary-500 bg-primary-500/10"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="font-medium">搜尋</span>
          </router-link>

          <router-link
            to="/genres"
            @click="closeMenu"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-dark-700 transition-all duration-200"
            active-class="text-primary-500 bg-primary-500/10"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2" />
            </svg>
            <span class="font-medium">類型</span>
          </router-link>

          <router-link
            to="/favorites"
            @click="closeMenu"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-dark-700 transition-all duration-200"
            active-class="text-primary-500 bg-primary-500/10"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span class="font-medium">收藏</span>
            <span
              v-if="favoritesStore.favoriteCount > 0"
              class="ml-auto px-2 py-1 text-xs rounded-full bg-primary-500 text-white"
            >
              {{ favoritesStore.favoriteCount }}
            </span>
          </router-link>

          <router-link
            to="/watchlist"
            @click="closeMenu"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-dark-700 transition-all duration-200"
            active-class="text-primary-500 bg-primary-500/10"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span class="font-medium">觀看清單</span>
            <span
              v-if="watchlistStore.watchlistCount > 0"
              class="ml-auto px-2 py-1 text-xs rounded-full bg-blue-500 text-white"
            >
              {{ watchlistStore.watchlistCount }}
            </span>
          </router-link>

          <router-link
            to="/ratings"
            @click="closeMenu"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-dark-700 transition-all duration-200"
            active-class="text-primary-500 bg-primary-500/10"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span class="font-medium">我的評分</span>
            <span
              v-if="ratingsStore.ratingsCount > 0"
              class="ml-auto px-2 py-1 text-xs rounded-full bg-yellow-500 text-white"
            >
              {{ ratingsStore.ratingsCount }}
            </span>
          </router-link>

          <router-link
            to="/profile"
            @click="closeMenu"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-dark-700 transition-all duration-200"
            active-class="text-primary-500 bg-primary-500/10"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="font-medium">個人資料</span>
          </router-link>
        </nav>

        <!-- 底部用戶區域 -->
        <div class="absolute bottom-0 left-0 right-0 p-6 border-t border-dark-600">
          <div v-if="!authStore.isAuthenticated" class="space-y-3">
            <p class="text-sm text-gray-400 text-center">登入以同步您的收藏</p>
            <LoginButton @click="closeMenu" />
          </div>
          <div v-else class="flex items-center gap-3">
            <img
              v-if="authStore.userPhotoURL"
              :src="authStore.userPhotoURL"
              :alt="authStore.userDisplayName"
              class="w-10 h-10 rounded-full"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">
                {{ authStore.userDisplayName }}
              </p>
              <p class="text-xs text-gray-400 truncate">
                {{ authStore.userEmail }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { useFavoritesStore } from '../../stores/favorites.js'
import { useWatchlistStore } from '../../stores/watchlist.js'
import { useRatingsStore } from '../../stores/ratings.js'
import LoginButton from '../auth/LoginButton.vue'

export default {
  name: 'MobileMenu',
  components: {
    LoginButton
  },
  setup() {
    const isOpen = ref(false)
    const authStore = useAuthStore()
    const favoritesStore = useFavoritesStore()
    const watchlistStore = useWatchlistStore()
    const ratingsStore = useRatingsStore()

    const toggleMenu = () => {
      isOpen.value = !isOpen.value
      // 防止背景滾動
      if (isOpen.value) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }

    const closeMenu = () => {
      isOpen.value = false
      document.body.style.overflow = ''
    }

    return {
      isOpen,
      authStore,
      favoritesStore,
      watchlistStore,
      ratingsStore,
      toggleMenu,
      closeMenu
    }
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-fade-out {
  animation: fade-out 0.3s ease-out;
}

/* Icon components */
.w-5.h-5 {
  width: 1.25rem;
  height: 1.25rem;
}
</style>