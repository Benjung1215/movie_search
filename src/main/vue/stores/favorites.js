import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from '../services/firebase.js'
import { useAuthStore } from './auth.js'

export const useFavoritesStore = defineStore('favorites', () => {
  // 狀態
  const favorites = ref([])
  const loading = ref(false)
  const error = ref(null)
  const isCloudSynced = ref(false)
  const STORAGE_KEY = 'movie-search-favorites'
  
  let unsubscribeSnapshot = null

  // 計算屬性
  const favoriteCount = computed(() => favorites.value.length)
  const hasFavorites = computed(() => favorites.value.length > 0)

  // 設定載入狀態
  const setLoading = (state) => {
    loading.value = state
  }

  // 設定錯誤
  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  // 清除錯誤
  const clearError = () => {
    error.value = null
  }

  // 從本地存儲載入收藏
  const loadFavoritesFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const localFavorites = JSON.parse(stored)
        // 如果沒有雲端同步，直接使用本地數據
        if (!isCloudSynced.value) {
          favorites.value = localFavorites
        }
        return localFavorites
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error)
    }
    return []
  }

  // 保存收藏到本地存儲
  const saveFavoritesToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value))
    } catch (error) {
      console.error('Error saving favorites to storage:', error)
    }
  }

  // 獲取用戶收藏集合引用
  const getUserFavoritesCollection = () => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return null
    
    return collection(db, 'users', authStore.user.uid, 'favorites')
  }

  // 從 Firestore 載入收藏
  const loadFavoritesFromCloud = async () => {
    const favoritesCollection = getUserFavoritesCollection()
    if (!favoritesCollection) return []

    try {
      setLoading(true)
      clearError()

      const q = query(favoritesCollection, orderBy('added_at', 'desc'))
      const snapshot = await getDocs(q)
      
      const cloudFavorites = []
      snapshot.forEach((doc) => {
        cloudFavorites.push({
          id: doc.id,
          ...doc.data()
        })
      })

      return cloudFavorites
    } catch (err) {
      console.error('Error loading favorites from cloud:', err)
      setError('載入雲端收藏失敗')
      return []
    } finally {
      setLoading(false)
    }
  }

  // 合併本地和雲端收藏
  const mergeFavorites = (localFavorites, cloudFavorites) => {
    const mergedMap = new Map()

    // 添加雲端收藏
    cloudFavorites.forEach(movie => {
      mergedMap.set(movie.id, movie)
    })

    // 添加本地收藏（如果雲端沒有）
    localFavorites.forEach(movie => {
      if (!mergedMap.has(movie.id)) {
        mergedMap.set(movie.id, movie)
      }
    })

    return Array.from(mergedMap.values())
      .sort((a, b) => new Date(b.added_at) - new Date(a.added_at))
  }

  // 同步收藏到雲端
  const syncFavoriteToCloud = async (movie) => {
    const favoritesCollection = getUserFavoritesCollection()
    if (!favoritesCollection) return false

    try {
      const movieDoc = doc(favoritesCollection, movie.id.toString())
      await setDoc(movieDoc, {
        ...movie,
        synced_at: new Date().toISOString()
      })
      return true
    } catch (err) {
      console.error('Error syncing favorite to cloud:', err)
      return false
    }
  }

  // 從雲端移除收藏
  const removeFavoriteFromCloud = async (movieId) => {
    const favoritesCollection = getUserFavoritesCollection()
    if (!favoritesCollection) return false

    try {
      const movieDoc = doc(favoritesCollection, movieId.toString())
      await deleteDoc(movieDoc)
      return true
    } catch (err) {
      console.error('Error removing favorite from cloud:', err)
      return false
    }
  }

  // 設定雲端數據監聽
  const setupCloudSync = async () => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    const favoritesCollection = getUserFavoritesCollection()
    if (!favoritesCollection) return

    try {
      const q = query(favoritesCollection, orderBy('added_at', 'desc'))
      
      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const cloudFavorites = []
        snapshot.forEach((doc) => {
          cloudFavorites.push({
            id: doc.id,
            ...doc.data()
          })
        })

        // 合併本地和雲端數據
        const localFavorites = loadFavoritesFromStorage()
        const mergedFavorites = mergeFavorites(localFavorites, cloudFavorites)
        
        favorites.value = mergedFavorites
        saveFavoritesToStorage()
        isCloudSynced.value = true
        
        console.log('雲端收藏同步完成:', mergedFavorites.length, '部電影')
      }, (err) => {
        console.error('雲端同步錯誤:', err)
        setError('雲端同步失敗')
      })
    } catch (err) {
      console.error('設定雲端同步失敗:', err)
    }
  }

  // 停止雲端同步
  const stopCloudSync = () => {
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot()
      unsubscribeSnapshot = null
    }
    isCloudSynced.value = false
  }

  // 添加到收藏
  const addToFavorites = async (movie) => {
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

    // 添加到本地
    favorites.value.unshift(movieData)
    saveFavoritesToStorage()

    // 同步到雲端（如果已登入）
    if (isCloudSynced.value) {
      await syncFavoriteToCloud(movieData)
    }

    return true
  }

  // 從收藏中移除
  const removeFromFavorites = async (movieId) => {
    const index = favorites.value.findIndex(fav => fav.id === movieId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveFavoritesToStorage()

      // 從雲端移除（如果已登入）
      if (isCloudSynced.value) {
        await removeFavoriteFromCloud(movieId)
      }

      return true
    }
    return false
  }

  // 檢查是否已收藏
  const isFavorite = (movieId) => {
    return favorites.value.some(fav => fav.id === movieId)
  }

  // 切換收藏狀態
  const toggleFavorite = async (movie) => {
    if (isFavorite(movie.id)) {
      return await removeFromFavorites(movie.id)
    } else {
      return await addToFavorites(movie)
    }
  }

  // 清空所有收藏
  const clearAllFavorites = async () => {
    // 如果已登入，從雲端移除所有收藏
    if (isCloudSynced.value) {
      const favoritesToRemove = [...favorites.value]
      for (const movie of favoritesToRemove) {
        await removeFavoriteFromCloud(movie.id)
      }
    }

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

  // 初始化（用於未登入狀態）
  const init = () => {
    loadFavoritesFromStorage()
  }

  // 用戶登入時的初始化
  const initWithUser = async () => {
    try {
      setLoading(true)
      
      // 載入本地收藏
      const localFavorites = loadFavoritesFromStorage()
      
      // 載入雲端收藏
      const cloudFavorites = await loadFavoritesFromCloud()
      
      // 合併數據
      const mergedFavorites = mergeFavorites(localFavorites, cloudFavorites)
      favorites.value = mergedFavorites
      saveFavoritesToStorage()

      // 同步本地獨有的收藏到雲端
      for (const localMovie of localFavorites) {
        const existsInCloud = cloudFavorites.some(cloud => cloud.id === localMovie.id)
        if (!existsInCloud) {
          await syncFavoriteToCloud(localMovie)
        }
      }

      // 設定即時同步
      await setupCloudSync()
      
      console.log('用戶收藏初始化完成:', mergedFavorites.length, '部電影')
    } catch (err) {
      console.error('用戶收藏初始化失敗:', err)
      setError('初始化收藏失敗')
    } finally {
      setLoading(false)
    }
  }

  // 用戶登出時的清理
  const cleanup = () => {
    stopCloudSync()
    // 保持本地數據，但標記為未同步
    isCloudSynced.value = false
    console.log('收藏雲端同步已停止')
  }

  return {
    // 狀態
    favorites,
    loading,
    error,
    isCloudSynced,
    
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
    init,
    initWithUser,
    cleanup,
    setLoading,
    setError,
    clearError
  }
})