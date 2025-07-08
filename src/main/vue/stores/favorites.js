import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFavoritesStore = defineStore('favorites', () => {
  // 狀態
  const favorites = ref([])
  const STORAGE_KEY = 'movie-search-favorites'

  // 計算屬性
  const favoriteCount = computed(() => favorites.value.length)
  const hasFavorites = computed(() => favorites.value.length > 0)

  // 從本地存儲載入收藏
  const loadFavoritesFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        favorites.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error)
      favorites.value = []
    }
  }

  // 保存收藏到本地存儲
  const saveFavoritesToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value))
    } catch (error) {
      console.error('Error saving favorites to storage:', error)
    }
  }

  // 添加到收藏
  const addToFavorites = (movie) => {
    if (!movie || !movie.id) return false

    const isAlreadyFavorite = favorites.value.some(fav => fav.id === movie.id)
    if (isAlreadyFavorite) return false

    // 只保存必要的電影資訊
    const movieData = {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      genre_ids: movie.genre_ids || [],
      adult: movie.adult,
      original_language: movie.original_language,
      original_title: movie.original_title,
      popularity: movie.popularity,
      video: movie.video,
      added_at: new Date().toISOString()
    }

    favorites.value.unshift(movieData)
    saveFavoritesToStorage()
    return true
  }

  // 從收藏中移除
  const removeFromFavorites = (movieId) => {
    const index = favorites.value.findIndex(fav => fav.id === movieId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveFavoritesToStorage()
      return true
    }
    return false
  }

  // 檢查是否已收藏
  const isFavorite = (movieId) => {
    return favorites.value.some(fav => fav.id === movieId)
  }

  // 切換收藏狀態
  const toggleFavorite = (movie) => {
    if (isFavorite(movie.id)) {
      return removeFromFavorites(movie.id)
    } else {
      return addToFavorites(movie)
    }
  }

  // 清空所有收藏
  const clearAllFavorites = () => {
    favorites.value = []
    saveFavoritesToStorage()
  }

  // 取得收藏電影
  const getFavoriteById = (movieId) => {
    return favorites.value.find(fav => fav.id === movieId) || null
  }

  // 取得收藏清單（依加入時間排序）
  const getFavoritesSortedByDate = () => {
    return [...favorites.value].sort((a, b) => new Date(b.added_at) - new Date(a.added_at))
  }

  // 取得收藏清單（依評分排序）
  const getFavoritesSortedByRating = () => {
    return [...favorites.value].sort((a, b) => b.vote_average - a.vote_average)
  }

  // 取得收藏清單（依標題排序）
  const getFavoritesSortedByTitle = () => {
    return [...favorites.value].sort((a, b) => a.title.localeCompare(b.title))
  }

  // 搜尋收藏
  const searchFavorites = (query) => {
    if (!query.trim()) return favorites.value

    const lowercaseQuery = query.toLowerCase()
    return favorites.value.filter(movie => 
      movie.title.toLowerCase().includes(lowercaseQuery) ||
      movie.overview.toLowerCase().includes(lowercaseQuery) ||
      movie.original_title.toLowerCase().includes(lowercaseQuery)
    )
  }

  // 初始化
  const init = () => {
    loadFavoritesFromStorage()
  }

  return {
    // 狀態
    favorites,
    
    // 計算屬性
    favoriteCount,
    hasFavorites,
    
    // 方法
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    clearAllFavorites,
    getFavoriteById,
    getFavoritesSortedByDate,
    getFavoritesSortedByRating,
    getFavoritesSortedByTitle,
    searchFavorites,
    init
  }
})