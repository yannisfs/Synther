import { lazy, Suspense } from 'react'

// The two Research routes are code-split: the paper page carries the
// whole Markdown toolchain (react-markdown, the remark/rehype plugins,
// KaTeX and its fonts) and the index page carries the YAML frontmatter
// parser. Most visitors never open the section, so neither should sit in
// the bundle everybody downloads.
//
// React.lazy always suspends once — even when the module is already in
// the module map, because import() resolves in a microtask. On a direct
// visit to /research/ that means React swaps the prerendered page for
// the Suspense fallback for a frame: a flash of the empty state and a
// layout shift of the whole page.
//
// So the module is kept in a cache as well. When it is already there
// (the route was preloaded before the app rendered) the component is
// rendered directly and nothing suspends. Without the preload — a
// client-side navigation from another page — the lazy import runs and
// React shows the fallback until it resolves, which is what the
// fallback is for.

const loadIndex = () => import('./ResearchIndexPage.jsx')
const loadPaper = () => import('./ResearchPaperPage.jsx')

const LazyIndex = lazy(loadIndex)
const LazyPaper = lazy(loadPaper)

const cache = { index: null, paper: null }

// Load the route's module and keep it. Returns a promise that resolves
// once the module is in the cache, so the caller can wait for it before
// rendering the app. Paths outside the Research section load nothing.
export const preloadResearchRoute = async (path) => {
  const isIndex = path === '/research' || path === '/research/'
  const isPaper = path.startsWith('/research/')
  if (!isIndex && !isPaper) return null
  const key = isIndex ? 'index' : 'paper'
  if (cache[key]) return cache[key]
  const mod = isIndex ? await loadIndex() : await loadPaper()
  cache[key] = mod.default
  return cache[key]
}

// The route components. Each renders the cached module when it is
// available and falls back to the lazy import otherwise.
const route = (key, Lazy) => {
  const Route = () => {
    const Loaded = cache[key]
    if (Loaded) return <Loaded />
    return (
      <Suspense fallback={<div className="container research__loading" />}>
        <Lazy />
      </Suspense>
    )
  }
  Route.displayName = `Research${key === 'index' ? 'Index' : 'Paper'}Route`
  return Route
}

export const ResearchIndexRoute = route('index', LazyIndex)
export const ResearchPaperRoute = route('paper', LazyPaper)
