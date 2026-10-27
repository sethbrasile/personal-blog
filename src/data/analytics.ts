// PostHog project token for byteMyCache. It is a PUBLIC client-side token (not a
// secret), committed on purpose, like a GA4 measurement ID. Leave empty to
// ship the site with no PostHog snippet at all.
export const POSTHOG_KEY: string = 'phc_qUz9WCfE29ToXE5yhWP5v6ZVwCCPacLWEL5CDXsJyMup';

// Only capture on the real production host: previews (*.pages.dev) and local
// dev stay out of the numbers.
export const POSTHOG_PROD_HOST = 'bytemycache.com';

// Same-origin proxy served by functions/ingest/[[path]].ts. Keeping this
// first-party means ad-blockers don't drop it and CSP stays connect-src 'self'.
export const POSTHOG_API_PATH = '/ingest';
