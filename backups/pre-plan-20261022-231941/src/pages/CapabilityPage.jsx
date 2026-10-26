import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useReveal from '../hooks/useReveal.js'
import { offerings, company } from '../data/content.js'
import Icon from '../components/Icon.jsx'
import DisciplineVisual from '../components/DisciplineVisual.jsx'

// Full discipline / capability page. Reaches into the same offerings.items
// content as the home-page rows, but pulls the extended page keys
// (pageLead / overview / capabilities / engagement / outcomes and, where
// present, status / spec / lineage / faq / seo). Every enriched
// section is gated on its content existing, so disciplines that have not yet
// been expanded render the baseline page unchanged.
export default function CapabilityPage() {
  const { id } = useParams()
  const { t } = useTranslation()

  const heroRef = useReveal()
  const overviewRef = useReveal()
  const capsRef = useReveal({ threshold: 0.05 })
  const engRef = useReveal({ threshold: 0.05 })
  const lineageRef = useReveal({ threshold: 0.05 })
  const outRef = useReveal({ threshold: 0.05 })
  const faqRef = useReveal({ threshold: 0.05 })

  const meta = offerings.find((o) => o.id === id)
  const valid = Boolean(meta)

  // t() with returnObjects yields the key string when a namespace is absent,
  // so guard every array/object section with Array.isArray / typeof object.
  const arr = (key) => {
    const v = t(key, { returnObjects: true })
    return Array.isArray(v) ? v : []
  }
  const obj = (key) => {
    const v = t(key, { returnObjects: true })
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null
  }

  const spec = valid ? arr(`offerings.items.${id}.spec`) : []
  const overview = valid ? arr(`offerings.items.${id}.overview`) : []
  const capabilities = valid ? arr(`offerings.items.${id}.capabilities`) : []
  const engagementSteps = valid ? arr(`offerings.items.${id}.engagement.steps`) : []
  const lineage = valid ? arr(`offerings.items.${id}.lineage`) : []
  const outcomes = valid ? arr(`offerings.items.${id}.outcomes`) : []
  const faq = valid ? arr(`offerings.items.${id}.faq`) : []
  const seo = valid ? obj(`offerings.items.${id}.seo`) : null
  const others = offerings.filter((o) => o.id !== id)

  // Reset scroll on navigation between pages.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  // Page-specific <title>; DocumentTitle yields on non-home routes.
  useEffect(() => {
    if (!valid) return
    document.title = t('capabilityPage.docTitle', {
      name: t(`offerings.items.${id}.title`),
    })
  }, [t, id, valid])

  // Per-discipline SEO: meta description, canonical, and a JSON-LD Service
  // block built from the real capability list. No fabricated addresses, IDs
  // or certifications — only provider, area served and the actual services.
  useEffect(() => {
    if (!valid || !seo) return

    const metaDesc = document.querySelector('meta[name="description"]')
    const prevDesc = metaDesc ? metaDesc.getAttribute('content') : null
    if (metaDesc && seo.description) metaDesc.setAttribute('content', seo.description)

    let canonical = document.querySelector('link[rel="canonical"]')
    const prevCanonical = canonical ? canonical.getAttribute('href') : null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    if (seo.canonical) {
      canonical.setAttribute('href', `${window.location.origin}${seo.canonical}`)
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: t(`offerings.items.${id}.title`),
      description: seo.description,
      serviceType: t(`offerings.items.${id}.title`),
      provider: {
        '@type': 'Organization',
        name: t('site.legalName'),
        email: company.email,
      },
      areaServed: { '@type': 'Country', name: t('site.location') },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        itemListElement: capabilities.map((c) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: c.title,
            description: c.text,
          },
        })),
      },
    }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'synther-service-schema'
    script.text = JSON.stringify(schema)
    document.head.appendChild(script)

    return () => {
      if (metaDesc && prevDesc != null) metaDesc.setAttribute('content', prevDesc)
      if (canonical && prevCanonical != null) {
        canonical.setAttribute('href', prevCanonical)
      }
      const s = document.getElementById('synther-service-schema')
      if (s) s.remove()
    }
  }, [t, id, valid, seo, capabilities])

  if (!valid) {
    return (
      <section className="section capability capability--notfound">
        <div className="container">
          <h1 className="capability__title">{t('capabilityPage.notFoundTitle')}</h1>
          <p className="capability__lead">{t('capabilityPage.notFoundBody')}</p>
          <a href="/#offerings" className="btn btn--primary capability__back-cta">
            {t('capabilityPage.notFoundCta')} <span className="arrow">→</span>
          </a>
        </div>
      </section>
    )
  }

  const title = t(`offerings.items.${id}.title`)

  return (
    <article className="capability">
      {/* Breadcrumb wayfinding */}
      <nav className="capability__crumb" aria-label="Breadcrumb">
        <div className="container">
          <ol>
            <li>
              <Link to="/">{t('capabilityPage.breadcrumbHome')}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <a href="/#offerings">{t('capabilityPage.breadcrumbRoot')}</a>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{title}</li>
          </ol>
        </div>
      </nav>

      {/* Hero — dark panel with a per-discipline inline-SVG schematic in
          place of a stock photo (no raster images), plus a gradient overlay
          for readability, content on top. */}
      <header className="capability__hero" id="top">
        <div className="capability__hero-bg" aria-hidden="true">
          <DisciplineVisual id={id} />
        </div>
        <div className="capability__hero-overlay" aria-hidden="true" />
        <div className="container capability__hero-content">
          <div className="capability__hero-head reveal" ref={heroRef}>
{/*         <p className="eyebrow">
              {meta.icon && (
                <Icon name={meta.icon} size={16} strokeWidth={1.5} className="capability__eyebrow-icon" />
              )} 
              {t('capabilityPage.eyebrow')}
          </p> */}
            <h1 className="capability__title">{title}</h1>
            <p className="capability__lead">{t(`offerings.items.${id}.pageLead`)}</p>
          </div>

          {/* Spec-sheet strip — qualitative key/value, no invented metrics */}
          {spec.length > 0 && (
            <dl className="capability__spec">
              {spec.map((s) => (
                <div className="capability__spec-cell" key={s.label}>
                  <dt className="capability__spec-label mono">{s.label}</dt>
                  <dd className="capability__spec-value">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      {/* Overview */}
      <section className="section capability__overview">
        <div className="container">
          <div className="capability__block reveal" ref={overviewRef}>
            <p className="eyebrow">{t('capabilityPage.overviewEyebrow')}</p>
            <div className="capability__body">
              {overview.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities breakdown — cells with optional sub-points */}
      <section className="section capability__caps">
        <div className="container">
          <div className="capability__block-head reveal" ref={capsRef}>
            <p className="eyebrow">{t('capabilityPage.capabilitiesEyebrow')}</p>
            <h2 className="capability__h2">{t('capabilityPage.capabilitiesTitle')}</h2>
          </div>
          <div className="capability__cap-grid">
            {capabilities.map((c, i) => (
              <div className="capability__cap" key={i}>
                <span className="capability__cap-index mono">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="capability__cap-title">{c.title}</h3>
                <p className="capability__cap-text">{c.text}</p>
                {Array.isArray(c.points) && c.points.length > 0 && (
                  <ul className="capability__cap-points">
                    {c.points.map((p) => (
                      <li key={p} className="mono">{p}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement */}
      <section className="section capability__engagement">
        <div className="container">
          <div className="capability__block-head reveal" ref={engRef}>
            <p className="eyebrow">{t('capabilityPage.engagementEyebrow')}</p>
            <h2 className="capability__h2">{t('capabilityPage.engagementTitle')}</h2>
            <p className="capability__eng-lead section-lead">
              {t(`offerings.items.${id}.engagement.lead`)}
            </p>
          </div>
          <ol className="capability__eng-steps">
            {engagementSteps.map((s, i) => (
              <li className="capability__eng-step" key={i}>
                <span className="capability__eng-num mono">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="capability__eng-step-title">{s.title}</h3>
                  <p className="capability__eng-step-text">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Lineage — where this discipline sits in the synthesis model */}
      {lineage.length > 0 && (
        <section className="section capability__lineage">
          <div className="container">
            <div className="capability__block-head reveal" ref={lineageRef}>
              <p className="eyebrow">{t('capabilityPage.lineageEyebrow')}</p>
              <h2 className="capability__h2">{t('capabilityPage.lineageTitle')}</h2>
            </div>
            <ol className="capability__lineage-list">
              {lineage.map((node, i) => (
                <li
                  className={`capability__lineage-node${node.current ? ' is-current' : ''}`}
                  key={i}
                >
                  <span className="capability__lineage-rank mono">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="capability__lineage-name">{node.name}</h3>
                    <p className="capability__lineage-text">{node.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Outcomes */}
      <section className="section capability__outcomes">
        <div className="container">
          <div className="capability__block-head reveal" ref={outRef}>
            <p className="eyebrow">{t('capabilityPage.outcomesEyebrow')}</p>
            <h2 className="capability__h2">{t('capabilityPage.outcomesTitle')}</h2>
          </div>
          <ul className="capability__outcome-list">
            {outcomes.map((o, i) => (
              <li className="capability__outcome" key={i}>
                <span className="capability__outcome-mark" aria-hidden="true" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ — native disclosure, no JS */}
      {faq.length > 0 && (
        <section className="section capability__faq">
          <div className="container">
            <div className="capability__block-head reveal" ref={faqRef}>
              <p className="eyebrow">{t('capabilityPage.faqEyebrow')}</p>
              <h2 className="capability__h2">{t('capabilityPage.faqTitle')}</h2>
            </div>
            <div className="capability__faq-list">
              {faq.map((item, i) => (
                <details className="capability__faq-item" key={i}>
                  <summary>
                    <span>{item.q}</span>
                    <span className="capability__faq-mark" aria-hidden="true">+</span>
                  </summary>
                  <p className="capability__faq-a">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA + related disciplines */}
      <section className="capability__cta">
        <div className="container capability__cta-inner">
          <div className="capability__cta-main">
            <h2 className="capability__cta-title">{t('capabilityPage.ctaTitle')}</h2>
            <p className="capability__cta-text">
              {t('capabilityPage.ctaText', { name: title })}
            </p>
            <a href="/#contact" className="btn btn--primary capability__cta-btn">
              {t('capabilityPage.discussCta')} <span className="arrow">→</span>
            </a>
          </div>

          <aside className="capability__related">
            <h3 className="capability__related-title mono">{t('capabilityPage.relatedTitle')}</h3>
            <ul className="capability__related-grid">
              {others.map((o) => (
                <li key={o.id}>
                  <Link to={`/disciplines/${o.id}`} className="capability__related-card">
                    <span className="capability__related-body">
                      <span className="capability__related-name">{t(`offerings.items.${o.id}.title`)}</span>
                      <span className="capability__related-blurb">{t(`offerings.items.${o.id}.blurb`)}</span>
                    </span>
                    <span className="arrow" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </article>
  )
}