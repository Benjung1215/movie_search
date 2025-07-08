<template>
  <div class="min-h-screen bg-dark-900">
    <div class="container mx-auto px-4 py-8">
      <!-- 返回按鈕 -->
      <button 
        @click="goBack"
        class="btn-secondary mb-6 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        返回
      </button>

      <!-- 用戶資料卡片 -->
      <div class="bg-dark-800 rounded-lg p-8 mb-8">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
          <!-- 用戶頭像 -->
          <div class="flex-shrink-0">
            <img 
              :src="authStore.userPhotoURL || '/placeholder-avatar.png'"
              :alt="authStore.userDisplayName"
              class="w-24 h-24 rounded-full object-cover border-4 border-primary-500"
              @error="handleAvatarError"
            />
          </div>

          <!-- 用戶資訊 -->
          <div class="flex-1 text-center md:text-left">
            <h1 class="text-3xl font-bold text-white mb-2">
              {{ authStore.userDisplayName || '用戶' }}
            </h1>
            <p class="text-gray-400 text-lg mb-4">{{ authStore.userEmail }}</p>
            
            <!-- 同步狀態 -->
            <div class="flex items-center gap-2 justify-center md:justify-start mb-4">
              <div 
                class="w-3 h-3 rounded-full"
                :class="favoritesStore.isCloudSynced ? 'bg-green-500' : 'bg-yellow-500'"
              ></div>
              <span class="text-sm text-gray-400">
                {{ favoritesStore.isCloudSynced ? '雲端同步已啟用' : '離線模式' }}
              </span>
            </div>

            <!-- 帳戶資訊 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div class="bg-dark-700 rounded-lg p-4">
                <div class="text-2xl font-bold text-primary-500">{{ favoritesStore.favoriteCount }}</div>
                <div class="text-gray-400 text-sm">收藏電影</div>
              </div>
              
              <div class="bg-dark-700 rounded-lg p-4">
                <div class="text-2xl font-bold text-primary-500">{{ joinedDays }}</div>
                <div class="text-gray-400 text-sm">使用天數</div>
              </div>
              
              <div class="bg-dark-700 rounded-lg p-4">
                <div class="text-2xl font-bold text-primary-500">{{ averageRating }}</div>
                <div class="text-gray-400 text-sm">平均評分</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 收藏統計 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- 收藏類型分佈 -->
        <div class="bg-dark-800 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            收藏類型分佈
            <span v-if="genreStats.length > 0" class="text-sm text-gray-400">({{ genreStats.length }} 種類型)</span>
          </h2>
          
          <div v-if="genreStats.length > 0" class="space-y-3">
            <div 
              v-for="(genre, index) in genreStats.slice(0, 6)"
              :key="genre.name"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <span 
                  class="w-3 h-3 rounded-full"
                  :class="getGenreColor(index)"
                ></span>
                <span class="text-gray-300">{{ genre.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-24 bg-dark-600 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-500"
                    :class="getGenreBarColor(index)"
                    :style="{ width: `${(genre.count / maxGenreCount) * 100}%` }"
                  ></div>
                </div>
                <span class="text-gray-400 text-sm w-8">{{ genre.count }}</span>
                <span class="text-gray-500 text-xs w-12">{{ ((genre.count / favoritesStore.favoriteCount) * 100).toFixed(0) }}%</span>
              </div>
            </div>
            
            <!-- 顯示更多 -->
            <div v-if="genreStats.length > 6" class="pt-2 border-t border-dark-600">
              <p class="text-gray-500 text-sm text-center">
                還有 {{ genreStats.length - 6 }} 種其他類型
              </p>
            </div>
          </div>
          
          <div v-else class="text-gray-500 text-center py-8">
            <svg class="w-12 h-12 mx-auto text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v11a3 3 0 01-3 3H6a3 3 0 01-3-3V6H2a1 1 0 110-2h4zM6 6v11a1 1 0 001 1h10a1 1 0 001-1V6H6z" />
            </svg>
            <p>還沒有收藏電影</p>
            <p class="text-sm mt-1">開始收藏電影來查看類型分佈</p>
          </div>
        </div>

        <!-- 最近收藏 -->
        <div class="bg-dark-800 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-white mb-4">最近收藏</h2>
          <div v-if="recentFavorites.length > 0" class="space-y-3">
            <div 
              v-for="movie in recentFavorites"
              :key="movie.id"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-700 cursor-pointer transition-colors"
              @click="navigateToDetail(movie.id)"
            >
              <img 
                :src="tmdbService.getPosterUrl(movie.poster_path)"
                :alt="movie.title"
                class="w-12 h-18 object-cover rounded"
                @error="handleImageError"
              />
              <div class="flex-1">
                <p class="text-white font-medium line-clamp-1">{{ movie.title }}</p>
                <p class="text-gray-400 text-sm">{{ formatDate(movie.added_at) }}</p>
              </div>
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="text-gray-400 text-sm">{{ movie.vote_average?.toFixed(1) || 'N/A' }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 text-center py-8">
            還沒有收藏電影
          </div>
        </div>
      </div>

      <!-- 帳戶設定 -->
      <div class="bg-dark-800 rounded-lg p-6">
        <h2 class="text-xl font-semibold text-white mb-4">帳戶設定</h2>
        
        <div class="space-y-4">
          <!-- 數據同步 -->
          <div class="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
            <div>
              <h3 class="text-white font-medium">數據同步</h3>
              <p class="text-gray-400 text-sm">自動同步收藏到雲端</p>
            </div>
            <div class="flex items-center gap-2">
              <span 
                class="px-2 py-1 rounded text-xs"
                :class="favoritesStore.isCloudSynced ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'"
              >
                {{ favoritesStore.isCloudSynced ? '已啟用' : '離線模式' }}
              </span>
            </div>
          </div>

          <!-- 清空收藏 -->
          <div class="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
            <div>
              <h3 class="text-white font-medium">清空所有收藏</h3>
              <p class="text-gray-400 text-sm">刪除所有收藏的電影（無法復原）</p>
            </div>
            <button 
              @click="showClearConfirm = true"
              class="btn bg-red-600 hover:bg-red-700 text-white"
              :disabled="!favoritesStore.hasFavorites || favoritesStore.loading"
            >
              清空收藏
            </button>
          </div>

          <!-- 登出 -->
          <div class="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
            <div>
              <h3 class="text-white font-medium">登出帳戶</h3>
              <p class="text-gray-400 text-sm">登出當前帳戶，保留本地數據</p>
            </div>
            <button 
              @click="handleLogout"
              class="btn-secondary"
              :disabled="authStore.loading"
            >
              <span v-if="!authStore.loading">登出</span>
              <span v-else>登出中...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 清空確認對話框 -->
      <div v-if="showClearConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-dark-800 rounded-lg p-6 max-w-md mx-4">
          <h3 class="text-xl font-semibold text-white mb-4">確認清空收藏</h3>
          <p class="text-gray-300 mb-6">
            您確定要清空所有收藏嗎？此操作將同時清除本地和雲端數據，且無法復原。
          </p>
          <div class="flex gap-4">
            <button 
              @click="showClearConfirm = false"
              class="btn-secondary flex-1"
            >
              取消
            </button>
            <button 
              @click="confirmClearAll"
              class="btn bg-red-600 hover:bg-red-700 text-white flex-1"
              :disabled="favoritesStore.loading"
            >
              <span v-if="!favoritesStore.loading">確認清空</span>
              <span v-else>清空中...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useFavoritesStore } from '../stores/favorites.js'
import { useMoviesStore } from '../stores/movies.js'
import tmdbService from '../services/tmdb.js'

export default {
  name: 'Profile',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const favoritesStore = useFavoritesStore()
    const moviesStore = useMoviesStore()
    const showClearConfirm = ref(false)

    // 計算屬性
    const joinedDays = computed(() => {
      if (!authStore.user?.metadata?.creationTime) return 0
      const joinDate = new Date(authStore.user.metadata.creationTime)
      const now = new Date()
      const diffTime = Math.abs(now - joinDate)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    })

    const averageRating = computed(() => {
      if (favoritesStore.favoriteCount === 0) return 'N/A'
      const total = favoritesStore.favorites.reduce((sum, movie) => {
        return sum + (movie.vote_average || 0)
      }, 0)
      return (total / favoritesStore.favoriteCount).toFixed(1)
    })

    const recentFavorites = computed(() => {
      return favoritesStore.getFavoritesSortedByDate().slice(0, 5)
    })

    const genreStats = computed(() => {
      const genreMap = new Map()
      
      favoritesStore.favorites.forEach(movie => {
        if (movie.genre_ids && movie.genre_ids.length > 0) {
          movie.genre_ids.forEach(genreId => {
            const genreName = moviesStore.getGenreName(genreId)
            if (genreName) {
              genreMap.set(genreName, (genreMap.get(genreName) || 0) + 1)
            }
          })
        }
      })

      const stats = Array.from(genreMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)

      console.log('類型統計:', stats) // 除錯用
      return stats
    })

    const maxGenreCount = computed(() => {
      return Math.max(...genreStats.value.map(g => g.count), 1)
    })

    // 方法
    const goBack = () => {
      router.back()
    }

    const navigateToDetail = (movieId) => {
      router.push(`/movie/${movieId}`)
    }

    const handleLogout = async () => {
      try {
        await authStore.logout()
        router.push('/')
      } catch (error) {
        console.error('登出失敗:', error)
      }
    }

    const confirmClearAll = async () => {
      try {
        await favoritesStore.clearAllFavorites()
        showClearConfirm.value = false
      } catch (error) {
        console.error('清空收藏失敗:', error)
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric'
      })
    }

    const handleAvatarError = (event) => {
      event.target.src = '/placeholder-avatar.png'
    }

    const handleImageError = (event) => {
      event.target.src = '/placeholder-poster.jpg'
    }

    // 為類型分佈添加顏色
    const getGenreColor = (index) => {
      const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
      ]
      return colors[index % colors.length]
    }

    const getGenreBarColor = (index) => {
      const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
      ]
      return colors[index % colors.length]
    }

    // 初始化
    onMounted(async () => {
      // 確保電影類型已載入
      if (moviesStore.genres.length === 0) {
        await moviesStore.fetchGenres()
      }
    })

    return {
      authStore,
      favoritesStore,
      moviesStore,
      tmdbService,
      showClearConfirm,
      joinedDays,
      averageRating,
      recentFavorites,
      genreStats,
      maxGenreCount,
      goBack,
      navigateToDetail,
      handleLogout,
      confirmClearAll,
      formatDate,
      handleAvatarError,
      handleImageError,
      getGenreColor,
      getGenreBarColor
    }
  }
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>