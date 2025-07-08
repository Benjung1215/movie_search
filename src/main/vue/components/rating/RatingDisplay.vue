<template>
  <div class="flex items-center gap-2">
    <!-- 用戶評分 -->
    <div v-if="userRating > 0" class="flex items-center gap-1">
      <span class="text-xs text-gray-400">我的評分:</span>
      <div class="flex items-center">
        <svg 
          v-for="star in 5"
          :key="`user-${star}`"
          class="w-3 h-3"
          :class="star <= userRating ? 'text-yellow-400' : 'text-gray-600'"
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span class="text-xs text-yellow-400 ml-1">{{ userRating }}</span>
      </div>
    </div>
    
    <!-- 分隔符 -->
    <span v-if="userRating > 0 && showTmdbRating" class="text-gray-600">|</span>
    
    <!-- TMDB 評分 -->
    <div v-if="showTmdbRating" class="flex items-center gap-1">
      <span class="text-xs text-gray-400">TMDB:</span>
      <div class="flex items-center">
        <svg class="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span class="text-xs text-blue-400 ml-1">{{ formatTmdbRating(tmdbRating) }}</span>
        <span v-if="voteCount" class="text-xs text-gray-500 ml-1">({{ formatVoteCount(voteCount) }})</span>
      </div>
    </div>
    
    <!-- 快速評分按鈕 -->
    <button
      v-if="showQuickRate && !readonly"
      @click="$emit('quick-rate')"
      class="text-xs text-primary-500 hover:text-primary-400 transition-colors ml-2"
      title="快速評分"
    >
      {{ userRating > 0 ? '修改評分' : '評分' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'RatingDisplay',
  props: {
    userRating: {
      type: Number,
      default: 0
    },
    tmdbRating: {
      type: Number,
      default: 0
    },
    voteCount: {
      type: Number,
      default: 0
    },
    showTmdbRating: {
      type: Boolean,
      default: true
    },
    showQuickRate: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['quick-rate'],
  setup(props) {
    // 格式化 TMDB 評分
    const formatTmdbRating = (rating) => {
      return rating ? rating.toFixed(1) : 'N/A'
    }
    
    // 格式化投票數
    const formatVoteCount = (count) => {
      if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`
      } else if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`
      }
      return count.toString()
    }
    
    return {
      formatTmdbRating,
      formatVoteCount
    }
  }
}
</script>

<style scoped>
/* 小尺寸星星的微調 */
svg {
  flex-shrink: 0;
}
</style>