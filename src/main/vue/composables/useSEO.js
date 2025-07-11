import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export function useSEO() {
  const router = useRouter()
  const route = useRoute()
  
  const defaultMeta = {
    title: 'Vue Movie Search - Modern Movie Discovery & Collection App',
    description: 'Discover, search, and collect your favorite movies with our modern Vue.js application. Features advanced search, personal collections, ratings, and recommendations powered by TMDB API.',
    keywords: 'movie search, movie database, vue.js app, tmdb api, movie collection, film discovery, movie ratings, cinema app, responsive design, progressive web app',
    ogImage: 'https://vue-movie-search.vercel.app/og-image.jpg',
    twitterImage: 'https://vue-movie-search.vercel.app/twitter-image.jpg'
  }
  
  const currentMeta = ref({ ...defaultMeta })
  
  // Function to update document head
  const updateHead = () => {
    // Update document title
    document.title = currentMeta.value.title
    
    // Update meta description
    updateMeta('description', currentMeta.value.description)
    updateMeta('keywords', currentMeta.value.keywords)
    
    // Update Open Graph meta tags
    updateMeta('og:title', currentMeta.value.title, 'property')
    updateMeta('og:description', currentMeta.value.description, 'property')
    updateMeta('og:image', currentMeta.value.ogImage, 'property')
    updateMeta('og:url', window.location.href, 'property')
    
    // Update Twitter meta tags
    updateMeta('twitter:title', currentMeta.value.title, 'property')
    updateMeta('twitter:description', currentMeta.value.description, 'property')
    updateMeta('twitter:image', currentMeta.value.twitterImage, 'property')
    
    // Update canonical URL
    updateCanonical(window.location.href)
  }
  
  // Helper function to update meta tags
  const updateMeta = (name, content, attribute = 'name') => {
    let element = document.querySelector(`meta[${attribute}="${name}"]`)
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attribute, name)
      document.head.appendChild(element)
    }
    element.setAttribute('content', content)
  }
  
  // Helper function to update canonical URL
  const updateCanonical = (url) => {
    let element = document.querySelector('link[rel="canonical"]')
    if (!element) {
      element = document.createElement('link')
      element.setAttribute('rel', 'canonical')
      document.head.appendChild(element)
    }
    element.setAttribute('href', url)
  }
  
  // Function to set SEO data
  const setSEO = (seoData) => {
    currentMeta.value = {
      ...defaultMeta,
      ...seoData
    }
    updateHead()
  }
  
  // Function to generate SEO data for different pages
  const generatePageSEO = (pageName, customData = {}) => {
    const pageConfigs = {
      home: {
        title: 'Vue Movie Search - Discover Your Next Favorite Movie',
        description: 'Explore thousands of movies with our powerful search engine. Create personal collections, rate movies, and discover new favorites with our modern Vue.js movie database app.',
        keywords: 'movie search, movie discovery, film database, movie collection, vue movie app, tmdb movies'
      },
      search: {
        title: 'Search Movies - Vue Movie Search',
        description: 'Search through thousands of movies using our advanced search filters. Find movies by title, genre, year, rating, and more.',
        keywords: 'movie search, film search, movie finder, search movies online, movie database search'
      },
      favorites: {
        title: 'My Favorite Movies - Vue Movie Search',
        description: 'Manage your personal collection of favorite movies. Keep track of movies you love and want to recommend to others.',
        keywords: 'favorite movies, movie collection, personal movie list, movie favorites'
      },
      watchlist: {
        title: 'My Watchlist - Vue Movie Search',
        description: 'Keep track of movies you want to watch and movies you\'ve already seen. Organize your viewing experience.',
        keywords: 'movie watchlist, movies to watch, movie tracker, viewing list'
      },
      genres: {
        title: 'Movie Genres - Vue Movie Search',
        description: 'Browse movies by genre. Discover action, comedy, drama, horror, sci-fi, and more movie categories.',
        keywords: 'movie genres, film categories, action movies, comedy movies, drama movies'
      },
      profile: {
        title: 'My Profile - Vue Movie Search',
        description: 'Manage your movie preferences, view your activity, and customize your movie discovery experience.',
        keywords: 'movie profile, user preferences, movie settings'
      },
      ratings: {
        title: 'My Movie Ratings - Vue Movie Search',
        description: 'View and manage your movie ratings. See what movies you\'ve rated and discover new movies based on your preferences.',
        keywords: 'movie ratings, film ratings, movie reviews, personal movie scores'
      }
    }
    
    const config = pageConfigs[pageName] || defaultMeta
    setSEO({
      ...config,
      ...customData
    })
  }
  
  // Function to generate movie detail SEO
  const generateMovieSEO = (movie) => {
    if (!movie) return
    
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : ''
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'
    
    setSEO({
      title: `${movie.title}${releaseYear ? ` (${releaseYear})` : ''} - Vue Movie Search`,
      description: movie.overview || `Watch ${movie.title}${releaseYear ? ` (${releaseYear})` : ''}. Rating: ${rating}/10. ${movie.overview ? movie.overview.substring(0, 120) + '...' : 'Discover more about this movie on Vue Movie Search.'}`,
      keywords: `${movie.title}, ${releaseYear}, movie, film, cinema, ${movie.genres?.map(g => g.name).join(', ') || 'movies'}`,
      ogImage: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : defaultMeta.ogImage,
      twitterImage: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : defaultMeta.twitterImage
    })
  }
  
  // Function to generate genre SEO
  const generateGenreSEO = (genre, movies = []) => {
    if (!genre) return
    
    const movieTitles = movies.slice(0, 5).map(m => m.title).join(', ')
    
    setSEO({
      title: `${genre.name} Movies - Vue Movie Search`,
      description: `Discover the best ${genre.name.toLowerCase()} movies. ${movieTitles ? `Popular titles include: ${movieTitles}` : ''} Browse our collection of ${genre.name.toLowerCase()} films.`,
      keywords: `${genre.name.toLowerCase()} movies, ${genre.name.toLowerCase()} films, movie genre, film category, ${genre.name}`
    })
  }
  
  // Watch for route changes
  watch(() => route.path, () => {
    // Generate SEO based on current route
    const routeName = route.name?.toLowerCase() || 'home'
    generatePageSEO(routeName)
  }, { immediate: true })
  
  onMounted(() => {
    updateHead()
  })
  
  return {
    setSEO,
    generatePageSEO,
    generateMovieSEO,
    generateGenreSEO,
    currentMeta
  }
}