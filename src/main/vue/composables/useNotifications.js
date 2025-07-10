import { ref, reactive } from 'vue'

const notifications = ref([])
let idCounter = 0

export function useNotifications() {
  const addNotification = (notification) => {
    const id = ++idCounter
    const newNotification = reactive({
      id,
      type: 'info', // info, success, warning, error
      title: '',
      message: '',
      duration: 5000,
      persistent: false,
      actions: [],
      ...notification
    })

    notifications.value.push(newNotification)

    // 自動移除通知（除非設為持久）
    if (!newNotification.persistent && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value.splice(0)
  }

  // 快捷方法
  const success = (message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    })
  }

  const error = (message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      duration: 7000, // 錯誤訊息顯示更久
      ...options
    })
  }

  const warning = (message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    })
  }

  const info = (message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    })
  }

  // 電影相關的快捷通知
  const movieAdded = (movieTitle, listType) => {
    const messages = {
      favorites: `已將「${movieTitle}」加入收藏`,
      watchlist: `已將「${movieTitle}」加入觀看清單`,
      ratings: `已為「${movieTitle}」評分`
    }

    return success(messages[listType] || `已添加「${movieTitle}」`)
  }

  const movieRemoved = (movieTitle, listType) => {
    const messages = {
      favorites: `已將「${movieTitle}」從收藏中移除`,
      watchlist: `已將「${movieTitle}」從觀看清單中移除`,
      ratings: `已移除「${movieTitle}」的評分`
    }

    return info(messages[listType] || `已移除「${movieTitle}」`)
  }

  const searchCompleted = (query, resultCount) => {
    if (resultCount === 0) {
      return warning(`未找到「${query}」的相關電影`, {
        actions: [
          {
            label: '瀏覽熱門電影',
            handler: () => {
              // 這裡可以觸發導航到熱門電影
            }
          }
        ]
      })
    } else {
      return success(`找到 ${resultCount} 部「${query}」相關電影`)
    }
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
    movieAdded,
    movieRemoved,
    searchCompleted
  }
}

// 全域通知實例
export const globalNotifications = useNotifications()