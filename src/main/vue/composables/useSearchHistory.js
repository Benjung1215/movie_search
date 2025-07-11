import { ref, computed } from 'vue'

const STORAGE_KEY = 'movie-search-history'
const MAX_HISTORY_ITEMS = 10

export function useSearchHistory() {
  const history = ref([])

  // 從本地存儲載入搜尋歷史
  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        history.value = JSON.parse(stored)
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('載入搜尋歷史時發生錯誤:', error)
      }
      history.value = []
    }
  }

  // 保存搜尋歷史到本地存儲
  const saveHistory = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('保存搜尋歷史時發生錯誤:', error)
      }
    }
  }

  // 添加搜尋記錄
  const addToHistory = (query) => {
    if (!query || !query.trim()) return

    const trimmedQuery = query.trim()
    
    // 移除重複項目
    history.value = history.value.filter(item => item !== trimmedQuery)
    
    // 添加到開頭
    history.value.unshift(trimmedQuery)
    
    // 限制歷史記錄數量
    if (history.value.length > MAX_HISTORY_ITEMS) {
      history.value = history.value.slice(0, MAX_HISTORY_ITEMS)
    }
    
    saveHistory()
  }

  // 移除特定搜尋記錄
  const removeFromHistory = (query) => {
    history.value = history.value.filter(item => item !== query)
    saveHistory()
  }

  // 清空搜尋歷史
  const clearHistory = () => {
    history.value = []
    saveHistory()
  }

  // 取得搜尋建議（基於歷史記錄）
  const getSearchSuggestions = (query) => {
    if (!query || !query.trim()) return []
    
    const lowerQuery = query.toLowerCase()
    return history.value.filter(item => 
      item.toLowerCase().includes(lowerQuery) && 
      item.toLowerCase() !== lowerQuery
    ).slice(0, 5)
  }

  // 計算屬性
  const hasHistory = computed(() => history.value.length > 0)
  const recentSearches = computed(() => history.value.slice(0, 5))

  // 初始化
  loadHistory()

  return {
    history: computed(() => history.value),
    hasHistory,
    recentSearches,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getSearchSuggestions
  }
}