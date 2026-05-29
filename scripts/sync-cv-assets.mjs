#!/usr/bin/env node
// sync-cv-assets.mjs — copy the resume repo's finished artifacts into the site.
//
//   ../resume/output/{Seth-Brasile-Resume.pdf, resume.json}  ──>  static/cv/
//
// The resume repo PRODUCES these (npm run build there); Hugo only consumes them.
// Run `npm run build` in the resume repo first. RESUME_REPO overrides the path.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const resumeRepo = process.env.RESUME_REPO
  ? path.resolve(process.env.RESUME_REPO)
  : path.resolve(repoRoot, '..', 'resume');

const destDir = path.join(repoRoot, 'static', 'cv');
const ASSETS = ['Seth-Brasile-Resume.pdf', 'resume.json'];

fs.mkdirSync(destDir, { recursive: true });
let copied = 0;
for (const name of ASSETS) {
  const src = path.join(resumeRepo, 'output', name);
  if (!fs.existsSync(src)) {
    console.warn(`⚠ missing ${path.relative(repoRoot, src)} — run \`npm run build\` in the resume repo first.`);
    continue;
  }
  fs.copyFileSync(src, path.join(destDir, name));
  console.log(`✓ ${name} → static/cv/`);
  copied++;
}
if (copied === 0) process.exitCode = 1;
