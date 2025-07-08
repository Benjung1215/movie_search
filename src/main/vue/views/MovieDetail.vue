<template>
  <div class="min-h-screen bg-dark-900">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-primary-500 mb-8">
        電影詳情
      </h1>
      
      <div class="text-center text-gray-400">
        電影 ID: {{ $route.params.id }}
        <br>
        電影詳情頁面即將完成...
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MovieDetail'
}
</script>