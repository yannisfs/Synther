#!/usr/bin/env node
/**
 * Synther site verification – headless checks for the v2 edit plan.
 *
 * Runs against a PRODUCTION build served locally (not the Vite dev server).
 *   BASE=http://localhost:4173 node scripts/verify-site.mjs            -> all checks
 *   BASE=http://localhost:4173 node scripts/verify-site.mjs V01 V09    -> selected checks
 *
 * Output: one line per check  ->  PASS | FAIL | SKIP  <id>  <description>  —  <detail>
 * Exit code 1 if any check FAILs.
 *
 * Optional env:
 *   SITE=https://synther.eu   production origin expected in canonical URLs
 *   D3=en-US | en-GB          spelling variant (default en-US)
 *   D4_LABEL="..."            new label of the Help nav item (V22 is skipped if unset)
 */
import { chromium, request } from 'playwright';

const BASE = (process.env.BASE || 'http://localhost:4173').replace(/\/$/, '');
const SITE = (process.env.SITE || 'https://synther.eu').replace(/\/$/, '');
const D3 = process.env.D3 || 'en-US';

// key -> [slug, project-type option text]
const KEYS = {
  systems: ['systems-engineering', 'Systems engineering & design'],
  process: ['process-optimization', 'Process optimization'],
  development: ['development', 'Development & engineering'],
  data: ['data-analytics', 'Complex data analytics'],
  decisions: ['decision-making', 'Data-driven decision making'],
  consulting: ['consulting', 'Consulting'],
};
const DISC_NAMES = [
  'Systems Engineering & Design',
  'Process Optimization',
  'Development & Engineering',
  'Complex Data Analytics',
  'Data-Driven Decision Making',
  'Consulting',
];
const DISC_PAGES = Object.values(KEYS).map(([slug]) => `/disciplines/${slug}/`);
const PAGES = ['/', ...DISC_PAGES, '/help/', '/imprint/', '/cookies/'];
const NOT_FOUND = '/this-page-does-not-exist-xyz/';

let browser;

// ---------- helpers ----------

async function open(path, { width = 1280, height = 900, reduced = false, consent = true } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  });
  if (consent) {
    // Pre-set a stored decision so the cookie banner does not cover the page.
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem('synther.consent', JSON.stringify({
          choice: 'rejected', version: '1.0.0', config: { analytics: false },
          timestamp: new Date().toISOString(),
        }));
      } catch {}
    });
  }
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const resp = await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  return { page, ctx, resp, errors };
}

async function onPage(path, fn, opts) {
  const o = await open(path, opts);
  try { return await fn(o); } finally { await o.ctx.close(); }
}

// fn returns true on success or a string describing the failure
async function eachPage(paths, fn, opts) {
  const fails = [];
  for (const p of paths) {
    const o = await open(p, opts);
    try {
      const r = await fn(o, p);
      if (r !== true) fails.push(`${p}: ${r}`);
    } finally { await o.ctx.close(); }
  }
  return fails.length ? { pass: false, detail: fails.join(' | ') } : { pass: true };
}

const text = (page) => page.evaluate(() => document.body.innerText);
const count = (str, needle) =>
  needle instanceof RegExp
    ? (str.match(new RegExp(needle.source, needle.flags.includes('g') ? needle.flags : needle.flags + 'g')) || []).length
    : str.split(needle).length - 1;
const meta = (page, key) =>
  page.evaluate((k) => document.querySelector(`meta[name="${k}"],meta[property="${k}"]`)?.content ?? null, key);
const ok = (cond, detail) => ({ pass: !!cond, detail: cond ? '' : detail });

function homeHas(needles, mustContain) {
  return onPage('/', async ({ page }) => {
    const t = await text(page);
    const bad = needles.filter((n) => t.includes(n) !== mustContain);
    return ok(!bad.length, (mustContain ? 'missing: ' : 'still present: ') + bad.join(' / '));
  });
}

// Luminance (0 = black, 1 = white) of the first opaque background behind an element's centre
function bgLumAt(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    for (const e of document.elementsFromPoint(x, y)) {
      const m = getComputedStyle(e).backgroundColor.match(/[\d.]+/g);
      if (!m) continue;
      const [R, G, B, A = 1] = m.map(Number);
      if (A < 0.5) continue;
      return 0.2126 * lin(R) + 0.7152 * lin(G) + 0.0722 * lin(B);
    }
    return 1;
  }, selector);
}

// ---------- checks ----------

const checks = {
  E00: ['No JavaScript errors on any page', () =>
    eachPage([...PAGES, NOT_FOUND], async ({ errors }) => (errors.length ? errors.join('; ').slice(0, 200) : true))],

  V01: ['Discuss links reach the form with the right project type', async () => {
    const fails = [];
    for (const [key, [slug, option]] of Object.entries(KEYS)) {
      await onPage(`/#contact?type=${key}`, async ({ page }) => {
        await page.waitForTimeout(800);
        const r = await page.evaluate(() => {
          const s = document.querySelector('#contact select') || document.querySelector('select');
          return { sel: s ? s.options[s.selectedIndex]?.text.trim() : null, y: Math.round(scrollY) };
        });
        if (r.sel !== option) fails.push(`/#contact?type=${key}: selected "${r.sel}"`);
        if (r.y < 300) fails.push(`/#contact?type=${key}: did not scroll (scrollY=${r.y})`);
      });
      await onPage(`/disciplines/${slug}/`, async ({ page }) => {
        const hrefs = await page.evaluate(() =>
          [...document.querySelectorAll('a')].filter((a) => /discuss/i.test(a.textContent)).map((a) => a.getAttribute('href')));
        if (!hrefs.length || hrefs.some((h) => h !== `/#contact?type=${key}`))
          fails.push(`/disciplines/${slug}/ discuss hrefs ${JSON.stringify(hrefs)}`);
      });
    }
    // Homepage cards: click each Discuss link and check the select
    await onPage('/', async ({ page }) => {
      const n = await page.evaluate(() =>
        [...document.querySelectorAll('a')].filter((a) => /^discuss/i.test(a.textContent.trim())).length);
      if (n !== 6) fails.push(`homepage: expected 6 Discuss links, found ${n}`);
      for (let i = 0; i < n; i++) {
        const href = await page.evaluate((i) =>
          [...document.querySelectorAll('a')].filter((a) => /^discuss/i.test(a.textContent.trim()))[i].getAttribute('href'), i);
        const key = (href.match(/type=([a-z]+)/) || [])[1];
        await page.evaluate((i) =>
          [...document.querySelectorAll('a')].filter((a) => /^discuss/i.test(a.textContent.trim()))[i].click(), i);
        await page.waitForTimeout(700);
        const sel = await page.evaluate(() => {
          const s = document.querySelector('#contact select') || document.querySelector('select');
          return s ? s.options[s.selectedIndex]?.text.trim() : null;
        });
        if (!key || !KEYS[key] || sel !== KEYS[key][1]) fails.push(`homepage card ${i + 1} (${href}): selected "${sel}"`);
      }
    });
    return ok(!fails.length, fails.join(' | '));
  }],

  V02: ['Header readable on 404 page (light background behind logo)', async () => {
    const lum404 = await onPage(NOT_FOUND, ({ page }) => bgLumAt(page, 'header a'));
    const lumHelp = await onPage('/help/', ({ page }) => bgLumAt(page, 'header a'));
    return ok(lum404 !== null && lum404 > 0.5, `background luminance behind logo: 404=${lum404?.toFixed(2)}, /help/=${lumHelp?.toFixed(2)} (need > 0.5)`);
  }],

  V03: ['404 title uses the · separator', () =>
    onPage(NOT_FOUND, async ({ page }) => {
      const t = await page.title();
      return ok(t === 'Page not found · Synther', `title is "${t}"`);
    })],

  V04: ['Unknown URLs return HTTP 404, real pages 200 (run against the hosting emulator)', async () => {
    const api = await request.newContext();
    const fails = [];
    for (const p of [NOT_FOUND, '/help/guides']) {
      const r = await api.get(BASE + p);
      if (r.status() !== 404) fails.push(`${p} -> ${r.status()}`);
    }
    for (const p of PAGES) {
      const r = await api.get(BASE + p);
      if (r.status() !== 200) fails.push(`${p} -> ${r.status()}`);
    }
    await api.dispose();
    return ok(!fails.length, fails.join(' | '));
  }],

  V05: ['Imprint address on one line at 1280 px, no overflow at 375 px', async () => {
    const r1280 = await onPage('/imprint/', ({ page }) => page.evaluate(() => {
      const leaf = [...document.querySelectorAll('body *')].find((e) => e.children.length === 0 && e.textContent.includes('Ludwigstraße'));
      if (!leaf) return 'address element not found';
      const cs = getComputedStyle(leaf);
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
      const h = leaf.getBoundingClientRect().height;
      return h <= lh * 1.6 ? true : `address is ${Math.round(h / lh)} lines tall`;
    }));
    const r375 = await onPage('/imprint/', ({ page }) => page.evaluate(() =>
      document.documentElement.scrollWidth <= document.documentElement.clientWidth ? true : 'horizontal overflow'), { width: 375 });
    const fails = [r1280, r375].filter((r) => r !== true);
    return ok(!fails.length, fails.join(' | '));
  }],

  V06: ['Stats strip hidden', () => homeHas(['99.95%', '3.2×', 'Uptime on delivered platforms'], false)],

  V07: ['Cookie banner has a single OK button; cookie policy matches', async () => {
    const fails = [];
    await onPage('/', async ({ page }) => {
      const btns = await page.evaluate(() =>
        [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null).map((b) => b.textContent.trim()));
      if (btns.some((b) => /accept all|reject all/i.test(b))) fails.push(`banner buttons: ${JSON.stringify(btns)}`);
      if (!btns.some((b) => /^ok$/i.test(b))) fails.push('no visible "OK" button on first visit');
    }, { consent: false });
    await onPage('/cookies/', async ({ page }) => {
      const t = await text(page);
      if (/\bRejected\b|No decision yet/.test(t)) fails.push('cookie policy still shows Rejected / No decision yet');
    }, { consent: false });
    return ok(!fails.length, fails.join(' | '));
  }],

  V08: ['PNG social image and large card on every page', () =>
    eachPage(PAGES, async ({ page }) => {
      const img = await meta(page, 'og:image');
      const tw = await meta(page, 'twitter:image');
      const card = await meta(page, 'twitter:card');
      const w = await meta(page, 'og:image:width');
      const bad = [];
      if (!img?.endsWith('.png')) bad.push(`og:image=${img}`);
      if (!tw?.endsWith('.png')) bad.push(`twitter:image=${tw}`);
      if (card !== 'summary_large_image') bad.push(`twitter:card=${card}`);
      if (w !== '1200') bad.push(`og:image:width=${w}`);
      return bad.length ? bad.join(', ') : true;
    })],

  V09: ['Hero subline replaced', () =>
    onPage('/', async ({ page }) => {
      const t = (await text(page)).slice(0, 800);
      return ok(!t.includes('Transforming disparate systems'), 'hero still shows the old subline');
    })],

  V10: ['Hero disciplines line updated', () => homeHas(['Systems · Machines · Process · Data · Software'], false)],
  V11: ['Self-quote removed', () => homeHas(['At Synther, we act as'], false)],
  V12: ['About heading/paragraph updated', () => homeHas(['The single point of synthesis between your systems'], false)],
  V13: ['Disciplines heading/intro updated', () =>
    homeHas(['Six disciplines, one point of synthesis', 'Each discipline stands on its own and draws on the others'], false)],

  V14: ['"singular point of decision" gone from every page', () =>
    eachPage(PAGES, async ({ page }) => {
      const n = count(await text(page), 'singular point of decision');
      return n === 0 ? true : `${n} occurrences`;
    })],

  V15: ['Homepage meta descriptions updated', () =>
    onPage('/', async ({ page }) => {
      const d = await meta(page, 'description');
      const og = await meta(page, 'og:description');
      return ok(/industrial/.test(d || '') && /industrial/.test(og || ''), `description="${d}" og:description="${og}"`);
    })],

  V16: ['One term (Offerings or Disciplines) in nav, button, footer, breadcrumb, form', async () => {
    const terms = [];
    await onPage('/', async ({ page }) => {
      terms.push(...(await page.evaluate(() => {
        const out = [];
        const pick = (root, re) => [...(root?.querySelectorAll('a') || [])].map((a) => a.textContent.trim()).filter((t) => re.test(t));
        out.push(...pick(document.querySelector('header'), /offering|discipline/i).map((t) => 'nav:' + t));
        out.push(...pick(document.querySelector('footer'), /offering|discipline/i).map((t) => 'footer:' + t));
        out.push(...[...document.querySelectorAll('a')].map((a) => a.textContent.trim()).filter((t) => /^explore (offerings|disciplines)/i.test(t)).map((t) => 'button:' + t));
        const s = document.querySelector('#contact select') || document.querySelector('select');
        if (s) out.push('form:' + s.options[0].text.trim());
        return out;
      })));
    });
    await onPage(DISC_PAGES[0], async ({ page }) => {
      terms.push(...(await page.evaluate(() =>
        [...document.querySelectorAll('a')]
          .filter((a) => !a.closest('header') && !a.closest('footer') && !/discuss/i.test(a.textContent) && /offering|discipline/i.test(a.textContent))
          .map((a) => 'breadcrumb:' + a.textContent.trim()))));
    });
    const fam = new Set(terms.map((t) => (/offering/i.test(t) ? 'offerings' : 'disciplines')));
    return ok(fam.size === 1 && terms.length >= 5, `found ${JSON.stringify(terms)}`);
  }],

  V17: ['Systems card wording', () => homeHas(['software domains in one model'], true)],

  V18: ['"what matters in the noise" at most once on homepage', () =>
    onPage('/', async ({ page }) => {
      const n = count(await text(page), 'what matters in the noise');
      return ok(n <= 1, `${n} occurrences`);
    })],

  V19: ['Approach wording', () => homeHas(['Solving an ill-posed problem achieves nothing', 'Handover & enablement'], true)],
  V20: ['Response time written out', () => homeHas(['Within 2 working days'], false)],

  V21: ['No duplicate links in the footer', () =>
    eachPage(PAGES, async ({ page }) => {
      const dups = await page.evaluate(() => {
        const hrefs = [...document.querySelectorAll('footer a')].map((a) => a.getAttribute('href')).filter((h) => h && !h.startsWith('mailto:') && !h.includes('#top'));
        return hrefs.filter((h, i) => hrefs.indexOf(h) !== i);
      });
      return dups.length ? `duplicate hrefs ${JSON.stringify(dups)}` : true;
    })],

  V22: ['Help nav item renamed (D4)', async () => {
    if (!process.env.D4_LABEL) return { skip: true, detail: 'set D4_LABEL to run' };
    return eachPage(PAGES, async ({ page }) => {
      const nav = await page.evaluate(() => [...document.querySelectorAll('header a')].map((a) => a.textContent.trim()));
      return nav.includes(process.env.D4_LABEL) ? true : `header links ${JSON.stringify(nav)}`;
    });
  }],

  V23: ['Scroll-reveal: content fully visible when in view and with reduced motion', async () => {
    const fails = [];
    await onPage('/', async ({ page }) => {
      const found = await page.evaluate(() => {
        const h = [...document.querySelectorAll('h3')].find((x) => /Handover|Knowledge transfer/.test(x.textContent));
        if (!h) return false;
        h.scrollIntoView({ block: 'center' });
        return true;
      });
      if (!found) { fails.push('Approach step 06 heading not found'); return; }
      await page.waitForTimeout(1500);
      const op = await page.evaluate(() => {
        const h = [...document.querySelectorAll('h3')].find((x) => /Handover|Knowledge transfer/.test(x.textContent));
        let o = 1; for (let e = h; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
        return o;
      });
      if (op < 0.99) fails.push(`step 06 opacity ${op.toFixed(2)} while in view`);
    });
    await onPage('/', async ({ page }) => {
      const hidden = await page.evaluate(() =>
        [...document.querySelectorAll('main h2, main h3, main p')].filter((el) => {
          let o = 1; for (let e = el; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
          return o < 0.99;
        }).map((el) => el.textContent.trim().slice(0, 40)));
      if (hidden.length) fails.push(`reduced motion: ${hidden.length} elements not fully visible, e.g. "${hidden[0]}"`);
    }, { reduced: true });
    return ok(!fails.length, fails.join(' | '));
  }],

  V24: ['All six homepage discipline cards share one resting style', () =>
    onPage('/', async ({ page }) => {
      await page.mouse.move(1, 1);
      const styles = await page.evaluate((names) => names.map((n) => {
        const h = [...document.querySelectorAll('h3')].find((x) => x.textContent.trim() === n);
        if (!h) return 'missing:' + n;
        const card = h.closest('article') || h.parentElement;
        const cs = getComputedStyle(card);
        return [cs.backgroundColor, cs.borderLeftWidth, cs.borderLeftColor, cs.boxShadow].join(' ');
      }), DISC_NAMES);
      return ok(new Set(styles).size === 1, JSON.stringify(styles));
    })],

  V25: ['Cookie policy mentions the database record (DE + EN)', () =>
    onPage('/cookies/', async ({ page }) => {
      const t = await text(page);
      const de = count(t, /Datenbank/), en = count(t, /database/);
      return ok(de >= 1 && en >= 2, `Datenbank=${de} (need ≥1), database=${en} (need ≥2)`);
    })],

  V26: [`Spelling variant ${D3} applied`, () => {
    const bad = D3 === 'en-GB'
      ? /\brigor\b|\bmodel(ed|ing)\b|\bbehavior|\binquir|optimiz|\bcenter\b|stabiliz|summariz/gi
      : /\brigour\b|\bmodell(ed|ing)\b|\bbehaviour|\benquir/gi;
    return eachPage(PAGES, async ({ page }) => {
      const hits = (await text(page)).match(bad) || [];
      return hits.length ? `found ${JSON.stringify([...new Set(hits)])}` : true;
    });
  }],

  V27: ['No spaced hyphens used as dashes', () =>
    eachPage(PAGES, async ({ page }) => {
      const t = await text(page);
      const n = count(t, ' - ');
      if (!n) return true;
      const i = t.indexOf(' - ');
      return `${n}x, e.g. "…${t.slice(Math.max(0, i - 30), i + 30).replace(/\n/g, ' ')}…"`;
    })],

  V28: ['Canonical and og:url point to the production site', () =>
    eachPage(PAGES, async ({ page }, p) => {
      const can = await page.evaluate(() => document.querySelector('link[rel=canonical]')?.href ?? null);
      const og = await meta(page, 'og:url');
      const want = SITE + p;
      return can === want && og === want ? true : `canonical=${can} og:url=${og} (want ${want})`;
    })],

  V29: ['sitemap.xml and robots.txt valid', async () => {
    const api = await request.newContext();
    const fails = [];
    const sm = await api.get(BASE + '/sitemap.xml');
    if (sm.status() !== 200) fails.push(`sitemap.xml -> ${sm.status()}`);
    else {
      const locs = [...(await sm.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
      if (!locs.length) fails.push('sitemap has no <loc> entries');
      for (const loc of locs) {
        if (!loc.startsWith(SITE + '/')) { fails.push(`loc not on ${SITE}: ${loc}`); continue; }
        const r = await api.get(BASE + new URL(loc).pathname, { maxRedirects: 0 });
        if (r.status() !== 200) fails.push(`${loc} -> ${r.status()}`);
      }
    }
    const rb = await api.get(BASE + '/robots.txt');
    if (rb.status() !== 200) fails.push(`robots.txt -> ${rb.status()}`);
    else if (!/Sitemap:\s*https:\/\/synther\.eu\/sitemap\.xml/i.test(await rb.text())) fails.push('robots.txt does not reference the sitemap');
    await api.dispose();
    return ok(!fails.length, fails.join(' | '));
  }],

  V30: ['No TODO placeholders on the imprint', () =>
    onPage('/imprint/', async ({ page }) => ok(!(await text(page)).includes('TODO'), 'TODO still visible (blocked on D7/D8?)'))],

  V31: ['Engagement step bodies aligned on discipline pages', () =>
    eachPage(DISC_PAGES, async ({ page }) => page.evaluate(() => {
      const h2 = [...document.querySelectorAll('h2')].find((h) => /How an engagement runs/.test(h.textContent));
      if (!h2) return 'section not found';
      const sec = h2.closest('section') || h2.parentElement.parentElement;
      const tops = [...sec.querySelectorAll('h3')].map((h3) => {
        const box = h3.closest('li') || h3.parentElement;
        const p = box.querySelector('p') || box.parentElement.querySelector('p');
        return p ? Math.round(p.getBoundingClientRect().top) : null;
      });
      if (tops.length < 3 || tops.includes(null)) return `step bodies not found (${JSON.stringify(tops)})`;
      return Math.max(...tops) - Math.min(...tops) <= 2 ? true : `body tops ${JSON.stringify(tops)}`;
    }))],

  V32: ['Help page ends without the "Back to home" section', () =>
    onPage('/help/', async ({ page }) => ok(!/back to home/i.test(await text(page)), '"Back to home" still present'))],

  V33: ['Visible checkboxes are 16 px', () =>
    eachPage(['/', '/help/'], async ({ page }) => {
      const sizes = await page.evaluate(() =>
        [...document.querySelectorAll('input[type=checkbox]')].filter((c) => c.offsetParent !== null).map((c) => Math.round(c.getBoundingClientRect().width)));
      return sizes.length && sizes.every((s) => s >= 15 && s <= 17) ? true : `sizes ${JSON.stringify(sizes)}`;
    })],

  V34: ['Cookie banner copy updated', () =>
    onPage('/', async ({ page }) => {
      const t = await text(page);
      return ok(!/No analytics yet|before you decide/.test(t), 'old banner text still present');
    }, { consent: false })],

  V35: ['Mobile (375 px): no horizontal scroll, buttons ≥ 44 px tall', () =>
    eachPage([...PAGES, NOT_FOUND], async ({ page }) => page.evaluate(() => {
      const bad = [];
      if (document.documentElement.scrollWidth > document.documentElement.clientWidth)
        bad.push(`overflow ${document.documentElement.scrollWidth}px`);
      const small = [...document.querySelectorAll('button, a[class*="btn"]')]
        .filter((b) => b.offsetParent !== null && b.getBoundingClientRect().height < 44)
        .map((b) => `"${b.textContent.trim().slice(0, 20)}" ${Math.round(b.getBoundingClientRect().height)}px`);
      if (small.length) bad.push(`small buttons: ${small.slice(0, 3).join(', ')}${small.length > 3 ? ` (+${small.length - 3})` : ''}`);
      return bad.length ? bad.join('; ') : true;
    }), { width: 375, height: 800 })],

  // ---------- v3: findings from the visual review (24 Oct 2026) ----------

  W01: ['Contact form: "no mail client" note removed', () => homeHas(['no mail client'], false)],

  W02: ['Contact form: Send button left-aligned with the fields', () =>
    onPage('/', ({ page }) => page.evaluate(() => {
      const c = document.querySelector('#contact');
      const inp = c && c.querySelector('input[name="name"]');
      const btn = c && [...c.querySelectorAll('button')].find((b) => /send/i.test(b.textContent));
      if (!inp || !btn) return { pass: false, detail: 'name input or Send button not found' };
      const d = Math.round(Math.abs(btn.getBoundingClientRect().left - inp.getBoundingClientRect().left));
      return { pass: d <= 2, detail: d <= 2 ? '' : `button left edge is ${d}px away from the field's left edge` };
    }))],

  W03: ['Cookie banner: OK button stands out from the banner (contrast ≥ 3:1)', () =>
    onPage('/', ({ page }) => page.evaluate(() => {
      const ok = [...document.querySelectorAll('button')].find((b) => /^ok$/i.test(b.textContent.trim()) && b.offsetParent !== null);
      if (!ok) return { pass: false, detail: 'no visible OK button' };
      const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]) => {
        const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
      let bannerBg = null;
      for (let e = ok.parentElement; e; e = e.parentElement) {
        const c = rgb(getComputedStyle(e).backgroundColor);
        if (c.length >= 3 && (c[3] === undefined || c[3] >= 0.5)) { bannerBg = c; break; }
      }
      bannerBg = bannerBg || [255, 255, 255];
      const cs = getComputedStyle(ok);
      const bg = rgb(cs.backgroundColor), border = rgb(cs.borderTopColor);
      const bgVisible = bg.length >= 3 && (bg[3] === undefined || bg[3] >= 0.5);
      const borderVisible = parseFloat(cs.borderTopWidth) >= 1 && border.length >= 3 && (border[3] === undefined || border[3] >= 0.5);
      const rBg = bgVisible ? ratio(bg, bannerBg) : 1;
      const rBorder = borderVisible ? ratio(border, bannerBg) : 1;
      const best = Math.max(rBg, rBorder);
      return { pass: best >= 3, detail: best >= 3 ? '' : `button background ${rBg.toFixed(2)}:1, border ${rBorder.toFixed(2)}:1 against the banner (need ≥ 3:1)` };
    }), { consent: false })],

  W04: ['Mobile menu button shows a menu icon (horizontal lines), not a gear', () =>
    onPage('/', ({ page }) => page.evaluate(() => {
      const btn = document.querySelector('header button[aria-label*="menu" i], header .nav__toggle');
      const svg = btn && btn.querySelector('svg');
      if (!svg) return { pass: false, detail: 'menu button svg not found' };
      const shapes = [...svg.querySelectorAll('path, line, rect, polyline')];
      const boxes = shapes.map((s) => s.getBBox());
      const flat = boxes.filter((b) => b.height <= 1.5 && b.width >= 10).length;
      const ok = shapes.length >= 2 && flat === shapes.length;
      return { pass: ok, detail: ok ? '' : `${shapes.length} shapes, ${flat} of them horizontal lines (all must be)` };
    }), { width: 375, height: 800 })],

  W05: ['Help heading: "30-minute" never breaks across lines at 375 px', () =>
    onPage('/help/', ({ page }) => page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
      for (let n; (n = walker.nextNode());) {
        const m = n.textContent.match(/30[-‐‑]minute/);
        if (!m) continue;
        const r = document.createRange();
        r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
        const tops = new Set([...r.getClientRects()].map((x) => Math.round(x.top)));
        return { pass: tops.size === 1, detail: tops.size === 1 ? '' : `"30-minute" spans ${tops.size} lines` };
      }
      return { pass: false, detail: '"30-minute" not found in a single text node of the h1' };
    }), { width: 375, height: 800 })],

  W06: ['Step text columns are at least 260 px wide (homepage Approach + discipline pages)', async () => {
    const fails = [];
    const measure = (re) => {
      const h2 = [...document.querySelectorAll('h2')].find((h) => new RegExp(re).test(h.textContent));
      if (!h2) return 'section not found';
      const sec = h2.closest('section') || h2.parentElement.parentElement;
      return [...sec.querySelectorAll('h3')].map((h3) => {
        const box = h3.closest('li') || h3.parentElement;
        const p = box.querySelector('p') || box.parentElement.querySelector('p');
        return p ? Math.round(p.getBoundingClientRect().width) : 0;
      });
    };
    for (const [path, re] of [['/', 'From problem to decision'], ...DISC_PAGES.map((p) => [p, 'How an engagement runs'])]) {
      await onPage(path, async ({ page }) => {
        const w = await page.evaluate(measure, re);
        if (typeof w === 'string') fails.push(`${path}: ${w}`);
        else if (!w.length || Math.min(...w) < 260) fails.push(`${path}: widths ${JSON.stringify(w)}`);
      });
    }
    return ok(!fails.length, fails.join(' | '));
  }],

  W07: ['Discipline CTA heading fits on at most 2 lines at 1280 px', () =>
    eachPage(DISC_PAGES, async ({ page }) => page.evaluate(() => {
      const h = [...document.querySelectorAll('h2')].find((x) => /Have a problem that fits/.test(x.textContent));
      if (!h) return 'CTA heading not found';
      const lh = parseFloat(getComputedStyle(h).lineHeight) || parseFloat(getComputedStyle(h).fontSize) * 1.2;
      const lines = Math.round(h.getBoundingClientRect().height / lh);
      return lines <= 2 ? true : `${lines} lines`;
    }))],

  // ---------- Research section ----------
  // The Research pages are their own section, so they get their own
  // checks instead of being folded into PAGES: the section has its own
  // empty state, its own feed and its own paper routes.

  R01: ['Research index: no JavaScript errors, one h1, ordered headings, labelled breadcrumb', async () => {
    const r = await onPage('/research/', async ({ page, errors }) => {
      if (errors.length) return `JS errors: ${errors.join('; ').slice(0, 200)}`;
      const dom = await page.evaluate(() => {
        const main = document.querySelector('main') || document.body;
        const headings = [...main.querySelectorAll('h1,h2,h3,h4,h5,h6')]
          .filter((h) => h.offsetParent !== null)
          .map((h) => ({ level: Number(h.tagName[1]), text: h.textContent.trim().slice(0, 40) }));
        const crumbs = document.querySelectorAll('nav[aria-label="Breadcrumb"]');
        const current = document.querySelector('nav[aria-label="Breadcrumb"] [aria-current="page"]');
        return {
          h1: main.querySelectorAll('h1').length,
          headings,
          crumbs: crumbs.length,
          current: current ? current.textContent.trim() : null,
        };
      });
      const problems = [];
      if (dom.h1 !== 1) problems.push(`${dom.h1} h1 elements`);
      // No level may be skipped on the way down: h2 -> h4 is a broken outline.
      let prev = dom.headings.length ? dom.headings[0].level : 1;
      for (const h of dom.headings.slice(1)) {
        if (h.level > prev + 1) problems.push(`h${prev} -> h${h.level} at "${h.text}"`);
        prev = h.level;
      }
      if (dom.crumbs !== 1) problems.push(`${dom.crumbs} breadcrumb navs`);
      if (!dom.current) problems.push('no aria-current="page" in the breadcrumb');
      return problems.length ? problems.join(' | ') : true;
    });
    return ok(r === true, r === true ? '' : r);
  }],

  R02: ['Research index: canonical, og:url, description, social image and RSS link', async () => {
    const r = await onPage('/research/', async ({ page }) => {
      const d = await page.evaluate(() => {
        const q = (s) => document.querySelector(s);
        return {
          canonical: q('link[rel=canonical]')?.href ?? null,
          ogUrl: q('meta[property="og:url"]')?.content ?? null,
          desc: q('meta[name=description]')?.content ?? null,
          ogDesc: q('meta[property="og:description"]')?.content ?? null,
          ogImage: q('meta[property="og:image"]')?.content ?? null,
          ogImageW: q('meta[property="og:image:width"]')?.content ?? null,
          twitterCard: q('meta[name="twitter:card"]')?.content ?? null,
          rss: q('link[rel=alternate][type="application/rss+xml"]')?.href ?? null,
          ld: document.querySelectorAll('script[type="application/ld+json"]').length,
        };
      });
      const want = SITE + '/research/';
      const bad = [];
      if (d.canonical !== want) bad.push(`canonical=${d.canonical}`);
      if (d.ogUrl !== want) bad.push(`og:url=${d.ogUrl}`);
      if (!d.desc) bad.push('no description');
      if (!d.ogDesc) bad.push('no og:description');
      if (!d.ogImage?.endsWith('.png')) bad.push(`og:image=${d.ogImage}`);
      if (d.ogImageW !== '1200') bad.push(`og:image:width=${d.ogImageW}`);
      if (d.twitterCard !== 'summary_large_image') bad.push(`twitter:card=${d.twitterCard}`);
      if (d.rss !== want.replace(/\/$/, '') + '/feed.xml') bad.push(`rss=${d.rss}`);
      if (d.ld < 2) bad.push(`${d.ld} JSON-LD blocks`);
      return bad.length ? bad.join(', ') : true;
    });
    return ok(r === true, r === true ? '' : r);
  }],

  R03: ['Research index: no horizontal overflow at 375 px', async () => {
    const r = await onPage('/research/', ({ page }) => page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth <= w) return true;
      const wide = [...document.querySelectorAll('body *')]
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''), right: Math.round(r.right), width: Math.round(r.width) };
        })
        .filter((x) => x.right > w + 1)
        .slice(0, 4);
      return `scrollWidth ${document.documentElement.scrollWidth} > ${w}; widest: ${wide.map((x) => `${x.sel} (right ${x.right})`).join(', ')}`;
    }), { width: 375, height: 800 });
    return ok(r === true, r === true ? '' : r);
  }],

  R04: ['Research index: every focusable element inside the section shows a focus ring', async () => {
    const r = await onPage('/research/', async ({ page }) => {
      // Walk the section with the keyboard, the way a keyboard user does.
      await page.evaluate(() => document.querySelector('.research')?.scrollIntoView());
      const seen = [];
      for (let i = 0; i < 25; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const cs = getComputedStyle(el);
          const outline = parseFloat(cs.outlineWidth) || 0;
          const shadow = cs.boxShadow && cs.boxShadow !== 'none';
          return {
            tag: el.tagName,
            label: (el.textContent || '').trim().slice(0, 24),
            inSection: !!(el.closest('.research') || el.closest('main')),
            visible: outline > 0 || shadow,
          };
        });
        if (!info) continue;
        seen.push(info);
        if (info.inSection) break; // one focus stop inside the section is enough
      }
      const stops = seen.filter((s) => s.inSection);
      if (!stops.length) return 'no focusable element found inside the section';
      const blind = stops.filter((s) => !s.visible);
      return blind.length
        ? blind.map((b) => `${b.tag} "${b.label}" has no focus ring`).join(' | ')
        : true;
    });
    return ok(r === true, r === true ? '' : r);
  }],

  R05: ['Research index: text meets the WCAG AA contrast ratio', async () => {
    const r = await onPage('/research/', ({ page }) => page.evaluate(() => {
      const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]) => {
        const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
      // The nearest opaque background behind an element, walking up the tree.
      const bgOf = (el) => {
        for (let e = el; e; e = e.parentElement) {
          const c = rgb(getComputedStyle(e).backgroundColor);
          if (c.length >= 3 && (c[3] === undefined || c[3] >= 0.5)) return c.slice(0, 3);
        }
        return [255, 255, 255];
      };
      const targets = [
        ['.research__empty-text', 4.5],
        ['.research__facts .capability__spec-label', 4.5],
        ['.research__facts .capability__spec-value', 4.5],
        ['.capability__lead', 4.5],
        ['.research__std-grid .capability__cap-text', 4.5],
        ['.research__std-grid .capability__cap-title', 4.5],
        ['.section-lead', 4.5],
        ['.eyebrow', 4.5],
        ['.capability__h2', 4.5],
        ['.research__link', 4.5],
        ['.research__empty-links a', 4.5],
      ];
      const bad = [];
      let measured = 0;
      for (const [sel, min] of targets) {
        const el = document.querySelector(sel);
        if (!el) continue; // not rendered on this page (e.g. no papers yet)
        measured++;
        const cs = getComputedStyle(el);
        const fg = rgb(cs.color).slice(0, 3);
        const size = parseFloat(cs.fontSize);
        const weight = Number(cs.fontWeight) || 400;
        const large = size >= 24 || (size >= 18.66 && weight >= 700);
        const need = large ? 3 : min;
        const r = ratio(fg, bgOf(el));
        if (r < need) bad.push(`${sel} ${r.toFixed(2)}:1 (need ${need}:1)`);
      }
      if (!measured) return 'no contrast target found';
      return bad.length ? bad.join(' | ') : true;
    }));
    return ok(r === true, r === true ? '' : r);
  }],

  R06: ['Research index: the empty state links to the feed and to the contact form', async () => {
    const r = await onPage('/research/', async ({ page }) => {
      const d = await page.evaluate(() => ({
        empty: !!document.querySelector('.research__empty'),
        links: [...document.querySelectorAll('.research__empty a')].map((a) => a.getAttribute('href')),
        filterChips: document.querySelectorAll('.research__chip').length,
        paperRows: document.querySelectorAll('.research__paper').length,
      }));
      const bad = [];
      if (d.paperRows > 0) {
        // With papers there is a list, and the list has a type filter.
        if (!d.filterChips) bad.push('no type filter');
        return bad.length ? bad.join(', ') : true;
      }
      // With no paper yet the section shows the empty state instead.
      if (!d.empty) bad.push('no empty state');
      if (!d.links.some((h) => /\/research\/feed\.xml$/.test(h || ''))) bad.push('no feed link');
      if (!d.links.some((h) => /#contact$/.test(h || ''))) bad.push('no contact link');
      return bad.length ? bad.join(', ') : true;
    });
    return ok(r === true, r === true ? '' : r);
  }],

  R07: ['Research: the header nav links to the section on the home page and on the index', async () => {
    const fails = [];
    for (const p of ['/', '/research/']) {
      const r = await onPage(p, async ({ page }) => {
        const hrefs = await page.evaluate(() =>
          [...document.querySelectorAll('header a')].map((a) => a.getAttribute('href')));
        return hrefs.some((h) => h === '/research' || h === '/research/') ? true : `header links ${JSON.stringify(hrefs)}`;
      });
      if (r !== true) fails.push(`${p}: ${r}`);
    }
    return ok(!fails.length, fails.join(' | '));
  }],

  R08: ['Research paper pages: one h1, ordered headings, Scholar meta tags, canonical', async () => {
    // The published papers are exactly the /research/<slug>/ URLs in the
    // sitemap. With no paper published yet the check skips.
    const api = await request.newContext();
    let xml = '';
    try {
      const res = await api.get(BASE + '/sitemap.xml');
      xml = await res.text();
    } catch {
      /* handled below */
    }
    await api.dispose();
    const paperUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => m[1])
      .filter((u) => /\/research\/[^/]+\/$/.test(u))
      .map((u) => new URL(u).pathname);
    if (!paperUrls.length) return { skip: true, detail: 'no published paper' };
    const fails = [];
    for (const p of paperUrls) {
      const r = await onPage(p, async ({ page, errors }) => {
        if (errors.length) return `JS errors: ${errors.join('; ').slice(0, 160)}`;
        const d = await page.evaluate(() => {
          const main = document.querySelector('main') || document.body;
          const levels = [...main.querySelectorAll('h1,h2,h3,h4,h5,h6')]
            .filter((h) => h.offsetParent !== null)
            .map((h) => Number(h.tagName[1]));
          const q = (s) => document.querySelector(s);
          const names = (s) => [...document.querySelectorAll(s)].map((m) => m.content);
          return {
            h1: main.querySelectorAll('h1').length,
            levels,
            canonical: q('link[rel=canonical]')?.href ?? null,
            title: document.title,
            scholarTitle: q('meta[name="citation_title"]')?.content ?? null,
            authors: names('meta[name="citation_author"]').length,
            date: q('meta[name="citation_publication_date"]')?.content ?? null,
            current: q('nav[aria-label="Breadcrumb"] [aria-current="page"]')?.textContent ?? null,
            toc: document.querySelectorAll('.research__toc a').length,
            cite: q('#cite')?.textContent?.includes('@') ?? false,
          };
        });
        const bad = [];
        if (d.h1 !== 1) bad.push(`${d.h1} h1`);
        let prev = d.levels.length ? d.levels[0] : 1;
        for (const l of d.levels.slice(1)) {
          if (l > prev + 1) bad.push(`h${prev} -> h${l}`);
          prev = l;
        }
        if (!d.canonical) bad.push('no canonical');
        if (!d.scholarTitle) bad.push('no citation_title');
        if (!d.authors) bad.push('no citation_author');
        if (!d.date) bad.push('no citation_publication_date');
        if (!d.current) bad.push('no aria-current in the breadcrumb');
        if (!d.cite) bad.push('no citation block');
        return bad.length ? bad.join(', ') : true;
      });
      if (r !== true) fails.push(`${p}: ${r}`);
      // The paper body carries wide tables and formulas — they have to
      // scroll inside their own box, not push the page sideways.
      const m = await onPage(p, ({ page }) => page.evaluate(() =>
        document.documentElement.scrollWidth <= document.documentElement.clientWidth
          ? true : `scrollWidth ${document.documentElement.scrollWidth} > ${document.documentElement.clientWidth}`
      ), { width: 375, height: 800 });
      if (m !== true) fails.push(`${p} at 375 px: ${m}`);
    }
    return ok(!fails.length, fails.join(' | '));
  }],

  R09: ['Research feed: valid RSS 2.0 with the published papers', async () => {
    const api = await request.newContext();
    let body = '';
    let type = '';
    try {
      const res = await api.get(BASE + '/research/feed.xml');
      type = res.headers()['content-type'] || '';
      body = await res.text();
    } catch (e) {
      await api.dispose();
      return ok(false, `feed not reachable: ${e.message.split('\n')[0]}`);
    }
    await api.dispose();
    const bad = [];
    if (!/xml/.test(type)) bad.push(`content-type=${type}`);
    if (!/<rss[^>]*version="2\.0"/.test(body)) bad.push('no rss version="2.0"');
    if (!/<channel>/.test(body)) bad.push('no channel');
    if (!/<title>/.test(body)) bad.push('no channel title');
    // Tag balance — a well-formed document has no unclosed element.
    const stack = [];
    for (const m of body.matchAll(/<\/?([a-zA-Z0-9:]+)[^>]*?(\/?)>/g)) {
      const [full, name, selfClose] = m;
      if (full.startsWith('<?') || full.startsWith('<!')) continue;
      if (full.startsWith('</')) {
        const top = stack.pop();
        if (top !== name) { bad.push(`</${name}> closes <${top}>`); break; }
      } else if (!selfClose && !full.endsWith('/>')) {
        stack.push(name);
      }
    }
    if (stack.length) bad.push(`unclosed: ${stack.join(',')}`);
    const items = (body.match(/<item>/g) || []).length;
    return ok(!bad.length, bad.join(', ') + (bad.length ? '' : ` (${items} item(s))`));
  }],
};

// ---------- runner ----------

const wanted = process.argv.slice(2);
const unknown = wanted.filter((w) => !checks[w]);
if (unknown.length) { console.error(`Unknown check id(s): ${unknown.join(', ')}`); process.exit(2); }

browser = await chromium.launch();
let failed = 0;
for (const [id, [desc, fn]] of Object.entries(checks)) {
  if (wanted.length && !wanted.includes(id)) continue;
  let r;
  try { r = await fn(); } catch (e) { r = { pass: false, detail: 'ERROR ' + e.message.split('\n')[0] }; }
  const status = r.skip ? 'SKIP' : r.pass ? 'PASS' : 'FAIL';
  if (status === 'FAIL') failed++;
  console.log(`${status}  ${id}  ${desc}${r.detail ? '  —  ' + r.detail : ''}`);
}
await browser.close();
process.exit(failed ? 1 : 0);
