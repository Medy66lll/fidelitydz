'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import LanguageToggle from '@/components/LanguageToggle';
import SupportWidget from '@/components/SupportWidget';
import { db } from '@/lib/db';
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
  Clock,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
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

  // Vérification du mode Caissier restreint (PIN Caissier)
  const [isCashierRole, setIsCashierRole] = useState(false);
  const [managerUnlockInput, setManagerUnlockInput] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  const isAr = language === 'ar';

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  useEffect(() => {
    setIsCashierRole(db.getSessionRole() === 'CASHIER');
  }, [pathname]);

  const handleLogout = () => {
    logoutMerchantSession();
    router.replace('/login');
  };

  const handleUnlockManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMerchant) return;
    setUnlockError('');
    setUnlocking(true);
    const ok = await db.verifyManagerPasswordAsync(currentMerchant.id, managerUnlockInput);
    setUnlocking(false);
    if (ok) {
      setIsCashierRole(false);
      setManagerUnlockInput('');
    } else {
      setUnlockError('Mot de passe Gérant incorrect. Accès au Dashboard refusé.');
    }
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

  // Si l'employé est connecté avec le Code PIN Caissier, bloquer totalement l'accès au Dashboard !
  if (isCashierRole) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <KeyRound className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
              🔒 Mode Caissier Actif
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Accès réservé au Gérant ({currentMerchant.business_name})
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cet appareil est verrouillé en <strong>Mode Caisse</strong> pour protéger vos statistiques, vos clients et
              vos paramètres. Saisissez le mot de passe Gérant pour déverrouiller le Dashboard.
            </p>
          </div>

          {unlockError && (
            <div className="bg-red-950/80 border border-red-700 text-red-200 p-3 rounded-xl text-xs font-bold">
              {unlockError}
            </div>
          )}

          <form onSubmit={handleUnlockManager} className="space-y-3 text-left">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Mot de passe Gérant *
              </label>
              <input
                aria-label="Mot de passe Gérant"
                type="password"
                required
                placeholder="Saisir le mot de passe Gérant..."
                value={managerUnlockInput}
                onChange={(e) => setManagerUnlockInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-white outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={unlocking}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all"
            >
              {unlocking ? 'Vérification...' : '🔓 Déverrouiller le Dashboard Gérant'}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/scanner"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Retourner au Scanner Caisse</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-red-400 font-bold pt-1"
            >
              Fermer la session
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isTrial = currentMerchant.subscription_status === 'TRIAL' && !isSubscriptionExpired;
  const isActive = currentMerchant.subscription_status === 'ACTIVE' && !isSubscriptionExpired;
  const isBillingPage = pathname === '/dashboard/billing';

  const menuItems = [
    { href: '/dashboard', labelFr: "Vue d'ensemble", labelAr: 'لوحة التحكم', icon: LayoutDashboard, lockedWhenExpired: true },
    { href: '/dashboard/program', labelFr: 'Studio Carte', labelAr: 'استوديو البطاقة', icon: Palette, lockedWhenExpired: true },
    { href: '/dashboard/customers', labelFr: 'Clients & Visites', labelAr: 'الزبائن والزيارات', icon: Users, lockedWhenExpired: true },
    { href: '/dashboard/offers', labelFr: 'Offres Ciblées', labelAr: 'العروض المخصصة', icon: Tag, lockedWhenExpired: true },
    { href: '/dashboard/poster', labelFr: 'Affiche QR Comptoir', labelAr: 'ملصق الكاونتر PDF', icon: Printer, lockedWhenExpired: true },
    { href: '/dashboard/billing', labelFr: 'Abonnement & Paiement', labelAr: 'الاشتراك والدفع', icon: CreditCard, lockedWhenExpired: false },
    { href: '/scanner', labelFr: 'Scanner Caisse', labelAr: 'ماسح الصندوق', icon: QrCode, lockedWhenExpired: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row relative overflow-x-hidden">
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

      {/* Sidebar Navigation — Toujours visible sur Desktop (lg:sticky lg:translate-x-0), tiroir sur Mobile */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-30 w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 overflow-y-auto shadow-2xl lg:shadow-none ${
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

            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-bold uppercase">
                  Points de vente ({currentMerchant.max_locations || 1} max)
                </span>
                <Link href="/dashboard/billing#quotas" className="text-emerald-400 hover:underline font-bold">
                  + Ajouter un local
                </Link>
              </div>
              <select
                aria-label="Sélecteur de point de vente"
                value={currentMerchant.id}
                disabled={isSubscriptionExpired}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__ADD_BRANCH__') {
                    const rootId = currentMerchant.parent_merchant_id || currentMerchant.id;
                    const linkedBranches = db.getMerchants().filter(
                      (m) => m.id === rootId || m.parent_merchant_id === rootId || m.phone === currentMerchant.phone
                    );
                    const maxLoc = Number(currentMerchant.max_locations || 1);
                    if (linkedBranches.length >= maxLoc) {
                      alert(
                        `Vous utilisez déjà ${linkedBranches.length}/${maxLoc} point(s) de vente inclus dans votre forfait. Rendez-vous dans Abonnement & Paiement pour ajouter un local supplémentaire (+1 500 DZD/mois).`
                      );
                      router.push('/dashboard/billing#quotas');
                      return;
                    }
                    const branchName = window.prompt(
                      'Nom de votre nouveau point de vente (ex: ' + currentMerchant.business_name + ' - Oran) :'
                    );
                    if (!branchName || !branchName.trim()) return;
                    const branchWilaya =
                      window.prompt('Wilaya du point de vente (ex: 31 - Oran) :', currentMerchant.wilaya) ||
                      currentMerchant.wilaya;
                    const branchAddress = window.prompt('Adresse ou localisation Google Maps :', '') || '';
                    fetch('/api/db', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'create_branch',
                        parent_merchant_id: currentMerchant.id,
                        business_name: branchName.trim(),
                        wilaya: branchWilaya.trim(),
                        address: branchAddress.trim(),
                      }),
                    })
                      .then((r) => r.json())
                      .then(async (res) => {
                        if (res && res.success && res.merchant) {
                          await db.syncFromSupabase();
                          localStorage.setItem('fidelitydz_current_store_id', res.merchant.id);
                          localStorage.setItem('fidelitydz_active_merchant', res.merchant.id);
                          window.location.href = '/dashboard';
                        } else {
                          alert(res?.error || 'Impossible de créer le local.');
                        }
                      });
                    return;
                  }
                  const all = db.getMerchants();
                  const target = all.find((m) => m.id === val);
                  if (target) {
                    localStorage.setItem('fidelitydz_current_store_id', target.id);
                    localStorage.setItem('fidelitydz_active_merchant', target.id);
                    window.location.href = '/dashboard';
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2 text-[11px] font-bold text-white outline-none focus:border-emerald-500 disabled:opacity-50"
              >
                <option value={currentMerchant.id}>
                  📍 {currentMerchant.business_name} ({currentMerchant.wilaya})
                </option>
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
                {isActive ? 'ACTIF' : isTrial ? `ESSAI (${daysLeft}J RESTANTS)` : 'EXPIRÉ / VERROUILLÉ'}
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
              const isLocked = isSubscriptionExpired && item.lockedWhenExpired;
              return (
                <Link
                  key={item.href}
                  href={isLocked ? '/dashboard/billing' : item.href}
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : isLocked
                      ? 'text-slate-600 hover:text-amber-300 hover:bg-slate-800/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{isAr ? item.labelAr : item.labelFr}</span>
                  </div>
                  {isLocked && <Lock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Cashier Lock & Logout */}
        <div className="p-5 border-t border-slate-800 space-y-2.5">
          <button
            type="button"
            onClick={() => {
              db.setSessionRole('CASHIER');
              router.push('/scanner');
            }}
            className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isAr ? 'وضع الصندوق فقط' : 'Activer Mode Caissier'}</span>
          </button>
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
      <main className="flex-1 min-w-0 w-full relative z-10 flex flex-col">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
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
            <button
              type="button"
              onClick={() => {
                db.setSessionRole('CASHIER');
                router.push('/scanner');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all"
              title="Verrouiller l'écran pour le caissier"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>Mode Caissier</span>
            </button>
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

        {/* Content Wrapper : Verrouillage strict si l'abonnement est expiré (sauf page de paiement) */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {isSubscriptionExpired && !isBillingPage ? (
            <div className="max-w-2xl mx-auto my-8 bg-slate-950 text-white rounded-[2.5rem] p-6 sm:p-10 border-2 border-red-500/70 shadow-2xl space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-black uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Abonnement Expiré — Dashboard Verrouillé</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Renouvelez votre abonnement pour débloquer votre Espace Commerçant
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
                  Votre période d&apos;essai de 14 jours ou votre abonnement mensuel pour{' '}
                  <strong className="text-white">{currentMerchant.business_name}</strong> est arrivé à échéance. Toutes
                  les fonctionnalités de gestion du Dashboard sont verrouillées jusqu&apos;à la validation de votre
                  paiement.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 sm:p-5 text-left space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Continuité Caisse & Clients Garantie (Mode En Attente)</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Aucun client perdu :</strong> Les nouveaux clients qui scannent votre affiche QR (
                      <code>/join/{currentMerchant.slug}</code>) reçoivent leur carte immédiatement.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Scans sauvegardés en attente :</strong> Les tampons et points scannés en caisse sont
                      enregistrés avec le statut <em>« En attente d&apos;activation »</em> et seront automatiquement
                      débloqués dès que votre paiement est validé.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/dashboard/billing"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Régler mon Abonnement (3 900 DZD) & Débloquer</span>
                </Link>
                <Link
                  href="/scanner"
                  className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Ouvrir le Scanner (Mode En Attente)</span>
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
        <SupportWidget
          defaultRole="MERCHANT"
          merchantName={currentMerchant.business_name}
          merchantPhone={currentMerchant.phone}
        />
      </main>
    </div>
  );
}
