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
    url.searchParams.append('language', 'en-US')
    
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
      // Log error in development only
      if (import.meta.env.DEV) {
        console.error('TMDB API Error:', error)
      }
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
  async getMoviesByGenre(genreId, page = 1, sortBy = 'popularity.desc') {
    return this.fetchFromAPI('/discover/movie', {
      with_genres: genreId,
      page,
      sort_by: sortBy
    })
  }

  // 進階搜尋電影
  async discoverMovies(options = {}) {
    const {
      page = 1,
      sortBy = 'popularity.desc',
      withGenres,
      withoutGenres,
      primaryReleaseYear,
      releaseDateGte,
      releaseDateLte,
      voteAverageGte,
      voteAverageLte,
      voteCountGte,
      withRuntime,
      withOriginalLanguage
    } = options

    const params = {
      page,
      sort_by: sortBy
    }

    if (withGenres) params.with_genres = withGenres
    if (withoutGenres) params.without_genres = withoutGenres
    if (primaryReleaseYear) params.primary_release_year = primaryReleaseYear
    if (releaseDateGte) params['release_date.gte'] = releaseDateGte
    if (releaseDateLte) params['release_date.lte'] = releaseDateLte
    if (voteAverageGte) params['vote_average.gte'] = voteAverageGte
    if (voteAverageLte) params['vote_average.lte'] = voteAverageLte
    if (voteCountGte) params['vote_count.gte'] = voteCountGte
    if (withRuntime) params.with_runtime = withRuntime
    if (withOriginalLanguage) params.with_original_language = withOriginalLanguage

    return this.fetchFromAPI('/discover/movie', params)
  }

  // 取得類型的熱門電影（用於類型頁面預覽）
  async getGenrePreviewMovies(genreId, limit = 4) {
    const response = await this.getMoviesByGenre(genreId, 1)
    return {
      ...response,
      results: response.results.slice(0, limit)
    }
  }

  // 取得年份範圍內的電影
  async getMoviesByYear(year, page = 1) {
    return this.fetchFromAPI('/discover/movie', {
      primary_release_year: year,
      page,
      sort_by: 'popularity.desc'
    })
  }

  // 取得高評分電影（評分範圍）
  async getMoviesByRating(minRating, maxRating = 10, page = 1) {
    return this.fetchFromAPI('/discover/movie', {
      'vote_average.gte': minRating,
      'vote_average.lte': maxRating,
      'vote_count.gte': 100, // 確保有足夠的評分數
      page,
      sort_by: 'vote_average.desc'
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

  // 取得類型統計資訊
  async getGenreStats(genreId) {
    try {
      const response = await this.getMoviesByGenre(genreId, 1)
      return {
        totalResults: response.total_results,
        totalPages: response.total_pages,
        popularMovies: response.results.slice(0, 4)
      }
    } catch (error) {
      // Log error in development only
      if (import.meta.env.DEV) {
        console.error('Error fetching genre stats:', error)
      }
      return {
        totalResults: 0,
        totalPages: 0,
        popularMovies: []
      }
    }
  }

  // 取得多個類型的統計資訊
  async getAllGenresStats() {
    try {
      const genresResponse = await this.getGenres()
      const genres = genresResponse.genres
      
      const genresWithStats = await Promise.all(
        genres.map(async (genre) => {
          const stats = await this.getGenreStats(genre.id)
          return {
            ...genre,
            ...stats
          }
        })
      )
      
      return genresWithStats
    } catch (error) {
      // Log error in development only
      if (import.meta.env.DEV) {
        console.error('Error fetching all genres stats:', error)
      }
      return []
    }
  }
}

export default new TMDBService()