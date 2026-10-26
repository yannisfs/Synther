// Re-export shim. The active imprint template is the one this file
// re-exports.
//
// Today (while the Synther GmbH registration is still pending):
//     export { default } from './ImprintPage.private.jsx'
//
// After the GmbH is registered and the legal-entity data is filled in:
//     export { default } from './ImprintPage.gmbh.jsx'
//
// Both template files are self-contained (each defines its own default
// export). No other file imports them directly; only the router in
// src/App.jsx imports this shim at the path './pages/ImprintPage.jsx'.
// So flipping this one line is the entire post-registration switch.

export { default } from './ImprintPage.private.jsx'
