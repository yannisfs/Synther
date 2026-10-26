import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { readConsent, SCHEMA_VERSION, STORAGE_KEY } from '../lib/consent.js'
import {
  init as initAnalytics,
  onConsentChange,
  register as analyticsRegister,
  track as analyticsTrack,
  identify as analyticsIdentify,
  onChange as onConsentChangeSubscribe,
} from '../lib/analytics.js'
import { EVENTS } from '../lib/analytics-events.js'
import Icon from './Icon.jsx'

// Persist a new choice into localStorage. The D1 receipt is sent
// fire-and-forget; a failed receipt must never block the UI or block
// the user from dismissing the banner.
function writeStored(record) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch {
    // localStorage unavailable (private mode, blocked storage) — silently
    // ignore. The D1 receipt still records the choice via the POST.
  }
}

function postReceipt(payload) {
  try {
    fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch((err) => {
      console.error('Consent receipt failed', err)
    })
  } catch (err) {
    console.error('Consent receipt failed to dispatch', err)
  }
}

export default function CookieBanner() {
  const { t } = useTranslation()
  const [stored, setStored] = useState(null) // null on first render — we hydrate in an effect
  const [openPrefs, setOpenPrefs] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef(null)
  const [hydrated, setHydrated] = useState(false) // gate to prevent flash on first paint

  // Hydrate from localStorage after mount; anything before this returns
  // null so the first paint stays free of UI flicker on return visits.
  useEffect(() => {
    setStored(readConsent())
    setHydrated(true)
  }, [])

  // Persist a new choice, update local state and notify the analytics
  // module. Called from every UI affordance (Accept, Reject, X, prefs
  // dialog). `config` describes the toggle state in the preferences
  // dialog; for the compact banner buttons the implicit config is
  // { analytics: choice === 'accepted' }.
  const persist = useCallback((choice, config) => {
    const record = {
      choice,
      version: SCHEMA_VERSION,
      config: config ?? { analytics: choice === 'accepted' },
      timestamp: new Date().toISOString(),
    }
    writeStored(record)
    setStored(record)
    postReceipt({ choice, version: SCHEMA_VERSION, config: record.config })
    // Fan out to any registered analytics providers. Errors here are
    // already caught inside the module — a misbehaving provider can't
    // take down the consent write.
    onConsentChange(record)
    return record
  }, [])

  // Expose the consent + analytics API on window. The consent object is
  // the single chokepoint for any future analytics integration; the
  // analytics object is the contract those integrations register against.
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.synther = window.synther || {}
    window.synther.consent = {
      get state() {
        return readConsent()
      },
      accept: () => persist('accepted'),
      reject: () => persist('rejected'),
      set: (config) => persist(config?.analytics ? 'accepted' : 'rejected', config),
      openPreferences: () => setOpenPrefs(true),
      // onChange(fn) lets non-analytics code (e.g. the footer) react to
      // consent changes without subscribing to a custom event bus.
      onChange: (fn) => onConsentChangeSubscribe(fn),
      // Legacy single-call hook kept for any in-flight caller. Calls fn()
      // synchronously if consent is currently accepted with analytics on;
      // otherwise no-op. This was the v1 stub; it's now a thin wrapper
      // over the new state machine so old call sites still work.
      analytics: (fn) => {
        const s = readConsent()
        if (s && s.choice === 'accepted' && s.config?.analytics === true && typeof fn === 'function') {
          fn()
        }
      },
    }
    window.synther.analytics = {
      register: analyticsRegister,
      track: analyticsTrack,
      identify: analyticsIdentify,
      EVENTS,
    }
    // Don't wipe on unmount — other tabs / future route changes may still
    // call into the API, and the browser window outlives this component.
  }, [persist])

  // Wire the analytics module to the consent module on mount, after the
  // hydration effect. The module's getters are pure functions, so a
  // re-mount is safe.
  useEffect(() => {
    initAnalytics({
      getConsent: readConsent,
      persistConsent: persist,
    })
  }, [persist])

  // Cleanup the toast timer on unmount.
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    },
    [],
  )

  const flashToast = useCallback(() => {
    setToastVisible(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 3000)
  }, [])

  // Until we've hydrated, render nothing — avoids a flash of banner on
  // pages where the user already accepted.
  if (!hydrated) return null

  const showBanner = !stored && !openPrefs

  // Preferences dialog: two categories. "Necessary" is locked on;
  // "Analytics" is the only real choice. Today there are no analytics
  // loaded; the toggle is a forward-compatible placeholder so the
  // integration doesn't have to touch the UI later.
  const prefs = (
    <div
      className="cookie-banner__prefs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-prefs-title"
    >
      <div className="cookie-banner__prefs-card">
        <div className="cookie-banner__prefs-head">
          <h2 id="cookie-prefs-title" className="cookie-banner__prefs-title">
            {t('cookie.preferencesTitle')}
          </h2>
          <button
            type="button"
            className="cookie-banner__prefs-close"
            aria-label={t('cookie.reject')}
            onClick={() => setOpenPrefs(false)}
          >
            <Icon name="check" size={18} strokeWidth={1.5} />
            {/* The check icon doubles as a "done/close" glyph; aria-label
                is the canonical name. */}
          </button>
        </div>

        <ul className="cookie-banner__categories">
          <li className="cookie-banner__category">
            <div className="cookie-banner__category-text">
              <div className="cookie-banner__category-label">
                {t('cookie.category.necessary.label')}
              </div>
              <p className="cookie-banner__category-desc">
                {t('cookie.category.necessary.description')}
              </p>
            </div>
            <span
              className="cookie-banner__toggle cookie-banner__toggle--locked"
              aria-label={t('cookie.category.necessary.label')}
            >
              <span className="cookie-banner__toggle-knob" />
            </span>
          </li>
          <li className="cookie-banner__category">
            <div className="cookie-banner__category-text">
              <div className="cookie-banner__category-label">
                {t('cookie.category.analytics.label')}
              </div>
              <p className="cookie-banner__category-desc">
                {t('cookie.category.analytics.description')}
              </p>
            </div>
            <button
              type="button"
              className="cookie-banner__toggle"
              role="switch"
              aria-checked={stored?.config?.analytics === true}
              aria-label={t('cookie.category.analytics.label')}
              onClick={() => {
                const nextAnalytics = !(stored?.config?.analytics === true)
                persist(nextAnalytics ? 'accepted' : 'rejected', { analytics: nextAnalytics })
                flashToast()
              }}
            >
              <span className="cookie-banner__toggle-knob" />
            </button>
          </li>
        </ul>

        <div className="cookie-banner__prefs-actions">
          <button
            type="button"
            className="btn btn--ghost cookie-banner__btn"
            onClick={() => {
              persist('rejected')
              flashToast()
              setOpenPrefs(false)
            }}
          >
            {t('cookie.reject')}
          </button>
          <button
            type="button"
            className="btn btn--ghost cookie-banner__btn"
            onClick={() => {
              flashToast()
              setOpenPrefs(false)
            }}
          >
            {t('cookie.save')}
          </button>
          <button
            type="button"
            className="btn btn--primary cookie-banner__btn"
            onClick={() => {
              persist('accepted')
              flashToast()
              setOpenPrefs(false)
            }}
          >
            {t('cookie.accept')}
          </button>
        </div>

        <div className="cookie-banner__prefs-foot">
          <LinkToCookies />
        </div>
      </div>
    </div>
  )

  // Compact banner. The bar has three logical columns at desktop:
  //   [title] [body + learn-more] [Reject | Accept]
  // No X close button — its action was identical to "Reject all" and
  // having two ways to do the same thing was redundant UI. The Reject
  // button is the canonical "use only necessary" affordance; Accept
  // is the affirmative action. "Settings" lives only in the preferences
  // dialog; the compact banner is the focused consent prompt.
  const banner = (
    <div
      className="cookie-banner cookie-banner--compact"
      role="region"
      aria-label={t('cookie.title')}
    >
      <div className="container cookie-banner__inner">
        <div className="cookie-banner__head">
          <p className="cookie-banner__title mono">{t('cookie.title')}</p>
        </div>
        <div className="cookie-banner__body">
          <p>
            {t('cookie.body')}{' '}
            <a
              className="cookie-banner__learnmore cookie-banner__learnmore--inline"
              href="/cookies"
            >
              {t('cookie.learnMore')}
            </a>
          </p>
        </div>
        <div className="cookie-banner__actions">
          <button
            type="button"
            className="btn btn--ghost cookie-banner__btn"
            onClick={() => persist('rejected')}
          >
            {t('cookie.reject')}
          </button>
          <button
            type="button"
            className="btn btn--primary cookie-banner__btn"
            onClick={() => persist('accepted')}
          >
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  )

  // The toast lives outside both — it appears above the banner area
  // when a preference is saved from the dialog.
  const toast = toastVisible ? (
    <div className="cookie-banner__toast" role="status" aria-live="polite">
      {t('cookie.saved')}
    </div>
  ) : null

  return (
    <>
      {openPrefs && prefs}
      {showBanner && banner}
      {toast}
    </>
  )
}

// Tiny inline "learn more" link to the cookie policy page. The component
// is split out only so the JSX in `prefs` stays readable.
function LinkToCookies() {
  const { t } = useTranslation()
  return (
    <a className="cookie-banner__learnmore" href="/cookies">
      {t('cookie.learnMore')}
    </a>
  )
}
