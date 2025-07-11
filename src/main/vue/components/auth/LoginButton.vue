<template>
  <div class="login-button">
    <!-- 登入狀態顯示 -->
    <div v-if="authStore.isAuthenticated" class="relative">
      <!-- 用戶頭像和名稱 -->
      <button 
        @click="toggleDropdown"
        class="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-700 transition-colors"
      >
        <img 
          :src="authStore.userPhotoURL || '/placeholder-avatar.png'"
          :alt="authStore.userDisplayName"
          class="w-8 h-8 rounded-full object-cover"
          @error="handleAvatarError"
        />
        <span class="text-white font-medium hidden md:block">
          {{ authStore.userDisplayName || authStore.userEmail }}
        </span>
        <svg 
          class="w-4 h-4 text-gray-400 transition-transform"
          :class="{ 'rotate-180': showDropdown }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- 下拉選單 -->
      <div 
        v-if="showDropdown"
        class="absolute right-0 top-full mt-2 w-64 bg-dark-800 rounded-lg shadow-lg border border-dark-600 z-50"
      >
        <!-- 用戶資訊 -->
        <div class="p-4 border-b border-dark-600">
          <div class="flex items-center gap-3">
            <img 
              :src="authStore.userPhotoURL || '/placeholder-avatar.png'"
              :alt="authStore.userDisplayName"
              class="w-12 h-12 rounded-full object-cover"
              @error="handleAvatarError"
            />
            <div>
              <p class="text-white font-medium">{{ authStore.userDisplayName }}</p>
              <p class="text-gray-400 text-sm">{{ authStore.userEmail }}</p>
            </div>
          </div>
        </div>

        <!-- 選單項目 -->
        <div class="py-2">
          <router-link 
            to="/profile" 
            class="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
            @click="closeDropdown"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            個人資料
          </router-link>
          
          <router-link 
            to="/favorites" 
            class="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
            @click="closeDropdown"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
            我的收藏
          </router-link>
          
          <router-link 
            to="/watchlist" 
            class="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
            @click="closeDropdown"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            觀看清單
          </router-link>

          <div class="border-t border-dark-600 my-2"></div>
          
          <button 
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-dark-700 hover:text-red-400 transition-colors"
            :disabled="authStore.loading"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span v-if="!authStore.loading">登出</span>
            <span v-else>登出中...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 未登入狀態 - 登入按鈕 -->
    <div v-else class="flex items-center gap-2">
      <button 
        @click="showLoginModal = true"
        class="btn-primary flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        登入
      </button>
    </div>

    <!-- 登入模態框 -->
    <div 
      v-if="showLoginModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeModal"
    >
      <div 
        class="bg-dark-800 rounded-lg p-8 max-w-md w-full mx-4"
        @click.stop
      >
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-white mb-2">歡迎回來</h2>
          <p class="text-gray-400">選擇一種方式登入您的帳戶</p>
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="authStore.error" class="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
          <p class="text-red-400 text-sm">{{ authStore.error }}</p>
        </div>

        <!-- 登入按鈕 -->
        <div class="space-y-3">
          <!-- Google 登入 -->
          <button 
            @click="handleGoogleLogin"
            class="w-full flex items-center justify-center gap-3 p-3 bg-white hover:bg-gray-100 text-gray-900 rounded-lg transition-colors"
            :disabled="authStore.loading"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span v-if="!authStore.loading">使用 Google 登入</span>
            <span v-else>登入中...</span>
          </button>

          <!-- GitHub 登入 -->
          <button 
            @click="handleGitHubLogin"
            class="w-full flex items-center justify-center gap-3 p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
            :disabled="authStore.loading"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span v-if="!authStore.loading">使用 GitHub 登入</span>
            <span v-else>登入中...</span>
          </button>
        </div>

        <!-- 關閉按鈕 -->
        <button 
          @click="closeModal"
          class="w-full mt-6 p-3 text-gray-400 hover:text-white transition-colors"
        >
          取消
        </button>
      </div>
    </div>

    <!-- 點擊外部關閉下拉選單 -->
    <div 
      v-if="showDropdown"
      class="fixed inset-0 z-40"
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'

export default {
  name: 'LoginButton',
  setup() {
    const authStore = useAuthStore()
    const showLoginModal = ref(false)
    const showDropdown = ref(false)

    // 處理 Google 登入
    const handleGoogleLogin = async () => {
      try {
        await authStore.signInWithGoogle()
        closeModal()
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Google 登入失敗:', error)
        }
      }
    }

    // 處理 GitHub 登入
    const handleGitHubLogin = async () => {
      try {
        await authStore.signInWithGitHub()
        closeModal()
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('GitHub 登入失敗:', error)
        }
      }
    }

    // 處理登出
    const handleLogout = async () => {
      try {
        await authStore.logout()
        closeDropdown()
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('登出失敗:', error)
        }
      }
    }

    // 關閉登入模態框
    const closeModal = () => {
      showLoginModal.value = false
      authStore.clearError()
    }

    // 切換下拉選單
    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value
    }

    // 關閉下拉選單
    const closeDropdown = () => {
      showDropdown.value = false
    }

    // 處理頭像載入錯誤
    const handleAvatarError = (event) => {
      event.target.src = '/placeholder-avatar.png'
    }

    return {
      authStore,
      showLoginModal,
      showDropdown,
      handleGoogleLogin,
      handleGitHubLogin,
      handleLogout,
      closeModal,
      toggleDropdown,
      closeDropdown,
      handleAvatarError
    }
  }
}
</script>

<style scoped>
/* 確保下拉選單在正確的層級 */
.login-button {
  position: relative;
  z-index: 10;
}
</style>