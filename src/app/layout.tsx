import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { MerchantProvider } from '@/context/MerchantContext';
import JsonLdSchema from '@/components/JsonLdSchema';

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'FidelityDZ — N°1 de la Carte de Fidélité Digitale en Algérie',
  description:
    'Créez votre programme de fidélité digital en 2 minutes. Sans application à télécharger pour vos clients. QR Code, Tampons, Points, Offres VIP et Paiement sécurisé BaridiMob / CCP.',
  manifest: '/api/manifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FidelityDZ',
  },
  openGraph: {
    title: 'FidelityDZ — Carte de Fidélité Digitale en Algérie',
    description:
      'Fidélisez vos clients en Algérie sur leur téléphone (05/06/07) par simple scan QR Code en caisse.',
    type: 'website',
    locale: 'fr_DZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FidelityDZ — Carte de Fidélité Digitale en Algérie',
    description:
      'La solution N°1 de fidélisation digitale pour commerces, cafés, restaurants et boutiques en Algérie.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <JsonLdSchema />
        <LanguageProvider>
          <MerchantProvider>{children}</MerchantProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
