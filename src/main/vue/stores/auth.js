import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../services/firebase.js'

export const useAuthStore = defineStore('auth', () => {
  // 狀態
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const isInitialized = ref(false)

  // 計算屬性
  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.displayName || '')
  const userEmail = computed(() => user.value?.email || '')
  const userPhotoURL = computed(() => user.value?.photoURL || '')

  // 設定載入狀態
  const setLoading = (state) => {
    loading.value = state
  }

  // 設定錯誤
  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  // 清除錯誤
  const clearError = () => {
    error.value = null
  }

  // Google 登入
  const signInWithGoogle = async () => {
    setLoading(true)
    clearError()

    try {
      const provider = new GoogleAuthProvider()
      provider.addScope('profile')
      provider.addScope('email')
      
      const result = await signInWithPopup(auth, provider)
      user.value = result.user
      
      console.log('Google 登入成功:', result.user.displayName)
      return result.user
    } catch (err) {
      console.error('Google 登入錯誤:', err)
      
      // 處理特定錯誤
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError('登入視窗被關閉')
          break
        case 'auth/popup-blocked':
          setError('彈出視窗被阻擋，請允許彈出視窗')
          break
        case 'auth/network-request-failed':
          setError('網路連接錯誤，請檢查網路連接')
          break
        default:
          setError('Google 登入失敗，請稍後再試')
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  // GitHub 登入
  const signInWithGitHub = async () => {
    setLoading(true)
    clearError()

    try {
      const provider = new GithubAuthProvider()
      provider.addScope('user:email')
      
      const result = await signInWithPopup(auth, provider)
      user.value = result.user
      
      console.log('GitHub 登入成功:', result.user.displayName)
      return result.user
    } catch (err) {
      console.error('GitHub 登入錯誤:', err)
      
      // 處理特定錯誤
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError('登入視窗被關閉')
          break
        case 'auth/popup-blocked':
          setError('彈出視窗被阻擋，請允許彈出視窗')
          break
        case 'auth/account-exists-with-different-credential':
          setError('此信箱已使用其他登入方式註冊')
          break
        case 'auth/network-request-failed':
          setError('網路連接錯誤，請檢查網路連接')
          break
        default:
          setError('GitHub 登入失敗，請稍後再試')
      }
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 登出
  const logout = async () => {
    setLoading(true)
    clearError()

    try {
      await signOut(auth)
      user.value = null
      console.log('登出成功')
    } catch (err) {
      console.error('登出錯誤:', err)
      setError('登出失敗，請稍後再試')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 初始化認證狀態監聽
  const initializeAuth = () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser
        isInitialized.value = true
        
        if (firebaseUser) {
          console.log('用戶已登入:', firebaseUser.displayName)
        } else {
          console.log('用戶未登入')
        }
        
        // 第一次初始化時 resolve
        if (!isInitialized.value) {
          resolve(firebaseUser)
        }
      })

      // 返回取消訂閱函數以便清理
      return unsubscribe
    })
  }

  // 重新載入用戶資料
  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload()
      user.value = auth.currentUser
    }
  }

  // 取得用戶 ID Token（用於 API 請求）
  const getUserToken = async () => {
    if (auth.currentUser) {
      try {
        return await auth.currentUser.getIdToken()
      } catch (err) {
        console.error('獲取用戶 token 錯誤:', err)
        return null
      }
    }
    return null
  }

  return {
    // 狀態
    user,
    loading,
    error,
    isInitialized,

    // 計算屬性
    isAuthenticated,
    userDisplayName,
    userEmail,
    userPhotoURL,

    // 方法
    signInWithGoogle,
    signInWithGitHub,
    logout,
    initializeAuth,
    refreshUser,
    getUserToken,
    setLoading,
    setError,
    clearError
  }
})