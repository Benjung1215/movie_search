<template>
  <div :class="containerClass">
    <!-- 電影卡片骨架 -->
    <div v-if="type === 'movie-card'" class="card">
      <div class="w-full h-80 bg-dark-700 animate-pulse"></div>
      <div class="p-4 space-y-3">
        <div class="h-5 bg-dark-700 rounded animate-pulse"></div>
        <div class="space-y-2">
          <div class="h-3 bg-dark-700 rounded animate-pulse"></div>
          <div class="h-3 bg-dark-700 rounded w-3/4 animate-pulse"></div>
        </div>
        <div class="flex justify-between">
          <div class="h-3 bg-dark-700 rounded w-16 animate-pulse"></div>
          <div class="h-3 bg-dark-700 rounded w-12 animate-pulse"></div>
        </div>
      </div>
    </div>

    <!-- 文字行骨架 -->
    <div v-else-if="type === 'text'" class="space-y-2">
      <div 
        v-for="line in lines"
        :key="line"
        :class="[
          'h-4 bg-dark-700 rounded animate-pulse',
          line === lines ? 'w-3/4' : 'w-full'
        ]"
      ></div>
    </div>

    <!-- 圓形頭像骨架 -->
    <div v-else-if="type === 'avatar'" :class="avatarClass">
      <div class="w-full h-full bg-dark-700 rounded-full animate-pulse"></div>
    </div>

    <!-- 搜尋結果列表骨架 -->
    <div v-else-if="type === 'search-results'" class="space-y-4">
      <div 
        v-for="item in count"
        :key="item"
        class="flex gap-4"
      >
        <div class="w-16 h-24 bg-dark-700 rounded animate-pulse flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-5 bg-dark-700 rounded animate-pulse"></div>
          <div class="h-3 bg-dark-700 rounded w-3/4 animate-pulse"></div>
          <div class="h-3 bg-dark-700 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    </div>

    <!-- 自定義骨架 -->
    <div v-else class="space-y-3">
      <div 
        v-for="i in count"
        :key="i"
        :class="skeletonClass"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonLoader',
  props: {
    type: {
      type: String,
      default: 'text',
      validator: (value) => [
        'movie-card',
        'text', 
        'avatar',
        'search-results',
        'custom'
      ].includes(value)
    },
    lines: {
      type: Number,
      default: 3
    },
    count: {
      type: Number,
      default: 1
    },
    containerClass: {
      type: String,
      default: ''
    },
    skeletonClass: {
      type: String,
      default: 'h-4 bg-dark-700 rounded animate-pulse'
    },
    avatarClass: {
      type: String,
      default: 'w-12 h-12'
    }
  }
}
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>