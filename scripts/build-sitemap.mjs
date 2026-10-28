// Writes dist/sitemap.xml — the hand-maintained page list from
// public/sitemap.xml plus the Research section.
//
// The static file in public/ is the source of truth for the pages that
// exist; the research URLs cannot be hand-maintained, because they come
// from the content folder. This script copies the static list and adds
// /research/ and every published paper, so the sitemap stays correct
// as soon as a paper is published.
//
// Runs as part of `npm run build`, after Vite has copied public/ into
// dist/.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readPapers } from './lib/research-files.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(HERE, '..')
const DIST = path.join(ROOT, 'dist')

const { SITE_URL } = await import(path.join(ROOT, 'src', 'data', 'content.js'))

const papers = await readPapers()
const base = await fs.readFile(path.join(ROOT, 'public', 'sitemap.xml'), 'utf8')

const entries = [
  `<url><loc>${SITE_URL}/research/</loc></url>`,
  ...papers.map((p) => `<url><loc>${SITE_URL}/research/${p.slug}/</loc></url>`),
]

if (!base.includes('</urlset>')) {
  throw new Error('public/sitemap.xml: no </urlset> closing tag')
}

const sitemap = base.replace('</urlset>', `${entries.join('\n  ')}\n</urlset>`)
await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemap)

console.log(
  `[sitemap] dist/sitemap.xml written (+1 research page, +${papers.length} paper${
    papers.length === 1 ? '' : 's'
  })`
)
