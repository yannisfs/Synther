// Consent-gated analytics fan-out.
//
// A single state machine that sits between the rest of the app and any
// future analytics provider. The contract is intentionally small:
//
//   window.synther.analytics = {
//     register(name, { init, enable, disable, track }),
//     track(eventName, properties),
//     identify(userId, traits),
//   }
//
// Any vendor (Plausible, Umami, Cloudflare Web Analytics, a first-party
// D1 sink) plugs in with a single `register` call. Until a provider is
// registered, `track` is a silent no-op — strict opt-in by default.
//
// Events queued before consent is granted are held in memory and replayed
// in order on the next grant. They are NOT persisted to localStorage — a
// page reload drops them. This is deliberate: pre-consent pageviews must
// not end up in a vendor's dataset even in a buffer. If a future audit
// needs them, that's a different (and explicit) feature.
//
// The module depends on the consent module through getters passed in by
// the banner (see `init`), not through an import. That keeps the dep
// arrow one-way — banner → both modules — and lets the analytics module
// be unit-tested without a DOM.

let consentGetter = () => null
let consentPersister = null // (choice, config) => record
let onConsentChangeCallback = null // (record) => void

// provider.name -> { init, enable, disable, track, identify, state }
const providers = new Map()
// Event buffer for calls made before consent was granted.
const buffer = []
// Latest known consent record, kept in sync by the banner's persist() path.
let lastRecord = null
// `init` is a guard so `register()` doesn't double-init a provider that
// consent was already granted for.
let inited = false

function fanoutTrack(name, props) {
  for (const p of providers.values()) {
    try {
      p.track?.(name, props)
    } catch (err) {
      // A misbehaving provider must not take down the rest. Log and move on.
      console.error(`[analytics] provider "${p.__name}" track() failed`, err)
    }
  }
}

function replayBuffer() {
  if (buffer.length === 0) return
  // Swap the buffer out before replaying so any track() calls made during
  // replay (e.g. from a provider's init) are appended to a fresh buffer.
  const queued = buffer.splice(0, buffer.length)
  for (const evt of queued) {
    if (evt.type === 'track') fanoutTrack(evt.name, evt.props)
    // identify() is not buffered — it carries PII and should never be
    // replayed without an explicit fresh call.
  }
}

function notifyChange(record) {
  for (const fn of changeListeners) {
    try {
      fn(record)
    } catch (err) {
      console.error('[analytics] onChange listener failed', err)
    }
  }
}

const changeListeners = new Set()

// Called once from the banner after the consent record is hydrated.
// `getConsent` returns the latest stored record (or null). `persistConsent`
// is the same `persist` the banner uses, so analytics consent changes
// fan out to providers in the same tick as the UI state update.
export function init({ getConsent, persistConsent } = {}) {
  if (typeof getConsent === 'function') consentGetter = getConsent
  if (typeof persistConsent === 'function') consentPersister = persistConsent
}

// Called by the banner on every consent change. `record` is the new
// stored record (or null if consent was cleared).
export function onConsentChange(record) {
  lastRecord = record
  const wasGranted = inited
  const isGranted = record?.choice === 'accepted' && record?.config?.analytics === true

  if (isGranted) {
    // First-time grant: init every registered provider. Re-grant after a
    // toggle: just enable.
    if (!wasGranted) {
      for (const p of providers.values()) {
        try {
          p.init?.()
        } catch (err) {
          console.error(`[analytics] provider "${p.__name}" init() failed`, err)
        }
      }
      inited = true
    }
    for (const p of providers.values()) {
      try {
        p.enable?.()
      } catch (err) {
        console.error(`[analytics] provider "${p.__name}" enable() failed`, err)
      }
    }
    replayBuffer()
  } else if (wasGranted) {
    // Going from granted → not granted (reject, toggle off, or wipe).
    // Providers stay registered so a later re-enable is cheap.
    for (const p of providers.values()) {
      try {
        p.disable?.()
      } catch (err) {
        console.error(`[analytics] provider "${p.__name}" disable() failed`, err)
      }
    }
    // Drop any events that were queued during the brief grant window —
    // they didn't fire because the user was mid-toggle.
    buffer.length = 0
  }

  notifyChange(record)
}

// Register a provider. Idempotent on name: a second call with the same
// name replaces the provider. If consent has already been granted, init
// fires immediately. Track calls made before this are replayed after init.
export function register(name, provider) {
  if (typeof name !== 'string' || !name) {
    console.error('[analytics] register: provider name must be a non-empty string')
    return
  }
  if (!provider || typeof provider !== 'object') {
    console.error('[analytics] register: provider must be an object')
    return
  }
  const tagged = { ...provider, __name: name }
  providers.set(name, tagged)

  // If consent has already been granted, init this provider right now.
  if (lastRecord?.choice === 'accepted' && lastRecord?.config?.analytics === true) {
    try {
      tagged.init?.()
    } catch (err) {
      console.error(`[analytics] provider "${name}" init() failed`, err)
    }
    try {
      tagged.enable?.()
    } catch (err) {
      console.error(`[analytics] provider "${name}" enable() failed`, err)
    }
    inited = true
  }
}

// Track a typed event. Buffered until consent is granted; fanned out to
// every registered provider when it is. No-op when no provider is
// registered AND consent is not yet granted (the privacy-by-default
// behaviour: no events leak even into the buffer if nothing is listening).
export function track(eventName, properties) {
  if (typeof eventName !== 'string' || !eventName) return
  const record = consentGetter() ?? lastRecord
  const granted = record?.choice === 'accepted' && record?.config?.analytics === true
  if (granted) {
    fanoutTrack(eventName, properties)
  } else if (providers.size > 0) {
    // Only buffer if a provider has actually been registered. Otherwise
    // memory grows for nothing.
    buffer.push({ type: 'track', name: eventName, props: properties })
  }
}

// Set user-level state on every provider that supports it. Optional —
// first-party sinks use it, third-party pageview tools ignore it. Not
// buffered, because PII should not be queued.
export function identify(userId, traits) {
  for (const p of providers.values()) {
    try {
      p.identify?.(userId, traits)
    } catch (err) {
      console.error(`[analytics] provider "${p.__name}" identify() failed`, err)
    }
  }
}

// Subscribe to consent changes. Returns an unsubscribe function. Used by
// `window.synther.consent.onChange(fn)` and by the Footer's hidden-state
// effect so a consent change in the banner reflects in the footer link.
export function onChange(fn) {
  if (typeof fn !== 'function') return () => {}
  changeListeners.add(fn)
  return () => changeListeners.delete(fn)
}

// Test-only / debug access. Not exported on `window.synther`.
export const _internal = {
  providers,
  buffer,
  get lastRecord() {
    return lastRecord
  },
}
