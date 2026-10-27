import { expect, test } from 'vitest';
import { filter } from './sitemap.mjs';

test('sitemap filter drops the 404 page', () => {
  expect(filter('https://bytemycache.com/404/')).toBe(false);
  expect(filter('https://bytemycache.com/posts/email-is-stupid/')).toBe(true);
});

test('sitemap filter drops tag pages, which are noindex', () => {
  expect(filter('https://bytemycache.com/tags/')).toBe(false);
  expect(filter('https://bytemycache.com/tags/homelab/')).toBe(false);
});
