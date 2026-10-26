// Tiny helpers for head-inject.mjs — escaping for HTML attributes and JSON-LD
// <script> bodies. Kept separate so the main module reads cleanly.

/** Escape an HTML attribute value. Quote-safe against `"`. */
export function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

/**
 * Stringify a JSON-LD object for inlining inside a <script> tag.
 * Mitigates the XSS-via-JSON risk by escaping the few characters that
 * can break out of a <script> element.
 *
 * Uses String.fromCharCode for U+2028/U+2029 because writing the literal
 * characters in source gets normalized by the JS parser and breaks regex.
 * U+2028/2029 are the only characters that need this treatment for
 * </script> breakout; the angle-bracket and ampersand escapes are
 * belt-and-suspenders.
 */
export function escapeJsonForScript(obj) {
  const LS = String.fromCharCode(0x2028); // LINE SEPARATOR
  const PS = String.fromCharCode(0x2029); // PARAGRAPH SEPARATOR
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .split(LS).join('\\u2028')
    .split(PS).join('\\u2029');
}
