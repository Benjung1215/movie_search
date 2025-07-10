<template>
  <div class="min-h-screen bg-dark-900">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-primary-500 mb-8">
        電影搜尋
      </h1>
      
      <!-- 搜尋輸入框 -->
      <div class="max-w-lg mx-auto mb-8">
        <div class="relative">
          <input 
            ref="searchInput"
            type="text" 
            placeholder="搜尋電影..."
            class="input w-full text-lg pr-12"
            v-model="searchQuery"
            @input="handleSearchInput"
            @keyup.enter="handleSearch"
            @focus="showSuggestions = true"
            @blur="hideSuggestions"
          />
          <button 
            @click="handleSearch"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-500"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <!-- 搜尋建議下拉選單 -->
          <div 
            v-if="showSuggestions && (suggestions.length > 0 || searchHistory.recentSearches.length > 0)"
            class="absolute top-full left-0 right-0 bg-dark-800 border border-dark-600 rounded-lg mt-1 shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            <!-- 搜尋建議 -->
            <div v-if="suggestions.length > 0" class="border-b border-dark-600 p-2">
              <div class="text-xs text-gray-400 mb-2">搜尋建議</div>
              <button
                v-for="suggestion in suggestions"
                :key="suggestion"
                @mousedown="selectSuggestion(suggestion)"
                class="w-full text-left px-3 py-2 hover:bg-dark-700 rounded text-white text-sm flex items-center gap-2"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {{ suggestion }}
              </button>
            </div>
            
            <!-- 最近搜尋 -->
            <div v-if="searchHistory.recentSearches.length > 0" class="p-2">
              <div class="text-xs text-gray-400 mb-2 flex items-center justify-between">
                <span>最近搜尋</span>
                <button 
                  @click="searchHistory.clearHistory()"
                  class="text-red-400 hover:text-red-300 text-xs"
                >
                  清除
                </button>
              </div>
              <button
                v-for="item in searchHistory.recentSearches"
                :key="item"
                @mousedown="selectSuggestion(item)"
                class="w-full text-left px-3 py-2 hover:bg-dark-700 rounded text-white text-sm flex items-center justify-between group"
              >
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ item }}
                </div>
                <button
                  @click.stop="searchHistory.removeFromHistory(item)"
                  class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-opacity"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 進階搜尋鏈接 -->
        <div class="text-center mt-4">
          <router-link 
            to="/search/advanced" 
            class="text-primary-500 hover:text-primary-400 text-sm flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
            </svg>
            進階搜尋
          </router-link>
        </div>
      </div>

      <!-- 載入狀態 -->
      <div v-if="moviesStore.isLoading && !moviesStore.hasSearchResults">
        <div class="text-center mb-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p class="text-gray-400 mt-2">搜尋中...</p>
        </div>
        
        <!-- 骨架屏 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <SkeletonLoader 
            v-for="i in 10"
            :key="i"
            type="movie-card"
          />
        </div>
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="moviesStore.hasError" class="text-center py-8">
        <p class="text-red-500">{{ moviesStore.error }}</p>
        <button 
          @click="retrySearch"
          class="btn-primary mt-4"
        >
          重新搜尋
        </button>
      </div>

      <!-- 搜尋結果 -->
      <div v-if="moviesStore.hasSearchResults && !moviesStore.isLoading">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-white">
            搜尋結果：{{ moviesStore.searchQuery }}
          </h2>
          <span class="text-gray-400 text-sm">
            共找到 {{ moviesStore.totalResults }} 個結果
          </span>
        </div>

        <!-- 電影網格 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <MovieCard 
            v-for="movie in moviesStore.searchResults"
            :key="movie.id"
            :movie="movie"
            @click="navigateToDetail(movie.id)"
          />
        </div>

        <!-- 載入更多按鈕 -->
        <div v-if="moviesStore.currentPage < moviesStore.totalPages" class="text-center mt-8">
          <button 
            @click="loadMore"
            class="btn-secondary"
            :disabled="moviesStore.isLoading"
          >
            載入更多
          </button>
        </div>
      </div>

      <!-- 初始狀態 - 顯示熱門電影 -->
      <div v-if="!moviesStore.hasSearchResults && !moviesStore.isLoading && !moviesStore.hasError">
        <div v-if="moviesStore.hasPopularMovies">
          <h2 class="text-xl font-semibold text-white mb-6">
            熱門電影
          </h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <MovieCard 
              v-for="movie in moviesStore.popularMovies"
              :key="movie.id"
              :movie="movie"
              @click="navigateToDetail(movie.id)"
            />
          </div>
        </div>
      </div>

      <!-- 沒有搜尋結果 -->
      <div v-if="searchQuery && !moviesStore.hasSearchResults && !moviesStore.isLoading && !moviesStore.hasError" class="text-center py-8">
        <p class="text-gray-400">沒有找到符合的電影</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMoviesStore } from '../stores/movies.js'
import { useFavoritesStore } from '../stores/favorites.js'
import { useSearchHistory } from '../composables/useSearchHistory.js'
import { useDebouncedFunction } from '../composables/useDebounce.js'
import MovieCard from '../components/movie/MovieCard.vue'
import SkeletonLoader from '../components/ui/SkeletonLoader.vue'

export default {
  name: 'Search',
  components: {
    MovieCard,
    SkeletonLoader
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const moviesStore = useMoviesStore()
    const favoritesStore = useFavoritesStore()
    const searchHistory = useSearchHistory()
    
    const searchQuery = ref('')
    const showSuggestions = ref(false)
    const searchInput = ref(null)

    // 防抖動搜尋
    const { debouncedFn: debouncedSearch } = useDebouncedFunction(() => {
      if (searchQuery.value.trim()) {
        performSearch()
      } else {
        moviesStore.clearSearchResults()
      }
    }, 300)

    // 搜尋建議
    const suggestions = computed(() => {
      if (!searchQuery.value.trim()) return []
      return searchHistory.getSearchSuggestions(searchQuery.value)
    })

    // 處理搜尋輸入
    const handleSearchInput = () => {
      debouncedSearch()
    }

    // 執行搜尋
    const performSearch = async () => {
      const query = searchQuery.value.trim()
      if (!query) return
      
      await moviesStore.searchMovies(query)
      searchHistory.addToHistory(query)
      showSuggestions.value = false
    }

    // 手動搜尋按鈕
    const handleSearch = async () => {
      await performSearch()
    }

    // 選擇搜尋建議
    const selectSuggestion = (suggestion) => {
      searchQuery.value = suggestion
      performSearch()
    }

    // 隱藏建議（延遲以允許點擊）
    const hideSuggestions = () => {
      setTimeout(() => {
        showSuggestions.value = false
      }, 200)
    }

    // 載入更多結果
    const loadMore = async () => {
      await moviesStore.loadMoreSearchResults()
    }

    // 重新搜尋
    const retrySearch = async () => {
      await performSearch()
    }

    // 導航到電影詳情
    const navigateToDetail = (movieId) => {
      router.push(`/movie/${movieId}`)
    }

    // 監聽 URL 查詢參數
    watch(() => route.query.q, (newQuery) => {
      if (newQuery && newQuery !== searchQuery.value) {
        searchQuery.value = newQuery
        performSearch()
      }
    }, { immediate: true })

    // 初始化
    onMounted(async () => {
      // 載入電影類型
      await moviesStore.fetchGenres()
      
      // 初始化收藏功能
      favoritesStore.init()
      
      // 載入熱門電影
      if (!moviesStore.hasPopularMovies) {
        await moviesStore.fetchPopularMovies()
      }

      // 從 URL 查詢參數初始化搜尋
      if (route.query.q) {
        searchQuery.value = route.query.q
        await performSearch()
      }
    })

    return {
      searchQuery,
      searchInput,
      showSuggestions,
      suggestions,
      searchHistory,
      moviesStore,
      favoritesStore,
      handleSearchInput,
      handleSearch,
      selectSuggestion,
      hideSuggestions,
      loadMore,
      retrySearch,
      navigateToDetail
    }
  }
}
</script>