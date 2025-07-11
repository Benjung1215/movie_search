<template>
  <div class="min-h-screen bg-dark-900">
    <div class="container mx-auto px-4 py-8">
      <!-- 標題 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">進階搜尋</h1>
        <p class="text-gray-400">使用多種條件精確搜尋您想要的電影</p>
      </div>

      <!-- 搜尋表單 -->
      <div class="bg-dark-800 rounded-lg p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- 關鍵字搜尋 -->
          <div class="lg:col-span-2">
            <label class="block text-white font-medium mb-2">關鍵字</label>
            <input
              v-model="searchForm.query"
              type="text"
              placeholder="搜尋電影標題、演員、導演..."
              class="input w-full"
              @keyup.enter="performSearch"
            />
          </div>

          <!-- 類型選擇 -->
          <div>
            <label class="block text-white font-medium mb-2">類型</label>
            <select v-model="searchForm.genre" class="input w-full">
              <option value="">所有類型</option>
              <option v-for="genre in genres" :key="genre.id" :value="genre.id">
                {{ genre.name }}
              </option>
            </select>
          </div>

          <!-- 年份範圍 -->
          <div>
            <label class="block text-white font-medium mb-2">上映年份</label>
            <div class="flex items-center gap-2">
              <input
                v-model="searchForm.yearFrom"
                type="number"
                placeholder="從"
                min="1900"
                :max="currentYear"
                class="input flex-1"
              />
              <span class="text-gray-400">-</span>
              <input
                v-model="searchForm.yearTo"
                type="number"
                placeholder="到"
                min="1900"
                :max="currentYear"
                class="input flex-1"
              />
            </div>
          </div>

          <!-- 評分範圍 -->
          <div>
            <label class="block text-white font-medium mb-2">評分範圍</label>
            <div class="flex items-center gap-2">
              <input
                v-model="searchForm.ratingFrom"
                type="number"
                placeholder="從"
                min="0"
                max="10"
                step="0.1"
                class="input flex-1"
              />
              <span class="text-gray-400">-</span>
              <input
                v-model="searchForm.ratingTo"
                type="number"
                placeholder="到"
                min="0"
                max="10"
                step="0.1"
                class="input flex-1"
              />
            </div>
          </div>

          <!-- 語言 -->
          <div>
            <label class="block text-white font-medium mb-2">原始語言</label>
            <select v-model="searchForm.language" class="input w-full">
              <option value="">所有語言</option>
              <option value="en">英語</option>
              <option value="zh">中文</option>
              <option value="ja">日語</option>
              <option value="ko">韓語</option>
              <option value="fr">法語</option>
              <option value="de">德語</option>
              <option value="es">西班牙語</option>
              <option value="it">意大利語</option>
              <option value="ru">俄語</option>
              <option value="pt">葡萄牙語</option>
              <option value="hi">印地語</option>
              <option value="ar">阿拉伯語</option>
            </select>
          </div>

          <!-- 排序方式 -->
          <div>
            <label class="block text-white font-medium mb-2">排序方式</label>
            <select v-model="searchForm.sortBy" class="input w-full">
              <option value="popularity.desc">人氣 (高到低)</option>
              <option value="popularity.asc">人氣 (低到高)</option>
              <option value="vote_average.desc">評分 (高到低)</option>
              <option value="vote_average.asc">評分 (低到高)</option>
              <option value="release_date.desc">上映日期 (新到舊)</option>
              <option value="release_date.asc">上映日期 (舊到新)</option>
              <option value="title.asc">標題 (A-Z)</option>
              <option value="title.desc">標題 (Z-A)</option>
            </select>
          </div>

          <!-- 最小評分數 -->
          <div>
            <label class="block text-white font-medium mb-2">最少評分人數</label>
            <input
              v-model="searchForm.minVoteCount"
              type="number"
              placeholder="例如: 100"
              min="0"
              class="input w-full"
            />
          </div>
        </div>

        <!-- 搜尋按鈕 -->
        <div class="flex items-center justify-center mt-6 gap-4">
          <button 
            @click="performSearch"
            :disabled="loading"
            class="btn-primary px-8"
          >
            <span v-if="!loading">搜尋電影</span>
            <span v-else class="flex items-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              搜尋中...
            </span>
          </button>
          <button @click="clearForm" class="btn-secondary">清除條件</button>
        </div>
      </div>

      <!-- 搜尋結果 -->
      <div v-if="hasSearched">
        <!-- 結果統計 -->
        <div class="flex items-center justify-between mb-6">
          <div class="text-white">
            找到 <span class="text-primary-500 font-semibold">{{ totalResults }}</span> 部電影
          </div>
          <div class="text-gray-400 text-sm">
            第 {{ currentPage }} 頁，共 {{ totalPages }} 頁
          </div>
        </div>

        <!-- 載入狀態 -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p class="text-gray-400 mt-2">搜尋中...</p>
        </div>

        <!-- 錯誤狀態 -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-red-500 text-xl mb-4">搜尋失敗</div>
          <p class="text-gray-400 mb-6">{{ error }}</p>
          <button @click="performSearch" class="btn-primary">重試</button>
        </div>

        <!-- 空結果 -->
        <div v-else-if="movies.length === 0" class="text-center py-12">
          <div class="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-semibold text-white mb-2">找不到符合的電影</h2>
          <p class="text-gray-400 mb-6">嘗試調整搜尋條件或使用不同的關鍵字</p>
          <button @click="clearForm" class="btn-primary">清除搜尋條件</button>
        </div>

        <!-- 電影結果 -->
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
        </div>
      </div>

      <!-- 搜尋提示 -->
      <div v-else class="text-center py-12">
        <div class="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <h2 class="text-2xl font-semibold text-white mb-2">開始進階搜尋</h2>
        <p class="text-gray-400">設定您的搜尋條件，找到完美的電影</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMoviesStore } from '../stores/movies.js'
import MovieCard from '../components/movie/MovieCard.vue'
import tmdbService from '../services/tmdb.js'

export default {
  name: 'AdvancedSearch',
  components: {
    MovieCard
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const moviesStore = useMoviesStore()
    
    const movies = ref([])
    const loading = ref(false)
    const loadingMore = ref(false)
    const error = ref(null)
    const hasSearched = ref(false)
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalResults = ref(0)
    
    // 搜尋表單
    const searchForm = ref({
      query: '',
      genre: '',
      yearFrom: '',
      yearTo: '',
      ratingFrom: '',
      ratingTo: '',
      language: '',
      sortBy: 'popularity.desc',
      minVoteCount: ''
    })

    // 計算屬性
    const genres = computed(() => moviesStore.genres)
    const hasMore = computed(() => currentPage.value < totalPages.value)
    const currentYear = computed(() => new Date().getFullYear())

    // 執行搜尋
    const performSearch = async (page = 1, append = false) => {
      if (page === 1) {
        loading.value = true
        error.value = null
        hasSearched.value = true
      } else {
        loadingMore.value = true
      }
      
      try {
        let response
        
        if (searchForm.value.query.trim()) {
          // 如果有關鍵字，使用關鍵字搜尋
          response = await tmdbService.searchMovies(searchForm.value.query, page)
        } else {
          // 否則使用 discover API
          const options = {
            page,
            sortBy: searchForm.value.sortBy
          }
          
          if (searchForm.value.genre) options.withGenres = searchForm.value.genre
          if (searchForm.value.yearFrom) options.releaseDateGte = `${searchForm.value.yearFrom}-01-01`
          if (searchForm.value.yearTo) options.releaseDateLte = `${searchForm.value.yearTo}-12-31`
          if (searchForm.value.ratingFrom) options.voteAverageGte = searchForm.value.ratingFrom
          if (searchForm.value.ratingTo) options.voteAverageLte = searchForm.value.ratingTo
          if (searchForm.value.language) options.withOriginalLanguage = searchForm.value.language
          if (searchForm.value.minVoteCount) options.voteCountGte = searchForm.value.minVoteCount
          
          response = await tmdbService.discoverMovies(options)
        }
        
        if (append) {
          movies.value = [...movies.value, ...response.results]
        } else {
          movies.value = response.results
        }
        
        currentPage.value = response.page
        totalPages.value = response.total_pages
        totalResults.value = response.total_results
        
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Error performing search:', err)
        }
        error.value = '搜尋失敗，請稍後重試'
      } finally {
        loading.value = false
        loadingMore.value = false
      }
    }

    // 載入更多
    const loadMore = () => {
      if (hasMore.value && !loadingMore.value) {
        performSearch(currentPage.value + 1, true)
      }
    }

    // 清除表單
    const clearForm = () => {
      searchForm.value = {
        query: '',
        genre: '',
        yearFrom: '',
        yearTo: '',
        ratingFrom: '',
        ratingTo: '',
        language: '',
        sortBy: 'popularity.desc',
        minVoteCount: ''
      }
      movies.value = []
      hasSearched.value = false
      currentPage.value = 1
      totalPages.value = 1
      totalResults.value = 0
      error.value = null
    }

    // 導航到電影詳情
    const navigateToDetail = (movieId) => {
      router.push(`/movie/${movieId}`)
    }

    // 從 URL 查詢參數初始化表單
    const initializeFromQuery = () => {
      const query = route.query
      if (query.q) searchForm.value.query = query.q
      if (query.genre) searchForm.value.genre = query.genre
      if (query.yearFrom) searchForm.value.yearFrom = query.yearFrom
      if (query.yearTo) searchForm.value.yearTo = query.yearTo
      if (query.ratingFrom) searchForm.value.ratingFrom = query.ratingFrom
      if (query.ratingTo) searchForm.value.ratingTo = query.ratingTo
      if (query.language) searchForm.value.language = query.language
      if (query.sortBy) searchForm.value.sortBy = query.sortBy
      if (query.minVoteCount) searchForm.value.minVoteCount = query.minVoteCount
      
      // 如果有查詢參數，自動執行搜尋
      if (Object.keys(query).length > 0) {
        performSearch()
      }
    }

    // 生命週期
    onMounted(async () => {
      // 載入類型資料
      if (moviesStore.genres.length === 0) {
        await moviesStore.fetchGenres()
      }
      
      // 從 URL 初始化
      initializeFromQuery()
    })

    return {
      movies,
      loading,
      loadingMore,
      error,
      hasSearched,
      currentPage,
      totalPages,
      totalResults,
      searchForm,
      genres,
      hasMore,
      currentYear,
      performSearch,
      loadMore,
      clearForm,
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