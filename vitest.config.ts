/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['src/**/*.test.ts', 'functions/**/*.test.ts', 'tests/**/*.test.ts'],
    passWithNoTests: true,
    globalSetup: ['tests/global-setup.ts'],
    testTimeout: 20_000,
  },
});
