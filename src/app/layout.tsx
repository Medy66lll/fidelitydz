import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { MerchantProvider } from '@/context/MerchantContext';

export const metadata: Metadata = {
  title: 'FidelityDZ - Plateforme de Carte de Fidélité Digitale en Algérie',
  description: 'Fidélisez vos clients en Algérie sans application à installer. Mode tampons ou points, scanner caissier, paiements Chargily Pay et BaridiMob.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function(){});
            });
          }
        ` }} />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <LanguageProvider>
          <MerchantProvider>
            {children}
          </MerchantProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
