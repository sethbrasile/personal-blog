import { beforeAll, expect, test } from 'vitest';
import { ensureBuilt, exists, read } from './build';

beforeAll(() => ensureBuilt());

test('rss lives at /index.xml and contains posts and videos newest first', () => {
  const xml = read('dist/index.xml');
  expect(xml).toContain('<link>https://bytemycache.com/posts/some-great-mac-apps-to-check-out/</link>');
  expect(xml).toContain(
    '<link>https://bytemycache.com/videos/your-kids-can-use-magic-wands-to-control-your-home/</link>',
  );
  expect(xml).toContain('<language>en-us</language>');
  expect(xml).not.toContain('avoiding-escape-hell-in-powershell');
  const dates = [...xml.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map((m) => Date.parse(m[1]));
  expect(dates.length).toBeGreaterThan(2);
  expect(dates).toEqual([...dates].sort((a, b) => b - a));
});
test('every rss item carries a non-empty <description>', () => {
  const xml = read('dist/index.xml');
  expect(xml).not.toMatch(/<description>\s*<\/description>/);
  const items = xml.split('<item>').slice(1);
  expect(items.length).toBeGreaterThan(0);
  for (const i of items) expect(i, i.slice(0, 120)).toMatch(/<description>\S/);
});
test('tag pages merge categories and use hugo slugs', () => {
  expect(exists('dist/tags/cloudflare-r2/index.html')).toBe(true);
  expect(exists('dist/tags/web-services/index.html')).toBe(true);
  expect(exists('dist/tags/diy/index.html')).toBe(true);
  expect(read('dist/tags/index.html')).toContain('/tags/powershell/');
});
test('redirects file carries every rule from the spec', () => {
  const r = read('dist/_redirects').replace(/[ \t]+/g, ' ');
  for (const rule of [
    '/cv/* https://sethbrasile.com/ 301',
    '/hire/ https://sethbrasile.com/ 301',
    '/search/ /posts/ 301',
    '/authors/* /about/ 301',
    '/categories/* /tags/:splat 301',
    '/coming-soon/ / 301',
    '/my-candida-treatment-plan/ / 301',
  ])
    expect(r).toContain(rule);
});
test('headers allow exactly the external origins the site loads', () => {
  const h = read('dist/_headers');
  expect(h).toContain("default-src 'self'");
  for (const o of [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://i.ytimg.com',
    'https://www.youtube-nocookie.com',
    'https://challenges.cloudflare.com',
  ])
    expect(h).toContain(o);
  expect(h).not.toContain('tenorcreative');
  expect(h).toContain('X-Frame-Options: DENY');
  expect(h).not.toContain('cloudflareinsights');
});
test('robots.txt points at the sitemap index', () => {
  expect(read('dist/robots.txt')).toContain('Sitemap: https://bytemycache.com/sitemap-index.xml');
  expect(exists('dist/sitemap-index.xml')).toBe(true);
});
