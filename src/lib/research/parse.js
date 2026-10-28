// Shared paper parsing + validation for the Research section.
//
// This module is imported by BOTH sides of the build:
//
//   - src/lib/research.js          the Vite/browser side (import.meta.glob)
//   - scripts/lib/research-files.mjs  the Node side (fs.readdir)
//
// so it must stay plain ESM with no Vite-only and no browser-only APIs.
// The two sides therefore agree by construction on what a valid paper is:
// same parser, same validator, same normalisation.

import matter from 'gray-matter'
import { offerings } from '../../data/content.js'

// gray-matter calls the global `Buffer.from()` on the input string
// (gray-matter/lib/utils.js). Node has Buffer; the browser does not,
// and the browser bundle is where the papers are parsed (the Vite-side
// loader inlines the Markdown at build time).
//
// The Buffer it builds is only stored as gray-matter's non-enumerable
// `orig` property — the frontmatter and the body are parsed from the
// string itself — so a shim that hands the string back unchanged is
// enough to make the library work in the browser. In Node the real
// Buffer exists and this block does nothing.
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = {
    from: (value) => value,
    isBuffer: () => false,
  }
}

// The three paper types the index page filters on.
export const PAPER_TYPES = ['efficiency', 'reproduction', 'record']

// The statuses the "In progress" pills can show.
export const AGENDA_STATUSES = ['planned', 'running', 'in-review']

// Frontmatter fields every paper must carry.
export const REQUIRED_FIELDS = [
  'title',
  'slug',
  'short',
  'type',
  'discipline',
  'date',
  'version',
  'authors',
  'summary',
  'result',
]

// A real paper's slug is kebab-case.
//
// A folder whose name starts with "_" is a draft. The two markers have to
// agree — the underscore in the folder name and `draft: true` in the
// frontmatter — because they do different jobs:
//
//   - the underscore is what the build sees without reading the file, so
//     a draft's text never reaches a production bundle (see the glob in
//     src/lib/research.js);
//   - `draft: true` is what the loader checks at runtime, so a draft is
//     never rendered and never gets a prerendered page.
//
// Requiring both means a draft cannot be published by accident (flipping
// the frontmatter alone still leaves it out of the build) and a published
// paper cannot be silently hidden (dropping the underscore alone fails
// the build with an error).
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// True when the folder is a draft folder (its name starts with "_").
export function isDraftSlug(slug) {
  return String(slug).startsWith('_')
}

const fail = (filePath, field, message) => {
  throw new Error(`Research paper ${filePath}: "${field}" ${message}`)
}

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0

// YAML turns `2026-11-04` into a Date object; keep everything as a plain
// YYYY-MM-DD string so sorting, formatting and JSON-LD all agree.
export function toIsoDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10)
  }
  if (typeof value === 'string' && value.trim()) return value.trim().slice(0, 10)
  return null
}

// The folder name is the paper's identity: <root>/<slug>/index.md.
export function slugFromPath(filePath) {
  const parts = String(filePath).split(/[\\/]/)
  const idx = parts.lastIndexOf('index.md')
  return idx > 0 ? parts[idx - 1] : ''
}

export function parsePaper(raw, filePath) {
  const { data, content } = matter(raw)
  return { data, content, filePath }
}

// Throws with the file name and the offending field — the message is what
// the build prints, so it has to say what to fix.
export function validatePaper(paper) {
  const { data, filePath } = paper

  for (const field of REQUIRED_FIELDS) {
    const value = data[field]
    const empty =
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    if (empty) fail(filePath, field, 'is required')
  }

  if (!PAPER_TYPES.includes(data.type)) {
    fail(filePath, 'type', `must be one of ${PAPER_TYPES.join(', ')} (got ${JSON.stringify(data.type)})`)
  }

  const folder = slugFromPath(filePath)
  if (data.slug !== folder) {
    fail(filePath, 'slug', `must equal its folder name ("${folder}")`)
  }
  const draftFolder = isDraftSlug(folder)
  const draftFlag = data.draft === true
  if (draftFolder !== draftFlag) {
    fail(
      filePath,
      'draft',
      draftFolder
        ? 'must be true — the folder name starts with "_", which marks it as a draft'
        : 'must be false — a draft has to live in a folder whose name starts with "_" so its text stays out of a production build'
    )
  }
  // The underscore is the draft marker, not part of the slug itself.
  const slugBody = draftFolder ? folder.slice(1) : folder
  if (!SLUG_RE.test(slugBody)) {
    fail(filePath, 'slug', 'must be kebab-case')
  }

  const disciplines = offerings.map((o) => o.id)
  if (!disciplines.includes(data.discipline)) {
    fail(filePath, 'discipline', `must match an existing discipline (${disciplines.join(', ')})`)
  }

  if (!toIsoDate(data.date)) fail(filePath, 'date', 'must be a date (YYYY-MM-DD)')

  if (!Number.isInteger(data.version) || data.version < 1) {
    fail(filePath, 'version', 'must be an integer ≥ 1')
  }

  if (!Array.isArray(data.authors) || !data.authors.every(isNonEmptyString)) {
    fail(filePath, 'authors', 'must be a list of names')
  }

  if (data.summary.length > 160) {
    fail(filePath, 'summary', `must be ≤ 160 characters (is ${data.summary.length})`)
  }

  if (data.short.length > 40) {
    fail(filePath, 'short', `must be ≤ 40 characters (is ${data.short.length})`)
  }

  if (data.results !== undefined) {
    if (!Array.isArray(data.results)) fail(filePath, 'results', 'must be a list of table rows')
    data.results.forEach((row, i) => {
      if (!row || !isNonEmptyString(row.method) || !isNonEmptyString(row.metric) || !isNonEmptyString(row.value)) {
        fail(filePath, `results[${i}]`, 'needs method, metric and value')
      }
    })
  }

  if (data.changelog !== undefined) {
    if (!Array.isArray(data.changelog)) fail(filePath, 'changelog', 'must be a list')
    data.changelog.forEach((entry, i) => {
      if (!entry || !Number.isInteger(entry.version) || !toIsoDate(entry.date)) {
        fail(filePath, `changelog[${i}]`, 'needs a numeric version and a date')
      }
    })
  }

  return paper
}

// Flatten the frontmatter into the shape the pages and the feed use.
export function normalizePaper(paper) {
  const data = { ...paper.data }
  data.date = toIsoDate(data.date)
  if (Array.isArray(data.changelog)) {
    data.changelog = data.changelog.map((entry) => ({
      ...entry,
      date: toIsoDate(entry.date),
    }))
  }
  return {
    slug: data.slug,
    data,
    content: paper.content,
    filePath: paper.filePath,
  }
}

// Newest first. Ties fall back to the slug so the order is stable.
export function sortPapers(papers) {
  return [...papers].sort((a, b) => {
    if (a.data.date !== b.data.date) return a.data.date < b.data.date ? 1 : -1
    return a.slug.localeCompare(b.slug)
  })
}

// "2026-11" — the date cell on the index rows.
export function monthStamp(isoDate) {
  return String(isoDate).slice(0, 7)
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// "November 2026" — the date cell in the paper header. Fixed English
// month names on purpose: the page is prerendered, so the output must
// not depend on the machine's locale.
export function monthYear(isoDate) {
  const [y, m] = String(isoDate).split('-')
  const name = MONTHS[Number(m) - 1]
  return name ? `${name} ${y}` : String(isoDate)
}
