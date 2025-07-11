import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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

export const useWatchlistStore = defineStore('watchlist', () => {
  // 狀態
  const watchlist = ref([])
  const loading = ref(false)
  const error = ref(null)
  const isCloudSynced = ref(false)
  const STORAGE_KEY = 'movie-search-watchlist'
  
  let unsubscribeSnapshot = null

  // 計算屬性
  const watchlistCount = computed(() => watchlist.value.length)
  const hasWatchlist = computed(() => watchlist.value.length > 0)

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

  // 從本地存儲載入觀看清單
  const loadWatchlistFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const localWatchlist = JSON.parse(stored)
        // 如果沒有雲端同步，直接使用本地數據
        if (!isCloudSynced.value) {
          watchlist.value = localWatchlist
        }
        return localWatchlist
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading watchlist from storage:', error)
      }
    }
    return []
  }

  // 保存觀看清單到本地存儲
  const saveWatchlistToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist.value))
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving watchlist to storage:', error)
      }
    }
  }

  // 獲取用戶觀看清單集合引用
  const getUserWatchlistCollection = () => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return null
    
    return collection(db, 'users', authStore.user.uid, 'watchlist')
  }

  // 從 Firestore 載入觀看清單
  const loadWatchlistFromCloud = async () => {
    const watchlistCollection = getUserWatchlistCollection()
    if (!watchlistCollection) return []

    try {
      setLoading(true)
      clearError()

      const q = query(watchlistCollection, orderBy('added_at', 'desc'))
      const snapshot = await getDocs(q)
      
      const cloudWatchlist = []
      snapshot.forEach((doc) => {
        cloudWatchlist.push({
          id: doc.id,
          ...doc.data()
        })
      })

      return cloudWatchlist
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error loading watchlist from cloud:', err)
      }
      setError('載入雲端觀看清單失敗')
      return []
    } finally {
      setLoading(false)
    }
  }

  // 合併本地和雲端觀看清單
  const mergeWatchlist = (localWatchlist, cloudWatchlist) => {
    const mergedMap = new Map()

    // 添加雲端觀看清單
    cloudWatchlist.forEach(movie => {
      mergedMap.set(movie.id, movie)
    })

    // 添加本地觀看清單（如果雲端沒有）
    localWatchlist.forEach(movie => {
      if (!mergedMap.has(movie.id)) {
        mergedMap.set(movie.id, movie)
      }
    })

    return Array.from(mergedMap.values())
      .sort((a, b) => new Date(b.added_at) - new Date(a.added_at))
  }

  // 同步觀看清單到雲端
  const syncWatchlistToCloud = async (movie) => {
    const watchlistCollection = getUserWatchlistCollection()
    if (!watchlistCollection) return false

    try {
      const movieDoc = doc(watchlistCollection, movie.id.toString())
      await setDoc(movieDoc, {
        ...movie,
        synced_at: new Date().toISOString()
      })
      return true
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error syncing watchlist to cloud:', err)
      }
      return false
    }
  }

  // 從雲端移除觀看清單
  const removeWatchlistFromCloud = async (movieId) => {
    const watchlistCollection = getUserWatchlistCollection()
    if (!watchlistCollection) return false

    try {
      const movieDoc = doc(watchlistCollection, movieId.toString())
      await deleteDoc(movieDoc)
      return true
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error removing watchlist from cloud:', err)
      }
      return false
    }
  }

  // 設定雲端數據監聽
  const setupCloudSync = async () => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    const watchlistCollection = getUserWatchlistCollection()
    if (!watchlistCollection) return

    try {
      const q = query(watchlistCollection, orderBy('added_at', 'desc'))
      
      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const cloudWatchlist = []
        snapshot.forEach((doc) => {
          cloudWatchlist.push({
            id: doc.id,
            ...doc.data()
          })
        })

        // 合併本地和雲端數據
        const localWatchlist = loadWatchlistFromStorage()
        const mergedWatchlist = mergeWatchlist(localWatchlist, cloudWatchlist)
        
        watchlist.value = mergedWatchlist
        saveWatchlistToStorage()
        isCloudSynced.value = true
        
        if (import.meta.env.DEV) {
          console.log('雲端觀看清單同步完成:', mergedWatchlist.length, '部電影')
        }
      }, (err) => {
        if (import.meta.env.DEV) {
          console.error('雲端同步錯誤:', err)
        }
        setError('雲端同步失敗')
      })
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('設定雲端同步失敗:', err)
      }
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

  // 添加到觀看清單
  const addToWatchlist = async (movie) => {
    if (!movie || !movie.id) return false

    const isAlreadyInWatchlist = watchlist.value.some(item => item.id === movie.id)
    if (isAlreadyInWatchlist) return false

    // 處理類型資訊 - 支援 genre_ids (搜尋) 和 genres (詳情)
    let genreData = []
    if (movie.genre_ids && movie.genre_ids.length > 0) {
      // 來自搜尋結果，使用 genre_ids
      genreData = movie.genre_ids
    } else if (movie.genres && movie.genres.length > 0) {
      // 來自詳情頁面，使用 genres 物件陣列
      genreData = movie.genres.map(genre => genre.id)
    }

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
      genre_ids: genreData,
      adult: movie.adult,
      original_language: movie.original_language,
      original_title: movie.original_title,
      popularity: movie.popularity,
      video: movie.video,
      added_at: new Date().toISOString(),
      status: 'want_to_watch' // 觀看狀態：want_to_watch, watched
    }

    // 添加到本地
    watchlist.value.unshift(movieData)
    saveWatchlistToStorage()

    // 同步到雲端（如果已登入）
    if (isCloudSynced.value) {
      await syncWatchlistToCloud(movieData)
    }

    return true
  }

  // 從觀看清單中移除
  const removeFromWatchlist = async (movieId) => {
    const index = watchlist.value.findIndex(item => item.id === movieId)
    if (index > -1) {
      watchlist.value.splice(index, 1)
      saveWatchlistToStorage()

      // 從雲端移除（如果已登入）
      if (isCloudSynced.value) {
        await removeWatchlistFromCloud(movieId)
      }

      return true
    }
    return false
  }

  // 檢查是否在觀看清單中
  const isInWatchlist = (movieId) => {
    return watchlist.value.some(item => item.id === movieId)
  }

  // 切換觀看清單狀態
  const toggleWatchlist = async (movie) => {
    if (isInWatchlist(movie.id)) {
      return await removeFromWatchlist(movie.id)
    } else {
      return await addToWatchlist(movie)
    }
  }

  // 更新觀看狀態
  const updateWatchStatus = async (movieId, status) => {
    const movieIndex = watchlist.value.findIndex(item => item.id === movieId)
    if (movieIndex > -1) {
      const updatedMovie = {
        ...watchlist.value[movieIndex],
        status: status,
        updated_at: new Date().toISOString()
      }
      
      // 使用 Vue 的反應性更新
      watchlist.value[movieIndex] = updatedMovie
      saveWatchlistToStorage()

      // 同步到雲端
      if (isCloudSynced.value) {
        await syncWatchlistToCloud(updatedMovie)
      }

      return true
    }
    return false
  }

  // 清空所有觀看清單
  const clearAllWatchlist = async () => {
    // 如果已登入，從雲端移除所有觀看清單
    if (isCloudSynced.value) {
      const watchlistToRemove = [...watchlist.value]
      for (const movie of watchlistToRemove) {
        await removeWatchlistFromCloud(movie.id)
      }
    }

    watchlist.value = []
    saveWatchlistToStorage()
  }

  // 取得觀看清單電影
  const getWatchlistById = (movieId) => {
    return watchlist.value.find(item => item.id === movieId) || null
  }

  // 取得觀看清單（依加入時間排序）
  const getWatchlistSortedByDate = () => {
    return [...watchlist.value].sort((a, b) => new Date(b.added_at) - new Date(a.added_at))
  }

  // 取得觀看清單（依評分排序）
  const getWatchlistSortedByRating = () => {
    return [...watchlist.value].sort((a, b) => b.vote_average - a.vote_average)
  }

  // 取得觀看清單（依標題排序）
  const getWatchlistSortedByTitle = () => {
    return [...watchlist.value].sort((a, b) => a.title.localeCompare(b.title))
  }

  // 依狀態篩選觀看清單
  const getWatchlistByStatus = (status) => {
    return watchlist.value.filter(movie => movie.status === status)
  }

  // 搜尋觀看清單
  const searchWatchlist = (query) => {
    if (!query.trim()) return watchlist.value

    const lowercaseQuery = query.toLowerCase()
    return watchlist.value.filter(movie => 
      movie.title.toLowerCase().includes(lowercaseQuery) ||
      movie.overview.toLowerCase().includes(lowercaseQuery) ||
      movie.original_title.toLowerCase().includes(lowercaseQuery)
    )
  }

  // 初始化（用於未登入狀態）
  const init = () => {
    loadWatchlistFromStorage()
  }

  // 用戶登入時的初始化
  const initWithUser = async () => {
    try {
      setLoading(true)
      
      // 載入本地觀看清單
      const localWatchlist = loadWatchlistFromStorage()
      
      // 載入雲端觀看清單
      const cloudWatchlist = await loadWatchlistFromCloud()
      
      // 合併數據
      const mergedWatchlist = mergeWatchlist(localWatchlist, cloudWatchlist)
      watchlist.value = mergedWatchlist
      saveWatchlistToStorage()

      // 同步本地獨有的觀看清單到雲端
      for (const localMovie of localWatchlist) {
        const existsInCloud = cloudWatchlist.some(cloud => cloud.id === localMovie.id)
        if (!existsInCloud) {
          await syncWatchlistToCloud(localMovie)
        }
      }

      // 設定即時同步
      await setupCloudSync()
      
      if (import.meta.env.DEV) {
        console.log('用戶觀看清單初始化完成:', mergedWatchlist.length, '部電影')
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('用戶觀看清單初始化失敗:', err)
      }
      setError('初始化觀看清單失敗')
    } finally {
      setLoading(false)
    }
  }

  // 用戶登出時的清理
  const cleanup = () => {
    stopCloudSync()
    // 保持本地數據，但標記為未同步
    isCloudSynced.value = false
    if (import.meta.env.DEV) {
      console.log('觀看清單雲端同步已停止')
    }
  }

  return {
    // 狀態
    watchlist,
    loading,
    error,
    isCloudSynced,
    
    // 計算屬性
    watchlistCount,
    hasWatchlist,
    
    // 方法
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    updateWatchStatus,
    clearAllWatchlist,
    getWatchlistById,
    getWatchlistSortedByDate,
    getWatchlistSortedByRating,
    getWatchlistSortedByTitle,
    getWatchlistByStatus,
    searchWatchlist,
    init,
    initWithUser,
    cleanup,
    setLoading,
    setError,
    clearError
  }
})