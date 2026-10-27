/**
 * Direct-Resend last-resort fallback for CRM ingest failures.
 *
 * Used by /api/contact and /api/report-request when sendToCrm (crm.ts)
 * throws — attempts a direct-Resend email with the raw lead payload + error.
 * Mirrors griffin-restoration-inc's direct Resend call shape.
 */

export interface ResendFallbackEnv {
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  LEAD_FALLBACK_TO?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Strip CR/LF from any value interpolated into a header (subject line) to
// prevent header/response splitting.
function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, ' ');
}

// Human-readable body for the recovery email (if Resend accepts it, this is the
// recovery copy of the lead): one labeled row per field, visitor-typed newlines
// rendered as real line breaks (JSON.stringify showed them as literal \n),
// raw JSON kept below as the recovery backstop. Never throws.
function leadRecoveryHtml(lead: Record<string, unknown>): string {
  try {
    const rows = Object.entries(lead)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(
        ([k, v]) =>
          `<p style="margin:0 0 8px"><strong>${escapeHtml(k)}:</strong> ${escapeHtml(String(v)).replace(/\n/g, '<br>')}</p>`,
      )
      .join('');
    const raw = escapeHtml(JSON.stringify(lead, null, 2));
    return `${rows}<p style="margin:16px 0 4px;color:#666">Raw payload (recovery backstop):</p><pre style="font-size:12px;color:#666">${raw}</pre>`;
  } catch {
    return `<pre>${escapeHtml(String(lead))}</pre>`;
  }
}

export async function sendFallbackEmail(
  env: ResendFallbackEnv,
  lead: Record<string, unknown>,
  errorMsg: string,
  errorType: string,
): Promise<void> {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM || !env.LEAD_FALLBACK_TO) {
    throw new Error('Resend fallback not configured — missing RESEND_API_KEY, RESEND_FROM, or LEAD_FALLBACK_TO');
  }

  const rawName = typeof lead.name === 'string' && lead.name.length > 0 ? lead.name : 'unknown';
  const subject = sanitizeHeaderValue(`LEAD (CRM ${errorType}): ${rawName}`);

  const html = `${leadRecoveryHtml(lead)}<p style="margin:16px 0 4px;color:#666">Error:</p><pre style="font-size:12px">${escapeHtml(errorMsg)}</pre>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM,
      to: env.LEAD_FALLBACK_TO,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Resend fallback failed: ${res.status} ${text}`);
  }
}
