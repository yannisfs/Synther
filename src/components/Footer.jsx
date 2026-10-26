import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { company, legalIdentity, nav } from '../data/content.js'
import { useHomeLink } from '../hooks/useHomeLink.js'

export default function Footer() {
  const { t } = useTranslation()
  const homeHref = useHomeLink()
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brandcol">
          <a href={homeHref('#top')} className="footer__brand">
            <img src="/Synther.svg" alt="" width="26" height="26" />
            <span className="mono">{t('site.brand')}</span>
          </a>
          <p className="footer__blurb">{t('footer.blurb')}</p>
          <a className="btn btn--primary footer__btn" href={`mailto:${company.email}`}>
            {t('footer.cta')} <span className="arrow">→</span>
          </a>
        </div>

        <nav className="footer__col" aria-label="Footer navigation">
          <h4 className="footer__col-title mono">{t('footer.navTitle')}</h4>
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <a href={homeHref(n.href)}>{t(`nav.${n.key}`)}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col">
          <h4 className="footer__col-title mono">{t('footer.legalTitle')}</h4>
          <ul>
            <li>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </li>
            <li>{legalIdentity.legalName}</li>
            <li>{legalIdentity.address}</li>
            <li>
              <Link to="/imprint" className="footer__imprint">
                {t('footer.imprint')}
              </Link>
            </li>
            <li>
              <Link to="/cookies" className="footer__imprint">
                {t('footer.cookiePolicy')}
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="footer__cookie-prefs"
                onClick={() => window.synther?.consent?.openBanner()}
              >
                {t('footer.cookiePrefs')}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer__bottom mono">
        <span>
          {t('footer.copyright', { year, legalName: legalIdentity.legalName })}
        </span>
        <span className="footer__tag">{t('footer.tag')}</span>
        <div className="footer__stripe" aria-hidden="true">
          <span style={{ background: 'var(--blue-600)' }} />
          <span style={{ background: 'var(--white)' }} />
          <span style={{ background: 'var(--blue-600)' }} />
        </div>
      </div>
    </footer>
  )
}
