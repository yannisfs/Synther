import React from 'react'
import ReactDOM from 'react-dom/client'
import './i18n/config.js' // Side-effect: initializes i18next + sets <html lang>.
import App from './App.jsx'
import { preloadResearchRoute } from './pages/research/routes.jsx'
import './styles.css'
import './components.css'
// The Research section's own rules. Imported after components.css so the
// cascade order is right: the research pages extend the shared classes
// rather than being overridden by them.
import './pages/research/research.css'

// The Research routes are code-split (see pages/research/routes.jsx). A
// visitor who opens /research/ directly gets the prerendered page, but
// React still has to hydrate it — and hydrating a route whose chunk is
// not loaded yet makes React swap the prerendered markup for the
// Suspense fallback for a frame. That shows as a flash of the empty
// state and as a layout shift (the footer jumps down by the height of
// the page).
//
// Loading the route's module before hydration removes both: the module
// is then rendered directly and React never suspends. Visitors who never
// open the section still never download it — the import only runs for a
// research route.
preloadResearchRoute(window.location.pathname).finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
