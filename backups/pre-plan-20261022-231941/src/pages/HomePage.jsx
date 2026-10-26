import Hero from '../components/Hero.jsx'
import Stats from '../components/Stats.jsx'
import Quote from '../components/Quote.jsx'
import About from '../components/About.jsx'
import Offerings from '../components/Offerings.jsx'
import Approach from '../components/Approach.jsx'
import Contact from '../components/Contact.jsx'

// The single scrolling landing page. Unchanged composition — routing wraps it
// at "/" so discipline pages can live at /disciplines/:id without disturbing
// the home page's anchor navigation.
export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Quote />
      <About />
      <Offerings />
      <Approach />
      <Contact />
    </>
  )
}