import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import usePageSeo from '../hooks/usePageSeo.js'

// Sets <title> from the locale, re-running whenever the language changes.
// Only owns the title on the home route; capability pages set their own title
// and would otherwise be overwritten here on a language change.
//
// S35: the home route also owns its own og:title / twitter:title /
// og:description / twitter:description. index.html ships them as static
// values ("Synther"), which is why every subpage used to share the
// homepage's social card. Each page now derives its own.
const DocumentTitle = () => {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (pathname === '/') {
      document.title = t('title.home')
    }
  }, [t, i18n.resolvedLanguage, pathname])

  usePageSeo({
    path: isHome ? '/' : null,
    title: isHome ? t('title.home') : null,
    // No description for the home route. index.html ships the hand-written
    // one ("Synther – systems engineering … decide what comes next."), and
    // the hook now writes the plain <meta name="description"> for the pages
    // that opt in with one — the home route must not have its description
    // replaced by a shorter pitch.
    description: null,
  })

  return null
}

export default DocumentTitle