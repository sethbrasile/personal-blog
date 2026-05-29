#!/usr/bin/env node
// export-json-resume.mjs — emit JSON Resume v1.0.0 from the canonical CV source.
//
//   resume/cv.yaml  ──>  static/cv/resume.json   (https://jsonresume.org/schema/)
//
// Standard parsers, ATS systems, and LLM resume tools understand this natively.
// Deterministic (no timestamps) so repeated builds don't churn git.

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
const OUT = path.join(repoRoot, 'static', 'cv', 'resume.json');

const MONTHS = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
                 jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };

// "Oct 2025" -> "2025-10" · "2021" -> "2021" · "Present"/"" -> null
function isoDate(s) {
  if (!s) return null;
  const v = String(s).trim();
  if (/^present$/i.test(v)) return null;
  const m = v.match(/^([A-Za-z]{3})[a-z]*\s+(\d{4})$/);
  if (m) return `${m[2]}-${MONTHS[m[1].toLowerCase()]}`;
  const y = v.match(/^(\d{4})$/);
  if (y) return y[1];
  return null;
}

// "Durant, OK" -> { city, region }
function location(s) {
  if (!s) return undefined;
  const [city, region] = String(s).split(',').map((p) => p.trim());
  const loc = {};
  if (city) loc.city = city;
  if (region) loc.region = region;
  return loc;
}

function dropEmpty(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) =>
      v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)),
  );
}

const cv = yaml.load(fs.readFileSync(SRC, 'utf8'));

const resume = {
  $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
  basics: dropEmpty({
    name: cv.basics.name,
    label: cv.basics.label,
    email: cv.basics.email,
    url: cv.basics.url,
    summary: cv.intro?.full,
    location: location(cv.basics.location),
    profiles: (cv.basics.profiles || []).map((p) => ({ network: p.network, url: p.url })),
  }),

  work: (cv.roles || []).map((r) => dropEmpty({
    name: r.org,
    position: r.title,
    startDate: isoDate(r.start),
    endDate: isoDate(r.end),
    summary: r.summary,
    highlights: (r.bullets || []).map((b) => b.text),
  })),

  projects: [
    ...(cv.projects || []).map((p) => dropEmpty({
      name: p.name,
      description: p.blurb,
      url: p.url,
      keywords: p.stack || [],
    })),
    ...(cv.homelab ? [dropEmpty({
      name: 'Homelab',
      description: cv.homelab.blurb,
      highlights: cv.homelab.items || [],
    })] : []),
  ],

  skills: (cv.skills || []).map((g) => dropEmpty({
    name: g.group,
    keywords: (g.items || []).map((i) => i.name),
  })),

  education: (cv.education || []).map((e) => {
    const [start, end] = String(e.dates || '').split(/[–-]/).map((x) => x && x.trim());
    return dropEmpty({
      institution: e.institution,
      studyType: e.study,
      startDate: isoDate(start),
      endDate: isoDate(end),
    });
  }),

  certificates: (cv.certifications || []).map((c) => dropEmpty({
    name: c.name,
    issuer: c.issuer,
    date: isoDate(c.date),
  })),

  publications: (cv.writing || []).map((w) => dropEmpty({
    name: w.title,
    publisher: w.note || 'bytemycache.com',
    url: w.url,
  })),

  meta: { canonical: `${cv.basics.url}/cv/resume.json`, version: '1.0.0' },
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(resume, null, 2) + '\n');
console.log(`✓ wrote ${path.relative(repoRoot, OUT)} (${resume.work.length} roles, ${resume.projects.length} projects, ${resume.skills.length} skill groups)`);
