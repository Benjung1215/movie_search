<template>
  <div class="min-h-screen bg-dark-900">
    <div class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-primary-500">
          我的收藏
        </h1>
        
        <div v-if="favoritesStore.hasFavorites" class="flex items-center gap-4">
          <!-- 搜尋框 -->
          <div class="relative">
            <input 
              type="text" 
              placeholder="搜尋收藏..."
              class="input w-64"
              v-model="searchQuery"
            >
            <svg class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <!-- 排序選項 -->
          <select 
            v-model="sortBy"
            class="input w-40"
          >
            <option value="date">加入時間</option>
            <option value="title">電影標題</option>
            <option value="rating">評分</option>
          </select>
          
          <!-- 清空收藏按鈕 -->
          <button 
            @click="showClearConfirm = true"
            class="btn bg-red-600 hover:bg-red-700 text-white"
          >
            清空收藏
          </button>
        </div>
      </div>

      <!-- 收藏統計 -->
      <div v-if="favoritesStore.hasFavorites" class="mb-6">
        <p class="text-gray-400">
          共收藏了 <span class="text-primary-500 font-semibold">{{ favoritesStore.favoriteCount }}</span> 部電影
          <span v-if="filteredFavorites.length !== favoritesStore.favoriteCount">
            ，顯示 <span class="text-primary-500 font-semibold">{{ filteredFavorites.length }}</span> 部
          </span>
        </p>
      </div>

      <!-- 空狀態 -->
      <div v-if="!favoritesStore.hasFavorites" class="text-center py-16">
        <svg class="w-24 h-24 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-400 mb-2">還沒有收藏的電影</h2>
        <p class="text-gray-500 mb-6">開始搜尋並收藏你喜歡的電影吧！</p>
        <router-link to="/search" class="btn-primary">
          去搜尋電影
        </router-link>
      </div>

      <!-- 收藏清單 -->
      <div v-else-if="filteredFavorites.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <MovieCard 
          v-for="movie in filteredFavorites"
          :key="movie.id"
          :movie="movie"
          @click="navigateToDetail(movie.id)"
        />
      </div>

      <!-- 搜尋無結果 -->
      <div v-else-if="searchQuery && filteredFavorites.length === 0" class="text-center py-16">
        <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-400 mb-2">沒有找到符合的電影</h2>
        <p class="text-gray-500">嘗試使用不同的關鍵字搜尋</p>
      </div>

      <!-- 清空確認對話框 -->
      <div v-if="showClearConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-dark-800 rounded-lg p-6 max-w-md mx-4">
          <h3 class="text-xl font-semibold text-white mb-4">確認清空收藏</h3>
          <p class="text-gray-300 mb-6">
            您確定要清空所有收藏嗎？此操作無法復原。
          </p>
          <div class="flex gap-4">
            <button 
              @click="showClearConfirm = false"
              class="btn-secondary flex-1"
            >
              取消
            </button>
            <button 
              @click="clearAllFavorites"
              class="btn bg-red-600 hover:bg-red-700 text-white flex-1"
            >
              確認清空
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
import { useFavoritesStore } from '../stores/favorites.js'
import MovieCard from '../components/movie/MovieCard.vue'

export default {
  name: 'Favorites',
  components: {
    MovieCard
  },
  setup() {
    const router = useRouter()
    const favoritesStore = useFavoritesStore()
    const searchQuery = ref('')
    const sortBy = ref('date')
    const showClearConfirm = ref(false)

    // 計算屬性 - 過濾和排序後的收藏清單
    const filteredFavorites = computed(() => {
      let favorites = favoritesStore.favorites

      // 搜尋過濾
      if (searchQuery.value.trim()) {
        favorites = favoritesStore.searchFavorites(searchQuery.value)
      }

      // 排序
      switch (sortBy.value) {
        case 'title':
          return favoritesStore.getFavoritesSortedByTitle().filter(movie => 
            !searchQuery.value.trim() || 
            movie.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            movie.overview.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            movie.original_title.toLowerCase().includes(searchQuery.value.toLowerCase())
          )
        case 'rating':
          return favoritesStore.getFavoritesSortedByRating().filter(movie => 
            !searchQuery.value.trim() || 
            movie.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            movie.overview.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            movie.original_title.toLowerCase().includes(searchQuery.value.toLowerCase())
          )
        case 'date':
        default:
          return favoritesStore.getFavoritesSortedByDate().filter(movie => 
            !searchQuery.value.trim() || 
            movie.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            movie.overview.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            movie.original_title.toLowerCase().includes(searchQuery.value.toLowerCase())
          )
      }
    })

    // 方法
    const navigateToDetail = (movieId) => {
      router.push(`/movie/${movieId}`)
    }

    const clearAllFavorites = () => {
      favoritesStore.clearAllFavorites()
      showClearConfirm.value = false
    }

    // 初始化
    onMounted(() => {
      favoritesStore.init()
    })

    return {
      favoritesStore,
      searchQuery,
      sortBy,
      showClearConfirm,
      filteredFavorites,
      navigateToDetail,
      clearAllFavorites
    }
  }
}
</script>