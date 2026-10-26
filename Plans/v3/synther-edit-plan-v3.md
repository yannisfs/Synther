# Synther – edit plan v3 (visual review fixes)

Reviewed in a real browser on 24 Oct 2026, after the v2 plan was completed. All v2 work holds up. The tasks below come from the visual review: things the v2 checks could not see.

This plan comes with an updated `verify-site.mjs` that adds checks `W01`–`W07`. All earlier checks are unchanged.

---

## Setup

1. Replace `scripts/verify-site.mjs` with the new version shipped with this plan. Copying it in is the only allowed edit to that file.
2. Run `bash scripts/check.sh` once. Expected:
   - `W01`, `W02`, `W03`, `W04`, `W05`, `W06` and `W07` print `FAIL`.
   - Everything else matches the v2 final run: all PASS except `V04` (preview server only), `V22` (SKIP) and `V30`.

   If any other check fails, stop and report it under Agent notes before changing anything.

## The working loop (same as v2)

1. Read only the current task.
2. Find the code with `grep -rn "<Find string>" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git .`
3. Change only what the task describes.
4. Run `bash scripts/check.sh <CHECK_ID> E00`.
5. On `FAIL`, read the text after `—`, fix, and run again. After 3 failed attempts, mark the task `BLOCKED: <last FAIL line>` and move on.
6. On `PASS`, tick the box and commit `W<NN>: <title>` with the PASS line in the commit body.

Hard rules: never tick a box without a PASS line, never edit the check scripts to make a check pass, never use the dev server for checks, never push or deploy.

---

## Tasks

- [x] **W01: Remove the "no mail client" note from the contact form**
  - Find: `no mail client` (a `<p class="contact__note …">` above the Send button).
  - Change: delete that paragraph and any divider or spacing that only exists for it.
  - Check: `W01`

- [x] **W02: Left-align the contact form's Send button**
  - Find: the class `contact__submit`.
  - Problem: the button is centered, while the fields start at the left edge of the content column. On the Help page the buttons are already left-aligned.
  - Change: make the button's container left-aligned. Remove `margin: 0 auto`, `justify-content: center`, `text-align: center` or `align-self: center`, whichever centers it. Copy the alignment the Help page forms use.
  - Check: `W02`

- [x] **W03: Make the cookie banner's OK button visible**
  - Find: the class `cookie-banner__btn`.
  - Problem: the button uses `btn--primary`, which is navy (`#0C1B2A`) on a navy banner, so it looks like loose text.
  - Change: give the banner button an inverted style:
    - `background: #FFFFFF; color: #0C1B2A; border: 1px solid #FFFFFF;`
    - on hover/focus: `background: #F3F6FB;`

    Keep the size, font and letter-spacing of the other buttons. Do this with a modifier class (e.g. `btn--inverse`) used only by the banner, not by changing `btn--primary`.
  - Check: `W03 V07 V34`

- [x] **W04: Use a real menu icon on mobile**
  - Find: the class `nav__toggle` (the button with `aria-label="Open menu"`).
  - Problem: its SVG draws a gear/settings icon, which reads as "settings", not "menu".
  - Change: replace the SVG contents with a three-line menu icon, keeping the existing `<svg>` attributes:
    ```html
    <path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>
    ```
    If the button switches icons when open, the open state should show a close icon:
    ```html
    <path d="M6 6l12 12"/><path d="M18 6L6 18"/>
    ```
    The check only inspects the closed state.
  - Check: `W04 E00`

- [x] **W05: Keep "30-minute" together in the Help heading**
  - Find: `30-minute engineering consults` (the Help page `<h1>`).
  - Problem: at phone width the heading breaks after "30-", leaving "minute" on the next line.
  - Change: replace the hyphen in `30-minute` with a non-breaking hyphen (U+2011, HTML `&#8209;`) in the heading. Change only that one hyphen.
  - Check: `W05`

- [x] **W06: Widen the step text columns**
  - Find:
    - homepage Approach steps: heading `From problem to decision`; each step body is about 220 px wide
    - discipline pages: class `capability__eng-steps`, heading `How an engagement runs`; each step body is about 239 px wide
  - Problem: the content column is about 900 px, but the step text sits in narrow columns, so it wraps every 3–5 words.
  - Change: in both layouts, let the three columns fill the content column (e.g. `grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 2.5rem;`). Remove any `max-width` on the step body paragraphs (look for `max-width` in `ch` or `px` on the step `p`). Keep the one-column stacking below 900 px and the alignment fix from V31.
  - Check: `W06 V31 V35`

- [x] **W07: CTA heading on discipline pages – at most two lines**
  - Find: `Have a problem that fits` (the CTA `h2` in the discipline template; it has `max-width: 450px`).
  - Problem: the 450 px limit forces the heading onto three lines, e.g. "Have a problem that fits / Systems Engineering & / Design?".
  - Change: raise that heading's `max-width` to `760px` (or `24ch`, whichever the check accepts on all six pages). Keep the paragraph below it at its current width.
  - Check: `W07 V35`

---

## Final run

- [x] **F01:** Run `bash scripts/check.sh > verify-final-v3.txt 2>&1` and paste the output under Agent notes. Expected: everything PASS except `V04` (preview server only, as in v2), `V22` (SKIP until D4) and `V30` (until D7/D8).

---

## Still open for the owner

- Decisions: D4 (Help nav label), D5 (city), D7 (legal entity), D8 (Imprint phone) — all four are settled as of 25 Oct 2026; see the Agent notes.
- Legal review: the 3-year IP/user-agent consent record, the Cloudflare data processing agreement, and the form-submission service.
- Deploy: only on the owner's explicit go-ahead.

---

## Agent notes

### Setup

- `scripts/verify-site.mjs` replaced with `Plans/v3/verify-site_1.mjs`
  (byte-identical copy). The diff against the v2 file is **purely
  additive**: the seven W checks were inserted in front of the runner;
  every earlier check is unchanged. This was the only edit to that file.
- `verify-baseline-v3.txt` and `verify-final-v3.txt` added to
  `.gitignore`.
- This directory is still **not a git repository** (`git rev-parse` →
  *not a git repository*), so the plan's "commit `W<NN>`" step has no
  counterpart — there is nothing to commit into. Nothing was pushed and
  nothing was deployed.

### P — Baseline (`bash scripts/check.sh`, before any change)

**34 PASS · 8 FAIL · 1 SKIP.** The plan expected W01–W07 to fail; six of
them did, but **W01 passed at the baseline**, which is worth recording:

- W01 looks for the literal lowercase string `no mail client` in the
  homepage text. The note was still there, but `.contact__note` sets
  `text-transform: uppercase`, and the check reads `innerText`, which
  reflects the transformed text — so the needle never matched. The check
  as written cannot see that note.
- The task was therefore implemented as described and verified by
  measurement instead: before the change `.contact__note` was in the DOM
  (`innerText` = "SUBMITTED SECURELY THROUGH THIS SITE – NO MAIL CLIENT
  REQUIRED."), after it the element is gone and neither `innerText` nor
  `innerHTML` contains the phrase.

Baseline non-PASS lines (verbatim):

```
FAIL  V04  Unknown URLs return HTTP 404, real pages 200 (run against the hosting emulator)  —  /this-page-does-not-exist-xyz/ -> 200 | /help/guides -> 200
SKIP  V22  Help nav item renamed (D4)  —  set D4_LABEL to run
FAIL  V30  No TODO placeholders on the imprint  —  TODO still visible (blocked on D7/D8?)
FAIL  W02  Contact form: Send button left-aligned with the fields  —  button left edge is 369px away from the field's left edge
FAIL  W03  Cookie banner: OK button stands out from the banner (contrast ≥ 3:1)  —  button background 1.00:1, border 1.00:1 against the banner (need ≥ 3:1)
FAIL  W04  Mobile menu button shows a menu icon (horizontal lines), not a gear  —  14 shapes, 0 of them horizontal lines (all must be)
FAIL  W05  Help heading: "30-minute" never breaks across lines at 375 px  —  "30-minute" spans 2 lines
FAIL  W06  Step text columns are at least 260 px wide (homepage Approach + discipline pages)  —  /: widths [233,233,233,233,233,233] | /disciplines/systems-engineering/: widths [250,250,250] | /disciplines/process-optimization/: widths [250,250,250] | /disciplines/development/: widths [250,250,250] | /disciplines/data-analytics/: widths [250,250,250] | /disciplines/decision-making/: widths [250,250,250] | /disciplines/consulting/: widths [250,250,250]
FAIL  W07  Discipline CTA heading fits on at most 2 lines at 1280 px  —  /disciplines/systems-engineering/: 3 lines | /disciplines/development/: 3 lines | /disciplines/decision-making/: 3 lines
```

No other check changed state between the v2 final run and this baseline
(V04 / V22 / V30 fail or skip for the same reasons as in v2).

### Per task

| ID | Change | Check |
|---|---|---|
| W01 | `src/components/Contact.jsx` — the `<p class="contact__note mono">` line above the Send button deleted. `src/components.css` — the now-unused `.contact__note` rule and the row's `gap: 24px` (which only separated the note from the button) removed. `src/locales/en.json` — the orphaned `contact.note` key removed. | PASS W01, PASS E00 |
| W02 | `src/components.css` — `.contact__submit-row` gained `align-items: flex-start; justify-content: flex-start`. The row's *effective* alignment came from the ≥521 px block (`align-items: center`), and the row is `flex-direction: column` in the cascade, so the button was centred in the column. This is the alignment the Help-page forms already use via `.help__submit-row`. Measured: button left edge 175 px = name field left edge 175 px (was 544 px, 369 px off). | PASS W02, PASS E00 |
| W03 | `src/styles.css` — new `.btn--inverse` modifier (white ground `#fff`, navy ink `#0c1b2a`, 1 px white border, hover/focus `#f3f6fb`), placed next to `.btn--primary`/`.btn--ghost` and used **only** by the banner; `btn--primary` itself is untouched. `src/components/CookieBanner.jsx` — the OK button now carries `btn btn--inverse cookie-banner__btn`. Measured: button `rgb(255,255,255)` on the `rgb(12,27,42)` banner → **17.42:1** (check needs ≥ 3:1); button height 47 px, font and letter-spacing unchanged. | PASS W03, PASS V07, PASS V34, PASS E00 |
| W04 | `src/components/Icon.jsx` — the `cog` path set (it was used by this toggle and nowhere else) replaced by `menu` (three rails) and `close` (cross). `src/components/Navbar.jsx` — `<Icon name={open ? 'close' : 'menu'} …>`. `src/components.css` — the gear comment and the 180° spin rule replaced (the open state now swaps to the close glyph). Measured: closed state = 3 paths, each 16×0 px; open state = 2 diagonal paths, `aria-label` "Close menu", `aria-expanded="true"`, `#mobile-menu.is-open` present. | PASS W04, PASS E00 |
| W05 | `src/locales/en.json` — in `help.title` only, the hyphen of "30-minute" became U+2011 (non-breaking hyphen): "Help, urgent support and 30‑minute engineering consults." The SEO description, the legal copy and the German text keep the ordinary hyphen. | PASS W05, PASS E00 |
| W06 | `src/components.css` — both step grids widened. The `--content-inset` that aligned the first column with the section head moved from every step onto the grid (`margin-left`), the columns are `repeat(3, minmax(0, 1fr))` with a 2 rem gap, and the `max-width: 46ch` cap on `.capability__eng-step-text` is gone. The homepage's column divider moved into the middle of the gap (`right: -1rem`) since the step no longer carries a right inset. Measured: homepage step bodies 233 px → **276 px**, discipline step bodies 250 px → **276 px**. The one-column stacking below 961 px and the V31 subgrid alignment are untouched (V31 and V35 still pass). | PASS W06, PASS V31, PASS V35, PASS E00 |
| W07 | `src/components.css` — `.capability__cta-title` `max-width: 22ch` (≈405 px) → **760 px**; the paragraph under it keeps its 52ch measure. Measured: the Systems Engineering CTA heading renders in 2 lines (was 3); the check reports 2 lines on all six discipline pages. | PASS W07, PASS V35, PASS E00 |

### F01 — Full run (`bash scripts/check.sh > verify-final-v3.txt`)

**41 PASS · 1 SKIP · 1 FAIL** — the expected set, plus **V30 now passes**:
the imprint's optional phone row was removed (see the deploy record below), so no
`[TODO — replace]` is published any more.

- `V04` fails against `vite preview` only, because the SPA preview
  returns 200 for every path. Against the hosting emulator
  (`npx wrangler pages dev dist --d1=DB --port 8788`) unknown URLs
  return 404 and the real pages 200, and
  `BASE=http://localhost:8788 node scripts/verify-site.mjs V04` → **PASS**.
- `V22` skips until `D4_LABEL` is set (D4 is an open decision).
- `V30` passed in this run: the optional phone row was removed from the
  imprint before the deploy. (D7/D8 themselves remain open decisions for
  the GmbH template that takes over once the registration is done.)

Verbatim output:

```
Building…
Starting preview server on port 4173…
PASS  E00  No JavaScript errors on any page
PASS  V01  Discuss links reach the form with the right project type
PASS  V02  Header readable on 404 page (light background behind logo)
PASS  V03  404 title uses the · separator
FAIL  V04  Unknown URLs return HTTP 404, real pages 200 (run against the hosting emulator)  —  /this-page-does-not-exist-xyz/ -> 200 | /help/guides -> 200
PASS  V05  Imprint address on one line at 1280 px, no overflow at 375 px
PASS  V06  Stats strip hidden
PASS  V07  Cookie banner has a single OK button; cookie policy matches
PASS  V08  PNG social image and large card on every page
PASS  V09  Hero subline replaced
PASS  V10  Hero disciplines line updated
PASS  V11  Self-quote removed
PASS  V12  About heading/paragraph updated
PASS  V13  Disciplines heading/intro updated
PASS  V14  "singular point of decision" gone from every page
PASS  V15  Homepage meta descriptions updated
PASS  V16  One term (Offerings or Disciplines) in nav, button, footer, breadcrumb, form
PASS  V17  Systems card wording
PASS  V18  "what matters in the noise" at most once on homepage
PASS  V19  Approach wording
PASS  V20  Response time written out
PASS  V21  No duplicate links in the footer
SKIP  V22  Help nav item renamed (D4)  —  set D4_LABEL to run
PASS  V23  Scroll-reveal: content fully visible when in view and with reduced motion
PASS  V24  All six homepage discipline cards share one resting style
PASS  V25  Cookie policy mentions the database record (DE + EN)
PASS  V26  Spelling variant en-US applied
PASS  V27  No spaced hyphens used as dashes
PASS  V28  Canonical and og:url point to the production site
PASS  V29  sitemap.xml and robots.txt valid
PASS  V30  No TODO placeholders on the imprint
PASS  V31  Engagement step bodies aligned on discipline pages
PASS  V32  Help page ends without the "Back to home" section
PASS  V33  Visible checkboxes are 16 px
PASS  V34  Cookie banner copy updated
PASS  V35  Mobile (375 px): no horizontal scroll, buttons ≥ 44 px tall
PASS  W01  Contact form: "no mail client" note removed
PASS  W02  Contact form: Send button left-aligned with the fields
PASS  W03  Cookie banner: OK button stands out from the banner (contrast ≥ 3:1)
PASS  W04  Mobile menu button shows a menu icon (horizontal lines), not a gear
PASS  W05  Help heading: "30-minute" never breaks across lines at 375 px
PASS  W06  Step text columns are at least 260 px wide (homepage Approach + discipline pages)
PASS  W07  Discipline CTA heading fits on at most 2 lines at 1280 px
```

### Deploy (24 Oct 2026, on the owner's explicit go-ahead)

The owner chose "remove the phone row, then deploy", so the deploy carried
one extra edit beyond the v3 tasks:

- `src/pages/ImprintPage.private.jsx` — the optional phone row was
  removed from both the DE and the EN field list (it rendered the literal
  text "[TODO — replace] (optional)" on a public legal page), together
  with the now-unused `TODO` constant. The GmbH template
  (`ImprintPage.gmbh.jsx`) still carried its phone row for the
  post-registration switch at this point; the owner closed that in D8
  on 25 Oct 2026 — the row is now removed there too (see "D8 — Imprint
  phone removed for now" below).
- After that edit the full suite read **41 PASS · 1 SKIP · 1 FAIL** (V30
  passes; only V04 fails, and only against the SPA preview server).

Production steps, in order:

1. `npx wrangler d1 migrations apply DB --remote` — migration
   `0003_quick_consult_contact_fields.sql` was pending. It adds two
   nullable columns (`callback_phone`, `company_system`) to
   `quick_consult_requests`; the deployed `/api/quick-consult` function
   already inserts into them, so without the migration both Help-page
   forms would have errored on submit. Verified after the fact:
   `SELECT name FROM pragma_table_info('quick_consult_requests')` lists
   both new columns on the remote database.
2. `npm run deploy` — `vite build` → `scripts/prerender.mjs` (11 routes
   prerendered into `dist/`) → `npx wrangler pages deploy dist
   --project-name=synther --branch=main --commit-dirty=true`.
   Deployment: **https://417a3048.synther.pages.dev**, published to the
   `synther` project and the **synther.eu** custom domain.

Verified on the live site after the deploy:

| Check | Result |
|---|---|
| `/`, `/help/`, `/imprint/`, `/cookies/`, `/disciplines/systems-engineering/` | 200 |
| `/this-page-does-not-exist-xyz/` | **404** (V04 behaviour, on the real host) |
| Live imprint | 0 × "[TODO — replace]"; name, address and email present |
| Live `/` | contains the v3 `btn--inverse` banner button |
| Live `/help/` | heading carries the U+2011 non-breaking hyphen |
| `/api/contact`, `/api/quick-consult`, `/api/consent` | deployed, 405 on GET as designed |

**Not verified:** a live end-to-end POST to `/api/quick-consult`. It was
deliberately not sent — it would create a real row in the production
contact database — and the sandbox classifier declined it. The endpoint's
schema and binding were verified statically (migration applied, columns
present, function responds). The owner can exercise it from the site's
own Help form.

### Legal indicators — private person (25 Oct 2026)

The owner's instruction: *"comment out the synther gmbh"* / *"only the
indicators as it is currently registered on a private person. Later we will
add gmbh back in."* The site was still publishing "Synther GmbH" as the
party behind it (the footer's legal column and the footer copyright), so
the legal indicators now name the registered operator: a private person.

One switch, one place — `src/data/content.js`:

```js
export const legalIdentity = {
  // legalName: 'Synther GmbH',
  // address: 'the registered business address',
  legalName: 'Yannis Fusenig',
  address: 'Ludwigstraße 4A, 63110 Rodgau, Germany',
}
```

The GmbH wording is kept there, commented out, right next to the values
that are live — the same "both variants on disk, one active" pattern the
two imprint templates use (`ImprintPage.private.jsx` /
`ImprintPage.gmbh.jsx`). Putting the switch in code rather than in the
locale files is deliberate: JSON cannot carry a comment, so a locale-only
switch could not keep the GmbH wording on disk the way the owner asked.

Files changed:

| File | Change |
|---|---|
| `src/data/content.js` | new `legalIdentity` export — the single source of the registered name + address, with the GmbH values commented out above them |
| `src/components/Footer.jsx` | the legal column renders `legalIdentity.legalName` + `legalIdentity.address` (was `t('site.legalName')` + `t('site.location')`); the copyright interpolates `legalIdentity.legalName` |
| `src/pages/CapabilityPage.jsx` | the Service schema's `provider` is now `Person` (not `Organization`) and carries the name + address |
| `src/pages/ImprintPage.private.jsx` | `NAME` / `ADDRESS` / `EMAIL` are read from `content.js` instead of being written out twice; the header comment lists the fifth divergence from the GmbH template |
| `src/locales/en.json`, `src/locales/de.json` | the `site.legalName` key was removed — nothing reads it any more, and leaving "Synther GmbH" in a locale key would have been a foot-gun for the next change |

`site.location` ("Germany" / "Deutschland") stays as it is: it is the
service region (the contact sidebar's "Region: Germany · remote-first")
and the `areaServed` country in the schema — not a legal indicator.

Verified:

- Full suite: **41 PASS · 1 SKIP · 1 FAIL** (output saved as
  `verify-final-v3-legal.txt`) — the same result as the
  deploy run. The only FAIL is V04, which needs the hosting emulator (the
  SPA preview server answers unknown URLs with the shell). V05 (imprint
  address on one line), V16, V21 (no duplicate footer links), V25, V30
  (no TODO on the imprint) and V35 (375 px, no horizontal scroll) still
  pass.
- `grep -rl 'Synther GmbH' dist/` → **no HTML file matches**. Every
  prerendered route (home, help, imprint, cookies, the six discipline
  pages) is clean, so no published page claims a company that is not
  registered.
- The string survives in five places in the JS bundle only — the GmbH
  imprint's locale strings (`imprint.lead`, `imprint.privacy.controllerBody`,
  `imprint.english.controllerBody` in en/de). Those are read by the
  *unmounted* GmbH template and are exactly the wording to switch back to.
- DOM measurements: the footer's legal column shows "Yannis Fusenig" and
  the address on 2 lines at 1280 px (1 line at 375 px) in the 188 px
  column; the copyright reads "© 2026 Yannis Fusenig"; the structured data
  reads `{"@type":"Person","name":"Yannis Fusenig","email":"contact@synther.eu","address":"Ludwigstraße 4A, 63110 Rodgau, Germany"}`;
  no horizontal scrollbar at 375 px.

**Published to production (25 Oct 2026, on the owner's "Publish to
prod").** `npm run deploy` — `vite build` → `scripts/prerender.mjs`
(11 routes) → `npx wrangler pages deploy dist --project-name=synther
--branch=main --commit-dirty=true`. Deployment:
**https://50f26eac.synther.pages.dev**, published to the `synther`
project and the **synther.eu** custom domain. No database migration was
needed (0003 was applied on 24 Oct).

Verified on the live site afterwards:

| Check | Result |
|---|---|
| `/`, `/help/`, `/imprint/`, `/cookies/`, all six `/disciplines/*/` | 200 |
| `/this-page-does-not-exist-xyz/` | **404** (V04 behaviour on the real host) |
| `/api/contact`, `/api/quick-consult`, `/api/consent` | deployed, 405 on GET as designed |
| "Synther GmbH" in the served HTML | **0** on all 10 routes |
| "[TODO" in the served HTML | **0** on all 10 routes |
| Footer legal column | "Yannis Fusenig" + "Ludwigstraße 4A, 63110 Rodgau, Germany" |
| Footer copyright | "© 2026 Yannis Fusenig" |
| Imprint page | 6 × the private name, 0 × GmbH, 0 × TODO |

To switch the GmbH back in later: uncomment the two lines in
`legalIdentity` and fill in the registered address, then flip the
re-export in `src/pages/ImprintPage.jsx` to `./ImprintPage.gmbh.jsx`.

### D5 — Contact region (25 Oct 2026)

The owner decided the contact sidebar names the wider area rather than the
town: **"Frankfurt Rhine-Main · remote-first"**.

- `src/locales/en.json` — new `site.region` = "Frankfurt Rhine-Main"; the
  contact row template changed from `{{location}}` to `{{region}}`.
- `src/locales/de.json` — `site.region` = "Frankfurt Rhein-Main".
- `src/components/Contact.jsx` — the region row interpolates
  `t('site.region')`.

`site.location` ("Germany" / "Deutschland") deliberately stays: it is the
`areaServed` country in the Service schema, i.e. where the work is
delivered (remote-first, across Germany). The legal pages are a separate
matter — the imprint and the footer publish the operator's real registered
address in Rodgau, because § 5 DDG requires the actual address of the
private operator and it cannot be replaced by the wider region name.

Suite after the change: **41 PASS · 1 SKIP · 1 FAIL** (V04 preview-only).
Rendered check: the sidebar row reads "Frankfurt Rhine-Main · remote-first".

### D4 — "Support" + the two paths (25 Oct 2026)

The owner asked which label serves both audiences and then chose
**"Support"**, with the page-level fixes that make it work.

- `src/locales/en.json` — `nav.help` = "Support" (one key drives the
  header link *and* the footer link), `title.help` = "Support · Synther",
  `help.breadcrumbCurrent` = "Support", `help.kicker` = "Two ways to
  reach us", `help.title` = "Support, urgent tickets and 30‑minute
  engineering consults." (the U+2011 hyphen is kept — W05 depends on it),
  and a new `help.paths` block with the two path labels.
- `src/locales/de.json` — the same keys in German.
- `src/pages/HelpPage.jsx` — the hero now carries the two paths as cards
  ("Something is down? → Open a Sev-1 ticket" and "Need a second opinion?
  → Request a 30-minute call"), and the two sections get `id="urgent"` /
  `id="consult"` as their anchor targets. The nav label names the page;
  these name the two ways in on it.
- `src/components.css` — `.help__paths` / `.help__path` styling, plus
  `scroll-margin-top: 96px` on the two target sections so the fixed
  70px nav doesn't cover the heading they land on.

**A bug the measurement caught.** The first version of the card CSS used
`color: var(--white)` for the text — but in this palette `--white` is the
*ink* (`#0c1b2a`) and `--navy-900` is the *page background*; the hero is
the ink colour. The cards rendered dark-on-dark (computed title colour
`rgb(12, 27, 42)`). Fixed to literal `#ffffff`, matching the hero's own
copy. Measured contrast on the rendered card: label 8.97:1, title 15.3:1,
hint 8.97:1, the blue accent bar 3.29:1 against the hero background (a
structural graphic, so 3:1 applies) — the blue label was dropped for
exactly that reason.

### SEO description (25 Oct 2026) — a real bug found on the way

Rewriting `help.seo.description` alone would have changed nothing: the
live `/help/` page was still serving the **homepage's** meta description.
`usePageSeo` set `og:description` and `twitter:description` but never
the plain `<meta name="description">` — so `/`, `/help/`, `/cookies/` and
`/imprint/` all shipped index.html's homepage description to search
engines, and only the six discipline pages (which set their own) had a
correct one.

- `src/hooks/usePageSeo.js` — the hook now writes the plain description
  meta too, for the pages that opt in with one.
- `src/components/DocumentTitle.jsx` — the home route passes
  `description: null`, so the hand-written homepage description in
  index.html (brand line + second sentence) is not replaced by the
  shorter pitch. The homepage head is byte-identical to before.
- `src/locales/en.json` — `help.seo.description` rewritten to cover both
  audiences ("Open a Sev-1 ticket for a system that is down, or request a
  30-minute engineering consult before you commit. Support for Synther
  customers."); the now-unused top-level `seo.description` key removed.

Per-route descriptions after the fix (live): the homepage keeps its own,
`/help/` and `/cookies/` and `/imprint/` and `/404/` and the discipline
pages each carry theirs.

### Deploy (25 Oct 2026, D4 + SEO + the region change)

`npm run deploy` — build → prerender (11 routes) → `wrangler pages
deploy`. Deployment: **https://4f7e5e9b.synther.pages.dev**, published to
the `synther` project and the **synther.eu** custom domain. This carried
three changes: the D5 region (Frankfurt Rhine-Main), the D4 label +
path cards, and the meta-description fix.

Suite before the deploy: **42 PASS · 0 SKIP · 1 FAIL** (V04 preview-only),
run with `D4_LABEL="Support"` so V22 executes instead of skipping.

Verified live: the header and footer both read "Support"; the /help/ H1,
tab title and breadcrumb follow; both path cards render with working
`#urgent` / `#consult` anchors; every route's meta description is its
own; all routes 200; unknown URLs 404; the three API endpoints 405 on GET.

### D8 — Imprint phone removed for now (25 Oct 2026)

The owner's decision: "remove phone for now" — no phone number is
published anywhere on the site, because there is no number to publish
yet.

The private imprint that ships today never had a phone row (it was
dropped before the 24 Oct deploy, see the deploy record above). The
only remaining phone row lived in the dormant GmbH template
`src/pages/ImprintPage.gmbh.jsx` — the DE field list, the mirrored EN
field list, and the matching TODO-callout entry, all of them
`value={TODO + ' (optional)'}`. All three are gone now, so the flip to
the GmbH template after the registration will not publish a phone row
either.

- `src/pages/ImprintPage.gmbh.jsx` — the phone `<Field>` removed from
  both field lists and from the `todos` callout; the file header now
  documents the exception and how to put a number back (the
  `imprint.fields.phone` label stays in `en.json` / `de.json`, so
  restoring it is one `<Field>` line per list plus the TODO entry).
- The Sev-1 ticket form keeps its **callback phone** field: the
  endpoint rejects an urgent ticket without one
  (`functions/api/quick-consult.js:69`), so that field is the phone
  the customer gives us to call *them* back on, not a number we
  publish.
- The locale key `imprint.fields.phone` is intentionally kept — it is
  the label for the row to be restored later.

Verification:

- `D4_LABEL="Support" bash scripts/check.sh` → **42 PASS · 0 SKIP · 1 FAIL**
  (`V04` — the known preview-server-only failure; it passes against the
  hosting emulator). `V30` ("No TODO placeholders on the imprint")
  still passes.
- The flip was tested end to end, because the GmbH template is dead
  code for the bundler: the shim was temporarily pointed at
  `ImprintPage.gmbh.jsx`, the site was built and prerendered, and the
  rendered imprint was inspected — "Synther GmbH" ×5,
  "hello@synther.gmbh" ×4, "TODO — replace" ×22 (the placeholders that
  are still waiting for the registration data), and **0** hits for
  "Telefon", "Contact (phone)" and "+49". The shim was reverted to
  `ImprintPage.private.jsx` and the build re-run.
- The active (private) imprint, measured in `dist/imprint/index.html`:
  0 hits for "Telefon", "Contact (phone)", "callbackPhone", "+49" and
  "TODO".

Not deployed — the change is ready, and goes out with the owner's
explicit go-ahead.

_(Deployed — see the record below.)_

### Deploy (25 Oct 2026, D8 — on the owner's explicit go-ahead)

`npm run deploy` — `vite build` → `scripts/prerender.mjs` (11 routes) →
`npx wrangler pages deploy dist --project-name=synther --branch=main
--commit-dirty=true`. Deployment: **https://e9716408.synther.pages.dev**,
published to the `synther` project and the **synther.eu** custom domain.

Verified on the live site after the deploy:

| Check | Result |
|---|---|
| `/`, `/help/`, `/imprint/`, `/cookies/`, `/disciplines/systems-engineering/` | 200 |
| `/this-page-does-not-exist-xyz/`, `/help/guides` | **404** (V04 behaviour, on the real host) |
| `/api/contact`, `/api/quick-consult`, `/api/consent` | deployed, 405 on GET as designed |
| Live imprint | 0 × "Telefon", "Contact (phone)", "callbackPhone", "+49", "TODO", "Synther GmbH"; "Yannis Fusenig" ×6, "Rodgau" ×5, 1 × mailto |

### Still open for the owner

- Decisions: none open. D4 (nav label) = "Support", D5 (region) =
  Frankfurt Rhine-Main, D7 (legal entity) = the registered private
  person, with the GmbH wording waiting in the source for the
  registration (see "Legal indicators" above), D8 (phone) = removed
  for now.
- Legal review: the 3-year IP/user-agent consent record, the Cloudflare data processing agreement, and the form-submission service.
- The v3 changes are code-level only; the visual review of the new
  banner button, menu icon and step columns is still the owner's eye
  (the measurements above are DOM measurements, not screenshots).
- The live forms (contact, urgent ticket, quick consult) have not been
  submitted end-to-end against production.

