import { expect, test } from 'vitest';
import { POSTHOG_KEY } from '@/data/analytics';
import { read } from '../../tests/build';

test('with an empty key the built homepage carries no PostHog code', () => {
  expect(POSTHOG_KEY).toBe('');
  expect(read('dist/index.html').toLowerCase()).not.toContain('posthog');
});
