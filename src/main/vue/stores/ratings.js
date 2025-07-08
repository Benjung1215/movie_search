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

export const useRatingsStore = defineStore('ratings', () => {
  // 狀態
  const ratings = ref([])
  const loading = ref(false)
  const error = ref(null)
  const isCloudSynced = ref(false)
  const STORAGE_KEY = 'movie-search-ratings'
  
  let unsubscribeSnapshot = null

  // 計算屬性
  const ratingsCount = computed(() => ratings.value.length)
  const hasRatings = computed(() => ratings.value.length > 0)
  const averageRating = computed(() => {
    if (ratings.value.length === 0) return 0
    const sum = ratings.value.reduce((acc, rating) => acc + rating.userRating, 0)
    return sum / ratings.value.length
  })

  // 評分分布統計
  const ratingDistribution = computed(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratings.value.forEach(rating => {
      if (rating.userRating >= 1 && rating.userRating <= 5) {
        distribution[rating.userRating]++
      }
    })
    return distribution
  })

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

  // 從本地存儲載入評分
  const loadRatingsFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const localRatings = JSON.parse(stored)
        if (!isCloudSynced.value) {
          ratings.value = localRatings
        }
        return localRatings
      }
    } catch (error) {
      console.error('Error loading ratings from storage:', error)
    }
    return []
  }

  // 保存評分到本地存儲
  const saveRatingsToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings.value))
    } catch (error) {
      console.error('Error saving ratings to storage:', error)
    }
  }

  // 獲取用戶評分集合引用
  const getUserRatingsCollection = () => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return null
    
    return collection(db, 'users', authStore.user.uid, 'ratings')
  }

  // 從 Firestore 載入評分
  const loadRatingsFromCloud = async () => {
    const ratingsCollection = getUserRatingsCollection()
    if (!ratingsCollection) return []

    try {
      setLoading(true)
      clearError()

      const q = query(ratingsCollection, orderBy('rated_at', 'desc'))
      const snapshot = await getDocs(q)
      
      const cloudRatings = []
      snapshot.forEach((doc) => {
        cloudRatings.push({
          id: doc.id,
          ...doc.data()
        })
      })

      return cloudRatings
    } catch (err) {
      console.error('Error loading ratings from cloud:', err)
      setError('載入雲端評分失敗')
      return []
    } finally {
      setLoading(false)
    }
  }

  // 合併本地和雲端評分
  const mergeRatings = (localRatings, cloudRatings) => {
    const mergedMap = new Map()

    // 添加雲端評分
    cloudRatings.forEach(rating => {
      mergedMap.set(rating.id, rating)
    })

    // 添加本地評分（如果雲端沒有）
    localRatings.forEach(rating => {
      if (!mergedMap.has(rating.id)) {
        mergedMap.set(rating.id, rating)
      }
    })

    return Array.from(mergedMap.values())
      .sort((a, b) => new Date(b.rated_at) - new Date(a.rated_at))
  }

  // 同步評分到雲端
  const syncRatingToCloud = async (rating) => {
    const ratingsCollection = getUserRatingsCollection()
    if (!ratingsCollection) return false

    try {
      const ratingDoc = doc(ratingsCollection, rating.id.toString())
      await setDoc(ratingDoc, {
        ...rating,
        synced_at: new Date().toISOString()
      })
      return true
    } catch (err) {
      console.error('Error syncing rating to cloud:', err)
      return false
    }
  }

  // 從雲端移除評分
  const removeRatingFromCloud = async (movieId) => {
    const ratingsCollection = getUserRatingsCollection()
    if (!ratingsCollection) return false

    try {
      const ratingDoc = doc(ratingsCollection, movieId.toString())
      await deleteDoc(ratingDoc)
      return true
    } catch (err) {
      console.error('Error removing rating from cloud:', err)
      return false
    }
  }

  // 設定雲端數據監聽
  const setupCloudSync = async () => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    const ratingsCollection = getUserRatingsCollection()
    if (!ratingsCollection) return

    try {
      const q = query(ratingsCollection, orderBy('rated_at', 'desc'))
      
      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const cloudRatings = []
        snapshot.forEach((doc) => {
          cloudRatings.push({
            id: doc.id,
            ...doc.data()
          })
        })

        // 合併本地和雲端數據
        const localRatings = loadRatingsFromStorage()
        const mergedRatings = mergeRatings(localRatings, cloudRatings)
        
        ratings.value = mergedRatings
        saveRatingsToStorage()
        isCloudSynced.value = true
        
        console.log('雲端評分同步完成:', mergedRatings.length, '個評分')
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

  // 添加或更新評分
  const rateMovie = async (movie, userRating, comment = '') => {
    if (!movie || !movie.id || userRating < 1 || userRating > 5) return false

    // 檢查是否已存在評分
    const existingRatingIndex = ratings.value.findIndex(rating => rating.id === movie.id)
    
    // 處理類型資訊
    let genreData = []
    if (movie.genre_ids && movie.genre_ids.length > 0) {
      genreData = movie.genre_ids
    } else if (movie.genres && movie.genres.length > 0) {
      genreData = movie.genres.map(genre => genre.id)
    }

    const ratingData = {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      genre_ids: genreData,
      userRating,
      comment,
      rated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (existingRatingIndex > -1) {
      // 更新現有評分
      const updatedRating = {
        ...ratings.value[existingRatingIndex],
        userRating,
        comment,
        updated_at: new Date().toISOString()
      }
      ratings.value[existingRatingIndex] = updatedRating
    } else {
      // 添加新評分
      ratings.value.unshift(ratingData)
    }

    saveRatingsToStorage()

    // 同步到雲端
    if (isCloudSynced.value) {
      await syncRatingToCloud(existingRatingIndex > -1 ? ratings.value[existingRatingIndex] : ratingData)
    }

    return true
  }

  // 移除評分
  const removeRating = async (movieId) => {
    const index = ratings.value.findIndex(rating => rating.id === movieId)
    if (index > -1) {
      ratings.value.splice(index, 1)
      saveRatingsToStorage()

      // 從雲端移除
      if (isCloudSynced.value) {
        await removeRatingFromCloud(movieId)
      }

      return true
    }
    return false
  }

  // 獲取電影評分
  const getMovieRating = (movieId) => {
    return ratings.value.find(rating => rating.id === movieId) || null
  }

  // 檢查是否已評分
  const isMovieRated = (movieId) => {
    return ratings.value.some(rating => rating.id === movieId)
  }

  // 獲取用戶評分（只返回分數）
  const getUserRating = (movieId) => {
    const rating = getMovieRating(movieId)
    return rating ? rating.userRating : 0
  }

  // 清空所有評分
  const clearAllRatings = async () => {
    if (isCloudSynced.value) {
      const ratingsToRemove = [...ratings.value]
      for (const rating of ratingsToRemove) {
        await removeRatingFromCloud(rating.id)
      }
    }

    ratings.value = []
    saveRatingsToStorage()
  }

  // 按評分排序
  const getRatingsSortedByRating = (desc = true) => {
    return [...ratings.value].sort((a, b) => 
      desc ? b.userRating - a.userRating : a.userRating - b.userRating
    )
  }

  // 按日期排序
  const getRatingsSortedByDate = (desc = true) => {
    return [...ratings.value].sort((a, b) => {
      const dateA = new Date(a.rated_at)
      const dateB = new Date(b.rated_at)
      return desc ? dateB - dateA : dateA - dateB
    })
  }

  // 按電影標題排序
  const getRatingsSortedByTitle = () => {
    return [...ratings.value].sort((a, b) => a.title.localeCompare(b.title))
  }

  // 依評分篩選
  const getRatingsByScore = (score) => {
    return ratings.value.filter(rating => rating.userRating === score)
  }

  // 搜尋評分
  const searchRatings = (query) => {
    if (!query.trim()) return ratings.value

    const lowercaseQuery = query.toLowerCase()
    return ratings.value.filter(rating => 
      rating.title.toLowerCase().includes(lowercaseQuery) ||
      rating.overview.toLowerCase().includes(lowercaseQuery) ||
      (rating.comment && rating.comment.toLowerCase().includes(lowercaseQuery))
    )
  }

  // 初始化（用於未登入狀態）
  const init = () => {
    loadRatingsFromStorage()
  }

  // 用戶登入時的初始化
  const initWithUser = async () => {
    try {
      setLoading(true)
      
      // 載入本地評分
      const localRatings = loadRatingsFromStorage()
      
      // 載入雲端評分
      const cloudRatings = await loadRatingsFromCloud()
      
      // 合併數據
      const mergedRatings = mergeRatings(localRatings, cloudRatings)
      ratings.value = mergedRatings
      saveRatingsToStorage()

      // 同步本地獨有的評分到雲端
      for (const localRating of localRatings) {
        const existsInCloud = cloudRatings.some(cloud => cloud.id === localRating.id)
        if (!existsInCloud) {
          await syncRatingToCloud(localRating)
        }
      }

      // 設定即時同步
      await setupCloudSync()
      
      console.log('用戶評分初始化完成:', mergedRatings.length, '個評分')
    } catch (err) {
      console.error('用戶評分初始化失敗:', err)
      setError('初始化評分失敗')
    } finally {
      setLoading(false)
    }
  }

  // 用戶登出時的清理
  const cleanup = () => {
    stopCloudSync()
    isCloudSynced.value = false
    console.log('評分雲端同步已停止')
  }

  return {
    // 狀態
    ratings,
    loading,
    error,
    isCloudSynced,
    
    // 計算屬性
    ratingsCount,
    hasRatings,
    averageRating,
    ratingDistribution,
    
    // 方法
    rateMovie,
    removeRating,
    getMovieRating,
    isMovieRated,
    getUserRating,
    clearAllRatings,
    getRatingsSortedByRating,
    getRatingsSortedByDate,
    getRatingsSortedByTitle,
    getRatingsByScore,
    searchRatings,
    init,
    initWithUser,
    cleanup,
    setLoading,
    setError,
    clearError
  }
})