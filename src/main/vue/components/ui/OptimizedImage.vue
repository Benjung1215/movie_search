<template>
  <div 
    :class="containerClass"
    :style="{ aspectRatio: aspectRatio }"
  >
    <!-- 載入狀態 -->
    <div 
      v-if="isLoading" 
      class="absolute inset-0 bg-dark-700 flex items-center justify-center animate-pulse"
    >
      <div class="w-8 h-8 text-gray-400">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div 
      v-else-if="hasError" 
      class="absolute inset-0 bg-dark-700 flex items-center justify-center"
    >
      <div class="text-center text-gray-400">
        <div class="w-8 h-8 mx-auto mb-2">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="text-xs">載入失敗</div>
      </div>
    </div>

    <!-- 圖片 -->
    <img
      v-else
      :src="currentSrc"
      :alt="alt"
      :class="imageClass"
      @load="handleLoad"
      @error="handleError"
      loading="lazy"
    />

    <!-- 遮罩層 -->
    <div v-if="overlay" :class="overlayClass">
      <slot name="overlay" />
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useImageLoader } from '../../composables/useImageLoader.js'

export default {
  name: 'OptimizedImage',
  props: {
    src: {
      type: String,
      required: true
    },
    fallbackSrc: {
      type: String,
      default: '/placeholder-poster.jpg'
    },
    alt: {
      type: String,
      default: ''
    },
    aspectRatio: {
      type: String,
      default: 'auto'
    },
    containerClass: {
      type: String,
      default: 'relative overflow-hidden'
    },
    imageClass: {
      type: String,
      default: 'w-full h-full object-cover'
    },
    overlay: {
      type: Boolean,
      default: false
    },
    overlayClass: {
      type: String,
      default: 'absolute inset-0'
    },
    preload: {
      type: Boolean,
      default: false
    }
  },
  emits: ['load', 'error'],
  setup(props, { emit }) {
    const { loading, error, loadImage, isImageCached } = useImageLoader()
    
    const currentSrc = ref(props.fallbackSrc)
    const isLoading = ref(true)
    const hasError = ref(false)
    const loadAttempts = ref(0)
    const maxAttempts = 2

    // 載入圖片
    const loadImageSrc = async (src) => {
      if (!src || loadAttempts.value >= maxAttempts) {
        handleError()
        return
      }

      // 如果圖片已快取，直接載入
      if (isImageCached(src)) {
        currentSrc.value = src
        isLoading.value = false
        hasError.value = false
        return
      }

      isLoading.value = true
      hasError.value = false
      loadAttempts.value++

      try {
        await loadImage(src)
        currentSrc.value = src
        isLoading.value = false
        emit('load')
      } catch (err) {
        if (loadAttempts.value < maxAttempts) {
          // 重試
          setTimeout(() => loadImageSrc(src), 1000)
        } else {
          handleError()
        }
      }
    }

    const handleLoad = () => {
      isLoading.value = false
      hasError.value = false
      emit('load')
    }

    const handleError = () => {
      isLoading.value = false
      hasError.value = true
      
      if (currentSrc.value !== props.fallbackSrc) {
        currentSrc.value = props.fallbackSrc
      }
      
      emit('error')
    }

    // 監聽 src 變化
    watch(() => props.src, (newSrc) => {
      loadAttempts.value = 0
      if (newSrc && newSrc !== props.fallbackSrc) {
        loadImageSrc(newSrc)
      } else {
        currentSrc.value = props.fallbackSrc
        isLoading.value = false
        hasError.value = false
      }
    }, { immediate: true })

    // 預載入
    onMounted(() => {
      if (props.preload && props.src) {
        loadImageSrc(props.src)
      }
    })

    return {
      currentSrc,
      isLoading,
      hasError,
      handleLoad,
      handleError
    }
  }
}
</script>