import useReveal from '../hooks/useReveal.js'
import { useTranslation } from 'react-i18next'
import { stats } from '../data/content.js'

export default function Stats() {
  const { t } = useTranslation()
  const ref = useReveal()
  return (
    <section className="stats" aria-label={t('stats.ariaLabel')}>
      <div className="container stats__grid reveal" ref={ref}>
        {stats.map((s) => (
          <div className="stats__cell" key={s.key}>
            <div className="stats__value">{s.value}</div>
            <div className="stats__label">{t(`stats.${s.key}.label`)}</div>
          </div>
        ))}
      </div>
    </section>
  )
}