import { expect, test } from 'vitest';
import { matchRedirect } from './redirects';

const rules = `
# comment

/exact/        /new/      301
/tags/candida/ /tags/     301
/tags/:tag/index.xml  /tags/:tag/  301
/c/*           /t/:splat  301
/c2/*          /t2/       301
/first/*       /one/      301
/first/x       /two/      301
`;

test('exact match', () => expect(matchRedirect(rules, '/exact/')).toBe('/new/'));
test('exact does not prefix-match', () => expect(matchRedirect(rules, '/exact/more/')).toBeNull());
test('splat with remainder', () => expect(matchRedirect(rules, '/c/a/b/')).toBe('/t/a/b/'));
test('splat with empty remainder', () => expect(matchRedirect(rules, '/c/')).toBe('/t/'));
test('splat without :splat in target', () => expect(matchRedirect(rules, '/c2/zzz')).toBe('/t2/'));
test('placeholder substitutes one segment', () => expect(matchRedirect(rules, '/tags/docker/index.xml')).toBe('/tags/docker/'));
test('placeholder does not span segments', () => expect(matchRedirect(rules, '/tags/a/b/index.xml')).toBeNull());
test('first match wins', () => {
  expect(matchRedirect(rules, '/first/x')).toBe('/one/');
  expect(matchRedirect(rules, '/tags/candida/')).toBe('/tags/');
});
test('no match is null', () => expect(matchRedirect(rules, '/nope/')).toBeNull());
test('comments and blanks ignored', () => expect(matchRedirect(rules, '#')).toBeNull());
