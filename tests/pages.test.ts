import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';
import { ensureBuilt, exists, read } from './build';

beforeAll(() => ensureBuilt());

const part = (n: number) =>
  `dist/posts/protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-${n}/index.html`;

describe('pages', () => {
  test('post without description has no empty meta description', () => {
    const html = read('dist/posts/email-is-stupid/index.html');
    expect(html).not.toMatch(/<meta name="description" content="">/);
    expect(html).not.toMatch(/<meta name="description"/);
  });
  test('page bundle images are optimised and served', () => {
    const html = read(part(3));
    expect(html).toMatch(/<img[^>]+src="\/_astro\/wan-rule\.[A-Za-z0-9_-]+\.(png|webp)"/);
  });
  test('home lists newest post first and links the store', () => {
    const html = read('dist/index.html');
    const at = (slug: string) => html.indexOf(`/posts/${slug}/`);
    expect(at('why-laravel-image-handling-still-sucks-and-how-to-fix-it')).toBeGreaterThan(-1);
    expect(at('why-laravel-image-handling-still-sucks-and-how-to-fix-it')).toBeLessThan(
      at('some-great-mac-apps-to-check-out'),
    );
    expect(at('some-great-mac-apps-to-check-out')).toBeLessThan(
      at('microsoft-copilot-365-copilot-copilot-plus-recall'),
    );
    expect(html).not.toContain('/posts/perplexity-solves-one-of-mankinds-worst-problems/');
    expect(html).toContain('href="https://store.bytemycache.com"');
  });
  test('404 page exists and is noindex', () => {
    const html = read('dist/404.html');
    expect(html).toContain('noindex');
    expect(html).toContain('Page not found');
    expect(html).toMatch(
      /Try the <a [^>]*href="\/videos\/"[^>]*>videos<\/a> or <a [^>]*href="\/posts\/"[^>]*>posts<\/a>\./,
    );
  });
  test('design tokens and fonts are in place, light is default', () => {
    const html = read('dist/index.html');
    expect(html).toMatch(/fonts\.googleapis\.com\/css2\?family=Bricolage\+Grotesque/);
    expect(html).toContain('DIY Electronics · Smart Home · Homelab · DevOps · Web');
    expect(html).toContain('Kits, cases and sensors from the videos');
    expect(html).toContain('Visit the store');
    expect(html).not.toMatch(/<html[^>]*data-theme="dark"/);
  });
  test('home hero links to YouTube and the show notes', () => {
    const html = read('dist/index.html');
    expect(html).toContain('https://www.youtube.com/watch?v=6ElDx8rN_Po');
    expect(html).toContain('Watch on YouTube');
    expect(html).toContain('Show notes and parts');
    expect(html).toContain('href="https://store.bytemycache.com/products/esp8266-case-ir"');
    expect(html).not.toContain('[PRICE]');
  });
  test('home hero thumbnail opens the show notes, not YouTube', () => {
    const html = read('dist/index.html');
    expect(html).toMatch(
      /<a href="\/videos\/your-kids-can-use-magic-wands-to-control-your-home\/" aria-label="Watch on this site: Control Your Home with Magic/,
    );
  });
  test('home shows six latest posts', () => {
    const html = read('dist/index.html');
    expect(html.match(/<li class="border-b[^"]*"><a href="\/posts\//g)?.length).toBe(6);
  });
  test('coral surfaces use an ink focus ring and the theme toggle exposes state', () => {
    expect(read('dist/index.html').match(/class="on-accent /g)?.length).toBe(1);
    expect(read('dist/index.html')).toContain('aria-pressed="false"');
  });
  test('code comments are lifted from #6a737d to #9fb3bf', () => {
    // Shiki still emits #6A737D inline (colorReplacements is ignored by Satteri); CSS must override it.
    const post = read('dist/posts/understanding-googles-page-speed-guidelines/index.html');
    expect(post.toLowerCase()).toContain('#6a737d');
    const css = readdirSync(resolve(import.meta.dirname, '../dist/_astro'))
      .filter((f) => f.endsWith('.css'))
      .map((f) => read(`dist/_astro/${f}`))
      .join('\n')
      .toLowerCase();
    expect(css).toMatch(/\[style\*=\\?#6a737d i\][^}]*color:#9fb3bf!important/);
  });
  test('dates use one Chicago-zoned format', () => {
    expect(read('dist/index.html')).toMatch(/\b\w{3} \d{1,2}, \d{4}\b/);
    // 2024-05-22T02:38Z is still 21 May in Chicago.
    expect(read(part(1))).toContain('Post · May 21, 2024');
  });
  test('mdx page renders the booking component', () => {
    expect(read('dist/contact/index.html')).toContain('link.tenorcreative.com/widget/booking/');
  });
  test('html comments in markdown bodies never reach dist', () => {
    expect(read('dist/about/index.html')).not.toContain('strugglebuss');
    expect(read(part(2))).not.toContain('<!--');
  });
  test('post note renders above the body', () => {
    const html = read('dist/posts/email-is-stupid/index.html');
    expect(html).toContain('Note: This article was written on a muuuuch older blog');
  });
  test('fence languages differing only in case are highlighted', () => {
    const html = read('dist/posts/fixing-throw-in-powershell/index.html');
    expect(html).toContain('astro-code');
    expect(exists('dist/posts/index.html')).toBe(true);
  });
  test('the basH fence (mixed-case alias) is syntax highlighted', () => {
    const html = read(
      'dist/posts/how-to-run-multiple-dockerized-proxied-spdyd-and-pagespeedified-ghost-blogs-with-4-commands/index.html',
    );
    const block = html.split('<pre').find((b) => b.includes('data-language="basH"'));
    expect(block, 'expected the basH code block in the output').toBeDefined();
    expect(block).toContain('style="color:');
  });
  test('post page has kicker, toc aside and more posts', () => {
    const html = read('dist/posts/why-laravel-image-handling-still-sucks-and-how-to-fix-it/index.html');
    expect(html).toContain('Post · ');
    expect(html).toContain('On this page');
    expect(html).toContain('aria-labelledby="toc-heading"');
    expect(html).not.toContain('Table of contents');
    expect(html).toContain('More posts');
  });
  test('copy-gate strings: index headings, tag chips, tag pages, series labels, toggle', () => {
    expect(read('dist/posts/index.html')).toMatch(/<h1[^>]*>Posts<\/h1>/);
    expect(read('dist/videos/index.html')).toMatch(/<h1[^>]*>Videos<\/h1>/);
    const tags = read('dist/tags/index.html');
    expect(tags).toMatch(/<h1[^>]*>Tags<\/h1>/);
    expect(tags).toMatch(/IT<span class="sr-only">, <\/span><span[^>]*>1<\/span><span class="sr-only"> item<\/span>/);
    expect(tags).toMatch(
      /cloudflare<span class="sr-only">, <\/span><span[^>]*>4<\/span><span class="sr-only"> items<\/span>/,
    );
    const both = read('dist/tags/smart-home/index.html');
    expect(both).toContain('>Tag</p>');
    expect(both).toMatch(/<h2[^>]*>Posts<\/h2>/);
    expect(both).toMatch(/<h2[^>]*>Videos<\/h2>/);
    const one = read('dist/tags/cloudflare/index.html');
    expect(one).not.toMatch(/<h2[^>]*>(Posts|Videos)<\/h2>/);
    expect(read('dist/index.html')).toContain('aria-label="Dark mode"');
    expect(read('dist/index.html')).not.toContain('Switch between light and dark');
    for (const label of ['Main', 'Footer']) expect(read('dist/index.html')).toContain(`aria-label="${label}"`);
  });
  test('home: hero label pairs with Watch on YouTube (More videos section only renders with 2+ videos)', () => {
    const html = read('dist/index.html');
    expect(html).toContain('Watch on YouTube<span class="sr-only">: ');
  });
  test('site description is the gated copy on home meta, og and RSS', () => {
    const d =
      'Videos and posts on DIY electronics, smart home, homelab, DevOps and web. The store sells kits, cases and sensors from the videos.';
    const html = read('dist/index.html');
    expect(html).toContain(`<meta name="description" content="${d}"`);
    expect(html).toContain(`property="og:description" content="${d}"`);
    expect(read('dist/index.xml')).toContain(`<description>${d}</description>`);
  });
  test('noindex pages and unlisted entries get robots meta', () => {
    expect(read('dist/404.html')).toContain('name="robots" content="noindex, nofollow"');
    expect(read('dist/404.html')).not.toContain('rel="canonical"');
    expect(read('dist/about/index.html')).toContain('rel="canonical"');
    expect(read('dist/about/index.html')).not.toContain('noindex');
  });
});

test('homepod post og:image is its processed cover, not the logo fallback', () => {
  const html = read('dist/posts/fix-a-homepod-mini-that-wont-turn-on/index.html');
  const m =
    html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/) ??
    html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/);
  expect(m, 'og:image meta').not.toBeNull();
  expect(m![1]).toMatch(/^https:\/\/bytemycache\.com\/_astro\/homepod\..+\.webp$/);
  expect(exists(`dist${new URL(m![1]).pathname}`)).toBe(true);
});
