<template>
  <div class="min-h-screen bg-dark-900">
    <div class="container mx-auto px-4 py-8">
      <!-- 主標題 -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-primary-500 mb-4">
          🎬 Vue Movie Search
        </h1>
        <p class="text-gray-400 text-xl mb-8">
          現代化的電影搜尋和收藏應用程式
        </p>
        
        <!-- 快速搜尋 -->
        <div class="max-w-lg mx-auto mb-8">
          <div class="relative">
            <input 
              type="text" 
              placeholder="搜尋電影..."
              class="input w-full text-lg pr-12"
              v-model="quickSearchQuery"
              @keyup.enter="handleQuickSearch"
            >
            <button 
              @click="handleQuickSearch"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-500"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

      </div>

      <!-- 統計資訊 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="card p-6 text-center">
          <div class="text-3xl font-bold text-primary-500 mb-2">{{ favoritesStore.favoriteCount }}</div>
          <div class="text-gray-400">已收藏電影</div>
        </div>
        
        <div class="card p-6 text-center">
          <div class="text-3xl font-bold text-primary-500 mb-2">{{ moviesStore.totalResults || '∞' }}</div>
          <div class="text-gray-400">可搜尋電影</div>
        </div>
        
        <div class="card p-6 text-center">
          <div class="text-3xl font-bold text-primary-500 mb-2">HD</div>
          <div class="text-gray-400">高畫質海報</div>
        </div>
      </div>

      <!-- 熱門電影預覽 -->
      <div v-if="moviesStore.hasPopularMovies">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold text-white">熱門電影</h2>
          <router-link to="/search" class="text-primary-500 hover:text-primary-400 flex items-center gap-1">
            查看更多
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div 
            v-for="movie in moviesStore.popularMovies.slice(0, 6)"
            :key="movie.id"
            class="cursor-pointer hover:scale-105 transition-transform"
            @click="navigateToDetail(movie.id)"
          >
            <img 
              :src="tmdbService.getPosterUrl(movie.poster_path)"
              :alt="movie.title"
              class="w-full aspect-[2/3] object-cover rounded-lg shadow-lg"
              @error="handleImageError"
            />
            <h3 class="text-white text-sm mt-2 line-clamp-2">{{ movie.title }}</h3>
            <div class="flex items-center mt-1">
              <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="text-gray-400 text-sm">{{ movie.vote_average?.toFixed(1) || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 熱門類型快速入口 -->
      <div v-if="popularGenres.length > 0">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold text-white">熱門類型</h2>
          <router-link to="/genres" class="text-primary-500 hover:text-primary-400 flex items-center gap-1">
            查看全部
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div 
            v-for="genre in popularGenres.slice(0, 6)"
            :key="genre.id"
            class="cursor-pointer hover:scale-105 transition-transform"
            @click="navigateToGenre(genre.id)"
          >
            <div class="bg-gradient-to-br from-primary-500 to-purple-600 aspect-square rounded-lg flex items-center justify-center shadow-lg">
              <span class="text-white font-bold text-lg text-center px-2">{{ genre.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 載入狀態 -->
      <div v-if="moviesStore.isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <p class="text-gray-400 mt-2">載入中...</p>
      </div>

      <!-- 功能介紹 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div class="text-center">
          <div class="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">智能搜尋</h3>
          <p class="text-gray-400">快速搜尋電影資料庫，找到你想要的電影</p>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">收藏管理</h3>
          <p class="text-gray-400">建立個人收藏清單，永不遺失喜愛的電影</p>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">詳細資訊</h3>
          <p class="text-gray-400">查看完整電影資訊、演員陣容和相似推薦</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMoviesStore } from '../stores/movies.js'
import { useFavoritesStore } from '../stores/favorites.js'
import { useWatchlistStore } from '../stores/watchlist.js'
import tmdbService from '../services/tmdb.js'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const moviesStore = useMoviesStore()
    const favoritesStore = useFavoritesStore()
    const watchlistStore = useWatchlistStore()
    const quickSearchQuery = ref('')
    const popularGenres = ref([])

    // 方法
    const handleQuickSearch = () => {
      if (quickSearchQuery.value.trim()) {
        router.push({
          path: '/search',
          query: { q: quickSearchQuery.value.trim() }
        })
      }
    }

    const navigateToDetail = (movieId) => {
      router.push(`/movie/${movieId}`)
    }

    const handleImageError = (event) => {
      event.target.src = '/placeholder-poster.jpg'
    }
    
    const navigateToGenre = (genreId) => {
      router.push(`/genres/${genreId}`)
    }
    
    const loadPopularGenres = () => {
      // 簡單的熱門類型列表
      const popularGenreIds = [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 10770, 53, 10752, 37]
      popularGenres.value = moviesStore.genres.filter(genre => popularGenreIds.includes(genre.id))
    }

    // 初始化
    onMounted(async () => {
      // 載入電影類型（確保類型功能正常）
      if (moviesStore.genres.length === 0) {
        await moviesStore.fetchGenres()
      }
      
      // 載入熱門電影（如果還沒載入）
      if (!moviesStore.hasPopularMovies) {
        await moviesStore.fetchPopularMovies()
      }
      
      // 載入熱門類型
      loadPopularGenres()
    })

    return {
      quickSearchQuery,
      moviesStore,
      favoritesStore,
      watchlistStore,
      tmdbService,
      popularGenres,
      handleQuickSearch,
      navigateToDetail,
      navigateToGenre,
      handleImageError
    }
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>