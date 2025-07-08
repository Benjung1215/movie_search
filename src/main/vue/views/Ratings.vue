<template>
  <div class="min-h-screen bg-dark-900">
    <div class="container mx-auto px-4 py-8">
      <!-- 標題 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">我的評分</h1>
        <p class="text-gray-400">管理您的電影評分和評論</p>
      </div>

      <!-- 統計卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" v-if="ratingsStore.hasRatings">
        <div class="card p-6 text-center">
          <div class="text-3xl font-bold text-primary-500 mb-2">{{ ratingsStore.ratingsCount }}</div>
          <div class="text-gray-400">已評分電影</div>
        </div>
        
        <div class="card p-6 text-center">
          <div class="text-3xl font-bold text-yellow-400 mb-2">{{ ratingsStore.averageRating.toFixed(1) }}</div>
          <div class="text-gray-400">平均評分</div>
        </div>
        
        <div class="card p-6 text-center">
          <div class="text-3xl font-bold text-green-500 mb-2">{{ highRatedCount }}</div>
          <div class="text-gray-400">高分電影 (4-5星)</div>
        </div>
        
        <div class="card p-6 text-center">
          <div class="text-3xl font-bold text-blue-500 mb-2">{{ recentRatingsCount }}</div>
          <div class="text-gray-400">本月新增</div>
        </div>
      </div>

      <!-- 評分分布圖表 -->
      <div v-if="ratingsStore.hasRatings" class="card p-6 mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">評分分布</h2>
        <div class="space-y-3">
          <div v-for="(count, rating) in ratingsStore.ratingDistribution" :key="rating" class="flex items-center gap-4">
            <div class="flex items-center gap-1 w-16">
              <span class="text-white">{{ rating }}</span>
              <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div class="flex-1 bg-dark-700 rounded-full h-4 relative">
              <div 
                class="bg-gradient-to-r from-yellow-400 to-orange-400 h-4 rounded-full transition-all duration-500"
                :style="{ width: `${(count / ratingsStore.ratingsCount) * 100}%` }"
              ></div>
            </div>
            <div class="text-gray-400 w-12 text-right">{{ count }}</div>
          </div>
        </div>
      </div>

      <!-- 搜尋和篩選 -->
      <div v-if="ratingsStore.hasRatings" class="card p-6 mb-8">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- 搜尋 -->
          <div class="flex-1">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="搜尋已評分的電影..."
              class="input w-full"
            />
          </div>
          
          <!-- 評分篩選 -->
          <div>
            <select v-model="filterRating" class="input">
              <option value="">所有評分</option>
              <option value="5">5 星</option>
              <option value="4">4 星</option>
              <option value="3">3 星</option>
              <option value="2">2 星</option>
              <option value="1">1 星</option>
            </select>
          </div>
          
          <!-- 排序 -->
          <div>
            <select v-model="sortBy" class="input">
              <option value="date">評分時間</option>
              <option value="rating">評分高低</option>
              <option value="title">電影標題</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 載入狀態 -->
      <div v-if="ratingsStore.loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <p class="text-gray-400 mt-2">載入中...</p>
      </div>

      <!-- 空狀態 -->
      <div v-else-if="!ratingsStore.hasRatings" class="text-center py-12">
        <div class="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <h2 class="text-2xl font-semibold text-white mb-2">還沒有評分記錄</h2>
        <p class="text-gray-400 mb-6">開始評分您觀看過的電影，建立個人品味檔案</p>
        <router-link to="/search" class="btn-primary">
          探索電影
        </router-link>
      </div>

      <!-- 評分列表 -->
      <div v-else-if="filteredRatings.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="rating in paginatedRatings" 
            :key="rating.id"
            class="card p-4 hover:scale-105 transition-transform cursor-pointer"
            @click="navigateToDetail(rating.id)"
          >
            <!-- 電影海報和評分 -->
            <div class="relative mb-4">
              <img 
                :src="tmdbService.getPosterUrl(rating.poster_path)"
                :alt="rating.title"
                class="w-full h-64 object-cover rounded-lg"
                @error="handleImageError"
              />
              <div class="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded flex items-center gap-1">
                <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{{ rating.userRating }}</span>
              </div>
            </div>
            
            <!-- 電影資訊 -->
            <div>
              <h3 class="text-white font-semibold mb-2 line-clamp-1">{{ rating.title }}</h3>
              <p v-if="rating.comment" class="text-gray-400 text-sm mb-2 line-clamp-2">{{ rating.comment }}</p>
              <div class="flex items-center justify-between text-xs text-gray-500">
                <span>{{ formatDate(rating.rated_at) }}</span>
                <span>TMDB {{ rating.vote_average?.toFixed(1) || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 分頁 -->
        <div v-if="totalPages > 1" class="flex justify-center mt-8">
          <div class="flex items-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="btn-secondary px-3 py-2"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
            >
              上一頁
            </button>
            
            <div class="flex items-center gap-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="currentPage = page"
                class="px-3 py-2 rounded"
                :class="page === currentPage ? 'bg-primary-500 text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'"
              >
                {{ page }}
              </button>
            </div>
            
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="btn-secondary px-3 py-2"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
            >
              下一頁
            </button>
          </div>
        </div>
      </div>

      <!-- 無搜尋結果 -->
      <div v-else class="text-center py-12">
        <p class="text-gray-400">沒有找到符合條件的評分記錄</p>
        <button @click="clearFilters" class="btn-primary mt-4">
          清除篩選條件
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRatingsStore } from '../stores/ratings.js'
import tmdbService from '../services/tmdb.js'

export default {
  name: 'Ratings',
  setup() {
    const router = useRouter()
    const ratingsStore = useRatingsStore()
    
    // 狀態
    const searchQuery = ref('')
    const filterRating = ref('')
    const sortBy = ref('date')
    const currentPage = ref(1)
    const itemsPerPage = 12

    // 計算屬性
    const highRatedCount = computed(() => {
      return ratingsStore.ratings.filter(rating => rating.userRating >= 4).length
    })

    const recentRatingsCount = computed(() => {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      
      return ratingsStore.ratings.filter(rating => {
        const ratedDate = new Date(rating.rated_at)
        return ratedDate >= oneMonthAgo
      }).length
    })

    const filteredRatings = computed(() => {
      let filtered = [...ratingsStore.ratings]

      // 搜尋篩選
      if (searchQuery.value.trim()) {
        filtered = ratingsStore.searchRatings(searchQuery.value.trim())
      }

      // 評分篩選
      if (filterRating.value) {
        filtered = filtered.filter(rating => rating.userRating === parseInt(filterRating.value))
      }

      // 排序
      switch (sortBy.value) {
        case 'rating':
          filtered = filtered.sort((a, b) => b.userRating - a.userRating)
          break
        case 'title':
          filtered = filtered.sort((a, b) => a.title.localeCompare(b.title))
          break
        case 'date':
        default:
          filtered = filtered.sort((a, b) => new Date(b.rated_at) - new Date(a.rated_at))
          break
      }

      return filtered
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredRatings.value.length / itemsPerPage)
    })

    const paginatedRatings = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredRatings.value.slice(start, end)
    })

    const visiblePages = computed(() => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) pages.push(i)
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        }
      }
      
      return pages.filter(page => page !== '...' || pages.indexOf(page) === pages.lastIndexOf(page))
    })

    // 方法
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const handleImageError = (event) => {
      event.target.src = '/placeholder-poster.jpg'
    }

    const navigateToDetail = (movieId) => {
      router.push(`/movie/${movieId}`)
    }

    const clearFilters = () => {
      searchQuery.value = ''
      filterRating.value = ''
      sortBy.value = 'date'
      currentPage.value = 1
    }

    // 監聽篩選變化重置分頁
    watch([searchQuery, filterRating, sortBy], () => {
      currentPage.value = 1
    })

    // 初始化
    onMounted(() => {
      ratingsStore.init()
    })

    return {
      ratingsStore,
      tmdbService,
      searchQuery,
      filterRating,
      sortBy,
      currentPage,
      highRatedCount,
      recentRatingsCount,
      filteredRatings,
      totalPages,
      paginatedRatings,
      visiblePages,
      formatDate,
      handleImageError,
      navigateToDetail,
      clearFilters
    }
  }
}
</script>

<style scoped>
.input {
  @apply bg-dark-700 text-white px-3 py-2 rounded border border-dark-600 focus:border-primary-500 focus:outline-none;
}

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