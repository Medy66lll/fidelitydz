'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import LanguageToggle from './LanguageToggle';
import { QrCode, Store, Sparkles, Menu, X, Lock, Instagram } from 'lucide-react';

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
    <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="w-10 h-10 rounded-xl fdz-oklab-accent-bg flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25 group-hover:scale-105 group-hover:shadow-emerald-500/35 transition-all">
              <QrCode className="w-5 h-5 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-slate-950 flex items-center gap-1">
                Fidelity<span className="text-emerald-500">DZ</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-500 font-semibold tracking-wide">
                {isAr ? 'منصة بطاقات الولاء الرقمية' : 'Fidélité Digitale Algérie'}
              </span>
            </div>
          </Link>

          {/* 100% DZ Pill Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50/90 border border-emerald-200/80 px-2.5 py-1 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black text-emerald-800 tracking-tight">100% DZ</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 transition-all hover:scale-[1.02]"
            >
              {isAr ? link.labelAr : link.labelFr}
            </Link>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://www.instagram.com/fidelity.dz"
            target="_blank"
            rel="noopener noreferrer"
            title="Suivre @fidelity.dz sur Instagram"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 hover:text-pink-700 border border-pink-200/80 text-xs font-bold transition-all"
          >
            <Instagram className="w-4 h-4" />
            <span className="hidden xl:inline">@fidelity.dz</span>
          </a>

          <LanguageToggle />

          {/* Merchant Login or Dashboard */}
          <Link
            href={isAuthenticated ? '/dashboard' : '/login'}
            className="inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap px-3 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-all shadow-sm border border-slate-700/60 hover:border-emerald-500/40"
          >
            {isAuthenticated ? (
              <>
                <Store className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">{currentMerchant?.business_name}</span>
                <span className="sm:hidden">{isAr ? 'حسابي' : 'Espace'}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">{t('merchant_login')}</span>
                <span className="sm:hidden">{isAr ? 'دخول' : 'Connexion'}</span>
              </>
            )}
          </Link>

          {/* Start Free 14-day Trial CTA */}
          {!isAuthenticated && (
            <Link
              href="/register"
              className="hidden xl:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl fdz-oklab-accent-bg hover:brightness-105 text-slate-950 text-sm font-extrabold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.03]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('start_free')}</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200/60"
            type="button"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-2xl">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100/80 transition-colors"
              >
                {isAr ? link.labelAr : link.labelFr}
              </Link>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 fdz-oklab-accent-bg text-slate-950 rounded-xl font-extrabold text-sm shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('start_free')}</span>
            </Link>
            <Link
              href={isAuthenticated ? '/dashboard' : '/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm border border-slate-800"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>{isAuthenticated ? 'Mon Espace Commerçant' : 'Connexion Commerçant'}</span>
            </Link>

            <a
              href="https://www.instagram.com/fidelity.dz"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-amber-500/10 border border-pink-300 text-pink-700 rounded-xl font-bold text-sm"
            >
              <Instagram className="w-4 h-4 text-pink-600" />
              <span>Suivre @fidelity.dz sur Instagram</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
