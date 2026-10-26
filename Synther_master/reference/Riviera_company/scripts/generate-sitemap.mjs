// Generates dist/sitemap.xml and dist/robots.txt after the prerender step.
//
// Sitemap format: standard <urlset> with xhtml:link hreflang triples for
// every URL. Because the site is content-switched (DE/EN swap in place),
// each hreflang variant points at the same URL — but the explicit triples
// are still required so Google knows about the localization.
//
// robots.txt: Allow /, Disallow /admin (defense in depth — /admin is also
// noindex in the prerendered HTML), Sitemap directive.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { INDEXABLE_ROUTES, SITE, ROUTES } from './seo-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

const today = new Date().toISOString().slice(0, 10);

function urlEntry(path) {
  const url = `${SITE.origin}${path === '/' ? '/' : path}`;
  const lastmod = today;
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === '/' ? '1.0' : '0.7'}</priority>
    <xhtml:link rel="alternate" hreflang="de" href="${url}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${url}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${url}"/>
  </url>`;
}

function buildSitemap() {
  const items = INDEXABLE_ROUTES.map((r) => urlEntry(r.path)).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${items}
</urlset>
`;
}

function buildRobots() {
  return `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${SITE.origin}/sitemap.xml
`;
}

async function main() {
  await mkdir(DIST, { recursive: true });

  const sitemapPath = resolve(DIST, 'sitemap.xml');
  await writeFile(sitemapPath, buildSitemap(), 'utf8');
  console.log(`[sitemap] ✓ wrote ${sitemapPath}`);

  const robotsPath = resolve(DIST, 'robots.txt');
  await writeFile(robotsPath, buildRobots(), 'utf8');
  console.log(`[sitemap] ✓ wrote ${robotsPath}`);

  console.log(`[sitemap] ${INDEXABLE_ROUTES.length} URLs indexed, ${ROUTES.filter((r) => r.noindex).length} excluded`);
}

main().catch((err) => {
  console.error('[sitemap] FAILED:', err);
  process.exit(1);
});
