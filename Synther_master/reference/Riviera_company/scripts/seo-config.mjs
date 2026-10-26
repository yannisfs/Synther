// Single source of truth for per-route SEO metadata used by the prerender
// pipeline (scripts/prerender.mjs) and the sitemap generator
// (scripts/generate-sitemap.mjs).
//
// Adding a new route means:
//   1. Adding a row to ROUTES below
//   2. Adding `title.<key>` to both src/locales/de.json and src/locales/en.json
//   3. (Optional) Adding `seo.description.<key>` to both locale files
//   4. (Optional) Adding a JSON-LD builder keyed by `jsonLd`
//
// Keeping titles in the locale files means the prerendered <title> matches
// what the live React app shows — no drift.

import de from '../src/locales/de.json' with { type: 'json' };
import en from '../src/locales/en.json' with { type: 'json' };

// ---------------------------------------------------------------------------
// Site-level constants
// ---------------------------------------------------------------------------

export const SITE = {
  // The canonical origin. Cloudflare Pages publishes to a *.pages.dev URL by
  // default; override with DEPLOY_ORIGIN env var if you wire a custom domain.
  origin: process.env.DEPLOY_ORIGIN || 'https://riviera-engineering.pages.dev',
  brand: 'Riviera Engineering',
  ogImagePath: '/og/default.png',
  logoPath: '/og/logo.png',
  twitterHandle: '@riviera_eng',
  locale: 'de_DE',
  alternateLocale: 'en_US',
};

// ---------------------------------------------------------------------------
// Organization schema (placeholder data — see ⚠️ blocks below)
//
// ⚠️ PLACEHOLDER WARNING: address, HRB number, USt-ID, Wirtschafts-ID, and
// managing director name are still placeholders from src/pages/Impressum.jsx.
// They will be emitted into Google's Knowledge Graph candidates as-is.
// REPLACE BEFORE PUBLIC LAUNCH.
// ---------------------------------------------------------------------------

export const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE.origin}/#organization`,
  name: 'Riviera Engineering GmbH',
  legalName: 'Riviera Engineering GmbH',
  url: SITE.origin,
  logo: `${SITE.origin}${SITE.logoPath}`,
  email: 'hello@riviera-engineering.example',
  telephone: '+49-89-0000-0000',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Musterstraße 12',       // ⚠️ PLACEHOLDER
    postalCode: '80331',
    addressLocality: 'München',
    addressRegion: 'BY',
    addressCountry: 'DE',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'hello@riviera-engineering.example',
    availableLanguage: ['German', 'English'],
  },
  // ⚠️ PLACEHOLDER: real register number goes here
  identifier: 'HRB 000000',
  // ⚠️ PLACEHOLDER: real VAT ID goes here
  vatID: 'DE000000000',
};

// ---------------------------------------------------------------------------
// WebSite schema — only emitted on /
// ---------------------------------------------------------------------------

const WEBSITE = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.origin}/#website`,
  url: SITE.origin,
  name: 'Riviera Engineering',
  inLanguage: ['de-DE', 'en-US'],
  publisher: { '@id': ORGANIZATION['@id'] },
};

// ---------------------------------------------------------------------------
// Per-page JSON-LD builders
// ---------------------------------------------------------------------------

const webpage = (path, name) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE.origin}${path}#webpage`,
  url: `${SITE.origin}${path}`,
  name,
  inLanguage: 'de-DE',
  isPartOf: { '@id': `${SITE.origin}/#website` },
  about: { '@id': ORGANIZATION['@id'] },
});

const homeJsonLd = () => [
  WEBSITE,
  webpage('/', 'Riviera Engineering — Intelligent Engineering für die physische Welt'),
];

const capabilitiesJsonLd = () => [
  webpage('/capabilities', 'Capabilities'),
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Intelligent Product' },
      { '@type': 'ListItem', position: 2, name: 'Digital Engineering' },
      { '@type': 'ListItem', position: 3, name: 'Software Systems' },
      { '@type': 'ListItem', position: 4, name: 'Physical Product' },
    ],
  },
];

const automotiveJsonLd = () => [
  webpage('/automotive', 'Automotive Roadmap'),
];

const founderJsonLd = () => [
  webpage('/founder', 'Founder'),
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    // ⚠️ PLACEHOLDER: real founder name goes here
    name: 'Geschäftsführer/in',
    jobTitle: 'Geschäftsführer/in',
    worksFor: { '@id': ORGANIZATION['@id'] },
  },
];

const contactJsonLd = () => [
  webpage('/contact', 'Kontakt'),
  {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: `${SITE.origin}/contact`,
    inLanguage: 'de-DE',
    about: { '@id': ORGANIZATION['@id'] },
  },
];

const legalJsonLd = (path, name) => [
  webpage(path, name),
];

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

export const ROUTES = [
  {
    path: '/',
    outFile: 'index.html',
    titleKey: 'home',
    descriptionKey: 'home',
    jsonLd: homeJsonLd,
    noindex: false,
  },
  {
    path: '/capabilities',
    outFile: 'capabilities/index.html',
    titleKey: 'capabilities',
    descriptionKey: 'capabilities',
    jsonLd: capabilitiesJsonLd,
    noindex: false,
  },
  {
    path: '/automotive',
    outFile: 'automotive/index.html',
    titleKey: 'automotive',
    descriptionKey: 'automotive',
    jsonLd: automotiveJsonLd,
    noindex: false,
  },
  {
    path: '/founder',
    outFile: 'founder/index.html',
    titleKey: 'founder',
    descriptionKey: 'founder',
    jsonLd: founderJsonLd,
    noindex: false,
  },
  {
    path: '/contact',
    outFile: 'contact/index.html',
    titleKey: 'contact',
    descriptionKey: 'contact',
    jsonLd: contactJsonLd,
    noindex: false,
  },
  {
    path: '/admin',
    outFile: 'admin/index.html',
    titleKey: 'admin',
    descriptionKey: null,
    jsonLd: null,
    noindex: true,
  },
  {
    path: '/legal/impressum',
    outFile: 'legal/impressum/index.html',
    titleKey: 'impressum',
    descriptionKey: 'impressum',
    jsonLd: () => legalJsonLd('/legal/impressum', 'Impressum'),
    noindex: false,
  },
  {
    path: '/legal/datenschutz',
    outFile: 'legal/datenschutz/index.html',
    titleKey: 'datenschutz',
    descriptionKey: 'datenschutz',
    jsonLd: () => legalJsonLd('/legal/datenschutz', 'Datenschutzerklärung'),
    noindex: false,
  },
  {
    path: '/legal/agb',
    outFile: 'legal/agb/index.html',
    titleKey: 'agb',
    descriptionKey: 'agb',
    jsonLd: () => legalJsonLd('/legal/agb', 'Allgemeine Geschäftsbedingungen'),
    noindex: false,
  },
  {
    path: '/legal/ki-hinweis',
    outFile: 'legal/ki-hinweis/index.html',
    titleKey: 'aiDisclosure',
    descriptionKey: 'aiDisclosure',
    jsonLd: () => legalJsonLd('/legal/ki-hinweis', 'Hinweis zur Nutzung von KI'),
    noindex: false,
  },
  {
    path: '/legal/cookies',
    outFile: 'legal/cookies/index.html',
    titleKey: 'cookies',
    descriptionKey: 'cookies',
    jsonLd: () => legalJsonLd('/legal/cookies', 'Cookie-Richtlinie'),
    noindex: false,
  },
];

// ---------------------------------------------------------------------------
// Helpers shared by prerender.mjs and generate-sitemap.mjs
// ---------------------------------------------------------------------------

const titleFor = (route, lang) => {
  const t = lang === 'en' ? en : de;
  const suffix = lang === 'en' ? ' — Riviera Engineering' : ' — Riviera Engineering';
  const base = t.title[route.titleKey] || SITE.brand;
  return base === SITE.brand ? SITE.brand : `${base}${suffix}`;
};

const descriptionFor = (route, lang) => {
  if (!route.descriptionKey) return '';
  const t = lang === 'en' ? en : de;
  return t.seo.description[route.descriptionKey] || '';
};

export function buildRouteMeta(route) {
  // DE is the canonical/prerendered language. EN is documented but content-only.
  const titleDe = titleFor(route, 'de');
  const descriptionDe = descriptionFor(route, 'de');
  const titleEn = titleFor(route, 'en');
  const descriptionEn = descriptionFor(route, 'en');
  const canonical = `${SITE.origin}${route.path === '/' ? '/' : route.path}`;
  const ogImage = `${SITE.origin}${SITE.ogImagePath}`;

  // Always emit Organization. Per-page schemas concatenated on top.
  const jsonLd = [
    ORGANIZATION,
    ...(route.jsonLd ? route.jsonLd() : []),
  ];

  return {
    path: route.path,
    outFile: route.outFile,
    noindex: route.noindex,
    canonical,
    titleDe,
    descriptionDe,
    titleEn,
    descriptionEn,
    ogType: 'website',
    ogImage,
    brand: SITE.brand,
    locale: SITE.locale,
    alternateLocale: SITE.alternateLocale,
    jsonLd,
  };
}

export const INDEXABLE_ROUTES = ROUTES.filter((r) => !r.noindex);
