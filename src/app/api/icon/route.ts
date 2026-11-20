import { NextRequest, NextResponse } from 'next/server';
import { getMerchantPwaMetaByToken } from '@/lib/pwa-server';
import { isSafeExternalImageUrl, logSecurityEvent } from '@/lib/validation';

export async function GET(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token') || '';
  const { businessName, logoUrl } = await getMerchantPwaMetaByToken(token);

  if (logoUrl && logoUrl.startsWith('data:image/')) {
    const match = logoUrl.match(/^data:(image\/(jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/);
    if (match) {
      const mimeType = match[1];
      const buffer = Buffer.from(match[3].replace(/\s+/g, ''), 'base64');
      // Limit to 4MB max
      if (buffer.length <= 4 * 1024 * 1024) {
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'no-store, must-revalidate',
          },
        });
      }
    }
  }

  if (logoUrl && (logoUrl.startsWith('https://') || logoUrl.startsWith('http://'))) {
    const urlCheck = isSafeExternalImageUrl(logoUrl);
    if (!urlCheck.safe || !urlCheck.url) {
      logSecurityEvent(
        'SSRF_ATTEMPT_BLOCKED',
        ip,
        { reason: urlCheck.error, url_prefix: logoUrl.slice(0, 120) },
        'CRITICAL'
      );
    } else {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const imgRes = await fetch(urlCheck.url, {
          cache: 'no-store',
          signal: controller.signal,
          headers: { 'Accept': 'image/png,image/jpeg,image/webp' },
        });
        clearTimeout(timeoutId);

        if (imgRes.ok) {
          const contentType = (imgRes.headers.get('content-type') || '').toLowerCase();
          const isAllowedType =
            contentType.includes('image/png') ||
            contentType.includes('image/jpeg') ||
            contentType.includes('image/webp');

          if (isAllowedType) {
            const arr = await imgRes.arrayBuffer();
            if (arr.byteLength <= 4 * 1024 * 1024) {
              return new NextResponse(Buffer.from(arr), {
                status: 200,
                headers: {
                  'Content-Type': contentType.split(';')[0].trim(),
                  'Cache-Control': 'no-store, must-revalidate',
                },
              });
            }
          }
        }
      } catch {}
    }
  }

  const initials = (businessName || 'FD').slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="110" fill="#0F172A"/>
    <rect x="24" y="24" width="464" height="464" rx="90" fill="none" stroke="#10B981" stroke-width="16"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#10B981" font-family="sans-serif" font-weight="900" font-size="200">${initials}</text>
  </svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
