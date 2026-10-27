/**
 * PPMC CRM ingest delivery.
 *
 * Signs and delivers a lead to the PPMC CRM's `/api/leads/ingest` endpoint.
 * Wire contract (must match the CRM's server-side verification exactly):
 *   - body = JSON.stringify(payload) — the signed string IS the sent string.
 *   - ts = unix seconds at send time.
 *   - signature = lowercase hex HMAC-SHA256 over `${ts}.${body}`, keyed by
 *     CRM_CLIENT_SECRET (an already-derived per-client secret; used as raw
 *     key bytes — never the CRM's master secret).
 *   - Headers: x-account-key, x-timestamp, x-signature.
 *
 * Throws on missing config, non-2xx response, or network failure — the
 * caller (contact.ts / report-request.ts) is responsible for catching and
 * falling back to sendFallbackEmail. In particular, the CRM ingest endpoint
 * returns 503 only for a verified unrecovered request: no lead committed and
 * Cloudflare recovery failed. Only for that verified unrecovered 503 branch,
 * the existing !res.ok throw intentionally activates this fallback and cannot
 * duplicate a stored lead. Other non-2xx responses or network failures do not
 * establish whether a lead committed; captured and recovered requests return success.
 */

export interface CrmEnv {
  CRM_INGEST_URL?: string;
  CRM_ACCOUNT_KEY?: string;
  CRM_CLIENT_SECRET?: string;
}

export interface CrmLeadPayload {
  contact: { name: string; email?: string; phone?: string; source?: string };
  title: string;
  message?: string;
}

async function signCrmBody(secret: string, ts: number, body: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${ts}.${body}`));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function sendToCrm(env: CrmEnv, payload: CrmLeadPayload): Promise<void> {
  if (!env.CRM_INGEST_URL || !env.CRM_ACCOUNT_KEY || !env.CRM_CLIENT_SECRET) {
    throw new Error('CRM ingest not configured — missing CRM_INGEST_URL, CRM_ACCOUNT_KEY, or CRM_CLIENT_SECRET');
  }

  const body = JSON.stringify(payload);
  const ts = Math.floor(Date.now() / 1000);
  const signature = await signCrmBody(env.CRM_CLIENT_SECRET, ts, body);

  const res = await fetch(env.CRM_INGEST_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-account-key': env.CRM_ACCOUNT_KEY,
      'x-timestamp': String(ts),
      'x-signature': signature,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`CRM ingest failed: ${res.status} ${text}`);
  }
}
