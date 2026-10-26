import { useEffect, useRef } from 'react'

// Adds `is-visible` to an element when it scrolls into view.
// Returns a ref to attach to the target node. Honors prefers-reduced-motion
// (the CSS disables the transition; we still reveal immediately).
//
// Robustness notes — a reveal must never be able to strand content invisible:
//
//  1. `threshold: 0` + a NEGATIVE bottom rootMargin would require the element
//     to clear the viewport top before counting, which is backwards. We instead
//     fire on any intersection at all, so the observer can never miss a section
//     that a fast scroll jumped clean over.
//  2. The observer callback also reveals when the element has been scrolled
//     PAST (boundingClientRect.top < 0). A trackpad flick can move further in
//     one frame than IntersectionObserver's queued callback is delivered for,
//     so a section can go from "below the viewport" to "above it" without ever
//     being observed as intersecting. That is the case that previously left
//     whole sections stuck at opacity: 0 for the rest of the session.
//  3. A scroll listener is the backstop for the same race: on every scroll frame
//     we check each target once and reveal it if its top is above the fold.
//     Cheap (a single getBoundingClientRect per target) and it makes the
//     failure mode impossible rather than merely unlikely.
//  4. The observer options are destructured to primitives before use as effect
//     deps. Passing the options OBJECT meant a fresh `{}` literal on every
//     render, which tore down and rebuilt the observer on every single render.
export default function useReveal(options = {}) {
  const ref = useRef(null)

  const { threshold = 0.15, rootMargin = '0px 0px -10% 0px' } = options

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const reveal = () => node.classList.add('is-visible')

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      reveal()
      return
    }

    let done = false
    const finish = () => {
      if (done) return
      done = true
      reveal()
      io.unobserve(node)
      window.removeEventListener('scroll', onScroll)
    }

    // Backstop: reveal once the element's top edge has passed the fold, whether
    // or not the observer ever reported it intersecting.
    const onScroll = () => {
      if (done) return
      if (node.getBoundingClientRect().top < window.innerHeight) finish()
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            finish()
          } else if (entry.boundingClientRect.top < 0) {
            // Scrolled past without an intersect report — reveal rather than
            // leave a section the user has already scrolled beyond invisible.
            finish()
          }
        })
      },
      { threshold, rootMargin }
    )

    io.observe(node)

    // Covers the case where the element is already in view on mount, or the
    // viewport is resized so that it lands in view without any scroll.
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [threshold, rootMargin])

  return ref
}