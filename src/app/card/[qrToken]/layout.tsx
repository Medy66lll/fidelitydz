import { Metadata } from 'next';
import { getMerchantPwaMetaByToken } from '@/lib/pwa-server';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { qrToken: string } }): Promise<Metadata> {
  const token = decodeURIComponent(params.qrToken || '').trim();
  const { businessName } = await getMerchantPwaMetaByToken(token);
  const iconUrl = `/api/icon?token=${encodeURIComponent(token)}`;

  return {
    title: businessName,
    applicationName: businessName,
    icons: {
      icon: iconUrl,
      shortcut: iconUrl,
      apple: [{ url: iconUrl, sizes: '180x180', type: 'image/png' }],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: businessName,
    },
    manifest: `/api/manifest?token=${encodeURIComponent(token)}&name=${encodeURIComponent(businessName)}`,
  };
}

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
