#!/usr/bin/env node
// build-cv.mjs — sync the canonical structured CV source into Hugo content.
//
//   resume/cv.yaml  ──>  content/cv.md  (locked frontmatter + body)
//
// Idempotent: same input always produces byte-identical output.
// Source repo path overridable via RESUME_REPO (default: ../resume).
//
// NEVER hand-edit content/cv.md — edit resume/cv.yaml and re-run `npm run build:cv`.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const resumeRepo = process.env.RESUME_REPO
  ? path.resolve(process.env.RESUME_REPO)
  : path.resolve(repoRoot, '..', 'resume');

const SRC = path.join(resumeRepo, 'cv.yaml');
const OUT = path.join(repoRoot, 'content', 'cv.md');

if (!fs.existsSync(SRC)) {
  console.error(`✗ source not found: ${SRC}\n  set RESUME_REPO to the resume repo path.`);
  process.exit(1);
}

const cv = yaml.load(fs.readFileSync(SRC, 'utf8'));

// Hugo-specific scalars are constant and owned here, not in the source.
const frontmatter = {
  title: cv.meta.title,
  layout: 'cv',
  draft: false,
  comments: false,
  searchHidden: true,
  hideMeta: true,
  description: cv.meta.description,
  basics: cv.basics,
  intro: cv.intro,
  highlights: cv.highlights,
  roles: cv.roles,
  projects: cv.projects,
  writing: cv.writing,
  homelab: cv.homelab,
  skills: cv.skills,
  education: cv.education,
  certifications: cv.certifications,
};

const LOCK = `# ─────────────────────────────────────────────────────────────────────────────
# GENERATED FILE — DO NOT HAND-EDIT.
# Source of truth: resume/cv.yaml (run \`npm run build:cv\` from the blog repo).
# ─────────────────────────────────────────────────────────────────────────────`;

const fmYaml = yaml.dump(frontmatter, { lineWidth: 100, noRefs: true, quotingType: '"' });
const body = (cv.body || '').replace(/\n+$/, '') + '\n';

const out = `---\n${LOCK}\n${fmYaml}---\n\n${body}`;
fs.writeFileSync(OUT, out);
console.log(`✓ wrote ${path.relative(repoRoot, OUT)} (${out.length} bytes) from ${path.relative(repoRoot, SRC)}`);
