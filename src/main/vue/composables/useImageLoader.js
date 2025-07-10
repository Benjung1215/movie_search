import { ref, computed } from 'vue'

const imageCache = new Map()
const CACHE_SIZE_LIMIT = 100

export function useImageLoader() {
  const loading = ref(false)
  const error = ref(false)
  
  // 預載入圖片
  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      if (!src) {
        reject(new Error('No image source provided'))
        return
      }

      // 檢查快取
      if (imageCache.has(src)) {
        resolve(imageCache.get(src))
        return
      }

      const img = new Image()
      
      img.onload = () => {
        // 添加到快取
        if (imageCache.size >= CACHE_SIZE_LIMIT) {
          // 清除最舊的項目
          const firstKey = imageCache.keys().next().value
          imageCache.delete(firstKey)
        }
        
        imageCache.set(src, {
          src,
          width: img.naturalWidth,
          height: img.naturalHeight,
          loaded: true
        })
        
        resolve(img)
      }
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`))
      }
      
      img.src = src
    })
  }

  // 載入圖片的主要函數
  const loadImage = async (src) => {
    if (!src) return null

    loading.value = true
    error.value = false

    try {
      const result = await preloadImage(src)
      loading.value = false
      return result
    } catch (err) {
      error.value = true
      loading.value = false
      console.error('Image loading error:', err)
      throw err
    }
  }

  // 批量預載入圖片
  const preloadImages = async (urls) => {
    const promises = urls.filter(Boolean).map(url => preloadImage(url))
    
    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.warn('Some images failed to preload:', error)
    }
  }

  // 檢查圖片是否已快取
  const isImageCached = (src) => {
    return imageCache.has(src)
  }

  // 清除快取
  const clearCache = () => {
    imageCache.clear()
  }

  // 取得快取統計
  const getCacheStats = () => {
    return {
      size: imageCache.size,
      limit: CACHE_SIZE_LIMIT,
      urls: Array.from(imageCache.keys())
    }
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    loadImage,
    preloadImage,
    preloadImages,
    isImageCached,
    clearCache,
    getCacheStats
  }
}

// 全域圖片預載入功能
export function useImagePreloader() {
  const { preloadImages } = useImageLoader()

  // 預載入電影海報
  const preloadMoviePosters = (movies, imageService) => {
    if (!movies || !movies.length) return

    const posterUrls = movies
      .map(movie => imageService.getPosterUrl(movie.poster_path))
      .filter(Boolean)
      .slice(0, 20) // 限制預載入數量

    preloadImages(posterUrls)
  }

  // 預載入電影背景圖
  const preloadMovieBackdrops = (movies, imageService) => {
    if (!movies || !movies.length) return

    const backdropUrls = movies
      .map(movie => imageService.getBackdropUrl(movie.backdrop_path))
      .filter(Boolean)
      .slice(0, 10) // 限制預載入數量

    preloadImages(backdropUrls)
  }

  return {
    preloadMoviePosters,
    preloadMovieBackdrops
  }
}