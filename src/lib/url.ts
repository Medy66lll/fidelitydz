export function getPublicOrigin(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://fidelitydz.vercel.app';
  }
  const host = window.location.hostname;
  if (host.endsWith('.vercel.app') && host !== 'fidelitydz.vercel.app' && host.startsWith('fidelitydz-')) {
    return 'https://fidelitydz.vercel.app';
  }
  return window.location.origin;
}
