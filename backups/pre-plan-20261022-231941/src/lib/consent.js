// Single source of truth for the cookie-consent schema version.
// Bump this (and the matching value in functions/api/consent.js) whenever
// the shape of the localStorage record or the categories change. The banner
// re-prompts users whose stored version is older than this.

export const SCHEMA_VERSION = '1.0.0'

export const STORAGE_KEY = 'synther.consent'

// Read the stored consent record. Returns null when nothing is stored or
// the stored version is older than SCHEMA_VERSION (which re-prompts the
// user when the schema changes). Shared by the banner and the footer so
// they agree on what "has a choice been made" means.
export function readConsent() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.version !== SCHEMA_VERSION) return null
    if (parsed.choice !== 'accepted' && parsed.choice !== 'rejected') return null
    return parsed
  } catch {
    return null
  }
}

// Boolean form of readConsent(). Cheap to call from the footer's effect.
export function hasConsent() {
  return readConsent() !== null
}