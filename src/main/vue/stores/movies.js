import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import tmdbService from '../services/tmdb.js'

export const useMoviesStore = defineStore('movies', () => {
  // 狀態
  const searchResults = ref([])
  const popularMovies = ref([])
  const currentMovie = ref(null)
  const genres = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const currentPage = ref(1)
  const totalPages = ref(0)
  const totalResults = ref(0)

  // 計算屬性
  const hasSearchResults = computed(() => searchResults.value.length > 0)
  const hasPopularMovies = computed(() => popularMovies.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  // 動作方法
  const setLoading = (state) => {
    loading.value = state
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // 搜尋電影
  const searchMovies = async (query, page = 1) => {
    if (!query.trim()) {
      searchResults.value = []
      return
    }

    setLoading(true)
    clearError()

    try {
      const response = await tmdbService.searchMovies(query, page)
      
      if (page === 1) {
        searchResults.value = response.results
      } else {
        searchResults.value = [...searchResults.value, ...response.results]
      }
      
      searchQuery.value = query
      currentPage.value = page
      totalPages.value = response.total_pages
      totalResults.value = response.total_results
    } catch (err) {
      setError('搜尋電影時發生錯誤')
      console.error('Error searching movies:', err)
    } finally {
      setLoading(false)
    }
  }

  // 載入更多搜尋結果
  const loadMoreSearchResults = async () => {
    if (currentPage.value >= totalPages.value) return
    
    await searchMovies(searchQuery.value, currentPage.value + 1)
  }

  // 取得熱門電影
  const fetchPopularMovies = async (page = 1) => {
    setLoading(true)
    clearError()

    try {
      const response = await tmdbService.getPopularMovies(page)
      
      if (page === 1) {
        popularMovies.value = response.results
      } else {
        popularMovies.value = [...popularMovies.value, ...response.results]
      }
    } catch (err) {
      setError('載入熱門電影時發生錯誤')
      console.error('Error fetching popular movies:', err)
    } finally {
      setLoading(false)
    }
  }

  // 取得電影詳情
  const fetchMovieDetails = async (movieId) => {
    setLoading(true)
    clearError()

    try {
      const response = await tmdbService.getMovieDetails(movieId)
      currentMovie.value = response
      return response
    } catch (err) {
      setError('載入電影詳情時發生錯誤')
      console.error('Error fetching movie details:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 取得電影類型
  const fetchGenres = async () => {
    try {
      const response = await tmdbService.getGenres()
      genres.value = response.genres
    } catch (err) {
      console.error('Error fetching genres:', err)
    }
  }

  // 清空搜尋結果
  const clearSearchResults = () => {
    searchResults.value = []
    searchQuery.value = ''
    currentPage.value = 1
    totalPages.value = 0
    totalResults.value = 0
  }

  // 重置當前電影
  const clearCurrentMovie = () => {
    currentMovie.value = null
  }

  // 取得類型名稱
  const getGenreName = (genreId) => {
    const genre = genres.value.find(g => g.id === genreId)
    return genre ? genre.name : ''
  }

  // 取得電影類型字串
  const getMovieGenres = (genreIds) => {
    if (!genreIds || genreIds.length === 0) return ''
    return genreIds.map(id => getGenreName(id)).filter(Boolean).join(', ')
  }

  return {
    // 狀態
    searchResults,
    popularMovies,
    currentMovie,
    genres,
    loading,
    error,
    searchQuery,
    currentPage,
    totalPages,
    totalResults,
    
    // 計算屬性
    hasSearchResults,
    hasPopularMovies,
    isLoading,
    hasError,
    
    // 方法
    searchMovies,
    loadMoreSearchResults,
    fetchPopularMovies,
    fetchMovieDetails,
    fetchGenres,
    clearSearchResults,
    clearCurrentMovie,
    setLoading,
    setError,
    clearError,
    getGenreName,
    getMovieGenres
  }
})