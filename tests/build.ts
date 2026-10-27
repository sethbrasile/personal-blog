import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

/** The single `astro build` per run happens in tests/global-setup.ts; this only asserts its output. */
export function ensureBuilt(): void {
  if (!existsSync(resolve(root, 'dist/index.html'))) {
    throw new Error('dist/ is missing: tests/global-setup.ts should have run `astro build`');
  }
}
export const read = (path: string): string => readFileSync(resolve(root, path), 'utf8');
export const exists = (path: string): boolean => existsSync(resolve(root, path));
