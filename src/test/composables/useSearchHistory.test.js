import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSearchHistory } from '../../main/vue/composables/useSearchHistory.js'

describe('useSearchHistory', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with empty history', () => {
    const { history, hasHistory } = useSearchHistory()
    
    expect(history.value).toEqual([])
    expect(hasHistory.value).toBe(false)
  })

  it('should add search query to history', () => {
    const { history, addToHistory, hasHistory } = useSearchHistory()
    
    addToHistory('Marvel')
    
    expect(history.value).toEqual(['Marvel'])
    expect(hasHistory.value).toBe(true)
  })

  it('should not add empty queries', () => {
    const { history, addToHistory } = useSearchHistory()
    
    addToHistory('')
    addToHistory('   ')
    addToHistory(null)
    addToHistory(undefined)
    
    expect(history.value).toEqual([])
  })

  it('should remove duplicates and add to front', () => {
    const { history, addToHistory } = useSearchHistory()
    
    addToHistory('Marvel')
    addToHistory('DC')
    addToHistory('Marvel') // duplicate
    
    expect(history.value).toEqual(['Marvel', 'DC'])
  })

  it('should limit history to max items', () => {
    const { history, addToHistory } = useSearchHistory()
    
    // Add 15 items (max is 10)
    for (let i = 1; i <= 15; i++) {
      addToHistory(`Query ${i}`)
    }
    
    expect(history.value).toHaveLength(10)
    expect(history.value[0]).toBe('Query 15') // most recent first
    expect(history.value[9]).toBe('Query 6') // oldest kept
  })

  it('should remove specific item from history', () => {
    const { history, addToHistory, removeFromHistory } = useSearchHistory()
    
    addToHistory('Marvel')
    addToHistory('DC')
    addToHistory('Star Wars')
    
    removeFromHistory('DC')
    
    expect(history.value).toEqual(['Star Wars', 'Marvel'])
  })

  it('should clear all history', () => {
    const { history, addToHistory, clearHistory, hasHistory } = useSearchHistory()
    
    addToHistory('Marvel')
    addToHistory('DC')
    
    expect(hasHistory.value).toBe(true)
    
    clearHistory()
    
    expect(history.value).toEqual([])
    expect(hasHistory.value).toBe(false)
  })

  it('should get search suggestions', () => {
    const { addToHistory, getSearchSuggestions } = useSearchHistory()
    
    addToHistory('Marvel Avengers')
    addToHistory('Marvel Spider-Man')
    addToHistory('DC Batman')
    addToHistory('Star Wars')
    
    const suggestions = getSearchSuggestions('Marvel')
    
    expect(suggestions).toHaveLength(2)
    expect(suggestions).toContain('Marvel Avengers')
    expect(suggestions).toContain('Marvel Spider-Man')
    expect(suggestions).not.toContain('DC Batman')
  })

  it('should return recent searches', () => {
    const { addToHistory, recentSearches } = useSearchHistory()
    
    for (let i = 1; i <= 8; i++) {
      addToHistory(`Query ${i}`)
    }
    
    expect(recentSearches.value).toHaveLength(5) // limited to 5
    expect(recentSearches.value[0]).toBe('Query 8') // most recent first
  })

  it('should persist history to localStorage', () => {
    const setItemSpy = vi.spyOn(localStorage, 'setItem')
    const { addToHistory } = useSearchHistory()
    
    addToHistory('Marvel')
    
    expect(setItemSpy).toHaveBeenCalledWith(
      'movie-search-history',
      JSON.stringify(['Marvel'])
    )
  })

  it('should load history from localStorage', () => {
    const getItemSpy = vi.spyOn(localStorage, 'getItem')
      .mockReturnValue(JSON.stringify(['Marvel', 'DC']))
    
    const { history } = useSearchHistory()
    
    expect(getItemSpy).toHaveBeenCalledWith('movie-search-history')
    expect(history.value).toEqual(['Marvel', 'DC'])
  })
})