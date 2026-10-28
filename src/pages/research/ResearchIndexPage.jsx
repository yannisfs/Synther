import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useReveal from '../../hooks/useReveal.js'
import usePageSeo from '../../hooks/usePageSeo.js'
import { getPapers, getAgenda } from '../../lib/research.js'
import { monthStamp } from '../../lib/research/parse.js'
import { SITE_URL, company } from '../../data/content.js'
import DisciplineVisual from '../../components/DisciplineVisual.jsx'

// The filter chips, in the order the plan lists them. "all" is the
// default state; the other three are the paper types.
const FILTERS = ['all', 'efficiency', 'reproduction', 'record']

// One row in the papers list. Shared with the paper page's "More
// research" block, so the two lists cannot drift apart.
function PaperRow({ paper, typeLabel }) {
  const { t } = useTranslation()
  const { data, slug } = paper
  return (
    <li className="research__paper">
      <span className="research__paper-date mono">{monthStamp(data.date)}</span>
      <span className="research__paper-type mono">{typeLabel}</span>
      <div className="research__paper-main">
        <h3 className="research__paper-title">
          <Link to={`/research/${slug}/`}>{data.title}</Link>
        </h3>
        <p className="research__paper-result">{data.result}</p>
      </div>
      <div className="research__paper-links">
        <Link className="research__link" to={`/research/${slug}/`}>
          <span>{t('research.papers.read')}</span>{' '}
          <span className="arrow" aria-hidden="true">→</span>
        </Link>
        {data.preprint && (
          <a className="research__link" href={data.preprint}>
            {t('research.papers.preprint')}
          </a>
        )}
        {data.code && (
          <a className="research__link" href={data.code}>
            {t('research.papers.code')}
          </a>
        )}
      </div>
    </li>
  )
}

export default function ResearchIndexPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')

  const heroRef = useReveal()
  const stdRef = useReveal({ threshold: 0.05 })
  const papersRef = useReveal({ threshold: 0.05 })
  const agendaRef = useReveal({ threshold: 0.05 })

  // The papers come from the content folder, not from a prop: the same
  // list the feed, the sitemap and the prerenderer read.
  const papers = useMemo(() => getPapers(), [])
  const agenda = useMemo(() => getAgenda(), [])

  const facts = useMemo(() => {
    const v = t('research.facts', { returnObjects: true })
    return Array.isArray(v) ? v : []
  }, [t])
  const standard = useMemo(() => {
    const v = t('research.standard.items', { returnObjects: true })
    return Array.isArray(v) ? v : []
  }, [t])

  const visible = useMemo(
    () => (filter === 'all' ? papers : papers.filter((p) => p.data.type === filter)),
    [papers, filter]
  )

  // Reset the scroll on navigation (unless the URL carries an anchor).
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0)
  }, [])

  // The page title. DocumentTitle only owns the title on the home route,
  // so every subpage sets its own.
  useEffect(() => {
    document.title = t('research.docTitle')
  }, [t])

  const title = t('research.docTitle')
  const description = t('research.seoDescription')

  // Canonical, og:url and the social card, same mechanism as the
  // discipline pages.
  usePageSeo({ path: '/research', title, description })

  // Structured data + the RSS alternate link. Both are injected as DOM
  // nodes (no inline <script> in the source, which the CSP forbids)
  // and removed again when the page is left.
  useEffect(() => {
    const scripts = []

    const addSchema = (id, data) => {
      // The prerendered page already carries this block (the prerender
      // captured the mounted DOM). Remove it first, otherwise the page
      // ends up with two identical JSON-LD blocks once React hydrates.
      document.getElementById(id)?.remove()
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = id
      script.textContent = JSON.stringify(data)
      document.head.appendChild(script)
      scripts.push(script)
    }

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${SITE_URL}/research/#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: t('research.breadcrumbHome'),
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: t('research.breadcrumbCurrent'),
          item: `${SITE_URL}/research/`,
        },
      ],
    }

    const collection = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t('research.title'),
      description,
      url: `${SITE_URL}/research/`,
      inLanguage: 'en',
      isPartOf: { '@type': 'WebSite', name: 'Synther', url: `${SITE_URL}/` },
      breadcrumb: { '@id': `${SITE_URL}/research/#breadcrumb` },
    }

    // The papers are the collection's items; the list is built from the
    // same data the page renders, so it can never drift.
    if (papers.length > 0) {
      collection.mainEntity = {
        '@type': 'ItemList',
        itemListElement: papers.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/research/${p.slug}/`,
          name: p.data.title,
        })),
      }
    }

    addSchema('synther-research-collection-schema', collection)
    addSchema('synther-research-breadcrumb-schema', breadcrumb)

    // The feed is built at deploy time (scripts/build-feed.mjs); the
    // link tells readers and aggregators where it is. The prerendered
    // page already has the link, so the old one goes first.
    document.head
      .querySelectorAll('link[rel="alternate"][type="application/rss+xml"]')
      .forEach((el) => el.remove())
    const alt = document.createElement('link')
    alt.rel = 'alternate'
    alt.type = 'application/rss+xml'
    alt.title = 'Synther Research'
    alt.href = `${SITE_URL}/research/feed.xml`
    document.head.appendChild(alt)

    return () => {
      scripts.forEach((s) => s.remove())
      alt.remove()
    }
  }, [t, description, papers])

  return (
    <article className="research">
      {/* Breadcrumb wayfinding */}
      <nav className="capability__crumb" aria-label="Breadcrumb">
        <div className="container">
          <ol>
            <li>
              <Link to="/">{t('research.breadcrumbHome')}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t('research.breadcrumbCurrent')}</li>
          </ol>
        </div>
      </nav>

      {/* Hero — the discipline hero shell, with the research motif
          behind it. */}
      <header className="capability__hero" id="top">
        <div className="capability__hero-bg" aria-hidden="true">
          <DisciplineVisual id="research" />
        </div>
        <div className="capability__hero-overlay" aria-hidden="true" />
        <div className="container capability__hero-content">
          <div className="capability__hero-head reveal" ref={heroRef}>
            <h1 className="capability__title">{t('research.title')}</h1>
            <p className="capability__lead">{t('research.intro')}</p>
          </div>

          <dl className="research__facts">
            {facts.map((f) => (
              <div className="capability__spec-cell" key={f.label}>
                <dt className="capability__spec-label mono">{f.label}</dt>
                <dd className="capability__spec-value">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* Our standard */}
      <section className="section research__standard">
        <div className="container">
          <div className="capability__block-head reveal" ref={stdRef}>
            <p className="eyebrow">{t('research.standard.eyebrow')}</p>
            <h2 className="capability__h2">{t('research.standard.title')}</h2>
          </div>
          <div className="research__std-grid">
            {standard.map((item, i) => (
              <div className="capability__cap" key={item.title}>
                <span className="capability__cap-index mono">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="capability__cap-title">{item.title}</h3>
                <p className="capability__cap-text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Papers */}
      <section className="section research__papers">
        <div className="container">
          <div className="capability__block-head reveal" ref={papersRef}>
            <p className="eyebrow">{t('research.papers.eyebrow')}</p>
            <h2 className="capability__h2">{t('research.papers.title')}</h2>
          </div>

          {papers.length > 0 && (
            <div
              className="research__filters"
              role="group"
              aria-label={t('research.papers.filterLabel')}
            >
              {FILTERS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="research__chip"
                  aria-pressed={filter === key}
                  onClick={() => setFilter(key)}
                >
                  {key === 'all'
                    ? t('research.papers.filterAll')
                    : t(`research.types.${key}`)}
                </button>
              ))}
            </div>
          )}

          {visible.length > 0 ? (
            <ul className="research__paper-list">
              {visible.map((paper) => (
                <PaperRow
                  key={paper.slug}
                  paper={paper}
                  typeLabel={t(`research.types.${paper.data.type}`)}
                />
              ))}
            </ul>
          ) : (
            <div className="research__empty">
              <p className="research__empty-text">{t('research.papers.empty')}</p>
              <p className="research__empty-links">
                <a className="research__link" href="/research/feed.xml">
                  {t('research.papers.emptyFeed')}
                </a>
                <a className="research__link" href="/#contact">
                  {t('research.papers.emptyContact')}
                </a>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* In progress — only when the agenda file has entries. */}
      {agenda.length > 0 && (
        <section className="section research__agenda">
          <div className="container">
            <div className="capability__block-head reveal" ref={agendaRef}>
              <p className="eyebrow">{t('research.agenda.eyebrow')}</p>
              <h2 className="capability__h2">{t('research.agenda.title')}</h2>
            </div>
            <ul className="research__agenda-list">
              {agenda.map((entry) => {
                const status = String(entry.status || 'planned')
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                return (
                  <li className="research__agenda-row" key={entry.topic}>
                    <span className="research__agenda-topic">{entry.topic}</span>
                    <span className="research__agenda-benchmark mono">
                      {entry.benchmark}
                    </span>
                    <span className={`research__status research__status--${status}`}>
                      {t(`research.agenda.status.${status}`)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="capability__cta">
        <div className="container">
          <div className="capability__cta-main">
            <h2 className="capability__cta-title">{t('research.cta.title')}</h2>
            <p className="capability__cta-text">{t('research.cta.text')}</p>
            <a
              href={`mailto:${company.email}`}
              className="btn btn--primary capability__cta-btn"
            >
              {t('research.cta.button')} <span className="arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
    </article>
  )
}
