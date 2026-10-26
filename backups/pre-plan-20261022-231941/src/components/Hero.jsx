import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { heroMeta } from '../data/content.js'

// Three.js is heavy; load the canvas only on the client.
const HeroBackground = lazy(() => import('./HeroBackground.jsx'))

function HeroFallback() {
  return <div className="hero-canvas hero-canvas--fallback" aria-hidden="true" />
}

export default function Hero() {
  const { t } = useTranslation()
  return (
    <section className="hero" id="top">
      <Suspense fallback={<HeroFallback />}>
        <HeroBackground />
      </Suspense>

      <div className="container hero__content">
        <h1 className="hero__title">
          {t('hero.titleLead')} <span className="hero__accent">{t('hero.titleAccent')}</span>.
        </h1>
        <p className="hero__lead">{t('site.shortPitch')}</p>

        <div className="hero__actions">
          <a href="#contact" className="btn btn--primary">
            {t('hero.ctaPrimary')} <span className="arrow">→</span>
          </a>
          <a href="#offerings" className="btn btn--ghost">
            {t('hero.ctaSecondary')}
          </a>
        </div>

        {/* Structured spec-sheet strip: labeled key/value pairs, divided
            by a hairline - dense and professional in lieu of an eyebrow. */}
        <dl className="hero__meta">
          {heroMeta.map((m) => (
            <div className="hero__meta-cell" key={m.key}>
              <dt className="hero__meta-label mono">{t(`heroMeta.${m.key}.label`)}</dt>
              <dd className="hero__meta-value">{t(`heroMeta.${m.key}.value`)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span className="mono">{t('hero.scroll')}</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  )
}