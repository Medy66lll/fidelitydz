import { NextRequest, NextResponse } from 'next/server';
import { getMerchantPwaMetaByToken } from '@/lib/pwa-server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token') || '';
  const fallbackName = searchParams.get('name') || '';

  const meta = token ? await getMerchantPwaMetaByToken(token) : { businessName: fallbackName || 'Carte Fidélité', logoUrl: '' };
  const finalName = (meta.businessName && meta.businessName !== 'Carte Fidélité') ? meta.businessName : (fallbackName || 'Carte Fidélité');
  const iconUrl = `/api/icon?token=${encodeURIComponent(token)}`;

  const manifest = {
    name: finalName,
    short_name: finalName.slice(0, 15),
    description: `Carte de fidélité ${finalName}`,
    start_url: token ? `/card/${encodeURIComponent(token)}` : '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0F172A',
    theme_color: '#10B981',
    orientation: 'portrait',
    icons: [
      { src: iconUrl, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: iconUrl, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
