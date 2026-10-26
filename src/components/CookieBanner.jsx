import { useCallback, useEffect, useState } from 'react'
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
  // V07: the banner can be re-opened on demand (footer "Cookie preferences",
  // "Change settings" on the cookie policy page) even after a decision has
  // already been stored. Before this it could only ever appear when nothing
  // was stored yet.
  const [reopened, setReopened] = useState(false)
  const [hydrated, setHydrated] = useState(false) // gate to prevent flash on first paint

  // Hydrate from localStorage after mount; anything before this returns
  // null so the first paint stays free of UI flicker on return visits.
  useEffect(() => {
    setStored(readConsent())
    setHydrated(true)
  }, [])

  // Persist a new choice, update local state and notify the analytics
  // module. Called from the banner's OK button and from the programmatic
  // API. `config` describes the toggle state; for the banner button the
  // implicit config is { analytics: choice === 'accepted' }.
  const persist = useCallback((choice, config) => {
    const record = {
      choice,
      version: SCHEMA_VERSION,
      config: config ?? { analytics: choice === 'accepted' },
      timestamp: new Date().toISOString(),
    }
    writeStored(record)
    setStored(record)
    // A decision closes the banner — including when it was re-opened
    // manually, so the OK button always leaves the page as it found it.
    setReopened(false)
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
      // V07: re-open the banner. The separate preferences dialog is gone —
      // the banner itself is the one consent surface, and this is how the
      // footer and the cookie policy page bring it back.
      openBanner: () => setReopened(true),
      // Kept as an alias so older call sites keep working.
      openPreferences: () => setReopened(true),
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

  // Until we've hydrated, render nothing — avoids a flash of banner on
  // pages where the user already accepted.
  if (!hydrated) return null

  // V07: one banner, one button. It appears on a first visit (nothing
  // stored yet) and whenever it is re-opened from the footer or the
  // cookie policy page.
  const showBanner = !stored || reopened

  // Compact banner. One primary "OK" button. It stores exactly what
  // "Reject all" used to store — the site loads no analytics, so the
  // only thing the user can consent to is the necessary set, and the
  // acknowledgment is what gets recorded.
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
            className="btn btn--inverse cookie-banner__btn"
            onClick={() => persist('rejected')}
          >
            {t('cookie.ok')}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {showBanner && banner}
    </>
  )
}
