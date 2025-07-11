import { createI18n } from 'vue-i18n'

// Import English locale messages
import en from './en'

// Create i18n instance with English only
const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en
  },
  legacy: false, // Use Composition API mode
  globalInjection: true // Make $t available globally
})

// Set document language
document.documentElement.lang = 'en'

export default i18n