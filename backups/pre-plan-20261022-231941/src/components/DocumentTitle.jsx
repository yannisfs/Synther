import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Sets <title> from the locale, re-running whenever the language changes.
// Only owns the title on the home route; capability pages set their own title
// and would otherwise be overwritten here on a language change.
const DocumentTitle = () => {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (pathname === '/') {
      document.title = t('title.home')
    }
  }, [t, i18n.resolvedLanguage, pathname])

  return null
}

export default DocumentTitle