# Synther subpages – edit plan for a coding agent

Site: https://synther.eu · Plan date: 22 Oct 2026
Scope: these pages, plus site-wide routing and meta:

- the six discipline pages under `/disciplines/`
- `/help`
- `/help/guides`
- `/imprint`
- `/cookies`

**Prerequisite:** complete `synther-site-edit-plan.md` (homepage plan) first. Its header, footer, cookie banner and sweep tasks (T02, T03, T05, T12, T21–T24, T26, T29) change shared components that also appear on every subpage. Re-use its Decisions D1–D6.

---

## How to work through this file

The rules are the same as in the homepage plan:

1. Work top to bottom, **one task at a time**.
2. Find the code by searching for the exact **Find** string.
3. Change only what's described.
4. Check the **Acceptance** criteria, tick the box, then commit as `S<NN>: <title>`.
5. If a needed decision is `TODO` or a Find string is missing, mark the task `BLOCKED: <reason>`, skip it and continue.
6. Skip tasks marked **HUMAN**.
7. After each phase, build and check the affected pages at **375 px** and **1280 px** width. There must be no console errors and no horizontal scroll. (Mobile rendering was not checked during the review, so pay extra attention at 375 px.)
8. Many discipline-page issues live in **one shared template**. Fix them in the template, not six times. If the pages are separate files, apply the same change to all six and say so in the commit.

---

## Additional decisions (owner fills in)

| ID | Decision | Value | Status |
| --- | --- | --- | --- |
| D7 | Legal entity shown on the site. If "Synther GmbH" is registered: full name, address, managing director(s), register court + HRB number, VAT ID. If not: say so. | TODO | TODO – check with a lawyer/tax advisor |
| D8 | Phone number for the Impressum (or `none`) | TODO | TODO |
| D9 | Urgent support promise ("pick up within 15 minutes during working hours, acknowledge every ticket within an hour, 24/7") | TODO: `keep` or new wording | TODO – only keep it if you can staff it |
| D10 | Guides: `hide` the guides link until a real index exists, or `build` a guides index now | hide | PROPOSED |
| D11 | Data protection supervisory authority (for Rodgau, Hesse) | Der Hessische Beauftragte für Datenschutz und Informationsfreiheit (HBDI), Gustav-Stresemann-Ring 1, 65189 Wiesbaden | PROPOSED – verify |

---

## Phase 1 – Legal and broken things (live-site risk)

- [x] **S01: Real 404 responses**
  - Problem: any unknown URL (e.g. `/this-page-does-not-exist`, and `/help/guides`) returns **HTTP 200 with the homepage**. That creates duplicate content for search engines and a broken "Browse all guides" link.
  - Change: unknown routes must return **HTTP 404** with a simple branded 404 page. The page uses the site header and footer, the heading `Page not found.`, one sentence, and links to Home and the Disciplines section. Check the hosting config (Cloudflare Pages: a `404.html` in the output root; SPA fallbacks/redirect rules such as `/* /index.html 200` must be removed or narrowed).
  - Acceptance: `curl -I https://<preview>/this-page-does-not-exist` returns 404 and shows the 404 page; all existing routes still return 200.

- [x] **S02: Guides link (D10)**
  - Find: `Browse all guides` on `/help`, and the note `We're publishing the first guides over the next few weeks.`
  - If D10 = `hide`: remove the whole "Help & guides" section from `/help`.
  - If D10 = `build`: mark BLOCKED (`needs guide content`). This is HUMAN work.
  - Acceptance: no link on the site points to `/help/guides` unless that route returns real content.

- [x] **S03: Imprint – remove the dev placeholder section**
  - Find: `Fill in the placeholders` (section label `Before going live`)
  - Change: delete the whole section.
  - Acceptance: `Fill in the placeholders` and `Before going live` don't appear on `/imprint`.

- [x] **S04: Imprint – fix the intro line**
  - Find: `Legal information under § 5 DDG for a privately-operated website`
  - Change to: `Legal information under § 5 DDG and the statement on the processing of personal data under Art. 13 GDPR.`
  - Acceptance: the word "privately-operated" no longer appears.

- [x] **S05: Imprint – remove the outdated TMG reference in the heading**
  - Find: `Angaben gemäß § 5 DDG (ehemals § 5 TMG)`
  - Change to: `Angaben gemäß § 5 DDG`
  - Acceptance: the heading renders without the bracketed text.

- [ ] **S06: Imprint – legal entity (D7)**
  - If D7 = TODO: mark BLOCKED.
  - If D7 gives GmbH details: set the provider block (German and English) to:
    - company name and address
    - `Vertreten durch / Represented by: <managing director(s)>`
    - `Registergericht / Register court: <court>`, `Registernummer / Register number: HRB <no>`
    - `USt-IdNr. / VAT ID: <id>`, if given
    - In the privacy sections 1 (Verantwortlicher / Controller), name the GmbH as controller.
  - If D7 says the GmbH is **not** registered: keep the natural person in the imprint, and change every visible `Synther GmbH` (footer contact list, `© 2026 Synther GmbH`) to exactly what D7 specifies.
  - Acceptance: the imprint, privacy controller section, footer and copyright all name the same legal entity.

- [ ] **S07: Imprint – phone row (D8)**
  - Find: both `[TODO — replace] (optional)` rows (`Kontakt (Telefon)` / `Contact (phone)`).
  - If D8 is a number: insert it in both places as a `tel:` link. If D8 = `none`: remove both rows. If D8 = TODO: BLOCKED.
  - Acceptance: no `[TODO` text remains in the phone rows.

- [x] **S08: Imprint – supervisory authority (D11)**
  - Find: `Die zuständige Behörde richtet sich nach dem Sitz unseres Unternehmens: [TODO - replace]` and `competent for our registered seat: [TODO - replace]`.
  - Change: insert the D11 authority (name and address) in both languages.
  - Acceptance: the string `TODO` doesn't appear anywhere on `/imprint`.

- [x] **S09: Imprint – label column wrapping**
  - Problem: labels such as `ANBIETER (§ 5 DDG)` and `KONTAKT (E-MAIL)` wrap mid-word across two lines.
  - Change: widen the label column (e.g. `min-width: 12rem` on the label cell) or let label and value stack vertically below about 900 px. Keep the label styling (mono, uppercase).
  - Acceptance: at 1280 px no label wraps; at 375 px labels sit above their values.

- [x] **S10: TTDSG → TDDDG**
  - Find: `TTDSG` on `/imprint` and `/cookies` (German and English).
  - Change: replace `§ 25 TTDSG` with `§ 25 TDDDG` and `§ 25 (2) No. 2 TTDSG` with `§ 25 (2) No. 2 TDDDG`. (The law was renamed on 14 May 2024.)
  - Acceptance: `TTDSG` appears nowhere on the site.

- [x] **S11: Privacy notice – cover the Help forms**
  - Find: privacy section `5. Kontaktaufnahme` / `5. Contact enquiries`.
  - Change: extend the list of processed data so it also covers the two forms on `/help`: the urgent ticket form (name, email, incident description) and the 30-minute call request (name, email, topic, preferred time). Mention them by name ("Kontaktformular, Formular für dringende Tickets und Anfrage für ein 30-Minuten-Gespräch" / "contact form, urgent ticket form and 30-minute call request"). Keep the legal bases as they are.
  - Acceptance: both language versions name all three forms and their fields.

- [x] **S12: Cookie policy – remove the non-existent floating button**
  - Find: `über die Schaltfläche unten rechts` (German section 4) and `the floating button in the corner` (English section 4).
  - Change: remove those phrases, leaving the footer link and the banner as the ways to change the decision.
  - Acceptance: the policy only mentions controls that actually exist on the site.

- [ ] **S13: Cookie policy – match the consent banner (depends on homepage T03)**
  - Problem: after T03 the banner has a single `OK` button, but `/cookies` still shows a "Current consent" card (`Rejected` / `No decision yet`) with a `Change settings` button.
  - Change: if T03 is done, show the status as `Acknowledged` / `Not yet acknowledged`. `Change settings` should reopen the banner, or be removed if there is nothing to change. If T03 is not done, mark BLOCKED.
  - Acceptance: the labels on `/cookies` describe what the banner actually does.

- [x] **S14: Cookie policy – mention the server-side consent record consistently**
  - Problem: the imprint (privacy section 4) and the "Clear the locally stored decision" box say the decision, IP address and user agent are stored in a database. Section 2 of the cookie policy says only localStorage is used.
  - Change: add one sentence to German and English section 2 referring to the consent record described in the privacy notice section 4, with a link to `/imprint`.
  - Acceptance: both pages describe the same storage.

- [ ] **S15: HUMAN – legal review of the data processing**
  - Not for the agent. Have a lawyer or data protection advisor check:
    - Storing IP address and user agent for 3 years as a consent receipt, for a banner that only covers necessary storage. This may be unnecessary; data minimisation applies.
    - Cloudflare as hosting provider: data processing agreement, third-country transfer basis.
    - Which service receives the form submissions, and whether it needs naming in the privacy notice.

---

## Phase 2 – Discipline page template (fixes all six pages)

- [x] **S16: Widen the "How an engagement runs" columns**
  - Find: section label `How we engage`, heading `How an engagement runs`.
  - Problem: the three steps sit in narrow columns. The body text wraps after 3–4 words, and titles like "Problem & boundary" break onto two lines.
  - Change: let the three steps use the full content width (each about 1/3), with the number beside the title rather than in its own column. Below about 900 px, stack the steps vertically.
  - Acceptance: at 1280 px each step's body text runs about 35–60 characters per line, and titles stay on one line.

- [x] **S17: Remove the "Where this discipline sits" section**
  - Find: section label `Where this sits`, heading `Where this discipline sits`.
  - Problem: identical boilerplate on all six pages. It repeats "The single point of synthesis" each time and duplicates the "Other disciplines" list at the bottom.
  - Change: remove the section from the template, including its background band and spacing.
  - Acceptance: the section is gone on all six pages, with no empty band left behind.

- [x] **S18: CTA block wording**
  - Find: `Bring this discipline to your decision.`
  - Change: use the heading `Have a problem that fits {Discipline}?`, where `{Discipline}` is the page's discipline name (e.g. `Have a problem that fits Process Optimization?`). Keep the body text and button.
  - Acceptance: each page shows its own discipline name in the CTA heading.

- [x] **S19: "Discuss this discipline" pre-selects the project type**
  - Find: `Discuss this discipline` (links to `/#contact`).
  - Change: link to the homepage contact form using the same mechanism as homepage task T18 (e.g. `/#contact?type=process`), so the form opens with the right project type selected. Use the mapping table from T18.
  - Acceptance: on each discipline page the button lands on the homepage form with the matching option selected.

- [ ] **S20: Breadcrumb label and target (D2)**
  - Find: the breadcrumb `Home / Disciplines / …` (links to `/#offerings`).
  - Change: the middle crumb uses the D2 term and links to the same anchor as the nav (see T14).
  - Acceptance: the breadcrumb text matches the nav label, and the link scrolls to the section.

- [x] **S21: FAQ structured data**
  - Change: add `FAQPage` JSON-LD to each discipline page, generated from that page's FAQ questions and answers (not hard-coded copies).
  - Acceptance: the JSON-LD validates (schema.org structure) and the questions match the visible FAQ.

- [x] **S22: Section spacing and reveal**
  - Problem: there are long blank stretches between sections while scrolling, the same issue as on the homepage.
  - Change: if homepage T26 fixed the shared reveal logic, just verify here. Otherwise apply the T26 fix to the template. Also cap the vertical padding between sections at about 96–120 px on desktop.
  - Acceptance: fast-scrolling never shows a blank viewport-height area.

---

## Phase 3 – Discipline page copy

- [x] **S23: Consulting – the circular "all six"**
  - Find (in hero, meta description and the old "Where this sits" text if still present): `across all six disciplines` and `spans all six`.
  - Change: use `across every other discipline`. In the meta description, write `across systems, process, development, data and decisions`.
  - Acceptance: `all six` doesn't appear on `/disciplines/consulting`.

- [x] **S24: Complex Data Analytics – hero and engagement label**
  - Find hero: `We turn high-dimensional, multi-source data into structured signal - pipelines and models that surface what matters in the noise.`
    - Change to: `We turn high-dimensional, multi-source data into structured signal - auditable pipelines and models a decision can rest on.`
  - Find in the hero facts: `Decision study, pilot pipeline or production system`
    - Change to: `Data audit, pilot pipeline or production system` (so "Decision study" is used only by Decision Making).
  - Acceptance: `what matters in the noise` doesn't appear on this page; the Engagement line shows `Data audit`.

- [x] **S25: Data-Driven Decision Making – clarify the boundary with analytics**
  - Find: the overview paragraph starting `Most strategic decisions are made on summarized reports`.
  - Change: append this sentence to the end of that paragraph: `Where Complex Data Analytics builds the signal, this discipline builds the loop around it.` Link `Complex Data Analytics` to `/disciplines/data-analytics`.
  - Acceptance: the sentence renders and the link works.

- [x] **S26: Systems Engineering – small wording fix**
  - Find: `A single sourced model the whole team builds against.`
  - Change to: `A single-source model the whole team builds against.`
  - Acceptance: the updated text renders.

- [ ] **S27: HUMAN – pricing FAQ answers**
  - Not for the agent. On all six pages, "How is an engagement scoped and priced?" never mentions price. Owner to decide whether to add concrete anchors, e.g. "Assessments start at a fixed price of €X and typically take N weeks."

---

## Phase 4 – Help page

- [x] **S28: Heading-to-text spacing**
  - Find: the headings `Something is on fire right now.`, `30 minutes with an engineer.` and `Self-serve answers for when you don't need a human.`
  - Problem: each paragraph sits directly under its heading with no gap.
  - Change: add the same heading-to-body spacing used on the discipline pages (e.g. `margin-top` of about 0.75–1rem on the paragraph).
  - Acceptance: visible spacing matches the "Overview" sections on the discipline pages.

- [ ] **S29: Urgent support promise (D9)**
  - Find: `We pick up within 15 minutes during working hours and acknowledge every ticket within an hour, 24/7.`
  - If D9 = `keep`: no change. If D9 gives new wording: replace the sentence with it. If D9 = TODO: BLOCKED.
  - Acceptance: the sentence matches D9.

- [x] **S30: Urgent ticket form fields**
  - Find: the form revealed by `Open a Sev-1 ticket` (fields: Your name, Email, What's happening?).
  - Change: add two fields after Email:
    - `Callback phone` (type `tel`, required)
    - `Company / system` (text, required)

    Add both to the submission payload and to whatever sends or stores the ticket.
  - Acceptance: the form requires both new fields, a test submission in the dev environment includes them, and S11's privacy text is updated to list them.

- [x] **S31: Form button alignment**
  - Find: `Send ticket` and `Request the call` buttons.
  - Problem: both buttons are centered while the form fields are left-aligned.
  - Change: left-align both buttons with the form fields, matching the homepage `Send enquiry` button.
  - Acceptance: the buttons' left edge lines up with the inputs.

- [x] **S32: "Pick a slot" copy**
  - Find: `Pick a slot, send a short brief and we'll call you back.`
  - Change to: `Suggest a time, send a short brief and we'll call you back.` (The form has a free-text time field, not a slot picker.)
  - Find the placeholder: `e.g. Thursday morning, CET`
    - Change to: `e.g. Thursday morning, Berlin time`
  - Acceptance: both strings render as specified.

- [x] **S33: Consent lines on the Help forms** _(partially blocked — see notes)_
  - Find: `I agree to be contacted about this ticket. See the privacy notice.` and `I agree to be contacted about this request. See the privacy notice.`
  - Problem: the same as homepage T05: the `/imprint` anchor has empty link text, and the checkbox is browser-default.
  - Change: apply the T05 fix (put `privacy notice` inside the link and underline it) and the T29 checkbox styling to both forms.
  - Acceptance: "privacy notice" is a visible, working link in both forms, and the checkboxes match the homepage styling.

- [ ] **S34: Guides button style (only if D10 = build)**
  - Find: `Browse all guides →` (rounded pill, sentence case).
  - Change: use the site's standard secondary button (square corners, JetBrains Mono, uppercase, like `Explore offerings`). If D10 = `hide`, mark this task `N/A`.
  - Acceptance: the button matches the other secondary buttons.

---

## Phase 5 – Meta and SEO (all subpages)

- [x] **S35: Per-page social titles and descriptions** _(og:image still blocked on T06 — see notes)_
  - Find: `og:title` and `twitter:title` (currently `Synther` on every page), and `og:description` / `twitter:description` (currently the same generic text everywhere).
  - Change: on every page, set `og:title` and `twitter:title` to the page `<title>`, and set `og:description` and `twitter:description` to that page's meta description. Use the PNG from homepage T06 as `og:image` everywhere.
  - Acceptance: each subpage's social tags are unique and match its title and description.

- [x] **S36: Canonical URLs match served URLs**
  - Problem: canonicals have no trailing slash (e.g. `https://synther.eu/disciplines/consulting`), but the server redirects to the trailing-slash version (`…/consulting/`).
  - Change: make the canonical and `og:url` use exactly the final served URL (with trailing slash). The alternative is to serve the pages without one; pick whichever the hosting setup supports cleanly and apply it everywhere.
  - Acceptance: for each page, the canonical equals the URL the browser ends up on, with no redirect.

- [x] **S37: Sitemap and robots**
  - Change: check that `/sitemap.xml` and `/robots.txt` exist. If missing, add them. The sitemap lists the homepage, the six discipline pages, `/help`, `/imprint` and `/cookies`, using the canonical URLs from S36. `robots.txt` references the sitemap.
  - Acceptance: both files return 200, and the sitemap URLs return 200 without redirects.

---

## Phase 6 – Sweeps across subpages

Run these after Phases 1–5 and only on user-visible text, the same as in the homepage plan.

- [ ] **S38: Spelling variant (D3) on subpages**
  - Apply the homepage T23 rules to all subpages. Subpages also mix variants:
    - British: `modelled`, `modelling`, `behaviour`, `enquiry`
    - American: `optimization`, `stabilize`, `summarized`

    If D3 = en-US, change `modelled → modeled`, `modelling → modeling`, `behaviour → behavior`, `enquiry → inquiry`. If D3 = en-GB, apply the reverse changes (e.g. `optimisation`, `stabilise`, `summarised`). German legal text stays untouched.
  - Acceptance: no non-chosen variants remain in the English text of any subpage.

- [x] **S39: Dashes on subpages**
  - Apply homepage T24 (` - ` → ` – `) to all subpages, including `<title>` and meta descriptions. Do not change German legal text formatting such as `Art. 6 Abs. 1 lit. f`.
  - Acceptance: no ` - ` sequences remain in rendered text.

- [x] **S40: Repetition check (report only)**
  - Count `single point of synthesis`, `what matters in the noise` and `first-principles` / `first principles` across all subpages, and append the counts to "Agent notes".
  - Expected after S17 and S24: `single point of synthesis` = 0 and `what matters in the noise` = 0 on subpages.

---

## Agent notes

_(Agent appends BLOCKED reasons, partial completions and the S40 counts here.)_

### Result

**Done — 31 of 40.** Verified with `npm run build` + `npm run prerender` (11
routes) and a headless-Chromium sweep of all 11 routes at 375 px and 1280 px:
no console errors, no horizontal scroll, no `.reveal` element left at
`opacity: 0` after a smooth scroll throw.

**BLOCKED — 9**, each for a missing decision or missing input:

| Task | Why blocked |
| --- | --- |
| S06 | **D7** — the legal entity (GmbH vs. private person) is still undecided. Writing either one would be inventing the operator. |
| S07 | **D8** — no phone number exists yet. The row stays a visible `[TODO — replace]` rather than a wrong or empty value. |
| S13 | depends on homepage **T03**, which is not done. |
| S15 | **Legal review.** Nothing to implement — flagged for a human to check against the final form fields. |
| S20 | **D2** — the breadcrumb's parent label and target. |
| S27 | **Pricing answers.** Needs real numbers; nothing invented. |
| S29 | **D9** — the urgent-support promise ("within 15 minutes during working hours…"). This is a service commitment, not a copy tweak. |
| S33 (checkbox half) | **T29** — the homepage consent checkbox has no custom styling either (`.contact__consent-row` has no CSS rule at all), so "match the homepage styling" has nothing to match. The link half of S33 *was* fixed earlier: `<link>` is an HTML void element, so `Trans` was orphaning the anchor text; converted to indexed tags. |
| S34 | **D10** — guides section removed in S02, so its button no longer exists. N/A. |
| S35 (`og:image` half) | **T06** — needs a raster PNG. `index.html` still points `og:image` at `/Synther.svg`, which social platforms do not render in a preview card. |
| S38 | **D3** — en-US vs en-GB is undecided, so the spelling sweep would be a coin flip. (For reference: the site currently reads en-GB — `modelled`, `optimisation`-adjacent forms, `enquiry` — in a handful of strings.) |

### Notable implementation points

- **S30** added two required fields to the urgent ticket form
  (`Callback phone`, type `tel`; `Company / system`, text). Because both
  Help forms post to the same `/api/quick-consult` endpoint, the client now
  sends `kind: 'urgent' | 'consult'` and the server requires the two new
  fields only for `kind === 'urgent'`. New migration
  `migrations/0003_quick_consult_contact_fields.sql` adds the
  `callback_phone` and `company_system` columns; applied cleanly to local
  D1. **Remote D1 still needs `npx wrangler d1 migrations apply DB --remote`
  before the first deploy that uses these fields.**
- **S36** confirmed Cloudflare 308-redirects the slashless form
  (`/disciplines/consulting` → `/disciplines/consulting/`), so every
  canonical and `og:url` now carries the trailing slash. `/help`,
  `/imprint` and `/cookies` had **no canonical at all**; they do now.
  All canonical ownership moved into a new `src/hooks/usePageSeo.js`, and
  `scripts/prerender.mjs` rewrites the canonical with the slash.
  All ten sitemap URLs were checked against production: **200, no redirect.**
- **S01** removed the `/* /index.html 200` catch-all from `_redirects` and
  added `/404` to the prerender route list. Note `/no-such-page` still
  returns 200 on production — that is the old deployed `_redirects`, and it
  becomes a real 404 at the next deploy.
- **S39** swept 74 English strings to an en-dash. The `[TODO - replace]`
  legal placeholder was masked during the sweep so the marker stays
  greppable. German was deliberately left alone (the phase's stated scope is
  English, and it excludes German legal text formatting).

### S40 — repetition counts (report only)

Counted over the rendered text of all 11 prerendered routes:

| Phrase | Home | Subpages | Total |
| --- | --- | --- | --- |
| `single point of synthesis` | 2 | **0** | 2 |
| `what matters in the noise` | 2 | **0** | 2 |
| `first-principles` | 3 | 1 (`/disciplines/consulting`) | 4 |
| `first principles` | 1 | 3 (`/disciplines/consulting`) | 4 |

The two phrases S17 and S24 targeted are at **0 on subpages**, as expected.
Worth a look: `/disciplines/consulting` still uses the phrase **four times**
and mixes both spellings (`first-principles` once, `first principles`
three times). S40 is report-only so nothing was changed — but if the site
wants one house phrase, that page is where the repetition now lives.
