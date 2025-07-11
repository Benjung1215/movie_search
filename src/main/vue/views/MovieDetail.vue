<template>
  <div class="min-h-screen bg-dark-900">
    <!-- 載入狀態 -->
    <div v-if="moviesStore.isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p class="text-gray-400 mt-4">載入中...</p>
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="moviesStore.hasError" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <p class="text-red-500 mb-4">{{ moviesStore.error }}</p>
        <button @click="loadMovieDetails" class="btn-primary">
          重新載入
        </button>
      </div>
    </div>

    <!-- 電影詳情 -->
    <div v-else-if="movie" class="relative">
      <!-- 背景圖片 -->
      <div 
        v-if="movie.backdrop_path"
        class="absolute inset-0 bg-cover bg-center opacity-20"
        :style="{ backgroundImage: `url(${backdropUrl})` }"
      ></div>
      
      <!-- 內容 -->
      <div class="relative z-10">
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

          <!-- 主要內容 -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- 電影海報 -->
            <div class="lg:col-span-1">
              <div class="sticky top-8">
                <img 
                  :src="posterUrl"
                  :alt="movie.title"
                  class="w-full rounded-lg shadow-lg"
                  @error="handleImageError"
                />
                
                <!-- 操作按鈕 -->
                <div class="mt-4 space-y-3">
                  <!-- 收藏按鈕 -->
                  <button 
                    @click="toggleFavorite"
                    class="btn w-full flex items-center justify-center gap-2"
                    :class="isFavorite ? 'bg-red-500 hover:bg-red-600 text-white' : 'btn-secondary'"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                    </svg>
                    {{ isFavorite ? '已收藏' : '加入收藏' }}
                  </button>
                  
                  <!-- 觀看清單按鈕 -->
                  <button 
                    @click="toggleWatchlist"
                    class="btn w-full flex items-center justify-center gap-2"
                    :class="isInWatchlist ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'btn-secondary'"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    {{ isInWatchlist ? '已加入觀看清單' : '加入觀看清單' }}
                  </button>
                  
                  <!-- 評分按鈕 -->
                  <button 
                    @click="openRatingModal"
                    class="btn w-full flex items-center justify-center gap-2"
                    :class="userRating > 0 ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'btn-secondary'"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {{ userRating > 0 ? `已評分 ${userRating} 星` : '評分' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 電影資訊 -->
            <div class="lg:col-span-2">
              <h1 class="text-4xl font-bold text-white mb-4">
                {{ movie.title }}
              </h1>
              
              <div v-if="movie.original_title !== movie.title" class="text-gray-400 text-lg mb-4">
                {{ movie.original_title }}
              </div>

              <!-- 基本資訊 -->
              <div class="space-y-4 mb-6">
                <!-- 評分資訊 -->
                <div class="flex flex-wrap items-center gap-4">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span class="text-white font-medium">TMDB {{ movie.vote_average?.toFixed(1) || 'N/A' }}</span>
                    <span class="text-gray-400">({{ movie.vote_count || 0 }} 評分)</span>
                  </div>
                  
                  <div v-if="userRating > 0" class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span class="text-white font-medium">我的評分 {{ userRating }}</span>
                  </div>
                </div>
                
                <!-- 其他資訊 -->
                <div class="flex flex-wrap items-center gap-4 text-gray-400">
                  <div>{{ formatDate(movie.release_date) }}</div>
                  <div>{{ formatRuntime(movie.runtime) }}</div>
                </div>
              </div>

              <!-- 類型 -->
              <div v-if="movie.genres && movie.genres.length > 0" class="mb-6">
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="genre in movie.genres"
                    :key="genre.id"
                    class="px-3 py-1 bg-dark-700 text-primary-500 rounded-full text-sm"
                  >
                    {{ genre.name }}
                  </span>
                </div>
              </div>

              <!-- 劇情簡介 -->
              <div v-if="movie.overview" class="mb-8">
                <h2 class="text-2xl font-semibold text-white mb-4">劇情簡介</h2>
                <p class="text-gray-300 leading-relaxed">{{ movie.overview }}</p>
              </div>

              <!-- 主要演員 -->
              <div v-if="movie.credits && movie.credits.cast && movie.credits.cast.length > 0" class="mb-8">
                <h2 class="text-2xl font-semibold text-white mb-4">主要演員</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div 
                    v-for="actor in movie.credits.cast.slice(0, 8)"
                    :key="actor.id"
                    class="text-center"
                  >
                    <img 
                      :src="getProfileUrl(actor.profile_path)"
                      :alt="actor.name"
                      class="w-20 h-20 mx-auto rounded-full object-cover mb-2"
                      @error="handleProfileImageError"
                    />
                    <p class="text-white text-sm font-medium">{{ actor.name }}</p>
                    <p class="text-gray-400 text-xs">{{ actor.character }}</p>
                  </div>
                </div>
              </div>

              <!-- 相似電影 -->
              <div v-if="movie.similar && movie.similar.results && movie.similar.results.length > 0" class="mb-8">
                <h2 class="text-2xl font-semibold text-white mb-4">相似電影</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div 
                    v-for="similar in movie.similar.results.slice(0, 6)"
                    :key="similar.id"
                    class="cursor-pointer hover:scale-105 transition-transform"
                    @click="navigateToMovie(similar.id)"
                  >
                    <img 
                      :src="tmdbService.getPosterUrl(similar.poster_path)"
                      :alt="similar.title"
                      class="w-full aspect-[2/3] object-cover rounded-lg"
                      @error="handleImageError"
                    />
                    <p class="text-white text-sm mt-2 line-clamp-2">{{ similar.title }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 評分對話框 -->
    <div 
      v-if="showRatingModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeRatingModal"
    >
      <div 
        class="bg-dark-800 rounded-lg p-6 w-full max-w-md"
        @click.stop
      >
        <h3 class="text-xl font-semibold text-white mb-4">
          {{ userRating > 0 ? '修改評分' : '評分電影' }}
        </h3>
        
        <div class="text-center mb-6">
          <h4 class="text-white font-medium mb-2">{{ movie?.title }}</h4>
          <StarRating
            v-model="tempRating"
            :show-text="true"
            :show-clear="true"
            size="lg"
          />
        </div>
        
        <!-- 評論 -->
        <div class="mb-6">
          <label class="block text-white font-medium mb-2">評論（可選）</label>
          <textarea
            v-model="ratingComment"
            placeholder="分享您對這部電影的想法..."
            class="w-full bg-dark-700 text-white px-3 py-2 rounded border border-dark-600 focus:border-primary-500 focus:outline-none resize-none"
            rows="3"
          ></textarea>
        </div>
        
        <!-- 按鈕 -->
        <div class="flex gap-3">
          <button
            @click="closeRatingModal"
            class="btn-secondary flex-1"
          >
            取消
          </button>
          <button
            @click="handleRate(tempRating)"
            :disabled="tempRating === 0"
            class="btn-primary flex-1"
            :class="{ 'opacity-50 cursor-not-allowed': tempRating === 0 }"
          >
            {{ tempRating > 0 ? '確認評分' : '請選擇評分' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMoviesStore } from '../stores/movies.js'
import { useFavoritesStore } from '../stores/favorites.js'
import { useRatingsStore } from '../stores/ratings.js'
import { useWatchlistStore } from '../stores/watchlist.js'
import tmdbService from '../services/tmdb.js'
import StarRating from '../components/rating/StarRating.vue'
import RatingDisplay from '../components/rating/RatingDisplay.vue'

export default {
  name: 'MovieDetail',
  components: {
    StarRating,
    RatingDisplay
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const moviesStore = useMoviesStore()
    const favoritesStore = useFavoritesStore()
    const ratingsStore = useRatingsStore()
    const watchlistStore = useWatchlistStore()
    
    // 狀態
    const showRatingModal = ref(false)
    const ratingComment = ref('')
    const tempRating = ref(0)

    // 計算屬性
    const movie = computed(() => moviesStore.currentMovie)
    
    const posterUrl = computed(() => {
      return tmdbService.getPosterUrl(movie.value?.poster_path) || '/placeholder-poster.jpg'
    })

    const backdropUrl = computed(() => {
      return tmdbService.getBackdropUrl(movie.value?.backdrop_path)
    })

    const isFavorite = computed(() => {
      return movie.value ? favoritesStore.isFavorite(movie.value.id) : false
    })

    const isInWatchlist = computed(() => {
      return movie.value ? watchlistStore.isInWatchlist(movie.value.id) : false
    })

    const currentRating = computed(() => {
      return movie.value ? ratingsStore.getMovieRating(movie.value.id) : null
    })

    const userRating = computed(() => {
      return currentRating.value ? currentRating.value.userRating : 0
    })

    // 方法
    const loadMovieDetails = async () => {
      const movieId = route.params.id
      if (movieId) {
        try {
          await moviesStore.fetchMovieDetails(movieId)
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('Failed to load movie details:', error)
          }
        }
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatRuntime = (minutes) => {
      if (!minutes) return ''
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m`
    }

    const handleImageError = (event) => {
      event.target.src = '/placeholder-poster.jpg'
    }

    const handleProfileImageError = (event) => {
      event.target.src = '/placeholder-profile.jpg'
    }

    const getProfileUrl = (profilePath) => {
      return tmdbService.getProfileUrl(profilePath) || '/placeholder-profile.jpg'
    }

    const toggleFavorite = () => {
      if (movie.value) {
        favoritesStore.toggleFavorite(movie.value)
      }
    }

    const goBack = () => {
      router.back()
    }

    const navigateToMovie = (movieId) => {
      router.push(`/movie/${movieId}`)
    }

    const toggleWatchlist = () => {
      if (movie.value) {
        watchlistStore.toggleWatchlist(movie.value)
      }
    }

    const handleRate = async (rating) => {
      if (movie.value && rating > 0) {
        await ratingsStore.rateMovie(movie.value, rating, ratingComment.value)
        showRatingModal.value = false
        ratingComment.value = ''
        tempRating.value = 0
      }
    }

    const openRatingModal = () => {
      if (currentRating.value) {
        ratingComment.value = currentRating.value.comment || ''
        tempRating.value = currentRating.value.userRating
      } else {
        ratingComment.value = ''
        tempRating.value = 0
      }
      showRatingModal.value = true
    }

    const closeRatingModal = () => {
      showRatingModal.value = false
      ratingComment.value = ''
      tempRating.value = 0
    }

    // 監聽路由變化
    watch(
      () => route.params.id,
      () => {
        loadMovieDetails()
      }
    )

    // 初始化
    onMounted(() => {
      favoritesStore.init()
      watchlistStore.init()
      ratingsStore.init()
      loadMovieDetails()
    })

    return {
      movie,
      posterUrl,
      backdropUrl,
      isFavorite,
      isInWatchlist,
      currentRating,
      userRating,
      showRatingModal,
      ratingComment,
      tempRating,
      moviesStore,
      tmdbService,
      loadMovieDetails,
      formatDate,
      formatRuntime,
      handleImageError,
      handleProfileImageError,
      getProfileUrl,
      toggleFavorite,
      toggleWatchlist,
      handleRate,
      openRatingModal,
      closeRatingModal,
      goBack,
      navigateToMovie
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