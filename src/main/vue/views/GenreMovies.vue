<template>
  <div class="min-h-screen bg-dark-900">
    <div class="container mx-auto px-4 py-8">
      <!-- 標題和麵包屑 -->
      <div class="mb-8">
        <nav class="flex items-center text-sm text-gray-400 mb-4">
          <router-link to="/" class="hover:text-primary-500">首頁</router-link>
          <span class="mx-2">/</span>
          <router-link to="/genres" class="hover:text-primary-500">電影類型</router-link>
          <span class="mx-2">/</span>
          <span class="text-white">{{ currentGenre?.name || '載入中...' }}</span>
        </nav>
        
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">
              {{ currentGenre?.name || '載入中...' }}
            </h1>
            <p class="text-gray-400">
              找到 {{ totalResults }} 部電影
            </p>
          </div>
          
          <!-- 控制項 -->
          <div class="flex items-center gap-4 mt-4 md:mt-0">
            <!-- 排序選擇 -->
            <select 
              v-model="sortBy" 
              @change="handleSortChange"
              class="bg-dark-800 text-white px-4 py-2 rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none"
            >
              <option value="popularity.desc">人氣 (高到低)</option>
              <option value="popularity.asc">人氣 (低到高)</option>
              <option value="vote_average.desc">評分 (高到低)</option>
              <option value="vote_average.asc">評分 (低到高)</option>
              <option value="release_date.desc">上映日期 (新到舊)</option>
              <option value="release_date.asc">上映日期 (舊到新)</option>
              <option value="title.asc">標題 (A-Z)</option>
              <option value="title.desc">標題 (Z-A)</option>
            </select>
            
            <!-- 篩選器切換 -->
            <button 
              @click="showFilters = !showFilters"
              class="btn-secondary flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
              </svg>
              篩選器
            </button>
          </div>
        </div>
      </div>

      <!-- 篩選器面板 -->
      <div v-if="showFilters" class="bg-dark-800 rounded-lg p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 年份篩選 -->
          <div>
            <label class="block text-white font-medium mb-2">上映年份</label>
            <div class="flex items-center gap-2">
              <input
                v-model="filters.yearFrom"
                type="number"
                placeholder="從"
                min="1900"
                :max="currentYear"
                class="input flex-1"
              />
              <span class="text-gray-400">-</span>
              <input
                v-model="filters.yearTo"
                type="number"
                placeholder="到"
                min="1900"
                :max="currentYear"
                class="input flex-1"
              />
            </div>
          </div>
          
          <!-- 評分篩選 -->
          <div>
            <label class="block text-white font-medium mb-2">評分範圍</label>
            <div class="flex items-center gap-2">
              <input
                v-model="filters.ratingFrom"
                type="number"
                placeholder="從"
                min="0"
                max="10"
                step="0.1"
                class="input flex-1"
              />
              <span class="text-gray-400">-</span>
              <input
                v-model="filters.ratingTo"
                type="number"
                placeholder="到"
                min="0"
                max="10"
                step="0.1"
                class="input flex-1"
              />
            </div>
          </div>
          
          <!-- 語言篩選 -->
          <div>
            <label class="block text-white font-medium mb-2">語言</label>
            <select 
              v-model="filters.language"
              class="input w-full"
            >
              <option value="">所有語言</option>
              <option value="en">英語</option>
              <option value="zh">中文</option>
              <option value="ja">日語</option>
              <option value="ko">韓語</option>
              <option value="fr">法語</option>
              <option value="de">德語</option>
              <option value="es">西班牙語</option>
            </select>
          </div>
        </div>
        
        <!-- 篩選器按鈕 -->
        <div class="flex items-center gap-4 mt-6">
          <button @click="applyFilters" class="btn-primary">
            套用篩選
          </button>
          <button @click="clearFilters" class="btn-secondary">
            清除篩選
          </button>
        </div>
      </div>

      <!-- 載入狀態 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <p class="text-gray-400 mt-2">載入中...</p>
      </div>

      <!-- 錯誤狀態 -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-500 text-xl mb-4">載入失敗</div>
        <p class="text-gray-400 mb-6">{{ error }}</p>
        <button @click="loadMovies" class="btn-primary">重試</button>
      </div>

      <!-- 空狀態 -->
      <div v-else-if="movies.length === 0" class="text-center py-12">
        <div class="text-gray-400 text-xl mb-4">找不到符合條件的電影</div>
        <button @click="clearFilters" class="btn-primary">清除篩選條件</button>
      </div>

      <!-- 電影網格 -->
      <div v-else>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <MovieCard 
            v-for="movie in movies" 
            :key="movie.id"
            :movie="movie"
            @click="navigateToDetail(movie.id)"
          />
        </div>
        
        <!-- 載入更多 -->
        <div v-if="hasMore" class="text-center mt-8">
          <button 
            @click="loadMore"
            :disabled="loadingMore"
            class="btn-primary"
          >
            <span v-if="!loadingMore">載入更多</span>
            <span v-else class="flex items-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              載入中...
            </span>
          </button>
        </div>
        
        <!-- 分頁資訊 -->
        <div class="text-center mt-6 text-gray-400">
          第 {{ currentPage }} 頁，共 {{ totalPages }} 頁
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMoviesStore } from '../stores/movies.js'
import MovieCard from '../components/movie/MovieCard.vue'
import tmdbService from '../services/tmdb.js'

export default {
  name: 'GenreMovies',
  components: {
    MovieCard
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const moviesStore = useMoviesStore()
    
    const movies = ref([])
    const currentGenre = ref(null)
    const loading = ref(false)
    const loadingMore = ref(false)
    const error = ref(null)
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalResults = ref(0)
    const sortBy = ref('popularity.desc')
    const showFilters = ref(false)
    
    // 篩選器
    const filters = ref({
      yearFrom: '',
      yearTo: '',
      ratingFrom: '',
      ratingTo: '',
      language: ''
    })

    // 計算屬性
    const genreId = computed(() => parseInt(route.params.id))
    const hasMore = computed(() => currentPage.value < totalPages.value)
    const currentYear = computed(() => new Date().getFullYear())

    // 載入電影
    const loadMovies = async (page = 1, append = false) => {
      if (page === 1) {
        loading.value = true
        error.value = null
      } else {
        loadingMore.value = true
      }
      
      try {
        // 建構搜尋選項
        const options = {
          page,
          sortBy: sortBy.value,
          withGenres: genreId.value
        }
        
        // 應用篩選器
        if (filters.value.yearFrom) {
          options.releaseDateGte = `${filters.value.yearFrom}-01-01`
        }
        if (filters.value.yearTo) {
          options.releaseDateLte = `${filters.value.yearTo}-12-31`
        }
        if (filters.value.ratingFrom) {
          options.voteAverageGte = filters.value.ratingFrom
        }
        if (filters.value.ratingTo) {
          options.voteAverageLte = filters.value.ratingTo
        }
        if (filters.value.language) {
          options.withOriginalLanguage = filters.value.language
        }
        
        const response = await tmdbService.discoverMovies(options)
        
        if (append) {
          movies.value = [...movies.value, ...response.results]
        } else {
          movies.value = response.results
        }
        
        currentPage.value = response.page
        totalPages.value = response.total_pages
        totalResults.value = response.total_results
        
      } catch (err) {
        console.error('Error loading movies:', err)
        error.value = '載入電影失敗，請稍後重試'
      } finally {
        loading.value = false
        loadingMore.value = false
      }
    }

    // 載入更多
    const loadMore = () => {
      if (hasMore.value && !loadingMore.value) {
        loadMovies(currentPage.value + 1, true)
      }
    }

    // 處理排序變更
    const handleSortChange = () => {
      currentPage.value = 1
      loadMovies(1, false)
    }

    // 應用篩選器
    const applyFilters = () => {
      currentPage.value = 1
      loadMovies(1, false)
    }

    // 清除篩選器
    const clearFilters = () => {
      filters.value = {
        yearFrom: '',
        yearTo: '',
        ratingFrom: '',
        ratingTo: '',
        language: ''
      }
      currentPage.value = 1
      loadMovies(1, false)
    }

    // 導航到電影詳情
    const navigateToDetail = (movieId) => {
      router.push(`/movie/${movieId}`)
    }

    // 載入類型資訊
    const loadGenreInfo = async () => {
      try {
        if (moviesStore.genres.length === 0) {
          await moviesStore.fetchGenres()
        }
        
        currentGenre.value = moviesStore.genres.find(g => g.id === genreId.value)
      } catch (err) {
        console.error('Error loading genre info:', err)
      }
    }

    // 監聽路由變化
    watch(() => route.params.id, () => {
      if (route.params.id) {
        loadGenreInfo()
        loadMovies(1, false)
      }
    }, { immediate: true })

    // 生命週期
    onMounted(() => {
      loadGenreInfo()
      loadMovies(1, false)
    })

    return {
      movies,
      currentGenre,
      loading,
      loadingMore,
      error,
      currentPage,
      totalPages,
      totalResults,
      sortBy,
      showFilters,
      filters,
      hasMore,
      currentYear,
      loadMovies,
      loadMore,
      handleSortChange,
      applyFilters,
      clearFilters,
      navigateToDetail
    }
  }
}
</script>

<style scoped>
.input {
  @apply bg-dark-700 text-white px-3 py-2 rounded border border-dark-600 focus:border-primary-500 focus:outline-none;
}
</style>