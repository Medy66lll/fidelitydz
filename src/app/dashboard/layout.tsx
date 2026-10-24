'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Menu,
  X,
  Lock,
  AlertTriangle,
  Clock,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAr = language === 'ar';

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

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

  const menuItems = [
    { href: '/dashboard', labelFr: "Vue d'ensemble", labelAr: 'لوحة التحكم', icon: LayoutDashboard },
    { href: '/dashboard/program', labelFr: 'Studio Carte', labelAr: 'استوديو البطاقة', icon: Palette },
    { href: '/dashboard/customers', labelFr: 'Clients & Visites', labelAr: 'الزبائن والزيارات', icon: Users },
    { href: '/dashboard/offers', labelFr: 'Offres Ciblées', labelAr: 'العروض المخصصة', icon: Tag },
    { href: '/dashboard/poster', labelFr: 'Affiche QR Comptoir', labelAr: 'ملصق الكاونتر PDF', icon: Printer },
    { href: '/dashboard/billing', labelFr: 'Abonnement & Paiement', labelAr: 'الاشتراك والدفع', icon: CreditCard },
    { href: '/scanner', labelFr: 'Scanner Caisse', labelAr: 'ماسح الصندوق', icon: QrCode },
  ];

  const isTrial = currentMerchant.subscription_status === 'TRIAL' && !isSubscriptionExpired;
  const isActive = currentMerchant.subscription_status === 'ACTIVE' && !isSubscriptionExpired;
  const isBillingPage = pathname === '/dashboard/billing';

  const handleLogout = () => {
    logoutMerchantSession();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col lg:flex-row relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3"></div>
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

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between z-40 transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
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

          {/* Isolated Merchant Badge (NO switcher to other stores) */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-extrabold text-white truncate">
                  {currentMerchant.business_name}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  {currentMerchant.phone} • {currentMerchant.wilaya}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Status & Trial Countdown Chip */}
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
              className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-[11px] font-bold text-emerald-300 flex items-center justify-center gap-1 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>3 900 DZD / mois • Payer / Renouveler</span>
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

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Trial Countdown Banner at Top */}
        {isTrial && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-extrabold flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                Période d&apos;essai gratuit de 14 jours en cours : il vous reste {daysLeft} jour(s). Après les 14 jours, votre session demandera l&apos;activation de l&apos;abonnement (3 900 DZD/mois).
              </span>
            </div>
            <Link
              href="/dashboard/billing"
              className="px-3 py-1 rounded-lg bg-slate-950 text-amber-300 font-bold text-[11px] whitespace-nowrap"
            >
              Activer mon abonnement maintenant →
            </Link>
          </div>
        )}

        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {currentMerchant.business_name}
            </h1>
            <p className="text-xs text-slate-500">
              {currentMerchant.category} • {currentMerchant.wilaya} • Tél : {currentMerchant.phone}
            </p>
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

        {/* Page Content with Automatic 14-Day Expiration Lock */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {isSubscriptionExpired && !isBillingPage ? (
            <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 border-2 border-red-500 shadow-2xl text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black uppercase">
                  Fin de période d&apos;essai (14 jours écoulés)
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Votre session d&apos;essai gratuit est terminée
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pour continuer à utiliser votre espace commerçant <strong>{currentMerchant.business_name}</strong>, scanner les cartes de vos clients et diffuser vos offres, veuillez activer votre forfait mensuel de <strong>3 900 DZD / mois</strong>.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1 text-left">
                <div className="font-bold text-slate-900">Moyens de paiement immédiats disponibles :</div>
                <div>• 📱 Virement BaridiMob (RIP : <strong>00799999004172668994</strong>)</div>
                <div>• 🏦 Versement CCP (<strong>41726689 Clé 87</strong> — KAZI TANI MOHAMMED EL MEHDI)</div>
                <div>• 💳 Paiement en ligne Edahabia / CIB (Chargily Pay)</div>
              </div>
              <Link
                href="/dashboard/billing"
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>Régler mon abonnement (3 900 DZD) et débloquer mon compte</span>
              </Link>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
