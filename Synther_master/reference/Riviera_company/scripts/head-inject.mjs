// Splices per-route <head> metadata into a captured HTML document.
//
// The captured HTML from Playwright may contain SEO meta from a previous
// prerender iteration (because vite preview serves dist/index.html, which
// is the home page's prerendered HTML after the home route has been
// processed). We strip ALL known SEO meta tags + the runtime-injected
// <title> before injecting our own per-route meta.
//
// We keep Vite's own <script> and <link rel="stylesheet"> tags.

import { escapeAttr, escapeJsonForScript } from './head-inject-helpers.mjs';

// Strip every existing SEO tag — anything that could be added by a
// previous prerender iteration or by the runtime HreflangTags/DocumentTitle
// useEffect hooks. We don't touch <script type="module"> or <link rel="stylesheet">.
function stripRuntimeHead(htmlString) {
  let out = htmlString;

  // Strip ALL <title> tags — we add our own.
  out = out.replace(/<title>[\s\S]*?<\/title>\s*/gi, '');

  // <link rel="alternate" hreflang="…"> (any number, anywhere)
  out = out.replace(/<link\s+[^>]*rel="alternate"[^>]*hreflang="[^"]*"[^>]*>\s*/gi, '');

  // <link rel="canonical">
  out = out.replace(/<link\s+[^>]*rel="canonical"[^>]*>\s*/gi, '');

  // <meta name="description">
  out = out.replace(/<meta\s+[^>]*name="description"[^>]*>\s*/gi, '');

  // <meta name="robots" / "googlebot">
  out = out.replace(/<meta\s+[^>]*name="robots"[^>]*>\s*/gi, '');
  out = out.replace(/<meta\s+[^>]*name="googlebot"[^>]*>\s*/gi, '');

  // Open Graph (property="og:…")
  out = out.replace(/<meta\s+[^>]*property="og:[^"]*"[^>]*>\s*/gi, '');

  // Twitter Card (name="twitter:…")
  out = out.replace(/<meta\s+[^>]*name="twitter:[^"]*"[^>]*>\s*/gi, '');

  // JSON-LD
  out = out.replace(/<script\s+[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/gi, '');

  return out;
}

function escapeText(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Build a single string of <head> children from the route metadata.
function buildHeadFragment(meta) {
  const tags = [];

  // <title>: DE is the canonical/prerendered content.
  tags.push(`<title>${escapeText(meta.titleDe)}</title>`);

  // <meta name="description">
  if (meta.descriptionDe) {
    tags.push(`<meta name="description" content="${escapeAttr(meta.descriptionDe)}">`);
  }

  // <link rel="canonical">
  tags.push(`<link rel="canonical" href="${escapeAttr(meta.canonical)}">`);

  // Three hreflang variants. Content-switched i18n: all point at the same URL.
  tags.push(`<link rel="alternate" hreflang="de" href="${escapeAttr(meta.canonical)}">`);
  tags.push(`<link rel="alternate" hreflang="en" href="${escapeAttr(meta.canonical)}">`);
  tags.push(`<link rel="alternate" hreflang="x-default" href="${escapeAttr(meta.canonical)}">`);

  // Open Graph
  tags.push(`<meta property="og:title" content="${escapeAttr(meta.titleDe)}">`);
  if (meta.descriptionDe) {
    tags.push(`<meta property="og:description" content="${escapeAttr(meta.descriptionDe)}">`);
  }
  tags.push(`<meta property="og:url" content="${escapeAttr(meta.canonical)}">`);
  tags.push(`<meta property="og:type" content="${escapeAttr(meta.ogType)}">`);
  tags.push(`<meta property="og:locale" content="${escapeAttr(meta.locale)}">`);
  tags.push(`<meta property="og:locale:alternate" content="${escapeAttr(meta.alternateLocale)}">`);
  tags.push(`<meta property="og:site_name" content="${escapeAttr(meta.brand)}">`);
  tags.push(`<meta property="og:image" content="${escapeAttr(meta.ogImage)}">`);

  // Twitter Card
  tags.push(`<meta name="twitter:card" content="summary_large_image">`);
  tags.push(`<meta name="twitter:title" content="${escapeAttr(meta.titleDe)}">`);
  if (meta.descriptionDe) {
    tags.push(`<meta name="twitter:description" content="${escapeAttr(meta.descriptionDe)}">`);
  }
  tags.push(`<meta name="twitter:image" content="${escapeAttr(meta.ogImage)}">`);

  // Robots — override for noindex routes
  const robotsContent = meta.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  tags.push(`<meta name="robots" content="${robotsContent}">`);
  tags.push(`<meta name="googlebot" content="${robotsContent}">`);

  // JSON-LD: one <script type="application/ld+json"> per top-level schema.
  for (const schema of meta.jsonLd) {
    tags.push(`<script type="application/ld+json">${escapeJsonForScript(schema)}</script>`);
  }

  return tags.join('\n    ');
}

// Splice a fragment of HTML into the <head> of an HTML document string.
// Strategy: strip ALL existing SEO meta first, then inject per-route meta
// right before </head>.
export function injectHeadIntoHtml(htmlString, meta) {
  const stripped = stripRuntimeHead(htmlString);
  const fragment = buildHeadFragment(meta);
  return stripped.replace(/<\/head>/i, `    ${fragment}\n  </head>`);
}

// Tag the document <html lang="de"> for crawlability consistency.
export function forceHtmlLang(htmlString, lang = 'de') {
  if (htmlString.match(/<html[^>]*\blang=/i)) {
    return htmlString.replace(/<html([^>]*)(\s)lang="[^"]*"/i, `<html$1$2lang="${lang}"`);
  }
  return htmlString.replace(/<html/i, `<html lang="${lang}"`);
}
