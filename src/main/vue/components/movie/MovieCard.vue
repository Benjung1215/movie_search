<template>
  <div class="card hover:scale-105 transition-transform duration-200 cursor-pointer">
    <div class="relative">
      <OptimizedImage
        :src="posterUrl"
        :alt="`${movie.title} movie poster${movie.release_date ? ` (${new Date(movie.release_date).getFullYear()})` : ''} - Rating: ${formatRating(movie.vote_average)}/10`"
        fallback-src="/placeholder-poster.jpg"
        aspect-ratio="2/3"
        container-class="relative overflow-hidden"
        image-class="w-full h-80 object-cover"
        preload
      />
      
      <!-- 評分標籤 -->
      <div class="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
        ⭐ {{ formatRating(movie.vote_average) }}
      </div>
      
      <!-- 動作按鈕 -->
      <div class="absolute top-2 left-2 flex flex-col gap-1">
        <!-- 收藏按鈕 -->
        <button 
          @click.stop="toggleFavorite"
          class="p-2 rounded-full transition-colors"
          :class="isFavorite ? 'bg-red-500 text-white' : 'bg-black bg-opacity-50 text-gray-300 hover:bg-red-500 hover:text-white'"
          :title="$t('movies.favorites.add')"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <!-- 觀看清單按鈕 -->
        <button 
          @click.stop="toggleWatchlist"
          class="p-2 rounded-full transition-colors"
          :class="isInWatchlist ? 'bg-blue-500 text-white' : 'bg-black bg-opacity-50 text-gray-300 hover:bg-blue-500 hover:text-white'"
          :title="$t('movies.watchlist.add')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="p-4">
      <h3 class="text-lg font-semibold text-white mb-2 line-clamp-1">
        {{ movie.title }}
      </h3>
      
      <p class="text-gray-400 text-sm mb-3 line-clamp-2">
        {{ movie.overview || $t('movies.noOverview') }}
      </p>
      
      <div class="flex items-center justify-between text-sm text-gray-500 mb-2">
        <span>{{ formatDate(movie.release_date) }}</span>
        <span>{{ movieGenres }}</span>
      </div>
      
      <!-- 評分顯示 -->
      <RatingDisplay
        :user-rating="userRating"
        :tmdb-rating="movie.vote_average"
        :vote-count="movie.vote_count"
        :show-quick-rate="true"
        @quick-rate="handleQuickRate"
      />
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '../../stores/favorites.js'
import { useWatchlistStore } from '../../stores/watchlist.js'
import { useRatingsStore } from '../../stores/ratings.js'
import { useMoviesStore } from '../../stores/movies.js'
import tmdbService from '../../services/tmdb.js'
import RatingDisplay from '../rating/RatingDisplay.vue'
import OptimizedImage from '../ui/OptimizedImage.vue'

export default {
  name: 'MovieCard',
  components: {
    RatingDisplay,
    OptimizedImage
  },
  props: {
    movie: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const favoritesStore = useFavoritesStore()
    const watchlistStore = useWatchlistStore()
    const ratingsStore = useRatingsStore()
    const moviesStore = useMoviesStore()

    // 計算屬性
    const posterUrl = computed(() => {
      return tmdbService.getPosterUrl(props.movie.poster_path) || '/placeholder-poster.jpg'
    })

    const isFavorite = computed(() => {
      return favoritesStore.isFavorite(props.movie.id)
    })

    const isInWatchlist = computed(() => {
      return watchlistStore.isInWatchlist(props.movie.id)
    })

    const movieGenres = computed(() => {
      return moviesStore.getMovieGenres(props.movie.genre_ids)
    })

    const userRating = computed(() => {
      return ratingsStore.getUserRating(props.movie.id)
    })

    // 方法
    const formatRating = (rating) => {
      return rating ? rating.toFixed(1) : 'N/A'
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.getFullYear()
    }


    const toggleFavorite = () => {
      favoritesStore.toggleFavorite(props.movie)
    }

    const toggleWatchlist = () => {
      watchlistStore.toggleWatchlist(props.movie)
    }

    const navigateToDetail = () => {
      router.push(`/movie/${props.movie.id}`)
    }

    const handleQuickRate = () => {
      navigateToDetail()
    }

    return {
      posterUrl,
      isFavorite,
      isInWatchlist,
      movieGenres,
      userRating,
      formatRating,
      formatDate,
      toggleFavorite,
      toggleWatchlist,
      navigateToDetail,
      handleQuickRate
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
}</style>