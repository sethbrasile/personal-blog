/**
 * Same-origin PostHog reverse proxy (PPMC client-site standard).
 *
 * posthog-js is configured with api_host = `${origin}/ingest`, so BOTH event
 * capture and its lazily loaded extension bundles arrive here as /ingest/**.
 * This function re-splits them onto PostHog's two real hosts:
 *   /ingest/static/**  -> us-assets.i.posthog.com  (array.js + extension bundles)
 *   everything else    -> us.i.posthog.com         (capture, /flags, /e, ...)
 *
 * Why a proxy at all: ad-blockers drop requests to *.posthog.com wholesale
 * (PostHog's own estimate: +10-30% capture behind a proxy), and it keeps CSP
 * at `connect-src 'self'`.
 *
 * Headers: cookies are never forwarded (PostHog doesn't need them; keeps the
 * proxy from leaking anything first-party). CF-Connecting-IP IS forwarded as
 * X-Forwarded-For — this is a local business, city-level geo on the dashboard
 * is the point, so PostHog must see the visitor's IP, not the edge's.
 */
const API_HOST = 'https://us.i.posthog.com';
const ASSETS_HOST = 'https://us-assets.i.posthog.com';

const DROP = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade', 'host', 'cookie',
  'cf-connecting-ip', 'cf-ray', 'cf-visitor', 'cf-ipcountry', 'x-forwarded-for',
  'x-forwarded-proto', 'x-real-ip',
]);

/**
 * Map the incoming /ingest/** URL onto its PostHog upstream, or return null
 * for a path this proxy must not relay.
 *
 * The visitor-controlled path is NEVER passed as the first argument of
 * `new URL(relative, base)`: a path beginning `//` (or `\\`, which the URL
 * parser normalises to `/`) is a protocol-relative reference there and
 * replaces the base wholesale — `/ingest//evil.example.com/x` would have
 * forwarded the request, headers and body to evil.example.com (deep review
 * 2026-09-02, C1). Instead the upstream is built from the fixed host and the
 * path/search are assigned through setters, which cannot change the origin;
 * the origin is then asserted anyway, so any future edit that reintroduces
 * the concatenation fails closed rather than open.
 */
export function resolveUpstream(requestUrl: string): URL | null {
  const url = new URL(requestUrl);
  const path = url.pathname.replace(/^\/ingest/, '') || '/';
  // A doubled separator is never a real PostHog path, and it is the one shape
  // that can escape a base URL. Reject rather than normalise.
  if (/^[/\\]{2}/.test(path) || path.includes('//') || path.includes('\\')) return null;
  const host = path.startsWith('/static/') ? ASSETS_HOST : API_HOST;
  const upstream = new URL(host);
  upstream.pathname = path;
  upstream.search = url.search;
  if (upstream.origin !== host) return null;
  return upstream;
}

// Self-typed (no @cloudflare/workers-types dependency) so `astro check` stays clean.
export const onRequest = async ({ request }: { request: Request }): Promise<Response> => {
  const upstream = resolveUpstream(request.url);
  if (!upstream) return new Response('Bad Request', { status: 400 });

  const headers = new Headers();
  request.headers.forEach((value: string, key: string) => {
    if (!DROP.has(key.toLowerCase())) headers.set(key, value);
  });
  const ip = request.headers.get('cf-connecting-ip');
  if (ip) headers.set('X-Forwarded-For', ip);

  const init: RequestInit = { method: request.method, headers, redirect: 'follow' };
  if (request.method !== 'GET' && request.method !== 'HEAD') init.body = request.body;

  const res = await fetch(upstream.toString(), init);
  const out = new Headers(res.headers);
  out.delete('set-cookie');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out });
};
