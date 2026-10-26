/**
 * Cloudflare Pages `_redirects` matcher: first match wins; `*` captures the rest
 * (including slashes) and is substituted for `:splat`; `:name` matches exactly one
 * non-empty path segment and is substituted by name in the target.
 */
export function matchRedirect(rules: string, path: string): string | null {
  const parsed: [string, string][] = [];
  for (const raw of rules.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const [from, to] = line.split(/\s+/);
    if (from && to) parsed.push([from, to]);
  }
  // Cloudflare resolves static (no `*`, no `:name`) rules before dynamic ones, wherever they sit in the file.
  const isDynamic = ([from]: [string, string]) => /[*:]/.test(from.replace(/^[a-z]+:\/\//, ''));
  const ordered = [...parsed.filter((r) => !isDynamic(r)), ...parsed.filter(isDynamic)];
  for (const [from, to] of ordered) {
    const names: string[] = [];
    const source = from
      .split('/')
      .map((seg) => {
        if (seg === '*') return '(.*)';
        if (seg.startsWith(':')) {
          names.push(seg.slice(1));
          return '([^/]+)';
        }
        return seg.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      })
      .join('/');
    const m = new RegExp(`^${source}$`).exec(path);
    if (!m) continue;
    // Captures are in source order: placeholders fill `names`, a `*` is the splat.
    const groups = from.split('/').filter((s) => s === '*' || s.startsWith(':'));
    let target = to;
    groups.forEach((g, i) => {
      const value = m[i + 1] ?? '';
      target = g === '*' ? target.replace(':splat', value) : target.replace(g, value);
    });
    return target;
  }
  return null;
}
