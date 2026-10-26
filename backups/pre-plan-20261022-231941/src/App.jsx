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
              links here for the full TTDSG / GDPR-7 explanation. */}
          <Route path="/cookies" element={<CookiePage />} />
          {/* /help — urgent support, 30-min consult, guides index. The
              /help/guides subroute is a placeholder for v1; the SPA
              fallback renders the home page until guides are written. */}
          <Route path="/help" element={<HelpPage />} />
          {/* Anything else falls back to the home page (the _redirects file
              already serves index.html for every path). */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
      <CookieBanner />
    </BrowserRouter>
  )
}