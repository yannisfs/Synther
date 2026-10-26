import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { nav } from '../data/content.js'
import { useHomeLink } from '../hooks/useHomeLink.js'
import Icon from './Icon.jsx'

export default function Navbar() {
  const { t } = useTranslation()
  const homeHref = useHomeLink()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <span className="nav__bg" aria-hidden="true" />
      <div className="container nav__inner">
        <a href={homeHref('#top')} className="nav__brand" aria-label={t('nav.ariaBrand')}>
          <img src="/Synther.svg" alt="" className="nav__logo" width="28" height="28" />
          <span className="nav__brand-text">{t('site.brand')}</span>
        </a>

        <nav className={`nav__links ${open ? 'is-open' : ''}`} id="mobile-menu">
          {nav.map((item) => (
            <a key={item.href} href={homeHref(item.href)} onClick={() => setOpen(false)}>
              {t(`nav.${item.key}`)}
            </a>
          ))}
          <a
            href={homeHref('#contact')}
            className="btn btn--primary nav__cta"
            onClick={() => setOpen(false)}
          >
            {t('nav.cta')}
          </a>
        </nav>

        <button
          className={`nav__toggle ${open ? 'is-open' : ''}`}
          aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name="cog" size={24} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}