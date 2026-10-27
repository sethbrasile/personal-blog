import { beforeAll, describe, expect, test } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { ensureBuilt, exists, read } from './build';
import LinkList from '@/components/LinkList.astro';
import VideoExtras from '@/components/VideoExtras.astro';
import VideoChapters from '@/components/VideoChapters.astro';
import YouTubeEmbed from '@/components/YouTubeEmbed.astro';

beforeAll(() => ensureBuilt());

const PAGE = 'dist/videos/your-kids-can-use-magic-wands-to-control-your-home/index.html';
const DISCLOSURE =
  "Note: the following are Amazon affiliate links. If you use these links to purchase, I get a small commission. It doesn't cost you anything extra, but it helps me out a lot. Thanks!";
const render = async (component: Parameters<AstroContainer['renderToString']>[0], props: Record<string, unknown>) =>
  (await AstroContainer.create()).renderToString(component, { props });

describe('video page', () => {
  test('embeds the main video and lists extras', () => {
    const html = read(PAGE);
    expect(html).toContain('i.ytimg.com/vi/6ElDx8rN_Po/');
    expect(html).toContain('Extras');
    expect(html).toContain('R90adjnIfpQ');
    expect(html).toContain('pUkgUDp6Cys');
  });
  test('store and affiliate blocks render with the disclosure once', () => {
    const html = read(PAGE);
    expect(html).toContain('store.bytemycache.com/en-usd/products/esp8266-wemos-d1-ir-case');
    expect(html.match(/Amazon affiliate links/g)?.length).toBe(1);
    expect(html).toContain('Products in my store');
    expect(html).toContain('Visit the store');
    expect(html).not.toContain('Products mentioned</h2>');
  });
  test('kicker, headline and tag chips', () => {
    const html = read(PAGE);
    expect(html).toContain('Video · Jul 7, 2024');
    expect(html).toContain('<h1');
    expect(html).toContain('href="/tags/smart-home/"');
  });
  test('no embed is loaded before a click', () => {
    const html = read(PAGE);
    expect(html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '')).not.toContain('<iframe');
    expect(html.match(/<button[^>]*data-yt-play/g)?.length).toBe(3);
  });
  test('video index lists the video; home links it', () => {
    expect(read('dist/videos/index.html')).toContain('/videos/your-kids-can-use-magic-wands-to-control-your-home/');
    expect(exists('dist/videos/index.html')).toBe(true);
  });
});

describe('components with nothing to show render nothing', () => {
  test('LinkList with no items', async () => {
    expect((await render(LinkList, { heading: 'Products mentioned', items: [], disclosure: 'x' })).trim()).toBe('');
  });
  test('LinkList renders heading, items and disclosure', async () => {
    const html = await render(LinkList, {
      heading: 'Products mentioned',
      items: [{ label: 'A thing', url: 'https://amzn.to/x' }],
      disclosure: DISCLOSURE,
    });
    expect(html).toContain('Products mentioned');
    expect(html).toContain('href="https://amzn.to/x"');
    expect(html.replaceAll('&#39;', "'")).toContain(DISCLOSURE);
  });
  test('LinkList store variant has the store button', async () => {
    const html = await render(LinkList, {
      heading: 'Products in my store',
      variant: 'store',
      items: [{ label: 'Case', url: 'https://store.bytemycache.com/p' }],
    });
    expect(html).toContain('Visit the store');
  });
  test('VideoExtras with none or empty', async () => {
    expect((await render(VideoExtras, { extras: undefined })).trim()).toBe('');
    expect((await render(VideoExtras, { extras: [] })).trim()).toBe('');
  });
  test('VideoChapters with none or empty', async () => {
    expect((await render(VideoChapters, { chapters: undefined })).trim()).toBe('');
    expect((await render(VideoChapters, { chapters: [] })).trim()).toBe('');
  });
  test('VideoChapters lists time and label', async () => {
    const html = await render(VideoChapters, { chapters: [{ time: '0:00', label: 'Intro' }] });
    expect(html).toContain('Chapters');
    expect(html).toContain('0:00');
    expect(html).toContain('Intro');
  });
});

describe('YouTubeEmbed', () => {
  test('is a keyboard-accessible button facade with a noscript iframe', async () => {
    const html = await render(YouTubeEmbed, { id: 'abc123', title: 'A video' });
    expect(html).toMatch(/<button[^>]*type="button"[^>]*data-yt-play/);
    expect(html).toContain('data-id="abc123"');
    expect(html).toContain('https://i.ytimg.com/vi/abc123/hqdefault.jpg');
    expect(html).toMatch(/<noscript>\s*<iframe[^>]*https:\/\/www\.youtube-nocookie\.com\/embed\/abc123/);
  });
  test('uses a supplied thumbnail', async () => {
    const html = await render(YouTubeEmbed, { id: 'abc123', title: 'A video', thumbnail: '/custom.jpg' });
    expect(html).toContain('src="/custom.jpg"');
    expect(html).not.toContain('i.ytimg.com/vi/abc123/');
  });
});

// Fourthwall product pages live under /<locale>/products/; the bare
// /products/<slug> form 404s. Guard every video's store links in source.
test('store product links use the /en-usd/products/ form', async () => {
  const { readdirSync, readFileSync } = await import('node:fs');
  const dir = 'src/content/videos';
  const links = readdirSync(dir).flatMap((f) =>
    [
      ...readFileSync(`${dir}/${f}`, 'utf8').matchAll(
        /https:\/\/store\.bytemycache\.com\/[^\s)"']*products\/[^\s)"']*/g,
      ),
    ].map((m) => m[0]),
  );
  expect(links.length).toBeGreaterThan(0);
  for (const l of links) expect(l).toMatch(/^https:\/\/store\.bytemycache\.com\/en-usd\/products\/[a-z0-9-]+$/);
});
