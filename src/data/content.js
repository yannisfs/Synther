// Structural (non-text) data for Synther. All user-facing copy lives in
// src/locales/en.json and is read via react-i18next's t(). This file keeps
// only ids, hrefs, icon names, numeric values and the contact email — the
// things that are not translated.

export const company = {
  email: 'contact@synther.eu',
  // The published phone number. `null` means "no number published": the
  // imprint and the contact sidebar then skip the phone row entirely
  // rather than rendering an empty one. Set it to the display format
  // (e.g. '+49 176 12345678') — the tel: link is derived from it by
  // phoneHref() below.
  phone: null,
}

// tel: href for a published phone number — strips the formatting
// characters, so '+49 176 12345678' becomes '+4917612345678'.
export const phoneHref = (phone) =>
  phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null

// The party behind the site, as currently registered: a private person.
//
// The Synther GmbH registration is still pending, so the site is published
// under the operator's own name and private address (§ 5 DDG). The footer's
// legal column, the footer copyright, the structured data and the imprint
// page all read these two values from here, so the legal indicators shown
// on the site can never drift apart.
//
// The GmbH wording is kept right below, commented out, so switching back
// once the registration is complete is a two-line change here plus the
// imprint switch in src/pages/ImprintPage.jsx — the same pattern the two
// imprint templates use.
export const legalIdentity = {
  // legalName: 'Synther GmbH',
  // address: 'the registered business address',
  // type: 'Organization',
  legalName: 'Yannis Fusenig',
  address: 'Ludwigstraße 4A, 63110 Rodgau, Germany',
  type: 'Person',
}

// The production origin. Canonical URLs and og:url are built from this
// constant, not from window.location.origin — otherwise a local build
// advertises http://localhost… as the canonical address of every page.
export const SITE_URL = 'https://synther.eu'

export const nav = [
  { key: 'offerings', href: '#offerings' },
  { key: 'approach', href: '#approach' },
  // The Research section (/research/). Between Approach and Support, as the
  // plan asks. Absolute path, so useHomeLink() passes it through unchanged
  // on every route (the hash links above are home-page anchors).
  { key: 'research', href: '/research' },
  { key: 'help', href: '/help' },
]

export const stats = [
  { key: 'systems', value: '40+' },
  { key: 'sectors', value: '12' },
  { key: 'efficiency', value: '3.2×' },
  { key: 'uptime', value: '99.95%' },
]

export const offerings = [
  { id: 'systems-engineering', key: 'systems', icon: 'disc-systems' },
  { id: 'process-optimization', key: 'process', icon: 'disc-process' },
  { id: 'development', key: 'development', icon: 'disc-development' },
  { id: 'data-analytics', key: 'data', icon: 'disc-data' },
  { id: 'decision-making', key: 'decisions', icon: 'disc-decision' },
  { id: 'consulting', key: 'consulting', icon: 'disc-consulting' },
]

// Labeled key/value strip at the foot of the hero - a structured "spec sheet"
// rather than a tagline eyebrow. Text comes from locales.heroMeta.<key>.
export const heroMeta = [{ key: 'disciplines' }]

// Contact "direct" sidebar rows. The email value is data (an address, not
// translatable prose); region/response values come from the locale.
export const contactDirect = [
  { icon: 'mail', key: 'email', href: `mailto:${company.email}` },
  // The phone row appears only while a number is published
  // (company.phone). Keeping it in this list — rather than hard-coding
  // it in the component — means the number is added or removed in one
  // place and the sidebar and the imprint stay in sync.
  ...(company.phone
    ? [{ icon: 'phone', key: 'phone', href: phoneHref(company.phone) }]
    : []),
  { icon: 'pin', key: 'region' },
  { icon: 'clock', key: 'response' },
]

// Project-type option keys for the contact form select. Labels come from
// locales.contact.projectTypes.<key>.
export const projectTypes = [
  'systems-engineering',
  'process-optimization',
  'development',
  'data-analytics',
  'decision-making',
  'consulting',
  'other',
]

// V01: the short key each offering uses in a "Discuss" link
// (#contact?type=<key>). The links carry the short key rather than the
// full project-type id so the URL stays readable and the mapping is
// explicit instead of implied by a prefix match.
export const projectTypeKeys = {
  systems: 'systems-engineering',
  process: 'process-optimization',
  development: 'development',
  data: 'data-analytics',
  decisions: 'decision-making',
  consulting: 'consulting',
}

export const approach = [
  { step: '01' },
  { step: '02' },
  { step: '03' },
  { step: '04' },
  { step: '05' },
  { step: '06' },
]

// Currently unused: the Capabilities section is not rendered. Kept as
// data-only (chart values are not localised copy).
export const capabilities = [
  {
    title: 'Convergent control system',
    sector: 'Industrial automation',
    description:
      'Model-based setpoint optimization across a multi-stage production line, replacing manual tuning with a closed-loop controller that converges on the globally optimal operating point.',
    metric: '+18%',
    metricLabel: 'line throughput',
    chart: 'bars',
    data: [42, 38, 46, 41, 52, 49, 58, 63, 67],
  },
  {
    title: 'Telemetry analytics platform',
    sector: 'Energy infrastructure',
    description:
      'Real-time anomaly detection across a 2,400-node grid. Statistical models separate signal from drift, surfacing failures before they cascade.',
    metric: '−63%',
    metricLabel: 'unplanned downtime',
    chart: 'line',
    data: [88, 81, 76, 72, 61, 54, 47, 39, 33],
  },
  {
    title: 'Decision intelligence layer',
    sector: 'Manufacturing operations',
    description:
      'Scenario modelling that quantifies the downstream cost of every operational decision, giving leadership an evidence base for working-capital allocation.',
    metric: '€4.1M',
    metricLabel: 'exposure removed / quarter',
    chart: 'bars',
    data: [12, 18, 15, 24, 31, 28, 39, 44, 41],
  },
  {
    title: 'Special-purpose machine platform',
    sector: 'Mechanical engineering',
    description:
      'A custom production machine designed from first principles - mechanical, mechatronic and control engineering in one loop, validated against real production conditions before hand-off.',
    metric: '−38%',
    metricLabel: 'cycle time per part',
    chart: 'bars',
    data: [62, 58, 54, 49, 47, 43, 41, 39, 38],
  },
]