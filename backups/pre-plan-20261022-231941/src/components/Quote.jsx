import useReveal from '../hooks/useReveal.js'
import { useTranslation } from 'react-i18next'

// Centered vision pull-quote band: a small 3-bar accent, an italic
// light-weight statement with a bold continuation, and a mono attribution.
// Bordered top/bottom so it reads as a distinct beat between sections.
export default function Quote() {
  const { t } = useTranslation()
  const ref = useReveal()
  return (
    <section className="quote" aria-label={t('vision.ariaLabel')}>
      <div className="container quote__inner reveal" ref={ref}>
        <div className="quote__bars" aria-hidden="true">
          <span style={{ background: 'var(--blue-600)' }} />
          <span style={{ background: 'var(--blue-600)' }} />
          <span style={{ background: 'var(--blue-600)' }} />
        </div>
        <blockquote className="quote__text">
          “{t('vision.quote')} {t('vision.quoteBold')}”
        </blockquote>
        <p className="quote__attribution mono">{t('vision.attribution')}</p>
      </div>
    </section>
  )
}