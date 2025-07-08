<template>
  <div class="min-h-screen bg-dark-900">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-primary-500 mb-4">
          🎬 Vue Movie Search App
        </h1>
        <p class="text-gray-400 text-lg mb-8">
          現代化的電影搜尋和收藏應用程式
        </p>
        
        <div class="max-w-md mx-auto">
          <router-link 
            to="/search"
            class="btn-primary inline-block text-xl px-8 py-4"
          >
            開始搜尋電影
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>