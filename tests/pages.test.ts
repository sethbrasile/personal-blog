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
    expect(at('why-laravel-image-handling-still-sucks-and-how-to-fix-it')).toBeLessThan(at('some-great-mac-apps-to-check-out'));
    expect(at('some-great-mac-apps-to-check-out')).toBeLessThan(at('microsoft-copilot-365-copilot-copilot-plus-recall'));
    expect(html).not.toContain('/posts/perplexity-solves-one-of-mankinds-worst-problems/');
    expect(html).toContain('href="https://store.bytemycache.com"');
  });
  test('404 page exists and is noindex', () => {
    const html = read('dist/404.html');
    expect(html).toContain('noindex');
    expect(html).toContain('Page not found');
    expect(html).toMatch(/Try the <a [^>]*href="\/videos\/"[^>]*>videos<\/a> or <a [^>]*href="\/posts\/"[^>]*>posts<\/a>\./);
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
    const html = read('dist/posts/how-to-run-multiple-dockerized-proxied-spdyd-and-pagespeedified-ghost-blogs-with-4-commands/index.html');
    const block = html.split('<pre').find((b) => b.includes('data-language="basH"'));
    expect(block, 'expected the basH code block in the output').toBeDefined();
    expect(block).toContain('style="color:');
  });
  test('post page has kicker, toc aside and more posts', () => {
    const html = read('dist/posts/why-laravel-image-handling-still-sucks-and-how-to-fix-it/index.html');
    expect(html).toContain('Post · ');
    expect(html).toContain('On this page');
    expect(html).toContain('More posts');
  });
  test('noindex pages and unlisted entries get robots meta', () => {
    expect(read('dist/404.html')).toContain('name="robots" content="noindex, nofollow"');
    expect(read('dist/404.html')).not.toContain('rel="canonical"');
    expect(read('dist/about/index.html')).toContain('rel="canonical"');
    expect(read('dist/about/index.html')).not.toContain('noindex');
  });
});
