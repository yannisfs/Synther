import { useEffect } from 'react'
import { SITE_URL } from '../data/content.js'

// S36 + S35: one place that owns the per-page <link rel="canonical">,
// og:url and the social card tags.
//
// S36: Cloudflare Pages serves /disciplines/<id> only as
// /disciplines/<id>/ — the slashless form gets a 308. A canonical pointing
// at the slashless URL therefore advertises a redirect to crawlers on every
// discipline page. Every canonical and og:url this site emits goes through
// withSlash() so it names the URL the browser actually ends up on.
//
// S35: og:title / twitter:title / og:description / twitter:description were
// static values in index.html, so every subpage shared the homepage's
// social card. They are now derived from the same <title> and meta
// description the page renders, so they cannot drift from what a visitor
// sees.
//
// Note this does NOT touch og:image. index.html points it at /Synther.svg,
// and social platforms don't render SVG in a preview card — fixing that
// needs the PNG from homepage task T06, which is still outstanding. Left
// as-is rather than half-changed.
//
// V28: the canonical and og:url are built from SITE_URL (the production
// origin), not from window.location.origin. With the origin, a local or
// staging build advertised http://localhost… as the canonical address of
// every page, and search engines would have indexed that.
//
// Contract:
//   title === null  → the page does not opt in; the hook does nothing at
//                      all. (Used by <DocumentTitle /> on non-home routes,
//                      where a page component owns the SEO instead.)
//   stripCanonical   → the page has no canonical URL of its own (the 404).
//                      Drops the <link rel="canonical"> / og:url that
//                      index.html ships statically, so an unknown URL isn't
//                      advertised as a duplicate of the homepage.

const withSlash = (p) => {
  if (!p || p === '/') return '/'
  return p.endsWith('/') ? p : `${p}/`
}

// Set a meta tag's content, creating the tag if it isn't in index.html.
// Returns a restore function, or null when there is nothing to do.
const setMeta = (attr, key, value) => {
  if (!value) return null
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  const prev = el.getAttribute('content')
  el.setAttribute('content', value)
  return () => {
    if (prev != null) el.setAttribute('content', prev)
    else el.remove()
  }
}

export default function usePageSeo({ path, title, description, stripCanonical = false }) {
  useEffect(() => {
    if (title == null) return undefined

    const restore = []

    if (stripCanonical) {
      // A page with no canonical of its own — the 404. index.html ships the
      // homepage's <link rel="canonical"> and og:url statically, and the
      // prerendered 404.html inherits them, which would tell crawlers that
      // every unknown URL is a duplicate of the homepage.
      const canonical = document.querySelector('link[rel="canonical"]')
      const prevCanonical = canonical ? canonical.getAttribute('href') : null
      canonical?.remove()
      const ogUrl = document.head.querySelector('meta[property="og:url"]')
      const prevOgUrl = ogUrl ? ogUrl.getAttribute('content') : null
      ogUrl?.remove()
      restore.push(() => {
        if (prevCanonical != null) {
          const el = document.createElement('link')
          el.rel = 'canonical'
          el.setAttribute('href', prevCanonical)
          document.head.appendChild(el)
        }
        if (prevOgUrl != null) setMeta('property', 'og:url', prevOgUrl)
      })
    } else if (path) {
      let canonical = document.querySelector('link[rel="canonical"]')
      const prevCanonical = canonical ? canonical.getAttribute('href') : null
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.appendChild(canonical)
      }
      canonical.setAttribute('href', `${SITE_URL}${withSlash(path)}`)
      restore.push(() => {
        if (prevCanonical != null) canonical.setAttribute('href', prevCanonical)
        else canonical.remove()
      })
      restore.push(setMeta('property', 'og:url', `${SITE_URL}${withSlash(path)}`))
    }

    restore.push(
      // The plain <meta name="description"> too. Until now this hook
      // only fed the social card (og:description / twitter:description),
      // so every page that doesn't set the description itself — /help/,
      // /cookies/, /imprint/ — served index.html's homepage description
      // to search engines. CapabilityPage set its own; the rest inherited
      // the homepage's.
      setMeta('name', 'description', description),
      setMeta('property', 'og:title', title),
      setMeta('name', 'twitter:title', title),
      setMeta('property', 'og:description', description),
      setMeta('name', 'twitter:description', description)
    )

    return () => restore.forEach((fn) => fn && fn())
  }, [path, title, description, stripCanonical])
}