// Table-of-contents extraction for a paper's Markdown body.
//
// The heading ids the table of contents links to are the ones
// rehype-slug puts on the rendered <h2> elements. rehype-slug uses
// github-slugger, so this module uses the same package and the same
// algorithm — the ids therefore always match, including the
// duplicate-counter behaviour ("method", "method-1", …).
//
// github-slugger is already installed as rehype-slug's own dependency;
// it is declared in package.json so the import is explicit rather than
// relying on the dependency tree.

import GithubSlugger from 'github-slugger'

// The visible text of a heading, reduced to what a renderer would
// print. The Markdown parser strips this syntax too, so both sides
// agree on the string that gets slugged.
const plainText = (raw) =>
  String(raw)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // image -> alt text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // link -> link text
    .replace(/`([^`]*)`/g, '$1') // inline code -> code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italic
    .replace(/(^|\s)_([^_]+)_(?=\s|$)/g, '$1$2') // italic
    .replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1') // escapes
    .trim()

// Every heading in the body, in order, with its id. Only the H2s are
// the table of contents, but all of them go through the slugger: the
// duplicate counters depend on the full sequence, exactly as
// rehype-slug sees it.
export function extractHeadings(markdown) {
  const slugger = new GithubSlugger()
  const headings = []
  let inFence = false

  for (const line of String(markdown).split('\n')) {
    // Fenced code blocks can contain lines that look like headings.
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!match) continue

    const level = match[1].length
    const text = plainText(match[2])
    if (!text) continue

    const id = slugger.slug(text)
    if (level === 2) headings.push({ text, id })
  }

  return headings
}
