// 404 page.
//
// Served two ways, and both must render this component:
//   - as `dist/404.html` at the origin root, which Cloudflare Pages
//     serves with a real HTTP 404 status for unknown URLs (S01), and
//   - as the React Router `*` catch-all, so client-side navigation to a
//     bad path shows the same branded page instead of silently falling
//     back to the homepage.
//
// The catch-all previously rendered <HomePage />, which meant every unknown
// URL returned HTTP 200 with the full homepage — duplicate content for search
// engines and a broken link target for anything that 404'd.

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useReveal from '../hooks/useReveal.js'
import usePageSeo from '../hooks/usePageSeo.js'

export default function NotFoundPage() {
  const { t } = useTranslation()
  const ref = useReveal()

  useEffect(() => {
    document.title = t('title.notFound')
  }, [t])

  // S35: og:title / twitter:title / descriptions. No canonical — a 404 has
  // no canonical URL to point at, and inheriting the homepage's would tell
  // crawlers the missing page is the same content as /.
  usePageSeo({
    path: null,
    title: t('title.notFound'),
    description: t('notFound.seo.description'),
    stripCanonical: true,
  })

  return (
    <article className="capability notfound">
      {/* V02: the other subpages all put a light breadcrumb band between the
          header and the dark hero. Without it the navy logo sits on the
          dark hero and is nearly invisible. Same markup and classes as the
          Help page's breadcrumb. */}
      <nav className="capability__crumb" aria-label="Breadcrumb">
        <div className="container">
          <ol>
            <li>
              <Link to="/">{t('notFound.breadcrumbHome')}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t('notFound.breadcrumbCurrent')}</li>
          </ol>
        </div>
      </nav>

      <header className="capability__hero" id="top">
        <div className="capability__hero-bg" aria-hidden="true" />
        <div className="capability__hero-overlay" aria-hidden="true" />
        <div className="container capability__hero-content">
          <div className="capability__hero-head reveal" ref={ref}>
            <p className="eyebrow">404</p>
            <h1 className="capability__title">{t('notFound.title')}</h1>
            <p className="capability__lead">{t('notFound.body')}</p>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="notfound__actions">
            <Link to="/" className="btn btn--primary">
              {t('notFound.homeCta')}
            </Link>
            <Link to="/#offerings" className="btn btn--ghost">
              {t('notFound.disciplinesCta')}
            </Link>
          </div>
        </div>
      </section>
    </article>
  )
}