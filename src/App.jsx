import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DocumentTitle from './components/DocumentTitle.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import CookieBanner from './components/CookieBanner.jsx'
import HomePage from './pages/HomePage.jsx'
import CapabilityPage from './pages/CapabilityPage.jsx'
import ImprintPage from './pages/ImprintPage.jsx'
import CookiePage from './pages/CookiePage.jsx'
import HelpPage from './pages/HelpPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <DocumentTitle />
      <Navbar />
      <main>
        <Routes>
          {/* The home route is the unchanged single scrolling page. */}
          <Route path="/" element={<HomePage />} />
          {/* Full discipline pages. */}
          <Route path="/disciplines/:id" element={<CapabilityPage />} />
          {/* Imprint / privacy. Real legal page, served via the SPA fallback
              that already covers every path in public/_redirects. */}
          <Route path="/imprint" element={<ImprintPage />} />
          {/* Dedicated cookie policy page. The imprint's "Cookies" section
              links here for the full TDDDG / GDPR-7 explanation. */}
          <Route path="/cookies" element={<CookiePage />} />
          {/* /help — urgent support and 30-minute consult. The guides
              index was removed in S02 (D10 = hide): no route or link
              points at /help/guides until real content exists. */}
          <Route path="/help" element={<HelpPage />} />
          {/* S01: unknown paths render the branded 404, not the homepage. Unknown
              URLs hit dist/404.html at the edge (real HTTP 404); this
              catch-all covers client-side navigation to a bad path. */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <CookieBanner />
    </BrowserRouter>
  )
}