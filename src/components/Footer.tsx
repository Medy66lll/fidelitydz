'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import AlgerianPaymentBadges from './AlgerianPaymentBadges';
import { QrCode, Heart } from 'lucide-react';

export default function Footer() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [cookieAccepted, setCookieAccepted] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fidelitydz_cookie_consent');
      if (!saved) setCookieAccepted(false);
    }
  }, []);

  const handleCookieChoice = (val: string) => {
    setCookieAccepted(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fidelitydz_cookie_consent', val);
    }
  };

  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Fidelity<span className="text-emerald-400">DZ</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isAr
                ? 'المنصة الجزائرية الرائدة لبطاقات الولاء الرقمية للمتاجر والمقاهي والمطاعم بدون تحميل أي تطبيق.'
                : 'La plateforme algérienne de référence pour la fidélisation client en commerce de détail, cafés et restaurants sans application à installer.'}
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
              <span>🇩🇿 Fièrement conçu pour l&apos;Algérie</span>
            </div>
          </div>

          {/* Col 2: Solutions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {isAr ? 'الحلول والخدمات' : 'Solutions'}
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/#fonctionnement" className="hover:text-emerald-400 transition-colors">
                  {isAr ? 'برنامج الأختام الرقمية' : 'Mode Tampons Digitaux'}
                </Link>
              </li>
              <li>
                <Link href="/#fonctionnement" className="hover:text-emerald-400 transition-colors">
                  {isAr ? 'برنامج النقاط والمشتريات' : 'Mode Points de Fidélité'}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  {isAr ? 'ملصق QR للطاولة والكاونتر' : 'Affiche QR de Comptoir'}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  {isAr ? 'ماسح الكاشير السريع' : 'Scanner Caisse Caissier'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation rapide (Aucun lien ni geste vers l'espace Propriétaire) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {isAr ? 'روابط سريعة' : 'Navigation'}
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/register" className="hover:text-emerald-400 transition-colors">
                  {isAr ? 'ابدأ تجربة مجانية 14 يوماً' : 'Essai Gratuit 14 Jours'}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  {isAr ? 'دخول لوحة تحكم التاجر' : 'Connexion Commerçant'}
                </Link>
              </li>
              <li>
                <Link href="/#tarif" className="hover:text-emerald-400 transition-colors">
                  {isAr ? 'اشتراك 3900 دج شهرياً' : 'Tarif Unique 3 900 DZD'}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                  {isAr ? 'سياسة الخصوصية' : 'Politique de confidentialité (Privacy Policy)'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Paiements acceptés */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {isAr ? 'طرق الدفع المدعومة في الجزائر' : 'Paiements Sécurisés en Algérie'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'دفع فوري عبر البطاقة الذهبية و CIB أو تحويل عبر بريدي موب وحساب CCP.'
                : 'Règlement instantané via Chargily Pay (Edahabia & CIB) ou virement BaridiMob / CCP.'}
            </p>
            <div className="pt-1">
              <AlgerianPaymentBadges size="sm" />
            </div>
          </div>
        </div>

        {/* Cookie Consent Banner */}
        {!cookieAccepted && (
          <div
            role="dialog"
            aria-label="cookie-consent"
            className="fixed bottom-4 left-4 right-20 sm:right-auto sm:max-w-md z-40 bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl text-xs text-slate-200 space-y-2.5"
          >
            <p className="leading-relaxed">
              🍪 Nous utilisons uniquement des cookies techniques essentiels au fonctionnement de votre session.
              Consultez notre{' '}
              <Link href="/privacy" className="text-emerald-400 underline">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCookieChoice('accepted')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold"
              >
                Accept / Accepter
              </button>
              <button
                type="button"
                onClick={() => handleCookieChoice('essential_only')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
              >
                Reject non-essential
              </button>
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} FidelityDZ SaaS. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            <span>Propulsé avec passion pour le commerce algérien</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
