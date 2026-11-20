import { NextRequest, NextResponse } from 'next/server';

const CSP_HEADER =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; media-src 'self' blob: data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests;";

function isTrustedOrigin(req: NextRequest, originHeader: string | null): boolean {
  if (!originHeader) return true;
  try {
    const parsedOrigin = new URL(originHeader);
    const reqHost = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').trim().toLowerCase();
    if (reqHost && parsedOrigin.host.toLowerCase() === reqHost) {
      return true;
    }
    const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (configuredAppUrl) {
      const parsedApp = new URL(configuredAppUrl);
      if (parsedOrigin.host.toLowerCase() === parsedApp.host.toLowerCase()) {
        return true;
      }
    }
    if (parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1') {
      return process.env.NODE_ENV !== 'production';
    }
    return false;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const { pathname, search, searchParams } = req.nextUrl;

  // Règle 23 : Bloquer l'accès public à tout fichier sensible (.env, .git, .sql, .bak, .pem, /supabase)
  if (/^\/(\.env|\.git|\.vscode|supabase(\/|$)|.*\.(sql|bak|pem|key|dump|log|sh|zip)$)/i.test(pathname)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Règle 4 : Forcer HTTPS automatiquement en production
  const proto = req.headers.get('x-forwarded-proto');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  if (
    process.env.NODE_ENV === 'production' &&
    proto === 'http' &&
    host &&
    !host.startsWith('localhost') &&
    !host.startsWith('127.0.0.1')
  ) {
    return NextResponse.redirect(`https://${host}${pathname}${search}`, 308);
  }

  // Règles 13 & 16 : Restriction CORS & Protection CSRF sur les routes API (hors webhook signé Chargily)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/chargily/webhook')) {
    const origin = req.headers.get('origin');
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

    if (req.method === 'OPTIONS') {
      if (!isTrustedOrigin(req, origin)) {
        return new NextResponse(null, { status: 403 });
      }
      const preflight = new NextResponse(null, { status: 204 });
      if (origin) {
        preflight.headers.set('Access-Control-Allow-Origin', origin);
        preflight.headers.set('Vary', 'Origin');
      }
      preflight.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      preflight.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, x-admin-token, x-merchant-token, x-merchant-id, x-device-id'
      );
      preflight.headers.set('Access-Control-Max-Age', '86400');
      return preflight;
    }

    if (isMutating && origin && !isTrustedOrigin(req, origin)) {
      return NextResponse.json(
        { success: false, error: 'Requête cross-origin refusée (Protection CSRF / CORS).' },
        { status: 403 }
      );
    }
  }

  if (pathname.startsWith('/api/chargily/checkout') || pathname.startsWith('/api/db')) {
    const type = searchParams.get('type') || 'init';
    const isPublicLookup = type === 'merchant_by_slug' || type === 'card_by_token';
    const sessionCookie = req.cookies.get('fidelitydz_session')?.value;
    const adminCookie = req.cookies.get('fidelitydz_admin_session')?.value;
    const merchantHeader = req.headers.get('x-merchant-token') || req.headers.get('x-merchant-id');
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

  // Règle 14 : Security Headers systématiques
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(), payment=()');
  res.headers.set('X-DNS-Prefetch-Control', 'off');
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('Content-Security-Policy', CSP_HEADER);

  const origin = req.headers.get('origin');
  if (pathname.startsWith('/api/') && origin && isTrustedOrigin(req, origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Vary', 'Origin');
  }

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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
