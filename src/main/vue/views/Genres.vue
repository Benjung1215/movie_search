<template>
  <div class="min-h-screen bg-dark-900">
    <div class="container mx-auto px-4 py-8">
      <!-- 標題 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-white mb-4">電影類型</h1>
        <p class="text-gray-400 text-lg">探索不同類型的精彩電影</p>
      </div>

      <!-- 載入狀態 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p class="text-gray-400 mt-4">載入類型資料中...</p>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-500 text-xl mb-4">載入失敗</div>
        <p class="text-gray-400 mb-6">{{ error }}</p>
        <button @click="loadGenres" class="btn-primary">重試</button>
      </div>

      <!-- 類型網格 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="genre in genresWithStats"
          :key="genre.id"
          class="bg-dark-800 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer"
          @click="navigateToGenre(genre.id)"
        >
          <!-- 電影預覽網格 -->
          <div class="relative h-48 bg-gradient-to-br from-dark-700 to-dark-900">
            <div class="grid grid-cols-2 gap-1 h-full p-2">
              <div 
                v-for="(movie, index) in genre.popularMovies.slice(0, 4)"
                :key="movie.id"
                class="relative rounded overflow-hidden"
              >
                <img
                  :src="tmdbService.getPosterUrl(movie.poster_path)"
                  :alt="movie.title"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
                <div class="absolute inset-0 bg-black bg-opacity-20"></div>
              </div>
              
              <!-- 填充空白格子 -->
              <div 
                v-for="n in Math.max(0, 4 - genre.popularMovies.length)"
                :key="`empty-${n}`"
                class="bg-dark-600 rounded flex items-center justify-center"
              >
                <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v11a3 3 0 01-3 3H6a3 3 0 01-3-3V6H2a1 1 0 110-2h4z"/>
                </svg>
              </div>
            </div>
            
            <!-- 類型標籤 -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-4">
              <h3 class="text-white font-bold text-lg mb-1">{{ genre.name }}</h3>
              <p class="text-gray-300 text-sm">{{ genre.totalResults || 0 }} 部電影</p>
            </div>
          </div>
          
          <!-- 類型資訊 -->
          <div class="p-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-primary-500 font-medium">熱門電影</span>
              <span class="text-gray-400 text-sm">{{ genre.popularMovies.length }} / 4</span>
            </div>
            
            <!-- 熱門電影標題 -->
            <div class="space-y-1">
              <div 
                v-for="movie in genre.popularMovies.slice(0, 3)"
                :key="movie.id"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-gray-300 truncate">{{ movie.title }}</span>
                <span class="text-yellow-500 ml-2">{{ movie.vote_average?.toFixed(1) }}</span>
              </div>
            </div>
            
            <!-- 查看更多按鈕 -->
            <div class="mt-4 pt-3 border-t border-dark-600">
              <div class="flex items-center justify-center text-primary-500 hover:text-primary-400 transition-colors">
                <span class="mr-2">探索更多</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-if="!loading && !error && genresWithStats.length === 0" class="text-center py-12">
        <div class="text-gray-400 text-xl mb-4">暫無類型資料</div>
        <button @click="loadGenres" class="btn-primary">重新載入</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMoviesStore } from '../stores/movies.js'
import tmdbService from '../services/tmdb.js'

export default {
  name: 'Genres',
  setup() {
    const router = useRouter()
    const moviesStore = useMoviesStore()
    const genresWithStats = ref([])
    const loading = ref(false)
    const error = ref(null)

    // 載入類型資料
    const loadGenres = async () => {
      loading.value = true
      error.value = null
      
      try {
        // 先確保基本類型資料已載入
        if (moviesStore.genres.length === 0) {
          await moviesStore.fetchGenres()
        }
        
        // 為每個類型載入統計資料和預覽電影
        const genresData = []
        
        for (const genre of moviesStore.genres) {
          try {
            const stats = await tmdbService.getGenreStats(genre.id)
            genresData.push({
              ...genre,
              ...stats
            })
          } catch (err) {
            if (import.meta.env.DEV) {
              console.error(`Error loading stats for genre ${genre.name}:`, err)
            }
            // 如果某個類型載入失敗，仍然添加基本資料
            genresData.push({
              ...genre,
              totalResults: 0,
              totalPages: 0,
              popularMovies: []
            })
          }
        }
        
        // 按電影數量排序
        genresWithStats.value = genresData.sort((a, b) => b.totalResults - a.totalResults)
        
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Error loading genres:', err)
        }
        error.value = '載入類型資料失敗，請稍後重試'
      } finally {
        loading.value = false
      }
    }

    // 導航到類型頁面
    const navigateToGenre = (genreId) => {
      router.push(`/genres/${genreId}`)
    }

    // 處理圖片載入錯誤
    const handleImageError = (event) => {
      event.target.src = '/placeholder-poster.jpg'
    }

    // 生命週期
    onMounted(() => {
      loadGenres()
    })

    return {
      genresWithStats,
      loading,
      error,
      tmdbService,
      loadGenres,
      navigateToGenre,
      handleImageError
    }
  }
}
</script>

<style scoped>
.grid-cols-2 > div:nth-child(1) {
  border-top-left-radius: 0.375rem;
}
.grid-cols-2 > div:nth-child(2) {
  border-top-right-radius: 0.375rem;
}
.grid-cols-2 > div:nth-child(3) {
  border-bottom-left-radius: 0.375rem;
}
.grid-cols-2 > div:nth-child(4) {
  border-bottom-right-radius: 0.375rem;
}
</style>