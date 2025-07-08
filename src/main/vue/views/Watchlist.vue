<template>
  <div class="min-h-screen bg-dark-900">
    <div class="container mx-auto px-4 py-8">
      <!-- 標題和統計 -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">我的觀看清單</h1>
          <p class="text-gray-400">
            管理您想看的電影 
            <span v-if="watchlistStore.watchlistCount > 0" class="text-primary-500">
              ({{ watchlistStore.watchlistCount }} 部電影)
            </span>
          </p>
        </div>
        
        <!-- 動作按鈕 -->
        <div class="flex items-center gap-4 mt-4 md:mt-0">
          <!-- 排序選擇 -->
          <select 
            v-model="sortBy" 
            class="bg-dark-800 text-white px-4 py-2 rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none"
          >
            <option value="date">依加入時間</option>
            <option value="rating">依評分</option>
            <option value="title">依標題</option>
          </select>
          
          <!-- 狀態篩選 -->
          <select 
            v-model="filterStatus" 
            class="bg-dark-800 text-white px-4 py-2 rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none"
          >
            <option value="all">所有狀態</option>
            <option value="want_to_watch">想看</option>
            <option value="watched">已看</option>
          </select>
          
          <!-- 清空按鈕 -->
          <button 
            v-if="watchlistStore.hasWatchlist"
            @click="showClearConfirm = true"
            class="btn bg-red-600 hover:bg-red-700 text-white"
          >
            清空清單
          </button>
        </div>
      </div>

      <!-- 搜尋欄 -->
      <div class="mb-8">
        <div class="relative max-w-md">
          <input 
            type="text" 
            placeholder="搜尋觀看清單..." 
            v-model="searchQuery"
            class="input w-full pr-10"
          >
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 載入狀態 -->
      <div v-if="watchlistStore.loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <p class="text-gray-400 mt-2">載入中...</p>
      </div>

      <!-- 空狀態 -->
      <div v-else-if="!watchlistStore.hasWatchlist" class="text-center py-12">
        <div class="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </div>
        <h2 class="text-2xl font-semibold text-white mb-2">觀看清單是空的</h2>
        <p class="text-gray-400 mb-6">開始添加您想看的電影吧！</p>
        <router-link to="/search" class="btn-primary">
          搜尋電影
        </router-link>
      </div>

      <!-- 觀看清單內容 -->
      <div v-else>
        <!-- 沒有搜尋結果 -->
        <div v-if="filteredWatchlist.length === 0" class="text-center py-12">
          <h2 class="text-xl font-semibold text-white mb-2">找不到符合的電影</h2>
          <p class="text-gray-400">嘗試調整搜尋條件或篩選器</p>
        </div>

        <!-- 電影網格 -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            v-for="movie in filteredWatchlist" 
            :key="movie.id"
            class="bg-dark-800 rounded-lg overflow-hidden hover:scale-105 transition-transform"
          >
            <!-- 電影海報 -->
            <div class="relative">
              <img 
                :src="tmdbService.getPosterUrl(movie.poster_path)"
                :alt="movie.title"
                class="w-full h-64 object-cover cursor-pointer"
                @click="navigateToDetail(movie.id)"
                @error="handleImageError"
              />
              
              <!-- 狀態標籤 -->
              <div class="absolute top-2 right-2">
                <span 
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="getStatusColor(movie.status)"
                >
                  {{ getStatusText(movie.status) }}
                </span>
              </div>
              
              <!-- 評分 -->
              <div class="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                ⭐ {{ movie.vote_average?.toFixed(1) || 'N/A' }}
              </div>
            </div>
            
            <!-- 電影資訊 -->
            <div class="p-4">
              <h3 
                class="text-lg font-semibold text-white mb-2 cursor-pointer hover:text-primary-500 transition-colors line-clamp-1"
                @click="navigateToDetail(movie.id)"
              >
                {{ movie.title }}
              </h3>
              
              <p class="text-gray-400 text-sm mb-3 line-clamp-2">
                {{ movie.overview || '暫無劇情簡介' }}
              </p>
              
              <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>{{ formatDate(movie.release_date) }}</span>
                <span>{{ formatAddedDate(movie.added_at) }}</span>
              </div>
              
              <!-- 動作按鈕 -->
              <div class="flex items-center gap-2">
                <!-- 狀態切換 -->
                <button 
                  @click="toggleWatchStatus(movie)"
                  class="flex-1 py-2 px-3 rounded transition-colors text-sm"
                  :class="movie.status === 'watched' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'"
                >
                  {{ movie.status === 'watched' ? '標記為想看' : '標記為已看' }}
                </button>
                
                <!-- 移除按鈕 -->
                <button 
                  @click="removeFromWatchlist(movie.id)"
                  class="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded transition-colors"
                  title="移除"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 清空確認對話框 -->
      <div v-if="showClearConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-dark-800 rounded-lg p-6 max-w-md mx-4">
          <h3 class="text-xl font-semibold text-white mb-4">確認清空觀看清單</h3>
          <p class="text-gray-300 mb-6">
            您確定要清空所有觀看清單嗎？此操作將同時清除本地和雲端數據，且無法復原。
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
              :disabled="watchlistStore.loading"
            >
              <span v-if="!watchlistStore.loading">確認清空</span>
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
import { useWatchlistStore } from '../stores/watchlist.js'
import { useMoviesStore } from '../stores/movies.js'
import tmdbService from '../services/tmdb.js'

export default {
  name: 'Watchlist',
  setup() {
    const router = useRouter()
    const watchlistStore = useWatchlistStore()
    const moviesStore = useMoviesStore()
    
    const searchQuery = ref('')
    const sortBy = ref('date')
    const filterStatus = ref('all')
    const showClearConfirm = ref(false)

    // 計算屬性
    const filteredWatchlist = computed(() => {
      let movies = watchlistStore.watchlist

      // 狀態篩選
      if (filterStatus.value !== 'all') {
        movies = movies.filter(movie => movie.status === filterStatus.value)
      }

      // 搜尋篩選
      if (searchQuery.value.trim()) {
        movies = watchlistStore.searchWatchlist(searchQuery.value)
      }

      // 排序
      switch (sortBy.value) {
        case 'rating':
          return watchlistStore.getWatchlistSortedByRating().filter(movie => {
            if (filterStatus.value !== 'all' && movie.status !== filterStatus.value) return false
            if (searchQuery.value.trim()) {
              const query = searchQuery.value.toLowerCase()
              return movie.title.toLowerCase().includes(query) ||
                     movie.overview.toLowerCase().includes(query) ||
                     movie.original_title.toLowerCase().includes(query)
            }
            return true
          })
        case 'title':
          return watchlistStore.getWatchlistSortedByTitle().filter(movie => {
            if (filterStatus.value !== 'all' && movie.status !== filterStatus.value) return false
            if (searchQuery.value.trim()) {
              const query = searchQuery.value.toLowerCase()
              return movie.title.toLowerCase().includes(query) ||
                     movie.overview.toLowerCase().includes(query) ||
                     movie.original_title.toLowerCase().includes(query)
            }
            return true
          })
        default:
          return movies
      }
    })

    // 方法
    const navigateToDetail = (movieId) => {
      router.push(`/movie/${movieId}`)
    }

    const removeFromWatchlist = async (movieId) => {
      await watchlistStore.removeFromWatchlist(movieId)
    }

    const toggleWatchStatus = async (movie) => {
      const newStatus = movie.status === 'watched' ? 'want_to_watch' : 'watched'
      await watchlistStore.updateWatchStatus(movie.id, newStatus)
    }

    const confirmClearAll = async () => {
      try {
        await watchlistStore.clearAllWatchlist()
        showClearConfirm.value = false
      } catch (error) {
        console.error('清空觀看清單失敗:', error)
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.getFullYear()
    }

    const formatAddedDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric'
      })
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'watched':
          return '已看'
        case 'want_to_watch':
        default:
          return '想看'
      }
    }

    const getStatusColor = (status) => {
      switch (status) {
        case 'watched':
          return 'bg-green-600 text-white'
        case 'want_to_watch':
        default:
          return 'bg-blue-600 text-white'
      }
    }

    const handleImageError = (event) => {
      event.target.src = '/placeholder-poster.jpg'
    }

    // 生命週期
    onMounted(async () => {
      // 確保電影類型已載入
      if (moviesStore.genres.length === 0) {
        await moviesStore.fetchGenres()
      }
    })

    return {
      watchlistStore,
      moviesStore,
      tmdbService,
      searchQuery,
      sortBy,
      filterStatus,
      showClearConfirm,
      filteredWatchlist,
      navigateToDetail,
      removeFromWatchlist,
      toggleWatchStatus,
      confirmClearAll,
      formatDate,
      formatAddedDate,
      getStatusText,
      getStatusColor,
      handleImageError
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>