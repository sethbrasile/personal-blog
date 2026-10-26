/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['src/**/*.test.ts', 'functions/**/*.test.ts', 'tests/**/*.test.ts'],
    passWithNoTests: true,
  },
});
