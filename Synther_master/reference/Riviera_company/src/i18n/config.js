import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import de from '../locales/de.json';
import en from '../locales/en.json';

// Languages we ship. Anything else falls back to 'de'.
export const SUPPORTED_LANGUAGES = ['de', 'en'];
export const DEFAULT_LANGUAGE = 'de';

// Order matters for the switcher and the hreflang tag list.
export const LANGUAGE_ORDER = ['de', 'en'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,

    // Detection order:
    //   1. localStorage 'i18nextLng' — set when the user clicks DE | EN
    //   2. navigator.language — first visit only
    //   3. fallback ('de')
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: { escapeValue: false }, // React already escapes
    react: { useSuspense: false },
  });

// Reflect current language on <html lang> so screen readers + browsers
// pick the right hyphenation/dictionary. Legal pages stay 'de' regardless.
const LEGAL_PREFIX = '/legal/';
i18n.on('languageChanged', (lng) => {
  const path = window.location.pathname;
  if (path.startsWith(LEGAL_PREFIX)) {
    document.documentElement.setAttribute('lang', 'de');
    return;
  }
  document.documentElement.setAttribute('lang', lng);
});

// Set initial value on first load.
if (typeof document !== 'undefined') {
  const path = window.location.pathname;
  document.documentElement.setAttribute(
    'lang',
    path.startsWith(LEGAL_PREFIX) ? 'de' : i18n.language
  );
}

export default i18n;