// Re-export shim. The active imprint template is the one this file
// re-exports.
//
// Today (the site identifies the operator as Synther GmbH):
//     export { default } from './ImprintPage.gmbh.jsx'
//
// Fallback (the private-person imprint used before the registration):
//     export { default } from './ImprintPage.private.jsx'
//
// Both template files are self-contained (each defines its own default
// export). No other file imports them directly; only the router in
// src/App.jsx imports this shim at the path './pages/ImprintPage.jsx'.
// So flipping this one line is the entire switch.

export { default } from './ImprintPage.gmbh.jsx'
