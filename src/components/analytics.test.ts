import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { POSTHOG_KEY, POSTHOG_PROD_HOST, POSTHOG_API_PATH } from '@/data/analytics';
import { read } from '../../tests/build';

const home = () => read('dist/index.html');

test.skipIf(POSTHOG_KEY !== '')('with an empty key the built homepage carries no PostHog code', () => {
  expect(home().toLowerCase()).not.toContain('posthog');
});

test.skipIf(POSTHOG_KEY === '')(
  'with a key the snippet is present, host-gated, and uses the same-origin ingest',
  () => {
    const html = home();
    expect(html.toLowerCase()).toContain('posthog');
    expect(html).toContain(POSTHOG_KEY);
    expect(html).toContain(JSON.stringify(POSTHOG_PROD_HOST));
    expect(html).toContain('location.hostname !== POSTHOG_PROD_HOST');
    expect(html).toContain(JSON.stringify(POSTHOG_API_PATH));
    expect(html).toContain('api_host: location.origin + POSTHOG_API_PATH');
  },
);

// The privacy and cookies pages say analytics stores nothing on the visitor's
// device. That is only true while PostHog runs cookieless, so pin it in source
// (this holds with or without a key).
test('PostHog is configured cookieless for every visitor', () => {
  const src = readFileSync('src/components/Analytics.astro', 'utf8');
  expect(src).toContain("cookieless_mode: 'always'");
  expect(src).toContain('disable_session_recording: true');
});
