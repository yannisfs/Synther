import { Link } from 'react-router-dom'
import useReveal from '../hooks/useReveal.js'
import { useTranslation } from 'react-i18next'
import { offerings } from '../data/content.js'
import Icon from './Icon.jsx'

function OfferingRow({ id, icon }) {
  const { t } = useTranslation()
  // Array values come back as objects via returnObjects.
  const points = t(`offerings.items.${id}.points`, { returnObjects: true })
  return (
    <article className="offering" id={id}>
      <div className="offering__main">
        <h3 className="offering__title">
          {icon && (
            <Icon name={icon} size={22} strokeWidth={1.4} className="offering__icon" />
          )}
          <span>{t(`offerings.items.${id}.title`)}</span>
        </h3>
        <p className="offering__summary">{t(`offerings.items.${id}.summary`)}</p>
        <ul className="offering__tags">
          {points.map((p) => (
            <li key={p} className="offering__tag mono">
              {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="offering__actions">
        {/* Explore (secondary) — SPA-navigates to the full discipline page. */}
        <Link className="offering__link offering__link--more mono" to={`/disciplines/${id}`}>
          {t('offerings.more')}
        </Link>
        <span className="offering__actions-sep" aria-hidden="true" />
        {/* Discuss (primary) — stays an in-page anchor to the contact form. */}
        <a className="offering__link mono" href="#contact">
          {t('offerings.discuss')} <span className="arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  )
}

export default function Offerings() {
  const { t } = useTranslation()
  const headRef = useReveal()
  // One observer for the whole list: rows cascade in together as a group
  // (CSS nth-child stagger) instead of each triggering on its own scroll
  // position, which read as laggy/sequential loading.
  const listRef = useReveal({ threshold: 0.05 })
  return (
    <section className="section offerings" id="offerings">
      <div className="container">
        <div className="offerings__head section-head reveal" ref={headRef}>
          <p className="eyebrow">{t('offerings.eyebrow')}</p>
          <h2 className="section-title">{t('offerings.title')}</h2>
          <p className="section-lead">{t('offerings.lead')}</p>
        </div>

        <div className="offerings__list" ref={listRef}>
          {offerings.map((o) => (
            <OfferingRow key={o.id} id={o.id} icon={o.icon} />
          ))}
        </div>
      </div>
    </section>
  )
}