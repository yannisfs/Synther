import { Children, createContext, isValidElement, useContext, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import 'katex/dist/katex.min.css'
import usePageSeo from '../../hooks/usePageSeo.js'
import { getPaper, getPapers } from '../../lib/research.js'
import { monthYear } from '../../lib/research/parse.js'
import { extractHeadings } from '../../lib/research/toc.js'
import { SITE_URL } from '../../data/content.js'

// The figures a paper may reference. Relative paths in the Markdown
// ("figures/example.svg") are resolved through this map, so Vite
// fingerprints them and the build fails loudly on a missing file
// instead of shipping a broken image.
//
// A draft's figures (an underscore-prefixed folder) are only referenced
// from the development branch below. In a production build the branch is
// folded away, so the files are never imported — they are not inlined as
// data URIs and they are not emitted into dist/assets/ either. A draft's
// artwork stays out of the deployment entirely.
const figureFiles = import.meta.glob(
  [
    '/src/content/research/*/figures/*.{png,jpg,jpeg,svg,webp,gif}',
    '!/src/content/research/_*/figures/*.{png,jpg,jpeg,svg,webp,gif}',
  ],
  { query: '?url', import: 'default', eager: true }
)
const devFigureFiles = import.meta.glob(
  '/src/content/research/_*/figures/*.{png,jpg,jpeg,svg,webp,gif}',
  { query: '?url', import: 'default', eager: true }
)
const allFigureFiles = import.meta.env.DEV
  ? { ...figureFiles, ...devFigureFiles }
  : figureFiles

// "2026-11-04" -> "2026/11/04" for the Google Scholar tag.
const scholarDate = (iso) => String(iso).replace(/-/g, '/')

// A figure in the paper body is rendered as a <figure> with its caption.
// Markdown wraps a lone image in a paragraph, and a <figure> inside a <p>
// is invalid HTML: React logs it as a nesting warning and the browser
// closes the paragraph early. The paragraph renderer below therefore
// unwraps a paragraph that holds nothing but a figure.
//
// The figure renderer resolves the image URL through a context, which
// keeps it a module-level component: a renderer defined inside the
// component body would get a new identity on every render and remount
// the whole article whenever the state changed (the "copied" label of
// the citation button).
const FigureResolverContext = createContext(null)

const MarkdownFigure = ({ src, alt, title }) => {
  const resolve = useContext(FigureResolverContext)
  return (
    <figure>
      <img src={resolve ? resolve(src) : src} alt={alt || ''} loading="lazy" />
      {title && <figcaption>{title}</figcaption>}
    </figure>
  )
}

const MarkdownParagraph = ({ children }) => {
  const items = Children.toArray(children)
  if (
    items.length === 1 &&
    isValidElement(items[0]) &&
    items[0].type === MarkdownFigure
  ) {
    return items[0]
  }
  return <p>{children}</p>
}

export default function ResearchPaperPage() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const paper = useMemo(() => getPaper(slug), [slug])
  const data = paper ? paper.data : null

  // The table of contents and the "more research" list are computed
  // before the not-found branch below, so the hook order is the same
  // whether the slug resolves or not.
  const headings = useMemo(
    () => (paper ? extractHeadings(paper.content) : []),
    [paper]
  )
  const others = useMemo(
    () => getPapers().filter((p) => p.slug !== slug).slice(0, 3),
    [slug]
  )

  // Canonical, social card and the description meta.
  const title = data
    ? t('research.paper.docTitle', { short: data.short })
    : t('research.paper.notFound.title')
  const description = data ? data.summary : null
  usePageSeo({
    path: data ? `/research/${slug}` : null,
    title,
    description,
    stripCanonical: !data,
  })

  // Reset the scroll on navigation (unless the URL carries an anchor).
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0)
  }, [slug])

  // The page title. DocumentTitle only owns the title on the home route,
  // so every subpage sets its own.
  useEffect(() => {
    document.title = data
      ? t('research.paper.docTitle', { short: data.short })
      : t('research.paper.notFound.title')
  }, [data, t])

  // Structured data + the Google Scholar meta tags. Both are injected
  // as DOM nodes (the CSP forbids inline <script> in the source) and
  // removed again when the page is left.
  useEffect(() => {
    if (!data) return undefined

    const scripts = []
    const metas = []

    const addSchema = (id, payload) => {
      // The prerendered page already carries this block (the prerender
      // captured the mounted DOM). Remove it first, otherwise the page
      // ends up with two identical JSON-LD blocks once React hydrates.
      document.getElementById(id)?.remove()
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = id
      script.textContent = JSON.stringify(payload)
      document.head.appendChild(script)
      scripts.push(script)
    }

    const addMeta = (name, content) => {
      if (!content) return
      const el = document.createElement('meta')
      el.setAttribute('name', name)
      el.setAttribute('content', content)
      document.head.appendChild(el)
      metas.push(el)
    }

    const url = `${SITE_URL}/research/${slug}/`
    const changelog = Array.isArray(data.changelog) ? data.changelog : []
    const latest = changelog.length > 0 ? changelog[0].date : data.date

    addSchema('synther-paper-schema', {
      '@context': 'https://schema.org',
      '@type': 'ScholarlyArticle',
      headline: data.title,
      alternativeHeadline: data.short,
      description: data.summary,
      url,
      inLanguage: 'en',
      datePublished: data.date,
      dateModified: latest,
      author: data.authors.map((name) => ({ '@type': 'Person', name })),
      publisher: { '@type': 'Organization', name: 'Synther', url: SITE_URL },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      ...(data.preprint ? { sameAs: [data.preprint] } : {}),
      ...(data.code ? { codeRepository: data.code } : {}),
    })

    addSchema('synther-paper-breadcrumb-schema', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
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
          name: t('research.paper.breadcrumbResearch'),
          item: `${SITE_URL}/research/`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: data.short,
          item: url,
        },
      ],
    })

    // Google Scholar reads these. The prerendered page already carries
    // them, so the old ones go first — otherwise every tag appears twice
    // once React hydrates.
    document.head
      .querySelectorAll('meta[name^="citation_"]')
      .forEach((el) => el.remove())
    addMeta('citation_title', data.title)
    data.authors.forEach((author) => addMeta('citation_author', author))
    addMeta('citation_publication_date', scholarDate(data.date))
    if (data.pdf) addMeta('citation_pdf_url', data.pdf)

    // A paper is an article, not a website.
    const ogType = document.querySelector('meta[property="og:type"]')
    const prevOgType = ogType ? ogType.getAttribute('content') : null
    if (ogType) ogType.setAttribute('content', 'article')

    return () => {
      scripts.forEach((s) => s.remove())
      metas.forEach((m) => m.remove())
      if (ogType && prevOgType != null) ogType.setAttribute('content', prevOgType)
    }
  }, [data, slug, t])

  // A paper that does not exist (client-side navigation to a bad slug)
  // gets the same treatment as a discipline that does not exist.
  if (!paper) {
    return (
      <section className="section capability capability--notfound">
        <div className="container">
          <h1 className="capability__title">{t('research.paper.notFound.title')}</h1>
          <p className="capability__lead">{t('research.paper.notFound.body')}</p>
          <Link to="/research/" className="btn btn--primary capability__back-cta">
            {t('research.paper.notFound.cta')} <span className="arrow">→</span>
          </Link>
        </div>
      </section>
    )
  }

  const { content } = paper
  const results = Array.isArray(data.results) ? data.results : []
  const repro = data.repro || {}
  const benchmark = data.benchmark || {}
  const changelog = Array.isArray(data.changelog) ? data.changelog : []
  const typeLabel = t(`research.types.${data.type}`)
  const disciplineTitle = t(`offerings.items.${data.discipline}.title`)

  // Relative "figures/…" paths in the Markdown are resolved through
  // the build-time map; absolute and remote URLs are left alone.
  const resolveFigure = useMemo(
    () => (src) => {
      if (!src) return src
      if (/^([a-z]+:)?\/\//i.test(src) || src.startsWith('/')) return src
      const key = `/src/content/research/${slug}/${src.replace(/^\.\//, '')}`
      return allFigureFiles[key] || src
    },
    [slug]
  )

  const copyCitation = async () => {
    try {
      await navigator.clipboard.writeText(data.bibtex)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (no permission, insecure context): leave the
      // label as it is. The BibTeX is visible on the page either way.
    }
  }

  return (
    <article className="research research--paper">
      {/* Breadcrumb wayfinding */}
      <nav className="capability__crumb" aria-label="Breadcrumb">
        <div className="container">
          <ol>
            <li>
              <Link to="/">{t('research.breadcrumbHome')}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/research/">{t('research.paper.breadcrumbResearch')}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{data.short}</li>
          </ol>
        </div>
      </nav>

      {/* Paper header — light, not the dark hero: reading pages stay
          white. */}
      <header className="research__head">
        <div className="container">
          <p className="research__meta mono">
            <span className="research__meta-type">{typeLabel}</span>
            {' · '}
            <span>{disciplineTitle}</span>
            {' · '}
            <span>{monthYear(data.date)}</span>
            {' · '}
            <span>v{data.version}</span>
          </p>
          <h1 className="section-title research__title">{data.title}</h1>
          <p className="research__authors">{data.authors.join(', ')}</p>
          <div className="research__actions">
            {data.preprint && (
              <a href={data.preprint} className="btn btn--ghost">
                {t('research.paper.preprint')}
              </a>
            )}
            {data.code && (
              <a href={data.code} className="btn btn--ghost">
                {t('research.paper.code')}
              </a>
            )}
            {data.bibtex && (
              <a href="#cite" className="btn btn--ghost">
                {t('research.paper.cite')}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Key result */}
      <section className="section research__result">
        <div className="container">
          <div className="research__key">
            <p className="eyebrow research__key-label">
              {t('research.paper.keyResult')}
            </p>
            <p className="research__key-text">{data.result}</p>
            {results.length > 0 && (
              <div className="research__table-wrap">
                <table className="research__table">
                  <thead>
                    <tr>
                      <th scope="col">{t('research.paper.table.method')}</th>
                      <th scope="col">{t('research.paper.table.metric')}</th>
                      <th scope="col">{t('research.paper.table.value')}</th>
                      <th scope="col">{t('research.paper.table.cost')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, i) => (
                      <tr key={`${row.method}-${i}`} className={row.ours ? 'is-ours' : undefined}>
                        <td>{row.method}</td>
                        <td>{row.metric}</td>
                        <td>{row.value}</td>
                        <td>{row.cost || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Body — sticky table of contents beside the article */}
      <section className="section research__body">
        <div className="container research__body-grid">
          {headings.length > 0 && (
            <nav className="research__toc" aria-label={t('research.paper.toc.label')}>
              <p className="research__toc-label mono">{t('research.paper.toc.label')}</p>
              <ul>
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="research__article">
            <FigureResolverContext.Provider value={resolveFigure}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeSlug, rehypeKatex]}
                components={{
                  p: MarkdownParagraph,
                  img: MarkdownFigure,
                  a: ({ href, children, ...rest }) => {
                    const external = /^https?:/i.test(href || '')
                    return (
                      <a
                        href={href}
                        {...rest}
                        {...(external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {children}
                      </a>
                    )
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </FigureResolverContext.Provider>
          </div>
        </div>
      </section>

      {/* Reproducibility */}
      {(data.code || repro.commit || benchmark.name || repro.hardware || repro.runtime || repro.command) && (
        <section className="section research__repro">
          <div className="container">
            <div className="research__repro-box">
              <p className="eyebrow">{t('research.paper.repro.eyebrow')}</p>
              <dl className="research__repro-list">
                {data.code && (
                  <div>
                    <dt>{t('research.paper.repro.repository')}</dt>
                    <dd>
                      <a href={data.code}>{data.code}</a>
                    </dd>
                  </div>
                )}
                {repro.commit && (
                  <div>
                    <dt>{t('research.paper.repro.commit')}</dt>
                    <dd className="mono">{repro.commit}</dd>
                  </div>
                )}
                {benchmark.name && (
                  <div>
                    <dt>{t('research.paper.repro.dataset')}</dt>
                    <dd>
                      {benchmark.name}
                      {benchmark.version ? ` · ${benchmark.version}` : ''}
                    </dd>
                  </div>
                )}
                {repro.hardware && (
                  <div>
                    <dt>{t('research.paper.repro.hardware')}</dt>
                    <dd>{repro.hardware}</dd>
                  </div>
                )}
                {repro.runtime && (
                  <div>
                    <dt>{t('research.paper.repro.runtime')}</dt>
                    <dd>{repro.runtime}</dd>
                  </div>
                )}
                {repro.command && (
                  <div>
                    <dt>{t('research.paper.repro.command')}</dt>
                    <dd className="mono">{repro.command}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </section>
      )}

      {/* Cite this */}
      {data.bibtex && (
        <section className="section research__cite" id="cite">
          <div className="container">
            <div className="research__cite-head">
              <p className="eyebrow">{t('research.paper.citation.eyebrow')}</p>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={copyCitation}
              >
                {copied ? t('research.paper.citation.copied') : t('research.paper.citation.copy')}
              </button>
            </div>
            <pre className="research__bib">
              <code>{data.bibtex}</code>
            </pre>
          </div>
        </section>
      )}

      {/* Changelog */}
      {changelog.length > 0 && (
        <section className="section research__changelog">
          <div className="container">
            <div className="capability__block-head">
              <p className="eyebrow">{t('research.paper.changelog.eyebrow')}</p>
              <h2 className="capability__h2">{t('research.paper.changelog.title')}</h2>
            </div>
            <ol className="research__versions">
              {changelog.map((entry) => (
                <li className="research__version" key={entry.version}>
                  <span className="research__version-num mono">v{entry.version}</span>
                  <span className="research__version-date mono">
                    {monthYear(entry.date)}
                  </span>
                  <span className="research__version-note">{entry.note}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* More research */}
      {others.length > 0 && (
        <section className="section research__more">
          <div className="container">
            <div className="capability__block-head">
              <p className="eyebrow">{t('research.paper.more.eyebrow')}</p>
              <h2 className="capability__h2">{t('research.paper.more.title')}</h2>
            </div>
            <ul className="research__paper-list">
              {others.map((p) => (
                <li className="research__paper" key={p.slug}>
                  <span className="research__paper-date mono">{monthYear(p.data.date)}</span>
                  <span className="research__paper-type mono">
                    {t(`research.types.${p.data.type}`)}
                  </span>
                  <div className="research__paper-main">
                    <h3 className="research__paper-title">
                      <Link to={`/research/${p.slug}/`}>{p.data.title}</Link>
                    </h3>
                    <p className="research__paper-result">{p.data.result}</p>
                  </div>
                  <div className="research__paper-links">
                    <Link className="research__link" to={`/research/${p.slug}/`}>
                      <span>{t('research.papers.read')}</span>{' '}
                      <span className="arrow" aria-hidden="true">→</span>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  )
}
