<template>
  <div class="relative">
    <!-- 搜尋輸入框 -->
    <div class="relative">
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        :class="[
          'input w-full text-lg pr-12 pl-12 transition-all duration-300',
          isFocused ? 'ring-2 ring-primary-500 border-primary-500' : '',
          isLoading ? 'animate-pulse' : ''
        ]"
        @input="handleInput"
        @keyup.enter="handleSubmit"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.up="navigateSuggestions(-1)"
        @keydown.down="navigateSuggestions(1)"
        @keydown.escape="closeSuggestions"
      />
      
      <!-- 搜尋圖標 -->
      <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
        <svg
          v-if="!isLoading"
          class="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <div v-else class="w-5 h-5">
          <svg class="animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>

      <!-- 清除按鈕 -->
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        title="清除搜尋"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- 搜尋按鈕 -->
      <button
        @click="handleSubmit"
        :disabled="isLoading || !searchQuery.trim()"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="搜尋"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>

    <!-- 搜尋建議下拉選單 -->
    <div
      v-if="showSuggestions && (suggestions.length > 0 || recentSearches.length > 0)"
      class="absolute top-full left-0 right-0 bg-dark-800 border border-dark-600 rounded-lg mt-2 shadow-2xl z-50 max-h-96 overflow-y-auto"
      @click.stop
    >
      <!-- 搜尋建議 -->
      <div v-if="suggestions.length > 0" class="p-2 border-b border-dark-600">
        <div class="text-xs text-gray-400 mb-2 px-3">搜尋建議</div>
        <button
          v-for="(suggestion, index) in suggestions"
          :key="`suggestion-${index}`"
          :class="[
            'w-full text-left px-3 py-2 rounded text-white text-sm flex items-center gap-2 transition-colors',
            selectedSuggestionIndex === index ? 'bg-primary-600' : 'hover:bg-dark-700'
          ]"
          @click="selectSuggestion(suggestion)"
          @mouseenter="selectedSuggestionIndex = index"
        >
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span class="flex-1 truncate">{{ suggestion }}</span>
        </button>
      </div>

      <!-- 最近搜尋 -->
      <div v-if="recentSearches.length > 0" class="p-2">
        <div class="text-xs text-gray-400 mb-2 px-3 flex items-center justify-between">
          <span>最近搜尋</span>
          <button
            @click="clearHistory"
            class="text-red-400 hover:text-red-300 text-xs transition-colors"
          >
            清除全部
          </button>
        </div>
        <button
          v-for="(item, index) in recentSearches"
          :key="`recent-${index}`"
          :class="[
            'w-full text-left px-3 py-2 rounded text-white text-sm flex items-center justify-between group transition-colors',
            selectedSuggestionIndex === suggestions.length + index ? 'bg-primary-600' : 'hover:bg-dark-700'
          ]"
          @click="selectSuggestion(item)"
          @mouseenter="selectedSuggestionIndex = suggestions.length + index"
        >
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="truncate">{{ item }}</span>
          </div>
          <button
            @click.stop="removeFromHistory(item)"
            class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all p-1"
            title="移除"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </button>
      </div>

      <!-- 空狀態 -->
      <div v-if="suggestions.length === 0 && recentSearches.length === 0" class="p-6 text-center text-gray-400">
        <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p class="text-sm">開始輸入以搜尋電影</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useDebouncedFunction } from '../../composables/useDebounce.js'

export default {
  name: 'SearchInput',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '搜尋電影...'
    },
    suggestions: {
      type: Array,
      default: () => []
    },
    recentSearches: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    debounceMs: {
      type: Number,
      default: 300
    }
  },
  emits: [
    'update:modelValue',
    'search',
    'input',
    'select-suggestion',
    'clear-history',
    'remove-from-history'
  ],
  setup(props, { emit }) {
    const searchInput = ref(null)
    const isFocused = ref(false)
    const showSuggestions = ref(false)
    const selectedSuggestionIndex = ref(-1)

    const searchQuery = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    const totalSuggestions = computed(() => [...props.suggestions, ...props.recentSearches])

    // 防抖動輸入處理
    const { debouncedFn: debouncedInput } = useDebouncedFunction(() => {
      emit('input', searchQuery.value)
    }, props.debounceMs)

    const handleInput = () => {
      selectedSuggestionIndex.value = -1
      debouncedInput()
    }

    const handleSubmit = () => {
      if (searchQuery.value.trim()) {
        emit('search', searchQuery.value.trim())
        closeSuggestions()
      }
    }

    const handleFocus = () => {
      isFocused.value = true
      showSuggestions.value = true
    }

    const handleBlur = () => {
      isFocused.value = false
      // 延遲關閉以允許點擊建議
      setTimeout(() => {
        showSuggestions.value = false
      }, 200)
    }

    const clearSearch = () => {
      searchQuery.value = ''
      selectedSuggestionIndex.value = -1
      emit('input', '')
      searchInput.value?.focus()
    }

    const selectSuggestion = (suggestion) => {
      searchQuery.value = suggestion
      emit('select-suggestion', suggestion)
      closeSuggestions()
    }

    const clearHistory = () => {
      emit('clear-history')
    }

    const removeFromHistory = (item) => {
      emit('remove-from-history', item)
    }

    const closeSuggestions = () => {
      showSuggestions.value = false
      selectedSuggestionIndex.value = -1
    }

    const navigateSuggestions = (direction) => {
      if (!showSuggestions.value || totalSuggestions.value.length === 0) return

      const maxIndex = totalSuggestions.value.length - 1
      selectedSuggestionIndex.value += direction

      if (selectedSuggestionIndex.value < 0) {
        selectedSuggestionIndex.value = maxIndex
      } else if (selectedSuggestionIndex.value > maxIndex) {
        selectedSuggestionIndex.value = 0
      }

      // 如果有選中的建議，按 Enter 時選擇它
      const handleKeyUp = (event) => {
        if (event.key === 'Enter' && selectedSuggestionIndex.value >= 0) {
          event.preventDefault()
          selectSuggestion(totalSuggestions.value[selectedSuggestionIndex.value])
        }
      }

      searchInput.value?.addEventListener('keyup', handleKeyUp, { once: true })
    }

    return {
      searchInput,
      searchQuery,
      isFocused,
      showSuggestions,
      selectedSuggestionIndex,
      handleInput,
      handleSubmit,
      handleFocus,
      handleBlur,
      clearSearch,
      selectSuggestion,
      clearHistory,
      removeFromHistory,
      closeSuggestions,
      navigateSuggestions
    }
  }
}
</script>