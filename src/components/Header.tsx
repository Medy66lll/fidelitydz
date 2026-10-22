'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import LanguageToggle from './LanguageToggle';
import { QrCode, Store, Sparkles, Menu, X, Lock } from 'lucide-react';

export default function Header() {
  const { t, language } = useLanguage();
  const { isAuthenticated, currentMerchant } = useMerchant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAr = language === 'ar';

  const navLinks = [
    { href: '/#fonctionnement', labelFr: 'Fonctionnement', labelAr: 'كيف يعمل' },
    { href: '/#demo', labelFr: 'Démo Interactive', labelAr: 'تجربة حية' },
    { href: '/#tarif', labelFr: 'Tarif Unique (3 900 DZD)', labelAr: 'الأسعار' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1">
                Fidelity<span className="text-emerald-500">DZ</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                {isAr ? 'بطاقات ولاء رقمية' : 'Fidélité Digitale Algérie'}
              </span>
            </div>
          </Link>

          <div className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-800">100% DZ 🇩🇿</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
            >
              {isAr ? link.labelAr : link.labelFr}
            </Link>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <LanguageToggle />

          {/* Merchant Login or Dashboard if already logged in */}
          <Link
            href={isAuthenticated ? '/dashboard' : '/login'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors shadow-sm"
          >
            {isAuthenticated ? (
              <>
                <Store className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">{currentMerchant?.business_name}</span>
                <span className="sm:hidden">Mon Commerce</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">{t('merchant_login')}</span>
                <span className="sm:hidden">Connexion</span>
              </>
            )}
          </Link>

          {/* Start Free 14-day Trial CTA */}
          {!isAuthenticated && (
            <Link
              href="/register"
              className="hidden xl:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-md shadow-emerald-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('start_free')}</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            type="button"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                {isAr ? link.labelAr : link.labelFr}
              </Link>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-lg font-bold text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('start_free')}</span>
            </Link>
            <Link
              href={isAuthenticated ? '/dashboard' : '/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>{isAuthenticated ? 'Mon Espace Commerçant' : 'Connexion Commerçant'}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
