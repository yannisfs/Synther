// Writes dist/research/feed.xml — the RSS 2.0 feed of the published
// papers.
//
// Runs as part of `npm run build`, right after Vite has written dist/.
// The papers come from the same content folder the app renders, through
// the same Node-side loader the prerender script uses, so the feed and
// the page can never list different papers. Drafts are excluded.
//
// Copy (the channel title and description) comes from the English
// locale, so the feed says the same thing as the page.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readPapers } from './lib/research-files.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(HERE, '..')
const DIST = path.join(ROOT, 'dist')

const { SITE_URL } = await import(path.join(ROOT, 'src', 'data', 'content.js'))
const locale = JSON.parse(
  await fs.readFile(path.join(ROOT, 'src', 'locales', 'en.json'), 'utf8')
)

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// RFC 822 date, as RSS wants it: "Wed, 04 Nov 2026 00:00:00 GMT".
const rfc822 = (iso) => new Date(`${iso}T00:00:00Z`).toUTCString()

const papers = await readPapers()

const items = papers
  .map((paper) => {
    const url = `${SITE_URL}/research/${paper.slug}/`
    return [
      '    <item>',
      `      <title>${esc(paper.data.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${rfc822(paper.data.date)}</pubDate>`,
      `      <description>${esc(paper.data.result)}</description>`,
      '    </item>',
    ].join('\n')
  })
  .join('\n')

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(locale.research.feed.title)}</title>
    <link>${SITE_URL}/research/</link>
    <description>${esc(locale.research.feed.description)}</description>
    <language>en</language>
    <generator>Synther build</generator>
${items ? items + '\n' : ''}  </channel>
</rss>
`

await fs.mkdir(path.join(DIST, 'research'), { recursive: true })
await fs.writeFile(path.join(DIST, 'research', 'feed.xml'), feed)

console.log(
  `[feed] dist/research/feed.xml written (${papers.length} paper${
    papers.length === 1 ? '' : 's'
  })`
)
