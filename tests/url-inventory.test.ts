import { expect, test } from 'vitest';
import { exists, read } from './build';
import { matchRedirect } from './redirects';

const paths = (file: string) =>
  read(file)
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((u) => (u.startsWith('http') ? new URL(u).pathname : u));

const urls = paths('tests/fixtures/hugo-urls.txt');
const extra = paths('tests/fixtures/hugo-extra-urls.txt');
const rules = read('public/_redirects');

/** Built file for a site path: directories map to index.html, file paths map to themselves. */
const builtFile = (p: string) => `dist${p.endsWith('/') ? `${p}index.html` : p}`;

/** Follow redirects (a browser would) until a built page or a dead end. */
function resolves(path: string): { ok: boolean; trail: string[] } {
  const trail = [path];
  let cur = path;
  for (let hop = 0; hop < 4; hop++) {
    if (exists(builtFile(cur))) return { ok: true, trail };
    const target = matchRedirect(rules, cur);
    if (target === null) return { ok: false, trail };
    trail.push(target);
    if (!target.startsWith('/')) return { ok: true, trail }; // external site
    cur = target;
  }
  return { ok: false, trail };
}

test('fixtures are populated', () => {
  expect(urls.length).toBeGreaterThan(70);
  expect(extra.length).toBeGreaterThan(40);
});

test.each(urls)('%s is built or redirected to something built', (path) => {
  const r = resolves(path);
  expect(r.ok, r.trail.join(' -> ')).toBe(true);
});

test.each(extra)('(unlisted Hugo URL) %s is built or redirected to something built', (path) => {
  const r = resolves(path);
  expect(r.ok, r.trail.join(' -> ')).toBe(true);
});

const drafts = [
  'avoiding-escape-hell-in-powershell',
  'perplexity-solves-one-of-mankinds-worst-problems',
  'powershell-code-delivery',
  'the-hidden-goldmine-for-laid-off-developers-or-becoming-your-towns-webmaster-2.0',
  'protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-4',
];

test('drafts are not built', () => {
  for (const d of drafts) expect(exists(`dist/posts/${d}/index.html`), d).toBe(false);
});

test('drafts do not leak into tag pages, the feed or the sitemap', () => {
  const tagPages = urls.filter((u) => /^\/tags\/.+\/$/.test(u)).map((u) => `dist${u}index.html`).filter(exists);
  const files = ['dist/index.xml', 'dist/sitemap-0.xml', 'dist/tags/index.html', 'dist/posts/index.html', ...tagPages];
  for (const f of files) {
    const body = read(f);
    for (const d of drafts) expect(body.includes(d), `${d} in ${f}`).toBe(false);
  }
});

test('sitemap lists only real, indexable pages and no 404', () => {
  // intent: every <loc> must be a listed route that is actually built (not noindex, not the 404 page)
  const sitemaps = ['dist/sitemap-0.xml'];
  for (let i = 1; exists(`dist/sitemap-${i}.xml`); i++) sitemaps.push(`dist/sitemap-${i}.xml`);
  let n = 0;
  for (const f of sitemaps) {
    for (const m of read(f).matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const pathname = new URL(m[1]).pathname;
      n++;
      expect(m[1], 'sitemap loc').not.toContain('/404');
      const file = builtFile(pathname);
      expect(exists(file), `${m[1]} has no ${file}`).toBe(true);
      const html = read(file);
      expect(/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html), `${m[1]} is noindex`).toBe(false);
    }
  }
  expect(n).toBeGreaterThan(20);
});
