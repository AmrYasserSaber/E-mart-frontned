export function sanitizeReturnUrl(url: string | null | undefined, fallback = '/home'): string {
  if (!url) return fallback;
  const startsWithSingleSlash = url.startsWith('/') && !url.startsWith('//');
  const hasNoScheme = !url.includes('://');
  return startsWithSingleSlash && hasNoScheme ? url : fallback;
}
