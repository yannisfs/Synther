import useReveal from '../hooks/useReveal.js'
import { useTranslation } from 'react-i18next'
import { approach } from '../data/content.js'

export default function Approach() {
  const { t } = useTranslation()
  const headRef = useReveal()
  const listRef = useReveal({ threshold: 0.05 })
  return (
    <section className="section approach" id="approach">
      <div className="container">
        <div className="approach__head section-head reveal" ref={headRef}>
          <p className="eyebrow">{t('approach.eyebrow')}</p>
          <h2 className="section-title">{t('approach.title')}</h2>
          <p className="section-lead">{t('approach.lead')}</p>
        </div>

        <ol className="approach__steps" ref={listRef}>
          {approach.map((s) => (
            <li className="approach__step" key={s.step}>
              <span className="approach__step-num">{s.step}</span>
              <div className="approach__step-body">
                <h3 className="approach__step-title">
                  {t(`approach.items.${s.step}.title`)}
                </h3>
                <p className="approach__step-text">
                  {t(`approach.items.${s.step}.text`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}