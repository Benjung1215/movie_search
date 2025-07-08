<template>
  <div class="flex items-center gap-1">
    <!-- 星星評分 -->
    <div class="flex items-center">
      <button
        v-for="star in 5"
        :key="star"
        @click="setRating(star)"
        @mouseenter="hoverRating = star"
        @mouseleave="hoverRating = 0"
        :disabled="disabled"
        class="focus:outline-none transition-colors duration-150"
        :class="disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'"
        :title="`${star} 星`"
      >
        <svg 
          class="w-5 h-5 transition-all duration-150"
          :class="getStarClass(star)"
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    </div>
    
    <!-- 評分文字 -->
    <span 
      v-if="showText && (modelValue > 0 || hoverRating > 0)" 
      class="text-sm ml-2"
      :class="textColor"
    >
      {{ getRatingText(hoverRating || modelValue) }}
    </span>
    
    <!-- 重置按鈕 -->
    <button
      v-if="showClear && modelValue > 0 && !disabled"
      @click="clearRating"
      class="ml-2 text-gray-400 hover:text-red-500 transition-colors"
      title="清除評分"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'StarRating',
  props: {
    modelValue: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showText: {
      type: Boolean,
      default: true
    },
    showClear: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'md', // sm, md, lg
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    color: {
      type: String,
      default: 'yellow', // yellow, orange, red
      validator: (value) => ['yellow', 'orange', 'red'].includes(value)
    }
  },
  emits: ['update:modelValue', 'rate'],
  setup(props, { emit }) {
    const hoverRating = ref(0)
    
    // 計算屬性
    const textColor = computed(() => {
      const rating = hoverRating.value || props.modelValue
      if (rating >= 4) return 'text-green-500'
      if (rating >= 3) return 'text-yellow-500'
      if (rating >= 2) return 'text-orange-500'
      return 'text-red-500'
    })
    
    // 方法
    const getStarClass = (star) => {
      const currentRating = hoverRating.value || props.modelValue
      const isActive = star <= currentRating
      
      let colorClass = ''
      if (isActive) {
        switch (props.color) {
          case 'yellow':
            colorClass = 'text-yellow-400'
            break
          case 'orange':
            colorClass = 'text-orange-400'
            break
          case 'red':
            colorClass = 'text-red-400'
            break
        }
      } else {
        colorClass = props.disabled ? 'text-gray-400' : 'text-gray-300'
      }
      
      return [
        colorClass,
        {
          'w-4 h-4': props.size === 'sm',
          'w-5 h-5': props.size === 'md',
          'w-6 h-6': props.size === 'lg'
        }
      ]
    }
    
    const getRatingText = (rating) => {
      const texts = {
        1: '很差',
        2: '一般',
        3: '不錯',
        4: '很好',
        5: '極佳'
      }
      return texts[rating] || ''
    }
    
    const setRating = (rating) => {
      if (props.disabled) return
      
      emit('update:modelValue', rating)
      emit('rate', rating)
    }
    
    const clearRating = () => {
      if (props.disabled) return
      
      emit('update:modelValue', 0)
      emit('rate', 0)
    }
    
    return {
      hoverRating,
      textColor,
      getStarClass,
      getRatingText,
      setRating,
      clearRating
    }
  }
}
</script>

<style scoped>
/* 動畫效果 */
button svg {
  transition: transform 0.15s ease-in-out;
}

button:not(:disabled):hover svg {
  transform: scale(1.1);
}

button:not(:disabled):active svg {
  transform: scale(0.95);
}
</style>