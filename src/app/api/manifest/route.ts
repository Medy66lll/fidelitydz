import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token') || '';
  const name = searchParams.get('name') || 'Ma Carte Fidélité';
  const logo = searchParams.get('logo') || 'https://cdn-icons-png.flaticon.com/512/1041/1041888.png';

  const startUrl = token ? `/card/${token}` : '/';

  const manifest = {
    name: name,
    short_name: name.slice(0, 12),
    description: 'Votre carte de fidélité digitale FidelityDZ toujours accessible en 1 clic.',
    start_url: startUrl,
    scope: '/',
    display: 'standalone',
    background_color: '#0F172A',
    theme_color: '#10B981',
    orientation: 'portrait',
    icons: [
      { src: logo, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: logo, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'no-store' },
  });
}
