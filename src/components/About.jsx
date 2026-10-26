import useReveal from '../hooks/useReveal.js'
import { useTranslation } from 'react-i18next'

export default function About() {
  const { t } = useTranslation()
  const ref = useReveal()
  // Array values come back as objects via returnObjects.
  const principles = t('about.principles', { returnObjects: true })
  return (
    <section className="section about" id="about">
      <div className="container about__grid reveal" ref={ref}>
        <div className="about__intro section-head">
          <p className="eyebrow">{t('about.eyebrow')}</p>
          <h2 className="section-title">{t('about.title')}</h2>
        </div>

        <div className="about__body">
          <p className="section-lead">
            {t('about.body1', { name: t('site.name') })}
          </p>
          <p className="about__detail">{t('about.body2')}</p>
          <ul className="about__principles">
            {principles.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}