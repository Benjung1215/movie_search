<template>
  <div class="card hover:scale-105 transition-transform duration-200 cursor-pointer">
    <div class="relative">
      <img 
        :src="posterUrl" 
        :alt="movie.title"
        class="w-full h-80 object-cover"
        @error="handleImageError"
        @load="imageLoaded = true"
      />
      <div v-if="!imageLoaded" class="w-full h-80 bg-dark-700 flex items-center justify-center">
        <div class="text-gray-400">載入中...</div>
      </div>
      
      <!-- 評分標籤 -->
      <div class="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
        ⭐ {{ formatRating(movie.vote_average) }}
      </div>
      
      <!-- 收藏按鈕 -->
      <button 
        @click.stop="toggleFavorite"
        class="absolute top-2 left-2 p-2 rounded-full transition-colors"
        :class="isFavorite ? 'bg-red-500 text-white' : 'bg-black bg-opacity-50 text-gray-300 hover:bg-red-500 hover:text-white'"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    
    <div class="p-4">
      <h3 class="text-lg font-semibold text-white mb-2 line-clamp-1">
        {{ movie.title }}
      </h3>
      
      <p class="text-gray-400 text-sm mb-3 line-clamp-2">
        {{ movie.overview || '暫無劇情簡介' }}
      </p>
      
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>{{ formatDate(movie.release_date) }}</span>
        <span>{{ movieGenres }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '../../stores/favorites.js'
import { useMoviesStore } from '../../stores/movies.js'
import tmdbService from '../../services/tmdb.js'

export default {
  name: 'MovieCard',
  props: {
    movie: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const favoritesStore = useFavoritesStore()
    const moviesStore = useMoviesStore()
    const imageLoaded = ref(false)

    // 計算屬性
    const posterUrl = computed(() => {
      return tmdbService.getPosterUrl(props.movie.poster_path) || '/placeholder-poster.jpg'
    })

    const isFavorite = computed(() => {
      return favoritesStore.isFavorite(props.movie.id)
    })

    const movieGenres = computed(() => {
      return moviesStore.getMovieGenres(props.movie.genre_ids)
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

    const handleImageError = (event) => {
      event.target.src = '/placeholder-poster.jpg'
    }

    const toggleFavorite = () => {
      favoritesStore.toggleFavorite(props.movie)
    }

    const navigateToDetail = () => {
      router.push(`/movie/${props.movie.id}`)
    }

    return {
      posterUrl,
      isFavorite,
      movieGenres,
      imageLoaded,
      formatRating,
      formatDate,
      handleImageError,
      toggleFavorite,
      navigateToDetail
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