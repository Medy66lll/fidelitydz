import { NextRequest, NextResponse } from 'next/server';
import { getMerchantPwaMetaByToken } from '@/lib/pwa-server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token') || '';
  const { businessName, logoUrl } = await getMerchantPwaMetaByToken(token);

  if (logoUrl && logoUrl.startsWith('data:image/')) {
    const match = logoUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (match) {
      const mimeType = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'no-store, must-revalidate',
        },
      });
    }
  }

  if (logoUrl && logoUrl.startsWith('http')) {
    try {
      const imgRes = await fetch(logoUrl, { cache: 'no-store' });
      if (imgRes.ok) {
        const arr = await imgRes.arrayBuffer();
        return new NextResponse(Buffer.from(arr), {
          status: 200,
          headers: {
            'Content-Type': imgRes.headers.get('content-type') || 'image/png',
            'Cache-Control': 'no-store, must-revalidate',
          },
        });
      }
    } catch {}
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
