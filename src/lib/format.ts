/** The one date format shown anywhere on the site (en-US, site timezone). */
export const formatDate = (d: Date): string =>
  d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Chicago',
  });
