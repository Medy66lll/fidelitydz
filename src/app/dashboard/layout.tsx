'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import LanguageToggle from '@/components/LanguageToggle';
import {
  LayoutDashboard,
  Palette,
  Users,
  Tag,
  Printer,
  CreditCard,
  QrCode,
  LogOut,
  Store,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t, language } = useLanguage();
  const { currentMerchant, switchMerchant, allMerchants } = useMerchant();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [merchantDropdownOpen, setMerchantDropdownOpen] = useState(false);

  const isAr = language === 'ar';

  const menuItems = [
    { href: '/dashboard', labelFr: 'Vue d\'ensemble', labelAr: 'لوحة التحكم', icon: LayoutDashboard },
    { href: '/dashboard/program', labelFr: 'Studio Carte', labelAr: 'استوديو البطاقة', icon: Palette },
    { href: '/dashboard/customers', labelFr: 'Clients & Visites', labelAr: 'الزبائن والزيارات', icon: Users },
    { href: '/dashboard/offers', labelFr: 'Offres Ciblées', labelAr: 'العروض المخصصة', icon: Tag },
    { href: '/dashboard/poster', labelFr: 'Affiche QR Comptoir', labelAr: 'ملصق الكاونتر PDF', icon: Printer },
    { href: '/dashboard/billing', labelFr: 'Abonnement & Paiement', labelAr: 'الاشتراك والدفع', icon: CreditCard },
    { href: '/scanner', labelFr: 'Scanner Caisse', labelAr: 'ماسح الصندوق', icon: QrCode },
  ];

  const isTrial = currentMerchant?.subscription_status === 'TRIAL';
  const isActive = currentMerchant?.subscription_status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-200"
            type="button"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-base tracking-tight text-white">
            Fidelity<span className="text-emerald-400">DZ</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between z-40 transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo & Platform Name */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight block leading-tight">
                  Fidelity<span className="text-emerald-400">DZ</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                  {isAr ? 'لوحة تحكم التاجر' : 'Espace Commerçant'}
                </span>
              </div>
            </Link>
          </div>

          {/* Merchant Selector Dropdown (Multi-Tenant) */}
          <div className="relative">
            <button
              onClick={() => setMerchantDropdownOpen(!merchantDropdownOpen)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-left rtl:text-right hover:border-slate-700 transition-colors"
              type="button"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">
                    {currentMerchant?.business_name || 'Mon Commerce'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {currentMerchant?.wilaya}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>

            {/* Merchant list dropdown */}
            {merchantDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-1 z-50">
                <p className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500">
                  Changer de commerce :
                </p>
                {allMerchants.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      switchMerchant(m.id);
                      setMerchantDropdownOpen(false);
                    }}
                    className={`w-full text-left rtl:text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-900 transition-colors ${
                      currentMerchant?.id === m.id ? 'text-emerald-400 font-bold bg-slate-900/50' : 'text-slate-300'
                    }`}
                    type="button"
                  >
                    <span className="truncate">{m.business_name}</span>
                    <span className="text-[10px] text-slate-500">{m.slug}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subscription Status Chip */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{t('subscription_status_label')} :</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isTrial
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {isActive ? 'ACTIF' : isTrial ? 'ESSAI 14J' : 'EXPIRÉ'}
              </span>
            </div>
            <Link
              href="/dashboard/billing"
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 pt-0.5"
            >
              <span>3 900 DZD / mois • Gérer</span>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{isAr ? item.labelAr : item.labelFr}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-5 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <LanguageToggle />
            <Link
              href="/"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Retour à l'accueil"
            >
              <LogOut className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
          <p className="text-[10px] text-slate-500 text-center">
            FidelityDZ v1.0 • Algérie 🇩🇿
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {currentMerchant?.business_name}
            </h1>
            <p className="text-xs text-slate-500">
              {currentMerchant?.category} • {currentMerchant?.wilaya}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/join/${currentMerchant?.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200/80 transition-colors"
            >
              <span>Page Client : /{currentMerchant?.slug}</span>
            </Link>
            <Link
              href="/scanner"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>{t('open_scanner')}</span>
            </Link>
            <LanguageToggle />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
