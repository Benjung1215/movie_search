<template>
  <div class="min-h-screen bg-dark-900">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-primary-500 mb-8">
        電影搜尋
      </h1>
      
      <div class="max-w-lg mx-auto">
        <input 
          type="text" 
          placeholder="搜尋電影..."
          class="input w-full text-lg"
          v-model="searchQuery"
        >
      </div>
      
      <div v-if="searchQuery" class="mt-8 text-center text-gray-400">
        搜尋結果 "{{ searchQuery }}" 即將顯示...
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Search',
  setup() {
    const searchQuery = ref('')
    
    return {
      searchQuery
    }
  }
}
</script>