import { expect, test } from 'vitest';
import { filter } from './sitemap.mjs';

test('sitemap filter drops the 404 page', () => {
  expect(filter('https://bytemycache.com/404/')).toBe(false);
  expect(filter('https://bytemycache.com/posts/email-is-stupid/')).toBe(true);
});
