import { readFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';
import { afterEach, expect, test, vi } from 'vitest';
import { isAllowedOrigin, onRequestPost, validateContact, type Env } from './contact';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const baseEnv: Env = {
  TURNSTILE_SECRET_KEY: 'ts-secret',
  CRM_CLIENT_SECRET: 'client-secret',
  CRM_ACCOUNT_KEY: 'acct',
  CRM_INGEST_URL: 'https://crm.example/api/leads/ingest',
  RESEND_API_KEY: 'rk',
  RESEND_FROM: 'a <a@b.co>',
  LEAD_FALLBACK_TO: 'to@b.co',
};
const good = { name: 'Ada', email: 'ada@example.com', message: 'Hello', 'cf-turnstile-response': 'tok' };

function req(body: unknown, origin: string | null = 'https://bytemycache.com'): Request {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (origin) headers.Origin = origin;
  return new Request('https://bytemycache.com/api/contact', { method: 'POST', headers, body: JSON.stringify(body) });
}

function run(r: Request, env: Env) {
  const waits: Promise<unknown>[] = [];
  const p = onRequestPost({ request: r, env, waitUntil: (x) => waits.push(x) });
  return { p, settle: () => Promise.all(waits) };
}

type Call = { url: string; init: RequestInit };
function stubFetch(handlers: { crm?: () => Response }) {
  const calls: Call[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      if (url.includes('siteverify')) return Response.json({ success: true });
      if (url.includes('crm.example')) return handlers.crm ? handlers.crm() : new Response('ok');
      if (url.includes('resend.com')) return new Response('{}');
      throw new Error('unexpected fetch ' + url);
    }),
  );
  return calls;
}

test('allowed origins are exact; preview host check is on the parsed hostname', () => {
  for (const o of [
    'https://bytemycache.com',
    'https://www.bytemycache.com',
    'https://personal-blog-4u8.pages.dev',
    'https://abc123.personal-blog-4u8.pages.dev',
  ])
    expect(isAllowedOrigin(o), o).toBe(true);
  for (const o of [
    null,
    'http://bytemycache.com',
    'https://evil-personal-blog-4u8.pages.dev',
    'https://personal-blog-4u8.pages.dev.evil.com',
    'https://bytemycache.com.evil.com',
    'https://evil.com/https://personal-blog-4u8.pages.dev',
    'https://user@personal-blog-4u8.pages.dev.evil.com',
    'not a url',
  ])
    expect(isAllowedOrigin(o), String(o)).toBe(false);
});

test('bad origin is rejected before anything else happens', async () => {
  const calls = stubFetch({});
  const res = await run(req(good, 'https://evil-personal-blog-4u8.pages.dev'), baseEnv).p;
  expect(res.status).toBe(403);
  expect(calls).toHaveLength(0);
});

test('missing Turnstile token is rejected without calling siteverify', async () => {
  const calls = stubFetch({});
  const { 'cf-turnstile-response': _t, ...noToken } = good;
  const res = await run(req(noToken), baseEnv).p;
  expect(res.status).toBe(400);
  expect(calls).toHaveLength(0);
});

test('invalid body is rejected', async () => {
  stubFetch({});
  expect((await run(req({ ...good, email: 'nope' }), baseEnv).p).status).toBe(400);
  expect((await run(req({ ...good, message: '' }), baseEnv).p).status).toBe(400);
  expect((await run(req({ ...good, name: 'x'.repeat(201) }), baseEnv).p).status).toBe(400);
  const bad = new Request('https://bytemycache.com/api/contact', {
    method: 'POST',
    headers: { Origin: 'https://bytemycache.com', 'content-type': 'application/json' },
    body: '{',
  });
  expect((await run(bad, baseEnv).p).status).toBe(400);
  expect('error' in validateContact(null)).toBe(true);
});

test('failed Turnstile verification is rejected', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ success: false })),
  );
  expect((await run(req(good), baseEnv).p).status).toBe(400);
});

test('valid payload gives a CRM request signed HMAC-SHA256 over `${ts}.${body}`', async () => {
  const calls = stubFetch({});
  const res = await run(req(good), baseEnv).p;
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ success: true });
  const crm = calls.find((c) => c.url === baseEnv.CRM_INGEST_URL)!;
  const h = crm.init.headers as Record<string, string>;
  const body = crm.init.body as string;
  expect(h['x-account-key']).toBe('acct');
  expect(h['x-signature']).toBe(
    createHmac('sha256', 'client-secret').update(`${h['x-timestamp']}.${body}`).digest('hex'),
  );
  expect(JSON.parse(body)).toMatchObject({
    contact: { name: 'Ada', email: 'ada@example.com', source: 'bytemycache.com contact form' },
    message: 'Hello',
  });
  expect(calls.some((c) => c.url.includes('resend.com'))).toBe(false);
});

test('CRM non-2xx triggers the Resend fallback and still answers optimistically', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const calls = stubFetch({ crm: () => new Response('boom', { status: 503 }) });
  const r = run(req(good), baseEnv);
  const res = await r.p;
  expect(await res.json()).toEqual({ success: true, pending: true });
  await r.settle();
  const resend = calls.find((c) => c.url.includes('resend.com'))!;
  expect(resend).toBeTruthy();
  expect(JSON.parse(resend.init.body as string).to).toBe('to@b.co');
});

test('empty CRM_ACCOUNT_KEY goes straight to the Resend fallback', async () => {
  const calls = stubFetch({});
  const r = run(req(good), { ...baseEnv, CRM_ACCOUNT_KEY: '' });
  const res = await r.p;
  expect(await res.json()).toEqual({ success: true, pending: true });
  await r.settle();
  expect(calls.some((c) => c.url.includes('crm.example'))).toBe(false);
  expect(calls.some((c) => c.url.includes('resend.com'))).toBe(true);
});

test('wrangler.toml is Pages-only and holds no secrets', () => {
  const toml = readFileSync('wrangler.toml', 'utf8');
  expect(toml).not.toMatch(/^\s*main\s*=/m);
  for (const s of ['CRM_CLIENT_SECRET', 'RESEND_API_KEY', 'TURNSTILE_SECRET_KEY'])
    expect(
      toml
        .split('\n')
        .filter((l) => !l.trim().startsWith('#'))
        .join('\n'),
    ).not.toContain(s);
  expect(toml).toMatch(/^pages_build_output_dir\s*=/m);
});
