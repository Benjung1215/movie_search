import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue')
  },
  {
    path: '/search/advanced',
    name: 'AdvancedSearch',
    component: () => import('../views/AdvancedSearch.vue')
  },
  {
    path: '/genres',
    name: 'Genres',
    component: () => import('../views/Genres.vue')
  },
  {
    path: '/genres/:id',
    name: 'GenreMovies',
    component: () => import('../views/GenreMovies.vue')
  },
  {
    path: '/movie/:id',
    name: 'MovieDetail',
    component: () => import('../views/MovieDetail.vue')
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('../views/Favorites.vue')
  },
  {
    path: '/watchlist',
    name: 'Watchlist',
    component: () => import('../views/Watchlist.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router