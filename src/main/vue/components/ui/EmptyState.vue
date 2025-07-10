<template>
  <div class="text-center py-16">
    <!-- 圖標 -->
    <div class="w-24 h-24 mx-auto mb-6 relative">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-600/20 rounded-full"></div>
      <div class="absolute inset-2 bg-dark-800 rounded-full flex items-center justify-center">
        <component :is="iconComponent" class="w-8 h-8 text-gray-400" />
      </div>
    </div>

    <!-- 標題 -->
    <h3 class="text-xl font-semibold text-white mb-3">
      {{ title }}
    </h3>

    <!-- 描述 -->
    <p class="text-gray-400 mb-8 max-w-md mx-auto">
      {{ description }}
    </p>

    <!-- 行動按鈕 -->
    <div v-if="actions.length > 0" class="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        v-for="action in actions"
        :key="action.label"
        @click="action.handler"
        :class="[
          'btn transition-all duration-300 transform hover:scale-105',
          action.primary ? 'btn-primary' : 'btn-secondary'
        ]"
      >
        <component v-if="action.icon" :is="action.icon" class="w-4 h-4 mr-2" />
        {{ action.label }}
      </button>
    </div>

    <!-- 額外插槽 -->
    <div v-if="$slots.default" class="mt-8">
      <slot />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'EmptyState',
  props: {
    type: {
      type: String,
      default: 'default',
      validator: (value) => [
        'default',
        'search',
        'favorites',
        'watchlist',
        'ratings',
        'error',
        'loading'
      ].includes(value)
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    actions: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const emptyStateConfig = {
      default: {
        icon: 'InboxIcon',
        title: '沒有內容',
        description: '這裡還沒有任何內容'
      },
      search: {
        icon: 'SearchIcon',
        title: '開始探索電影世界',
        description: '輸入電影名稱或關鍵字，發現你想看的精彩電影'
      },
      favorites: {
        icon: 'HeartIcon',
        title: '還沒有收藏的電影',
        description: '點擊心形圖標將喜愛的電影加入收藏，方便日後查看'
      },
      watchlist: {
        icon: 'BookmarkIcon',
        title: '觀看清單是空的',
        description: '將想看的電影加入觀看清單，建立你的專屬片單'
      },
      ratings: {
        icon: 'StarIcon',
        title: '尚未評分任何電影',
        description: '為觀看過的電影評分，記錄你的觀影心得'
      },
      error: {
        icon: 'ExclamationIcon',
        title: '發生錯誤',
        description: '抱歉，載入內容時出現問題，請稍後再試'
      },
      loading: {
        icon: 'LoadingIcon',
        title: '載入中...',
        description: '正在為您準備精彩內容'
      }
    }

    const config = computed(() => emptyStateConfig[props.type] || emptyStateConfig.default)

    const iconComponent = computed(() => {
      const iconMap = {
        InboxIcon: {
          template: `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          `
        },
        SearchIcon: {
          template: `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          `
        },
        HeartIcon: {
          template: `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          `
        },
        BookmarkIcon: {
          template: `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          `
        },
        StarIcon: {
          template: `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          `
        },
        ExclamationIcon: {
          template: `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          `
        },
        LoadingIcon: {
          template: `
            <svg class="animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          `
        }
      }

      return iconMap[config.value.icon] || iconMap.InboxIcon
    })

    const computedTitle = computed(() => props.title || config.value.title)
    const computedDescription = computed(() => props.description || config.value.description)

    return {
      iconComponent,
      title: computedTitle,
      description: computedDescription
    }
  }
}
</script>