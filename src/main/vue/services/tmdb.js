const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL

class TMDBService {
  constructor() {
    this.baseURL = BASE_URL
    this.apiKey = API_KEY
    this.imageBaseURL = IMAGE_BASE_URL
  }

  async fetchFromAPI(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`)
    url.searchParams.append('api_key', this.apiKey)
    url.searchParams.append('language', 'zh-TW')
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value)
      }
    })

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('TMDB API Error:', error)
      throw error
    }
  }

  // 搜尋電影
  async searchMovies(query, page = 1) {
    return this.fetchFromAPI('/search/movie', {
      query,
      page,
      include_adult: false
    })
  }

  // 取得電影詳情
  async getMovieDetails(movieId) {
    return this.fetchFromAPI(`/movie/${movieId}`, {
      append_to_response: 'credits,videos,similar'
    })
  }

  // 取得熱門電影
  async getPopularMovies(page = 1) {
    return this.fetchFromAPI('/movie/popular', { page })
  }

  // 取得最新電影
  async getNowPlayingMovies(page = 1) {
    return this.fetchFromAPI('/movie/now_playing', { page })
  }

  // 取得即將上映電影
  async getUpcomingMovies(page = 1) {
    return this.fetchFromAPI('/movie/upcoming', { page })
  }

  // 取得高評分電影
  async getTopRatedMovies(page = 1) {
    return this.fetchFromAPI('/movie/top_rated', { page })
  }

  // 取得電影類型
  async getGenres() {
    return this.fetchFromAPI('/genre/movie/list')
  }

  // 依類型搜尋電影
  async getMoviesByGenre(genreId, page = 1) {
    return this.fetchFromAPI('/discover/movie', {
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc'
    })
  }

  // 圖片 URL 建構
  getImageUrl(path, size = 'w500') {
    if (!path) return null
    return `${this.imageBaseURL}${size}${path}`
  }

  // 背景圖片 URL
  getBackdropUrl(path, size = 'w1280') {
    return this.getImageUrl(path, size)
  }

  // 海報圖片 URL
  getPosterUrl(path, size = 'w500') {
    return this.getImageUrl(path, size)
  }

  // 演員照片 URL
  getProfileUrl(path, size = 'w185') {
    return this.getImageUrl(path, size)
  }
}

export default new TMDBService()