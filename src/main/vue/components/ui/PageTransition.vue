<template>
  <Transition
    :name="transitionName"
    mode="out-in"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
  >
    <slot />
  </Transition>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'PageTransition',
  props: {
    name: {
      type: String,
      default: 'fade'
    },
    duration: {
      type: Number,
      default: 300
    }
  },
  emits: [
    'before-enter',
    'enter', 
    'after-enter',
    'before-leave',
    'leave',
    'after-leave'
  ],
  setup(props, { emit }) {
    const route = useRoute()

    const transitionName = computed(() => {
      // 根據路由變化選擇不同的過渡效果
      if (route.meta?.transition) {
        return route.meta.transition
      }
      return props.name
    })

    const onBeforeEnter = (el) => {
      emit('before-enter', el)
    }

    const onEnter = (el, done) => {
      emit('enter', el, done)
      setTimeout(done, props.duration)
    }

    const onAfterEnter = (el) => {
      emit('after-enter', el)
    }

    const onBeforeLeave = (el) => {
      emit('before-leave', el)
    }

    const onLeave = (el, done) => {
      emit('leave', el, done)
      setTimeout(done, props.duration)
    }

    const onAfterLeave = (el) => {
      emit('after-leave', el)
    }

    return {
      transitionName,
      onBeforeEnter,
      onEnter,
      onAfterEnter,
      onBeforeLeave,
      onLeave,
      onAfterLeave
    }
  }
}
</script>

<style scoped>
/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滑入效果 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 縮放效果 */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* 彈性效果 */
.bounce-enter-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.bounce-leave-active {
  transition: all 0.3s ease-in;
}

.bounce-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.bounce-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 從上方滑入 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>