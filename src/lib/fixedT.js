// Use a fixed language for t() regardless of i18n.language. Used by the
// imprint and cookie pages, which render legally-binding German text in
// German even when the rest of the site is English.
//
// Why this does NOT use i18n.getFixedT(lng, null, null):
// The i18n config in src/i18n/config.js intentionally declares
// `supportedLngs: ['en']` so a German browser visiting the site does not
// get auto-switched to German UI — the whole site is English-only for
// users. With that config, `getFixedT('de', ...)` falls through i18next's
// resolution chain (de is not in supportedLngs → en fallback → en has no
// `imprint.privacy.*` keys) and the call returns the literal key string
// like "imprint.privacy.controllerHead" — which is exactly the bug this
// helper used to ship.
//
// The fix: bypass i18next's resolution entirely. The `de` resource is
// already loaded into the i18n instance (it's how the call sites get the
// data); we just read it directly from the resource bundle and walk the
// dotted key path. This is a tiny, self-contained lookup with no surprise
// interaction with supportedLngs / fallbackLng / load order.
//
// `keyPrefix` is honored for parity with i18next's getFixedT API: a caller
// can pass "imprint" and then call deT("privacy.controllerHead") instead
// of deT("imprint.privacy.controllerHead"). Unused today but cheap.

import i18n from '../i18n/config.js'

function resolveKey(obj, key) {
  const parts = key.split('.')
  let cur = obj
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[p]
  }
  return cur
}

function interpolate(value, opts) {
  if (!opts) return value
  return value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
    opts[name] != null ? String(opts[name]) : `{{${name}}}`
  )
}

export function fixedT(lng, keyPrefix) {
  const prefix = keyPrefix ? `${keyPrefix}.` : ''
  return (key, opts) => {
    const fullKey = prefix + key
    const bundle = i18n.getResourceBundle(lng, 'translation')
    const value = resolveKey(bundle, fullKey)
    if (typeof value === 'string') return interpolate(value, opts)
    // Match i18next's "key-as-string" fallback so missing keys are
    // greppable in the rendered HTML rather than silently empty.
    return fullKey
  }
}
