import { sendToCrm, type CrmLeadPayload } from './_lib/crm';
import { sendFallbackEmail } from './_lib/resend-fallback';

/**
 * POST /api/contact: Turnstile-checked contact form into the PPMC CRM, with a
 * direct-Resend fallback. Port of the crm-contact-worker skill template
 * (fields: name, email, message; request validation done by hand, no zod).
 */

const MAX_BODY_BYTES = 16 * 1024;
const SOURCE_LABEL = 'bytemycache.com contact form';
const PREVIEW_HOST = 'personal-blog-4u8.pages.dev';
const ALLOWED_ORIGINS = ['https://bytemycache.com', 'https://www.bytemycache.com'];

/** Exact-origin allow-list plus the Pages preview host and its subdomains, judged on a parsed URL. */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.origin !== origin) return false;
  return url.hostname === PREVIEW_HOST || url.hostname.endsWith(`.${PREVIEW_HOST}`);
}

export interface Env {
  // Secrets (wrangler pages secret put)
  TURNSTILE_SECRET_KEY?: string;
  CRM_CLIENT_SECRET?: string;
  RESEND_API_KEY?: string;
  // Plain vars (wrangler.toml [vars])
  CRM_INGEST_URL?: string;
  CRM_ACCOUNT_KEY?: string;
  RESEND_FROM?: string;
  LEAD_FALLBACK_TO?: string;
  // Set "1" temporarily to force a CRM failure and exercise the fallback
  TEST_FORCE_CRM_FAILURE?: string;
}

interface ContactData {
  name: string;
  email: string;
  message: string;
  token: string;
}

const CLIENT_TIMEOUT_MS = 8_000;
const BACKGROUND_SAFETY_MS = 25_000;

/** Returns the cleaned data, or an error message for the first failing field. */
export function validateContact(body: unknown): { data: ContactData } | { error: string } {
  if (typeof body !== 'object' || body === null) return { error: 'Invalid request body' };
  const b = body as Record<string, unknown>;
  const str = (k: string) => (typeof b[k] === 'string' ? (b[k] as string).trim() : '');
  const name = str('name');
  const email = str('email');
  const message = str('message');
  const token = str('cf-turnstile-response');
  if (!name || name.length > 200) return { error: 'Name is required' };
  if (!email || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: 'Invalid email address' };
  if (!message || message.length > 2000) return { error: 'Message is required' };
  if (!token) return { error: 'Bot verification failed' };
  return { data: { name, email, message, token } };
}

async function deliverToCrm(env: Env, payload: CrmLeadPayload): Promise<void> {
  if (env.TEST_FORCE_CRM_FAILURE === '1') throw new Error('TEST_FORCE_CRM_FAILURE=1 - exercising fallback path');
  await sendToCrm(env, payload);
}

// sendFallbackEmail throws; this wrapper never does, so an un-awaited waitUntil
// chain cannot reject silently. The console.error is the documented last resort.
async function deliverFallback(env: Env, data: ContactData, errorMsg: string, errorType: string): Promise<void> {
  const lead: Record<string, unknown> = { name: data.name, email: data.email, message: data.message };
  try {
    await sendFallbackEmail(env, lead, errorMsg, errorType);
  } catch (err) {
    console.error('[Fallback] failed:', err instanceof Error ? err.message : String(err));
  }
}

async function withOptimisticResponse(
  ctx: { waitUntil: (p: Promise<unknown>) => void },
  env: Env,
  data: ContactData,
  crmWork: () => Promise<void>,
): Promise<Response> {
  let responded = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const respond = (body: object, status = 200): Response => {
    responded = true;
    return Response.json(body, { status });
  };

  const crmPromise = crmWork()
    .then(() => (responded ? null : respond({ success: true })))
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[CRM] Fast failure:', msg);
      ctx.waitUntil(deliverFallback(env, data, msg, 'crm-failure'));
      return responded ? null : respond({ success: true, pending: true });
    });

  const timeoutPromise = new Promise<Response>((resolve) => {
    timer = setTimeout(() => {
      if (responded) return;
      console.warn('[CRM] Client timeout, responding optimistically');
      const optimistic = respond({ success: true, pending: true });
      ctx.waitUntil(
        Promise.race([
          crmPromise,
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('Background safety timeout')), BACKGROUND_SAFETY_MS),
          ),
        ]).catch((err: unknown) =>
          deliverFallback(env, data, err instanceof Error ? err.message : String(err), 'timeout'),
        ),
      );
      resolve(optimistic);
    }, CLIENT_TIMEOUT_MS);
  });

  const result = await Promise.race([crmPromise, timeoutPromise]);
  clearTimeout(timer);
  return result ?? respond({ success: true, pending: true });
}

interface PagesContext {
  request: Request;
  env: Env;
  waitUntil: (promise: Promise<unknown>) => void;
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env, waitUntil } = context;

  if (!isAllowedOrigin(request.headers.get('Origin'))) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    console.error('TURNSTILE_SECRET_KEY not configured');
    return Response.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // An empty or missing CRM_ACCOUNT_KEY / CRM_CLIENT_SECRET means "no CRM": go straight to Resend.
  const hasCrm = !!(env.CRM_CLIENT_SECRET && env.CRM_ACCOUNT_KEY && env.CRM_INGEST_URL);
  const hasResend = !!(env.RESEND_API_KEY && env.RESEND_FROM && env.LEAD_FALLBACK_TO);
  if (!hasCrm && !hasResend) {
    console.error('Neither CRM nor Resend configured');
    return Response.json({ error: 'Server configuration error. Please email seth@bytemycache.com.' }, { status: 500 });
  }

  // Refuse oversized bodies before parsing; the three fields are capped far below this.
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return Response.json({ error: 'Request too large' }, { status: 413 });
  }

  // The client posts FormData; JSON is accepted too.
  let raw: unknown;
  try {
    const type = request.headers.get('content-type') ?? '';
    raw = type.includes('application/json') ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = validateContact(raw);
  if ('error' in parsed) return Response.json({ error: parsed.error }, { status: 400 });
  const data = parsed.data;

  let turnstileResult: { success?: boolean } = { success: false };
  try {
    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: data.token,
        remoteip: request.headers.get('CF-Connecting-IP') || '',
      }),
    });
    turnstileResult = (await turnstileRes.json().catch(() => ({ success: false }))) as { success?: boolean };
  } catch (err) {
    console.error('Turnstile siteverify unreachable', err);
  }
  if (!turnstileResult.success) {
    return Response.json({ error: 'Bot verification failed. Please try again.' }, { status: 400 });
  }

  const payload: CrmLeadPayload = {
    contact: { name: data.name, email: data.email, source: SOURCE_LABEL },
    title: `Contact form: ${data.name}`.slice(0, 200),
    message: data.message,
  };

  if (!hasCrm) {
    waitUntil(
      deliverFallback(
        env,
        data,
        'CRM not configured (CRM_INGEST_URL/CRM_ACCOUNT_KEY/CRM_CLIENT_SECRET missing)',
        'server-error',
      ),
    );
    return Response.json({ success: true, pending: true });
  }

  return withOptimisticResponse({ waitUntil }, env, data, () => deliverToCrm(env, payload));
}
