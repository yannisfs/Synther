// The Node-side content loader for the Research section.
//
// `src/lib/research.js` cannot be imported here: it uses import.meta.glob,
// which is a Vite transform and does not exist in plain Node. This module
// reads the same folder from disk instead, and parses it with the same
// gray-matter call and the same validator (src/lib/research/parse.js), so
// the two sides cannot disagree about which papers exist.
//
// Used by:
//   - scripts/prerender.mjs   → the route list
//   - scripts/build-feed.mjs  → the RSS feed
//
// Drafts are excluded unless INCLUDE_DRAFTS=1 is set: a draft is a
// development-only paper and must never be published.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  parsePaper,
  validatePaper,
  normalizePaper,
  sortPapers,
  AGENDA_STATUSES,
} from '../../src/lib/research/parse.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const RESEARCH_ROOT = path.join(HERE, '..', '..', 'src', 'content', 'research')

const includeDrafts =
  process.env.INCLUDE_DRAFTS === '1' || process.env.INCLUDE_DRAFTS === 'true'

// Every paper, newest first. A malformed paper throws here — before the
// prerender launches a browser — with the file name and the field name.
export async function readPapers({ root = RESEARCH_ROOT, includeDrafts: drafts = includeDrafts } = {}) {
  let entries
  try {
    entries = await fs.readdir(root, { withFileTypes: true })
  } catch {
    return []
  }

  const papers = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const file = path.join(root, entry.name, 'index.md')
    let raw
    try {
      raw = await fs.readFile(file, 'utf8')
    } catch {
      continue // a folder without index.md is not a paper
    }
    const rel = `src/content/research/${entry.name}/index.md`
    const paper = parsePaper(raw, rel)
    validatePaper(paper)
    const normalized = normalizePaper(paper)
    if (!drafts && normalized.data.draft === true) continue
    papers.push(normalized)
  }
  return sortPapers(papers)
}

// The optional "In progress" list. Empty when there is no agenda file.
export async function readAgenda({ root = RESEARCH_ROOT } = {}) {
  let raw
  try {
    raw = await fs.readFile(path.join(root, 'agenda.json'), 'utf8')
  } catch {
    return []
  }
  let agenda
  try {
    agenda = JSON.parse(raw)
  } catch (err) {
    throw new Error(`Research agenda: src/content/research/agenda.json is not valid JSON (${err.message})`)
  }
  if (!Array.isArray(agenda)) {
    throw new Error('Research agenda: src/content/research/agenda.json must contain a list')
  }
  agenda.forEach((entry, i) => {
    if (!entry || !entry.topic || !entry.benchmark) {
      throw new Error(`Research agenda: entry ${i} needs a topic and a benchmark`)
    }
    const status = String(entry.status || 'planned').toLowerCase().replace(/\s+/g, '-')
    if (!AGENDA_STATUSES.includes(status)) {
      throw new Error(
        `Research agenda: entry ${i} has an unknown status "${entry.status}" (expected ${AGENDA_STATUSES.join(', ')})`
      )
    }
  })
  return agenda
}
