import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

/** Runs exactly one `astro build` per `vitest run`, before any worker starts. */
export default function setup() {
  execSync('npx astro build', {
    cwd: resolve(import.meta.dirname, '..'),
    stdio: 'inherit',
    // Vitest sets NODE_ENV=test; the build must see production so drafts are excluded.
    env: { ...process.env, NODE_ENV: 'production' },
    timeout: 180_000,
  });
}
