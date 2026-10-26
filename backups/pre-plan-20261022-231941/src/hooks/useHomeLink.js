import { useLocation } from 'react-router-dom'

// The site is a single scrolling page on "/" with hash-anchor navigation
// (#offerings, #approach, #contact). On any other route those anchors do not
// exist, so a plain "#contact" link would do nothing. This hook returns a
// helper that:
//   - passes through absolute paths (starting with "/") unchanged
//   - rewrites hash anchors on the home route as-is
//   - rewrites hash anchors on any other route to "/#…", a full navigation
//     back to the home page that the browser then scrolls to natively.
//
// Keeps the home UX untouched while making the nav work on capability pages
// and on the new /help, /imprint, /cookies routes.
export function useHomeLink() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  return (target) => {
    if (typeof target !== 'string') return target
    if (target.startsWith('/')) return target
    return isHome ? target : `/${target}`
  }
}