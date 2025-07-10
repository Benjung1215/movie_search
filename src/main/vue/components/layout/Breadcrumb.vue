<template>
  <nav v-if="breadcrumbs.length > 1" class="flex items-center space-x-2 text-sm text-gray-400 mb-6">
    <router-link
      v-for="(crumb, index) in breadcrumbs"
      :key="crumb.path"
      :to="crumb.path"
      :class="[
        'flex items-center',
        index === breadcrumbs.length - 1 
          ? 'text-white font-medium cursor-default' 
          : 'hover:text-primary-400 transition-colors'
      ]"
    >
      <!-- 圖標 -->
      <component
        v-if="crumb.icon"
        :is="crumb.icon"
        class="w-4 h-4 mr-2"
      />
      
      <!-- 文字 -->
      <span>{{ crumb.name }}</span>
      
      <!-- 分隔符 -->
      <svg
        v-if="index < breadcrumbs.length - 1"
        class="w-4 h-4 mx-2 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </router-link>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'Breadcrumb',
  setup() {
    const route = useRoute()

    const breadcrumbs = computed(() => {
      const crumbs = []
      
      // 添加首頁
      crumbs.push({
        name: '首頁',
        path: '/',
        icon: 'HomeIcon'
      })

      // 根據當前路由添加麵包屑
      switch (route.name) {
        case 'Search':
          crumbs.push({
            name: '搜尋',
            path: '/search'
          })
          break
          
        case 'AdvancedSearch':
          crumbs.push(
            {
              name: '搜尋',
              path: '/search'
            },
            {
              name: '進階搜尋',
              path: '/search/advanced'
            }
          )
          break
          
        case 'Genres':
          crumbs.push({
            name: '類型',
            path: '/genres'
          })
          break
          
        case 'GenreMovies':
          crumbs.push(
            {
              name: '類型',
              path: '/genres'
            },
            {
              name: route.params.genreName || '類型電影',
              path: route.fullPath
            }
          )
          break
          
        case 'MovieDetail':
          crumbs.push(
            {
              name: '搜尋',
              path: '/search'
            },
            {
              name: route.params.movieTitle || '電影詳情',
              path: route.fullPath
            }
          )
          break
          
        case 'Favorites':
          crumbs.push({
            name: '收藏',
            path: '/favorites'
          })
          break
          
        case 'Watchlist':
          crumbs.push({
            name: '觀看清單',
            path: '/watchlist'
          })
          break
          
        case 'Ratings':
          crumbs.push({
            name: '我的評分',
            path: '/ratings'
          })
          break
          
        case 'Profile':
          crumbs.push({
            name: '個人資料',
            path: '/profile'
          })
          break
      }

      return crumbs
    })

    return {
      breadcrumbs
    }
  }
}
</script>

<style scoped>
/* 簡單的圖標組件 */
.HomeIcon {
  width: 1rem;
  height: 1rem;
}
</style>