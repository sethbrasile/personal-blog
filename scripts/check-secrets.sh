#!/bin/sh
# Blocks staged additions that look like credentials. The PostHog project token
# (phc_...) is public by design and is allowed; personal API keys (phx_...) are not.
pattern='(phx_[A-Za-z0-9]{20,}|shpat_[a-f0-9]{20,}|shpss_[a-f0-9]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk_live_[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|xox[abp]-[A-Za-z0-9-]{10,})'
if git diff --cached --no-color -U0 | grep -E '^\+[^+]' | grep -Eq "$pattern"; then
  echo "pre-commit: staged changes look like they contain a credential. Remove it (use env vars / gitignored .env)." >&2
  exit 1
fi
