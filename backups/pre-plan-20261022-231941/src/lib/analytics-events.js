// Centralised list of typed analytics event names. Single source of truth
// so a future search-and-replace finds them all. Frozen so a typo in a
// call site that adds a key throws at module load instead of silently
// firing a mistyped event.
//
// `README`: adding a new provider is a one-liner — drop a <script> that
// calls `window.synther.analytics.register(name, { init, enable, disable,
// track, identify })` and the rest of the wiring is already done.

export const EVENTS = Object.freeze({
  PAGE_VIEW: 'page_view',
  CTA_CLICK: 'cta_click',
  CONTACT_SUBMIT: 'contact_submit',
  CONSENT_GRANTED: 'consent_granted',
  CONSENT_REVOKED: 'consent_revoked',
  IMPRINT_VISIT: 'imprint_visit',
  COOKIE_POLICY_VISIT: 'cookie_policy_visit',
})
