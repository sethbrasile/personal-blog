import { afterEach, expect, test, vi } from 'vitest';
import { onRequest, resolveUpstream } from './[[path]]';

afterEach(() => vi.unstubAllGlobals());

test('static goes to assets host, capture to api host', () => {
  expect(resolveUpstream('https://bytemycache.com/ingest/static/array.js')?.href).toBe('https://us-assets.i.posthog.com/static/array.js');
  expect(resolveUpstream('https://bytemycache.com/ingest/e/?ip=1')?.href).toBe('https://us.i.posthog.com/e/?ip=1');
});
test('doubled separators are rejected', () => {
  expect(resolveUpstream('https://bytemycache.com/ingest//evil.example.com/x')).toBeNull();
  expect(resolveUpstream('https://bytemycache.com/ingest/a//b')).toBeNull();
});
test('handler returns 400 for a doubled separator and never calls fetch', async () => {
  const fetchSpy = vi.fn(() => { throw new Error('fetch must not be called'); });
  vi.stubGlobal('fetch', fetchSpy);
  const res = await onRequest({ request: new Request('https://bytemycache.com/ingest//evil.example.com/x', { method: 'POST', body: '{}' }) });
  expect(res.status).toBe(400);
  expect(fetchSpy).not.toHaveBeenCalled();
});
