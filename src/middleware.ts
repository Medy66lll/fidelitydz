import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (pathname.startsWith('/api/chargily/checkout') || pathname.startsWith('/api/db')) {
    const type = searchParams.get('type') || 'init';
    const isPublicLookup = type === 'merchant_by_slug' || type === 'card_by_token';
    const sessionCookie = req.cookies.get('fidelitydz_session')?.value;
    const adminCookie = req.cookies.get('fidelitydz_admin_session')?.value;
    const merchantHeader = req.headers.get('x-merchant-id');
    const adminHeader = req.headers.get('x-admin-token');

    if (
      req.method === 'GET' &&
      !isPublicLookup &&
      searchParams.get('strict_auth') === '1' &&
      !sessionCookie &&
      !adminCookie &&
      !merchantHeader &&
      !adminHeader
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const res = NextResponse.next();

  // Protection anti-indexation et anti-cache public sur tous les espaces privés (Owner, Commerçants, Clients)
  if (
    pathname.startsWith('/kazi-owner-dz') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/scanner') ||
    pathname.startsWith('/card') ||
    pathname.startsWith('/api')
  ) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
    res.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate');
  }

  return res;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/kazi-owner-dz/:path*',
    '/dashboard/:path*',
    '/scanner/:path*',
    '/card/:path*',
  ],
};
