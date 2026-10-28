# Synther Research section: implementation plan

Target: add a **Research** section to synther.eu at `/research/`, holding scientific articles (benchmarked, reproducible results).
Stack: Vite + React (JavaScript), deployed on Cloudflare.
Executor: an LLM coding agent in Claude Code. Work **one task at a time, in order**. Each task ends with checks that must pass before the next task starts.

---

## 0. Rules for the agent (read before every task)

1. **Inspect before you write.** The site already has patterns for sub-pages (`/disciplines/<slug>/`, `/help/`). Reuse the existing components, CSS variables and file layout. Do not invent a parallel design system.
2. **Never write a new style value when an existing token or class covers it.** If you need a value that does not exist, add it next to the existing tokens and say so in your summary.
3. **No invented content.** No fake papers, results, authors, DOIs or numbers. Use the exact copy in this plan. Where copy is missing, write `TODO(copy)` and list it in your summary.
4. **Small diffs.** One task = one commit. Do not refactor files the task does not name.
5. **Keep pages prerendered.** Every existing page ships its full HTML (h1, meta, JSON-LD) in the built file. New pages must do the same. A page that only renders client-side is a failed task.
6. **Stop and report** instead of guessing when: a check fails twice, the repo structure differs from what Task 1 recorded, or a task needs a new dependency not listed here.
7. **Report format at the end of every task:** files changed, commands run with their result, TODOs, open questions.

---

## 1. What the live site looks like (measured 28 Oct 2026)

Use these to verify you matched the existing styles. The repo's CSS is the source of truth if it disagrees.

| Element | Value |
| --- | --- |
| Container | max-width 1160px, centred |
| Header | fixed; logo left; nav: Disciplines, Approach, Support; CTA button "START A PROJECT" right |
| Section heading | mono label (e.g. `WHAT THIS COVERS`), then H2, with a thin indigo vertical rule on the left of the pair |
| H2 | Inter 600, ~54px, letter-spacing ~-0.025em, ink `#0C1B2A` |
| H3 | Inter 600, ~21px |
| Body | Inter 400, ~23px on desktop, line-height ~1.55, slate `#495468` |
| Mono label | JetBrains Mono 400, ~11px, uppercase, tracking ~0.3em, `#5C6679` |
| Button | JetBrains Mono uppercase ~12px, padding 10px 20px, radius 2px, ink background, white text |
| Section backgrounds | alternate white and paper `#F3F6FB` |
| Sub-page hero | breadcrumb (mono, `Home / Disciplines / …`) on white, then a dark ink hero with H1, intro paragraph beside an indigo rule, and a 4-column row of mono-labelled facts (ENGAGEMENT, APPROACH, DELIVERABLE, HAND-OFF) |
| Card grids | 2 columns divided by hairlines, each item numbered `01`, `02` in indigo mono, then H3 and text |
| Discipline page order | breadcrumb → dark hero → Overview → What this covers (paper bg) → How an engagement runs → What you take away (paper bg) → FAQ accordion → CTA → Other disciplines |
| URLs | trailing slash (`/disciplines/data-analytics/`) |
| SEO | each page has meta description, canonical, Open Graph tags and 4 JSON-LD blocks |
| Sitemap | `/sitemap.xml` lists the 10 current pages, so new pages must be added |
| Status | `/research/` currently returns 404 |

Brand colours: ink `#0C1B2A`, indigo `#2D33A7`, slate `#495468` / `#5C6679` / `#828B9E`, hairline `#DDE3EC` / `#C7CFDD`, paper `#F3F6FB` / `#FFFFFF`.

---

## 2. Target layout

### 2.1 `/research/`: index page

Build it from the same parts as a discipline page so it looks native.

1. **Breadcrumb:** `Home / Research`
2. **Dark hero** (reuse the discipline hero component)
   - H1: `Research`
   - Intro: `Known problems, public benchmarks, published baselines. We show our work, including the code to reproduce it.`
   - 4 fact cells:
     - `FORMAT`: `Preprint, code and data`
     - `BENCHMARKS`: `Public only`
     - `BASELINES`: `Published and re-run`
     - `CODE`: `Open and reproducible`
3. **Our standard** (white bg)
   - Label `OUR STANDARD`, H2 `What every paper must show`
   - 3 numbered items in the card-grid style (3 columns on desktop, 1 on mobile):
     - `01` **A public benchmark**: The problem and data are ones anyone can download. No private datasets behind a claim.
     - `02` **Published baselines, re-run**: We compare against the best published results and re-run them where we can, under the same conditions.
     - `03` **Code that reproduces it**: Every figure in a paper can be regenerated from the linked repository with one command.
4. **Papers** (paper bg)
   - Label `PAPERS`, H2 `Published work`
   - Filter chips (buttons, not links): `All`, `Efficiency`, `Reproduction`, `Record`. Filtering is client-side; the prerendered HTML lists all papers.
   - One row per paper, newest first. On desktop it's a grid of `date | type | title + result | links`; on mobile the cells stack.
     - date: mono, `2026-11`
     - type: mono label in indigo
     - title: H3, links to the paper page
     - result: one sentence from frontmatter `result`
     - links: `READ →`, plus `PREPRINT` and `CODE` if present
   - **Empty state** (no published papers): `The first paper is in preparation. Follow along via the feed or get in touch.` with links to `/research/feed.xml` and `#contact`.
5. **In progress** (white bg). Render it only if `src/content/research/agenda.json` has entries.
   - Label `IN PROGRESS`, H2 `What we are working on`
   - Rows: topic, benchmark name, status pill (`Planned`, `Running`, `In review`). No result numbers in this list.
6. **CTA** (reuse the discipline CTA block)
   - H2 `Know a benchmark industry gets wrong?`
   - Text `Send it to us. If it is public and reproducible, we will take a look.`
   - Button `GET IN TOUCH →` → `mailto:contact@synther.eu`

### 2.2 `/research/<slug>/`: paper page

1. **Breadcrumb:** `Home / Research / <short title>`
2. **Paper header** (white, not the dark hero; reading pages stay light)
   - mono row: `<TYPE> · <DISCIPLINE> · <Month YYYY> · v<version>`
   - H1: title (use the H2 size, ~54px; a full hero H1 is too large for long titles)
   - authors line
   - action row of buttons: `PREPRINT` (arXiv/DOI), `CODE` (repo), `CITE` (scrolls to the citation block)
3. **Key result box**: paper bg, 1px hairline border, radius 2px
   - label `KEY RESULT`, the `result` sentence
   - small table from the frontmatter `results` array (columns: Method | Metric | Value | Cost). Highlight our row with an indigo left border.
4. **Body**: 2-column on desktop ≥ 1024px
   - left: sticky table of contents (H2s only), mono 12px
   - right: article text, max-width 720px, body ~19px (smaller than the marketing body copy, for long reading)
   - supports: headings, paragraphs, lists, tables, code blocks, images with captions, footnotes, LaTeX math (inline `$…$` and block `$$…$$`)
5. **Reproducibility box** (paper bg): repo URL, commit hash, dataset + version, hardware, runtime, and the one command to reproduce. All from frontmatter.
6. **Cite this**: BibTeX in a code block with a `COPY` button
7. **Changelog**: version list from frontmatter (`v1 – 2026-11-04 – first release`)
8. **More research**: up to 3 other papers, same row style as the index
9. Site footer as usual

### 2.3 Global changes

- Header nav: `Disciplines · Approach · Research · Support`. "Research" links to `/research/`. Do this on every page, including the mobile menu.
- Footer: add `Research` beside the existing nav links.
- Sitemap: add `/research/` and each published paper.
- RSS feed: `/research/feed.xml`, generated at build.

---

## 3. Content model

Each paper is one Markdown file. The agent never hard-codes paper content in components.

```
src/content/research/
  agenda.json                 # optional "In progress" list
  <slug>/
    index.md                  # frontmatter + body
    figures/*.png|svg         # images referenced relatively from index.md
```

Frontmatter (YAML). Required fields are marked *.

```yaml
title: "…"                    # *
slug: "…"                     # * kebab-case, equals folder name
short: "…"                    # * breadcrumb title, ≤ 40 chars
type: efficiency              # * efficiency | reproduction | record
discipline: data-analytics    # * matches an existing /disciplines/<slug>
date: 2026-11-04              # * first publication
version: 1                    # *
authors: ["…"]                # *
summary: "…"                  # * meta description, ≤ 160 chars
result: "…"                   # * one sentence, shown on index + key result box
results:                      # optional table rows
  - { method: "…", metric: "…", value: "…", cost: "…", ours: true }
benchmark: { name: "…", url: "…", version: "…" }
preprint: "https://arxiv.org/abs/…"
code: "https://github.com/…"
repro: { commit: "…", hardware: "…", runtime: "…", command: "…" }
bibtex: |
  @article{…}
changelog:
  - { version: 1, date: 2026-11-04, note: "First release" }
draft: true                   # drafts are built in dev only, never in production
```

`agenda.json`:

```json
[{ "topic": "…", "benchmark": "…", "status": "planned" }]
```

---

## 4. Dependencies (only these)

- `gray-matter`: frontmatter parsing at build time
- `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`, `katex`: Markdown body and math rendering
- `rehype-slug`: heading ids for the table of contents

If the repo already has a Markdown pipeline (check in Task 1), use it instead and skip what it covers.

---

## 5. Tasks

### Task 1: Survey the repo (no code changes)

Write `docs/research/REPO_NOTES.md` answering:

1. Router: which library and file defines routes? How is `/disciplines/:slug` registered?
2. Prerendering: how do the built HTML files get their content? (vite-react-ssg, vite-plugin-ssr/vike, a custom `prerender.js`, react-snap, or something else.) Give the script name in `package.json` and the file that lists the routes to prerender.
3. Head tags: how meta, canonical, OG and JSON-LD are set (react-helmet-async, a custom `<Seo>`, or in the prerender script).
4. Sitemap: generated (which script) or a static file (which path)?
5. Cloudflare: Pages or Workers static assets? List `wrangler.toml` / `_redirects` / `_headers` and the build output dir.
6. Components to reuse, with paths: header, footer, breadcrumb, dark hero, section heading (label + H2 + rule), card grid, FAQ, CTA, buttons.
7. Where the design tokens live (CSS variables, Tailwind config, CSS modules).
8. Is there already a Markdown/MDX pipeline?

**Done when:** the file exists, every question has an answer with a file path, and `npm run build` still passes untouched.

### Task 2: Content loader

- Create `src/content/research/` with one sample paper `_example/index.md`. Give it `draft: true` and obviously fake content: title `Example paper (draft)`, every value `EXAMPLE`.
- Create `src/lib/research.js` exporting:
  - `getPapers({ includeDrafts })` → array sorted by date desc, validated
  - `getPaper(slug)` → one paper or `null`
  - `getAgenda()` → array (empty if no file)
- Load files with `import.meta.glob('/src/content/research/*/index.md', { query: '?raw', import: 'default', eager: true })` and parse them with `gray-matter`.
- Validation: throw a build error naming the file and the field if a required field is missing or `type` is not one of the three values.
- Drafts are included only when `import.meta.env.DEV` is true.

**Done when:** a temporary test or a node check prints the example paper in dev mode, and a production build includes zero papers. Remove the temporary check afterwards.

### Task 3: Routes and prerendering

- Register `/research/` and `/research/:slug/` in the router, following the pattern used by `/disciplines/:slug`.
- Add both to the prerender route list. Generate the paper routes from `getPapers()`.
- Unknown slug → the site's existing 404 handling.
- Keep trailing slashes like the rest of the site.

**Done when:** `npm run build` produces `dist/research/index.html`, and that file contains `<h1` with the text `Research` in the raw HTML (check with `grep`).

### Task 4: Index page `/research/`

Build section 2.1 exactly, from the components listed in REPO_NOTES. New file(s) go under `src/pages/research/` (or the repo's equivalent pages folder).

**Done when:**
- With zero published papers, the page shows the empty state.
- In dev, the example draft appears in the Papers list.
- Filter chips are `<button>` elements with `aria-pressed`; they change the list without a page reload.
- At 375px width nothing scrolls horizontally, the 4 hero facts stack 2×2, and the paper rows stack.
- `npm run build` passes.

### Task 5: Paper page `/research/<slug>/`

Build section 2.2. Render the Markdown with `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex` + `rehype-slug`. Import `katex/dist/katex.min.css` on this page only.

- Images: resolve relative `figures/…` paths through `import.meta.glob` on the paper folder, so Vite fingerprints them.
- Table of contents: collect H2s from the Markdown, link to their ids, sticky at `top: header height + 24px`. Hide it below 1024px.
- Sections 5–7 render only when their frontmatter fields exist.
- `COPY` uses `navigator.clipboard.writeText`. The label switches to `COPIED` for 2 s.

**Done when:** the example draft renders in dev with a working table of contents, a formula, a table and an image (add these to the example), and `npm run build` passes.

### Task 6: SEO and scholarly metadata

For every research page, use the same head mechanism as the discipline pages:

- `<title>`: `Research · Synther` / `<short> · Synther Research`
- meta description = `summary`; canonical with trailing slash; OG title, description and type (`article` for papers)
- JSON-LD:
  - index: `CollectionPage` + `BreadcrumbList`
  - paper: `ScholarlyArticle` (headline, author, datePublished, dateModified from the latest changelog entry, publisher Synther, url, `sameAs` = preprint) + `BreadcrumbList`
- Google Scholar tags on paper pages: `citation_title`, one `citation_author` per author, `citation_publication_date` (YYYY/MM/DD), and `citation_pdf_url` if the frontmatter has `pdf`

**Done when:** grepping the built `dist/research/<slug>/index.html` of a temporarily non-draft example finds all the tags above. Set the example back to `draft: true` afterwards.

### Task 7: Navigation, footer, sitemap, feed

- Add `Research` to the header nav (desktop and mobile) and the footer, between Approach and Support.
- Sitemap: add `/research/` and every published paper. Follow the existing method from REPO_NOTES.
- Feed: a build step writes `dist/research/feed.xml` (RSS 2.0) with title, link, guid, pubDate and description = `result`. Link it from the index head with `<link rel="alternate" type="application/rss+xml">`.

**Done when:** the nav link appears on `/`, a discipline page and `/help/`; the built `sitemap.xml` contains `/research/`; `feed.xml` is valid XML (check it with `xmllint --noout` or a node XML parser).

### Task 8: Cloudflare check

- Run the build and serve the output the way Cloudflare does (`npx wrangler pages dev dist`, or the repo's equivalent from REPO_NOTES).
- Check: `/research` redirects to `/research/`, `/research/does-not-exist/` returns 404, and `feed.xml` has an XML content type. Add a `_headers` rule only if it doesn't.

**Done when:** all three checks pass locally. List the commands and outputs in the report.

### Task 9: Final pass

- Check accessibility on both pages: one h1, heading order without skips, the breadcrumb is a `<nav aria-label="Breadcrumb">`, links have visible focus styles, text contrast matches the existing pages.
- Lighthouse (or `npx unlighthouse` if available) on `/research/`: no score below what `/disciplines/data-analytics/` gets.
- Update `docs/research/REPO_NOTES.md` with a short "How to publish a paper" section: create the folder, fill the frontmatter, set `draft: false`, build, deploy.

**Done when:** the report lists the scores of both pages and the publishing steps exist.

---

## 6. Out of scope (do not build)

- A CMS, database, comments or search
- PDF generation (papers link to the preprint PDF)
- Changes to the homepage beyond the nav link
- New fonts, colours or animations; the hero particle field stays on the homepage only

---

## 7. How to hand this to the agent

Give it one task per message:

> Read `RESEARCH_PLAN.md` sections 0–4 and `docs/research/REPO_NOTES.md`. Do **Task N** only. Finish with the report from rule 7.

Review each report before sending the next task. If Task 1 finds that prerendering works differently from what Tasks 3 and 6 assume, update those tasks first. That's the most likely place for the plan to need adjusting.
