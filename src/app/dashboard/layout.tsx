'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import LanguageToggle from '@/components/LanguageToggle';
import SupportWidget from '@/components/SupportWidget';
import { db, generateUuid } from '@/lib/db';
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
  Menu,
  X,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t, language } = useLanguage();
  const {
    currentMerchant,
    isAuthenticated,
    isLoadingAuth,
    isSubscriptionExpired,
    daysLeft,
    logoutMerchantSession,
  } = useMerchant();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 1024 : false);

  const isAr = language === 'ar';

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  const handleLogout = () => {
    logoutMerchantSession();
    router.replace('/login');
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="text-xs text-slate-400">Vérification de votre session commerçant...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !currentMerchant) {
    return null;
  }

  const isTrial = currentMerchant.subscription_status === 'TRIAL' && !isSubscriptionExpired;
  const isActive = currentMerchant.subscription_status === 'ACTIVE' && !isSubscriptionExpired;
  const isBillingPage = pathname === '/dashboard/billing';

  const menuItems = [
    { href: '/dashboard', labelFr: "Vue d'ensemble", labelAr: 'لوحة التحكم', icon: LayoutDashboard },
    { href: '/dashboard/program', labelFr: 'Studio Carte', labelAr: 'استوديو البطاقة', icon: Palette },
    { href: '/dashboard/customers', labelFr: 'Clients & Visites', labelAr: 'الزبائن والزيارات', icon: Users },
    { href: '/dashboard/offers', labelFr: 'Offres Ciblées', labelAr: 'العروض المخصصة', icon: Tag },
    { href: '/dashboard/poster', labelFr: 'Affiche QR Comptoir', labelAr: 'ملصق الكاونتر PDF', icon: Printer },
    { href: '/dashboard/billing', labelFr: 'Abonnement & Paiement', labelAr: 'الاشتراك والدفع', icon: CreditCard },
    { href: '/scanner', labelFr: 'Scanner Caisse', labelAr: 'ماسح الصندوق', icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
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
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold"
            type="button"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 overflow-y-auto shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-5">
          {/* Logo */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight block leading-tight">
                  Fidelity<span className="text-emerald-400">DZ</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                  {isAr ? 'لوحة تحكم التاجر' : 'Espace Commerçant Privé'}
                </span>
              </div>
            </Link>
          </div>

          {/* Merchant & Multi-Locaux Switcher */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-extrabold text-white truncate">
                  {currentMerchant.business_name}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  {currentMerchant.phone} • {currentMerchant.wilaya}
                </p>
              </div>
            </div>

            {/* Sélecteur de Point de Vente (Multi-Locaux sur un seul compte) */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-bold uppercase">Points de vente ({currentMerchant.max_locations || 1} max)</span>
                <Link href="/dashboard/billing" className="text-emerald-400 hover:underline font-bold">
                  + Ajouter un local
                </Link>
              </div>
              <select
                value={currentMerchant.id}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__ADD_BRANCH__') {
                    router.push('/dashboard/billing');
                    return;
                  }
                  const all = db.getMerchants();
                  const target = all.find((m) => m.id === val);
                  if (target) {
                    localStorage.setItem('fidelitydz_merchant_session', target.id);
                    localStorage.setItem('fidelitydz_active_merchant', target.id);
                    window.location.href = '/dashboard';
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2 text-[11px] font-bold text-white outline-none focus:border-emerald-500"
              >
                <option value={currentMerchant.id}>📍 {currentMerchant.business_name} ({currentMerchant.wilaya})</option>
                {db
                  .getMerchants()
                  .filter(
                    (m) =>
                      m.id !== currentMerchant.id &&
                      (m.phone === currentMerchant.phone ||
                        m.parent_merchant_id === currentMerchant.id ||
                        (currentMerchant.parent_merchant_id && m.id === currentMerchant.parent_merchant_id))
                  )
                  .map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      📍 {branch.business_name} ({branch.wilaya})
                    </option>
                  ))}
                <option value="__ADD_BRANCH__">➕ Créer / Demander un nouveau local...</option>
              </select>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
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
                {isActive ? 'ACTIF' : isTrial ? `ESSAI (${daysLeft}J RESTANTS)` : 'EXPIRÉ'}
              </span>
            </div>
            <Link
              href="/dashboard/billing"
              className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-[11px] font-bold text-emerald-300 flex items-center justify-center gap-1 transition-colors text-center leading-tight"
            >
              <CreditCard className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Gérer mon Abonnement</span>
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
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
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

        {/* Sidebar Footer with Logout */}
        <div className="p-5 border-t border-slate-800 space-y-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{isAr ? 'تسجيل الخروج' : 'Fermer ma session'}</span>
          </button>
          <div className="flex items-center justify-between pt-1">
            <LanguageToggle />
            <span className="text-[10px] text-slate-500">FidelityDZ v3.0 🇩🇿</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 w-full relative z-10 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title={sidebarOpen ? "Masquer le menu" : "Afficher le menu"}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {currentMerchant.business_name}
              </h1>
              <p className="text-xs text-slate-500">
                {currentMerchant.category} • {currentMerchant.wilaya} • Tél : {currentMerchant.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/join/${currentMerchant.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200/80 transition-colors"
            >
              <span>Lien QR Client : /join/{currentMerchant.slug}</span>
            </Link>
            <Link
              href="/scanner"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>{t('open_scanner')}</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
        <SupportWidget defaultRole="MERCHANT" merchantName={currentMerchant.business_name} merchantPhone={currentMerchant.phone} />
      </main>
    </div>
  );
}
