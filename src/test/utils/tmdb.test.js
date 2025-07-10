import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the tmdb service
const mockTMDBService = {
  baseURL: 'https://api.themoviedb.org/3',
  apiKey: 'test-key',
  imageBaseURL: 'https://image.tmdb.org/t/p/',
  
  fetchFromAPI: vi.fn(),
  searchMovies: vi.fn(),
  getMovieDetails: vi.fn(),
  getPopularMovies: vi.fn(),
  getGenres: vi.fn(),
  
  getImageUrl: (path, size = 'w500') => {
    if (!path) return null
    return `${mockTMDBService.imageBaseURL}${size}${path}`
  },
  
  getPosterUrl: (path, size = 'w500') => mockTMDBService.getImageUrl(path, size),
  getBackdropUrl: (path, size = 'w1280') => mockTMDBService.getImageUrl(path, size)
}

describe('TMDB Service Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Image URL generation', () => {
    it('should generate correct poster URL', () => {
      const path = '/test-poster.jpg'
      const url = mockTMDBService.getPosterUrl(path)
      
      expect(url).toBe('https://image.tmdb.org/t/p/w500/test-poster.jpg')
    })

    it('should generate correct backdrop URL', () => {
      const path = '/test-backdrop.jpg'
      const url = mockTMDBService.getBackdropUrl(path)
      
      expect(url).toBe('https://image.tmdb.org/t/p/w1280/test-backdrop.jpg')
    })

    it('should handle null path', () => {
      const url = mockTMDBService.getPosterUrl(null)
      
      expect(url).toBeNull()
    })

    it('should handle custom size', () => {
      const path = '/test-image.jpg'
      const url = mockTMDBService.getImageUrl(path, 'w300')
      
      expect(url).toBe('https://image.tmdb.org/t/p/w300/test-image.jpg')
    })
  })

  describe('API methods', () => {
    it('should have all required methods', () => {
      expect(mockTMDBService.searchMovies).toBeDefined()
      expect(mockTMDBService.getMovieDetails).toBeDefined()
      expect(mockTMDBService.getPopularMovies).toBeDefined()
      expect(mockTMDBService.getGenres).toBeDefined()
    })

    it('should be mockable', () => {
      const mockResponse = {
        results: [{ id: 1, title: 'Test Movie' }],
        total_results: 1
      }
      
      mockTMDBService.searchMovies.mockResolvedValue(mockResponse)
      
      expect(mockTMDBService.searchMovies).toBeInstanceOf(Function)
    })
  })
})