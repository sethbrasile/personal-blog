import { expect, test } from 'vitest';
import { buildTagIndex, postPath, slugifyTag, tagPath, videoPath } from './content';

test('slugifyTag matches hugo urlize', () => {
  expect(slugifyTag('Cloudflare R2')).toBe('cloudflare-r2');
  expect(slugifyTag('DIY')).toBe('diy');
  expect(slugifyTag('old content rescued with the wayback machine')).toBe(
    'old-content-rescued-with-the-wayback-machine',
  );
  expect(slugifyTag('  IT ')).toBe('it');
});

test('postPath and videoPath use trailing slashes', () => {
  expect(postPath({ id: 'email-is-stupid' } as any)).toBe('/posts/email-is-stupid/');
  expect(videoPath({ id: 'x' } as any)).toBe('/videos/x/');
  expect(tagPath('diy')).toBe('/tags/diy/');
});

test('buildTagIndex merges spellings under one slug, first spelling wins', () => {
  const posts = [
    { id: 'a', data: { tags: ['DIY', 'IT'] } },
    { id: 'b', data: { tags: ['diy'] } },
    { id: 'c', data: { tags: [] } },
  ] as any;
  const videos = [{ id: 'v', data: { tags: ['Diy', 'Smart Home'] } }] as any;
  const idx = buildTagIndex(posts, videos);
  expect([...idx.keys()].sort()).toEqual(['diy', 'it', 'smart-home']);
  expect(idx.get('diy')!.name).toBe('DIY');
  expect(idx.get('diy')!.posts.map((p) => p.id)).toEqual(['a', 'b']);
  expect(idx.get('diy')!.videos.map((v) => v.id)).toEqual(['v']);
  expect(idx.get('smart-home')!.name).toBe('Smart Home');
});
