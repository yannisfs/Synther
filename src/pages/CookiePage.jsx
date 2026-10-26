import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useReveal from '../hooks/useReveal.js'
import usePageSeo from '../hooks/usePageSeo.js'
import { fixedT } from '../lib/fixedT.js'
import { STORAGE_KEY, readConsent } from '../lib/consent.js'
import { onChange as onConsentChange } from '../lib/analytics.js'

// The /cookies page. German legal copy is the primary content (legally
// binding for the GmbH under § 25 TDDDG + Art. 7 GDPR); an English
// courtesy translation follows. `deT` is a t() bound to the 'de' locale
// regardless of the active i18n.language — the DE blocks must always
// render in German. `enT` is the normal useTranslation() hook for the
// EN blocks.
export default function CookiePage() {
  const { t } = useTranslation()
  const deT = useMemo(() => fixedT('de'), [])
  const headRef = useReveal()
  const deRef = useReveal()
  const enRef = useReveal()
  const statusRef = useReveal()
  const asideRef = useReveal()

  // Reset scroll on direct navigation to /cookies.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Set <title>; DocumentTitle yields on non-home routes.
  useEffect(() => {
    document.title = t('title.cookies')
  }, [t])

  // S35/S36: canonical (trailing-slashed to match what Pages serves),
  // og:url, and this page's own social title/description.
  usePageSeo({ path: '/cookies', title: t('title.cookies'), description: t('cookiePage.seo.description') })

  // Hydrate the current consent record so the page can show the user
  // their actual state. Subscribes to consent changes so the status
  // card stays in sync if the user opens the dialog and toggles a
  // preference from this page.
  const [consent, setConsent] = useState(() => readConsent())
  useEffect(() => onConsentChange((r) => setConsent(r)), [])

  // Open the preferences dialog from a button on the page itself, so
  // /cookies is a complete consent-management surface, not just a
  // passive legal document.
  const openSettings = () => {
    if (typeof window !== 'undefined') {
      // V07: the banner is the one consent surface — "Change settings"
      // re-opens it so the visitor can acknowledge there and then.
      window.synther?.consent?.openBanner?.()
    }
  }

  // Inline reset. Clears the local record and reloads so the banner
  // re-appears. The historical D1 audit record is intentionally NOT
  // deleted — Art. 7 (1) GDPR requires the controller to be able to
  // prove the user *did* make a decision at the recorded time. A new
  // decision writes a new audit row.
  const onReset = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // localStorage unavailable — nothing to clear. Reload anyway so
      // the user gets a fresh state from whatever is in the receipt.
    }
    window.location.reload()
  }

  // V07: the banner has a single OK button, so there is no accept /
  // reject distinction left to show — a stored decision is acknowledged
  // either way. Only the absence of a decision is worth calling out.
  const statusKey = consent
    ? 'cookiePage.currentChoice.acknowledged'
    : 'cookiePage.currentChoice.notAcknowledged'

  return (
    <article className="capability imprint">
      {/* Breadcrumb wayfinding */}
      <nav className="capability__crumb" aria-label="Breadcrumb">
        <div className="container">
          <ol>
            <li>
              <Link to="/">{t('cookiePage.breadcrumbHome')}</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{t('cookiePage.breadcrumbCurrent')}</li>
          </ol>
        </div>
      </nav>

      {/* Header */}
      <header className="capability__hero" id="top">
        <div className="capability__hero-bg" aria-hidden="true" />
        <div className="capability__hero-overlay" aria-hidden="true" />
        <div className="container capability__hero-content">
          <div className="capability__hero-head reveal" ref={headRef}>
            <h1 className="capability__title">{t('cookiePage.title')}</h1>
            <p className="capability__lead">{t('cookiePage.lead')}</p>
          </div>
        </div>
      </header>

      {/* Current-consent status card. Sits at the top of the body so a
         user who lands here looking for "how do I change this?" can see
         their current state and the primary action (open settings)
         without scrolling. Mirrors the EDPB transparency principle:
         consent-management UI must show the user their current state. */}
      <section className="section capability__overview cookie-page__status-wrap">
        <div className="container">
          <div className="cookie-page__status reveal" ref={statusRef}>
            <div className="cookie-page__status-text">
              <p className="eyebrow">{t('cookiePage.currentChoice.label')}</p>
              <p
                className={`cookie-page__status-value mono cookie-page__status-value--${consent?.choice ?? 'none'}`}
              >
                {t(statusKey)}
              </p>
            </div>
            <button
              type="button"
              className="btn btn--primary cookie-page__status-action"
              onClick={openSettings}
            >
              {t('cookiePage.currentChoice.openSettings')}
            </button>
          </div>
        </div>
      </section>

      {/* Block 1 — Cookie-Richtlinie (DE) — legally binding */}
      <section className="section capability__overview">
        <div className="container">
          <div className="capability__block reveal" ref={deRef}>
            <p className="eyebrow">{t('cookiePage.kicker')}</p>
            <PolicySection
              head={deT('cookiePage.s1.head')}
              body={deT('cookiePage.s1.body')}
            />
            <PolicySection
              head={deT('cookiePage.s2.head')}
              body={deT('cookiePage.s2.body')}
            />
            <PolicySection
              head={deT('cookiePage.s3.head')}
              body={deT('cookiePage.s3.body')}
            />
            <PolicySection
              head={deT('cookiePage.s4.head')}
              body={deT('cookiePage.s4.body')}
            />
            <PolicySection
              head={deT('cookiePage.s5.head')}
              body={deT('cookiePage.s5.body')}
            />
          </div>
        </div>
      </section>

      {/* Block 2 — Cookie Policy (EN) — courtesy translation */}
      <section className="section capability__caps">
        <div className="container">
          <div className="capability__block-head reveal" ref={enRef}>
            <p className="eyebrow">{t('cookiePage.englishEyebrow')}</p>
            <h2 className="capability__h2">{t('cookiePage.english.kicker')}</h2>
          </div>
          <div className="capability__body">
            <PolicySection
              head={t('cookiePage.english.s1.head')}
              body={t('cookiePage.english.s1.body')}
            />
            <PolicySection
              head={t('cookiePage.english.s2.head')}
              body={t('cookiePage.english.s2.body')}
            />
            <PolicySection
              head={t('cookiePage.english.s3.head')}
              body={t('cookiePage.english.s3.body')}
            />
            <PolicySection
              head={t('cookiePage.english.s4.head')}
              body={t('cookiePage.english.s4.body')}
            />
            <PolicySection
              head={t('cookiePage.english.s5.head')}
              body={t('cookiePage.english.s5.body')}
            />
          </div>
        </div>
      </section>

      {/* "Clear local decision" aside. Not legally required — a user can
         always open the dialog and reject. This is a convenience for the
         "start over" case (e.g. a test user, a developer, someone whose
         stored record is stale). Demoted from a primary button to a small
         mono text link so it doesn't look like a required action. */}
      <aside className="cookie-page__aside" aria-label={t('cookiePage.aside.head')}>
        <div className="container">
          <div className="cookie-page__aside-inner reveal" ref={asideRef}>
            <h2 className="cookie-page__aside-title">
              {t('cookiePage.aside.head')}
            </h2>
            <p className="cookie-page__aside-body">{t('cookiePage.aside.body')}</p>
            <button
              type="button"
              className="cookie-page__aside-reset mono"
              onClick={onReset}
            >
              {t('cookiePage.aside.reset')}
            </button>
          </div>
        </div>
      </aside>

      {/* Back to home CTA */}
      <div className="container imprint__back-cta">
        <Link to="/" className="btn btn--ghost">
          {t('cookiePage.backCta')}
        </Link>
      </div>
    </article>
  )
}

// One <h3> + paragraph in the policy body. No `children` slot anymore —
// the reset action has been moved to a dedicated aside below the
// EN courtesy block.
//
// V25: the body may contain a link (the privacy notice reference in
// section 2). It is our own copy, not user input, so it is rendered as
// HTML — otherwise the anchor would show up as literal markup.
function PolicySection({ head, body }) {
  return (
    <div className="cookie-page__section">
      <h3 className="capability__cap-title">{head}</h3>
      <p dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  )
}
