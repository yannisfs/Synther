import Hero from '../components/Hero.jsx'
import Stats from '../components/Stats.jsx'
import About from '../components/About.jsx'
import Offerings from '../components/Offerings.jsx'
import Approach from '../components/Approach.jsx'
import Contact from '../components/Contact.jsx'

// V06: the stats strip is placeholder content — the figures are not
// backed by anything we can point at, so the section is not rendered.
// The constant stays so the strip can come back with real numbers.
const SHOW_STATS = false

// The single scrolling landing page. Unchanged composition — routing wraps it
// at "/" so discipline pages can live at /disciplines/:id without disturbing
// the home page's anchor navigation.
export default function HomePage() {
  return (
    <>
      <Hero />
      {SHOW_STATS && <Stats />}
      <About />
      <Offerings />
      <Approach />
      <Contact />
    </>
  )
}