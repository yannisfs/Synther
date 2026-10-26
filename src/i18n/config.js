// i18n setup, mirroring the Riviera reference: i18next + react-i18next +
// browser language detector. All UI text lives in src/locales/<lang>.json
// and is read via the useTranslation() hook / t() in components.
//
// English is the site's primary language. German (de.json) is also loaded
// as a resource so the /imprint page can render the legally-required German
// legal text — but SUPPORTED_LANGUAGES stays ['en'] so the browser's
// navigator.language never auto-switches the site to German. The imprint
// page reads its DE blocks directly from the German namespace via a
// fixed-language t() call (see ImprintPage.jsx).

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from '../locales/en.json'
import de from '../locales/de.json'

// Languages we expose to the runtime. Anything else falls back to DEFAULT_LANGUAGE.
export const SUPPORTED_LANGUAGES = ['en']
export const DEFAULT_LANGUAGE = 'en'
// Order matters for any future switcher + hreflang tag list.
export const LANGUAGE_ORDER = ['en']

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,

    // Detection order:
    //   1. localStorage 'i18nextLng' — set when a user picks a language
    //   2. navigator.language — first visit only
    //   3. fallback ('en')
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: { escapeValue: false }, // React already escapes
    react: { useSuspense: false },
  })

// Reflect the current language on <html lang> so screen readers + browsers
// pick the right hyphenation/dictionary.
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', lng)
  }
})

// Set the initial value on first load.
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('lang', i18n.language || DEFAULT_LANGUAGE)
}

export default i18n