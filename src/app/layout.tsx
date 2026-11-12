import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { MerchantProvider } from '@/context/MerchantContext';

export const viewport: Viewport = {
  themeColor: '#10B981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'FidelityDZ — N°1 de la Carte de Fidélité Digitale en Algérie',
  description:
    'Fidélisez vos clients en Algérie en 5 secondes par QR Code et numéro 05/06/07 sans application à installer. Tampons ou points, notifications Push, scanner caisse et paiement BaridiMob / Chargily Pay.',
  keywords: [
    'FidelityDZ',
    'carte de fidélité digitale Algérie',
    'fidélisation client Algérie',
    'programme fidélité QR code Algérie',
    'logiciel caisse fidélité Algérie',
    'BaridiMob',
    'Chargily Pay',
  ],
  openGraph: {
    title: 'FidelityDZ — Fidélisez vos clients en Algérie sans application à installer',
    description:
      'Créez un Club VIP digital pour votre commerce en quelques clics. Inscription client en 5 secondes par QR code et numéro 05/06/07.',
    type: 'website',
    locale: 'fr_DZ',
    siteName: 'FidelityDZ',
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function(){});
            });
          }
        `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <LanguageProvider>
          <MerchantProvider>{children}</MerchantProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
