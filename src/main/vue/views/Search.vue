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
            type="text" 
            placeholder="搜尋電影..."
            class="input w-full text-lg pr-12"
            v-model="searchQuery"
            @input="handleSearchInput"
            @keyup.enter="handleSearch"
          >
          <button 
            @click="handleSearch"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-500"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 載入狀態 -->
      <div v-if="moviesStore.isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <p class="text-gray-400 mt-2">搜尋中...</p>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMoviesStore } from '../stores/movies.js'
import { useFavoritesStore } from '../stores/favorites.js'
import MovieCard from '../components/movie/MovieCard.vue'

export default {
  name: 'Search',
  components: {
    MovieCard
  },
  setup() {
    const router = useRouter()
    const moviesStore = useMoviesStore()
    const favoritesStore = useFavoritesStore()
    const searchQuery = ref('')
    let searchTimeout = null

    // 處理搜尋輸入
    const handleSearchInput = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        if (searchQuery.value.trim()) {
          handleSearch()
        } else {
          moviesStore.clearSearchResults()
        }
      }, 500)
    }

    // 執行搜尋
    const handleSearch = async () => {
      if (!searchQuery.value.trim()) return
      
      await moviesStore.searchMovies(searchQuery.value)
    }

    // 載入更多結果
    const loadMore = async () => {
      await moviesStore.loadMoreSearchResults()
    }

    // 重新搜尋
    const retrySearch = async () => {
      await handleSearch()
    }

    // 導航到電影詳情
    const navigateToDetail = (movieId) => {
      router.push(`/movie/${movieId}`)
    }

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
    })

    return {
      searchQuery,
      moviesStore,
      favoritesStore,
      handleSearchInput,
      handleSearch,
      loadMore,
      retrySearch,
      navigateToDetail
    }
  }
}
</script>