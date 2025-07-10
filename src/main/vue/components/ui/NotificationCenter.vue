<template>
  <Teleport to="body">
    <div
      v-if="notifications.length > 0"
      class="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full"
    >
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'notification-card p-4 rounded-lg shadow-2xl border backdrop-blur-sm transition-all duration-300',
            notificationClasses[notification.type]
          ]"
        >
          <div class="flex items-start">
            <!-- 圖標 -->
            <div class="flex-shrink-0 mr-3">
              <component
                :is="getIcon(notification.type)"
                :class="[
                  'w-5 h-5',
                  iconClasses[notification.type]
                ]"
              />
            </div>

            <!-- 內容 -->
            <div class="flex-1 min-w-0">
              <!-- 標題 -->
              <h4
                v-if="notification.title"
                class="font-medium text-sm mb-1"
                :class="textClasses[notification.type]"
              >
                {{ notification.title }}
              </h4>

              <!-- 訊息 -->
              <p
                class="text-sm"
                :class="notification.title ? 'text-gray-300' : textClasses[notification.type]"
              >
                {{ notification.message }}
              </p>

              <!-- 動作按鈕 -->
              <div
                v-if="notification.actions && notification.actions.length > 0"
                class="mt-3 flex gap-2"
              >
                <button
                  v-for="action in notification.actions"
                  :key="action.label"
                  @click="handleAction(action, notification)"
                  class="text-xs px-3 py-1 rounded font-medium transition-colors"
                  :class="actionClasses[notification.type]"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>

            <!-- 關閉按鈕 -->
            <button
              @click="removeNotification(notification.id)"
              class="flex-shrink-0 ml-2 p-1 rounded-md transition-colors"
              :class="closeButtonClasses[notification.type]"
              aria-label="關閉通知"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 進度條（如果有持續時間） -->
          <div
            v-if="notification.duration > 0 && !notification.persistent"
            class="mt-3 h-1 bg-black bg-opacity-20 rounded-full overflow-hidden"
          >
            <div
              class="h-full transition-all linear"
              :class="progressClasses[notification.type]"
              :style="{
                width: '100%',
                animation: `notification-progress ${notification.duration}ms linear forwards`
              }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script>
import { computed } from 'vue'
import { globalNotifications } from '../../composables/useNotifications.js'

export default {
  name: 'NotificationCenter',
  setup() {
    const { notifications, removeNotification } = globalNotifications

    const notificationClasses = {
      success: 'bg-green-900/90 border-green-700',
      error: 'bg-red-900/90 border-red-700',
      warning: 'bg-yellow-900/90 border-yellow-700',
      info: 'bg-blue-900/90 border-blue-700'
    }

    const textClasses = {
      success: 'text-green-100',
      error: 'text-red-100',
      warning: 'text-yellow-100',
      info: 'text-blue-100'
    }

    const iconClasses = {
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400'
    }

    const closeButtonClasses = {
      success: 'text-green-300 hover:text-green-100 hover:bg-green-800',
      error: 'text-red-300 hover:text-red-100 hover:bg-red-800',
      warning: 'text-yellow-300 hover:text-yellow-100 hover:bg-yellow-800',
      info: 'text-blue-300 hover:text-blue-100 hover:bg-blue-800'
    }

    const actionClasses = {
      success: 'bg-green-800 text-green-100 hover:bg-green-700',
      error: 'bg-red-800 text-red-100 hover:bg-red-700',
      warning: 'bg-yellow-800 text-yellow-100 hover:bg-yellow-700',
      info: 'bg-blue-800 text-blue-100 hover:bg-blue-700'
    }

    const progressClasses = {
      success: 'bg-green-400',
      error: 'bg-red-400',
      warning: 'bg-yellow-400',
      info: 'bg-blue-400'
    }

    const getIcon = (type) => {
      const icons = {
        success: {
          template: `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          `
        },
        error: {
          template: `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          `
        },
        warning: {
          template: `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          `
        },
        info: {
          template: `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          `
        }
      }
      return icons[type] || icons.info
    }

    const handleAction = (action, notification) => {
      if (action.handler) {
        action.handler()
      }
      if (action.dismiss !== false) {
        removeNotification(notification.id)
      }
    }

    return {
      notifications,
      removeNotification,
      notificationClasses,
      textClasses,
      iconClasses,
      closeButtonClasses,
      actionClasses,
      progressClasses,
      getIcon,
      handleAction
    }
  }
}
</script>

<style scoped>
.notification-card {
  background: rgba(17, 24, 39, 0.95);
}

/* 通知動畫 */
.notification-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  transform: translateX(100%) scale(0.8);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%) scale(0.8);
  opacity: 0;
}

/* 進度條動畫 */
@keyframes notification-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>