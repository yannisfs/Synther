// The browser-side content loader for the Research section.
//
// The papers live as Markdown under src/content/research/<slug>/index.md.
// `import.meta.glob` inlines them at build time — the raw Markdown string
// for each paper — so there is no runtime file access and no server.
//
// The Node side of the build (the prerender script and the feed writer)
// cannot use import.meta.glob, so it reads the same folder from disk with
// the same parser and validator: see scripts/lib/research-files.mjs and
// src/lib/research/parse.js, which both sides share.

import {
  parsePaper,
  validatePaper,
  normalizePaper,
  sortPapers,
  AGENDA_STATUSES,
} from './research/parse.js'

// Every published paper's index.md, inlined as a raw string. The `?raw`
// query makes Vite hand over the file contents instead of trying to
// transform it. Folders whose name starts with "_" are drafts and are
// left out of this glob.
const rawPapers = import.meta.glob(
  ['/src/content/research/*/index.md', '!/src/content/research/_*/index.md'],
  {
    query: '?raw',
    import: 'default',
    eager: true,
  }
)

// Drafts (underscore-prefixed folders) are inlined here, but this glob
// is only referenced from the development branch below. In a production
// build `import.meta.env.DEV` is the literal false, the branch is
// folded away, and the draft's text is dropped from the bundle — a
// draft is never published, not even as bytes a visitor could read.
const rawDevDrafts = import.meta.glob('/src/content/research/_*/index.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const rawAll = import.meta.env.DEV ? { ...rawPapers, ...rawDevDrafts } : rawPapers

// The agenda is optional — the glob is empty when the file is absent, so
// the "In progress" section simply never renders.
const rawAgenda = import.meta.glob('/src/content/research/agenda.json', {
  query: '?raw',
  import: 'default',
  eager: true,
})

let cache = null

// Parse + validate every paper once. A broken paper throws here, naming
// the file and the field — the prerender step runs the app in a real
// browser, so the failure surfaces as a failed build rather than a blank
// page in production.
const load = () => {
  if (cache) return cache

  const papers = Object.entries(rawAll).map(([file, raw]) => {
    const paper = parsePaper(raw, file)
    validatePaper(paper)
    return normalizePaper(paper)
  })

  const agenda = Object.values(rawAgenda)[0]
    ? JSON.parse(Object.values(rawAgenda)[0])
    : []
  if (!Array.isArray(agenda)) {
    throw new Error('Research agenda: src/content/research/agenda.json must contain a list')
  }
  agenda.forEach((entry, i) => {
    if (!entry || !entry.topic || !entry.benchmark) {
      throw new Error(
        `Research agenda: entry ${i} needs a topic and a benchmark`
      )
    }
    const status = String(entry.status || 'planned').toLowerCase().replace(/\s+/g, '-')
    if (!AGENDA_STATUSES.includes(status)) {
      throw new Error(
        `Research agenda: entry ${i} has an unknown status "${entry.status}" (expected ${AGENDA_STATUSES.join(', ')})`
      )
    }
  })

  cache = { papers: sortPapers(papers), agenda }
  return cache
}

// All papers, newest first.
//
// Drafts are for development only: `import.meta.env.DEV` is false in a
// production build, so a draft never reaches the deployed bundle. The
// Node side applies the same rule (see scripts/lib/research-files.mjs).
export function getPapers({ includeDrafts = import.meta.env.DEV } = {}) {
  const { papers } = load()
  const filtered = includeDrafts
    ? papers
    : papers.filter((p) => p.data.draft !== true)
  return sortPapers(filtered)
}

// One paper by slug, or null when there is no such paper.
export function getPaper(slug, { includeDrafts = import.meta.env.DEV } = {}) {
  return getPapers({ includeDrafts }).find((p) => p.slug === slug) || null
}

// The "In progress" list. Empty when there is no agenda file.
export function getAgenda() {
  return load().agenda
}
