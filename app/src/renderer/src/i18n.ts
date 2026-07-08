import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import translationEN from './components/translate/en.json'
import translationJP from './components/translate/jp.json'

const resources = {
  en: {
    translation: translationEN
  },
  ja: {
    translation: translationJP
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'ja',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
