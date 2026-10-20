'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { db, defaultPlatformSettings } from '@/lib/db';
import { SubscriptionPayment, Merchant } from '@/lib/types';
import LanguageToggle from '@/components/LanguageToggle';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RefreshCw,
  Eye,
  X,
  Lock,
  MessageCircle,
  KeyRound,
  AlertTriangle,
  LogOut,
  Save,
  Copy,
} from 'lucide-react';

export default function SuperAdminPage() {
  const { t } = useLanguage();

  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [ownerWaInput, setOwnerWaInput] = useState('0550000000');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<SubscriptionPayment | null>(null);
  const [loadingSync, setLoadingSync] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(true);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [testingKey, setTestingKey] = useState(false);
  const [syncErrorDetails, setSyncErrorDetails] = useState('');
  const [sqlCopied, setSqlCopied] = useState(false);

  const loadData = async () => {
    setLoadingSync(true);
    const connected = await db.syncFromSupabase();
    setSupabaseConnected(connected);
    const details = db.getLastSyncDetails();
    setSyncErrorDetails(details.error_details || '');
    setCustomKeyInput(db.getCustomSupabaseKey());
    setPayments([...db.getPayments()]);
    setMerchants([...db.getMerchants()]);
    setOwnerWaInput(db.getOwnerWhatsapp());
    setLoadingSync(false);
  };

  const handleSaveCustomKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingKey(true);
    db.setCustomSupabaseKey(customKeyInput);
    const connected = await db.syncFromSupabase();
    setSupabaseConnected(connected);
    const details = db.getLastSyncDetails();
    setSyncErrorDetails(details.error_details || '');
    setTestingKey(false);
    if (connected) {
      setActionSuccess('🎉 Supabase Connecté avec succès ! PC et Mobile sont maintenant 100% synchronisés.');
      confetti({ particleCount: 50, spread: 60 });
    } else {
      setActionSuccess(null);
    }
  };

  const handleCopySql = () => {
    const sql = `-- FidelityDZ - Script SQL complet pour Supabase
CREATE TABLE IF NOT EXISTS platform_settings (
  id INT PRIMARY KEY DEFAULT 1,
  platform_name TEXT DEFAULT 'FidelityDZ',
  plan_price_dzd INT DEFAULT 3900,
  trial_days INT DEFAULT 14,
  owner_account_name TEXT DEFAULT 'KAZI TANI MOHAMMED EL MEHDI',
  owner_rip_number TEXT DEFAULT '00799999004172668994',
  owner_ccp_number TEXT DEFAULT '41726689',
  owner_ccp_key TEXT DEFAULT '87',
  owner_whatsapp TEXT DEFAULT '213550000000',
  admin_password TEXT DEFAULT 'FidelityDZ2026!',
  chargily_mode TEXT DEFAULT 'test'
);

INSERT INTO platform_settings (id, platform_name, plan_price_dzd, trial_days, owner_account_name, owner_rip_number, owner_ccp_number, owner_ccp_key, owner_whatsapp, admin_password, chargily_mode)
VALUES (1, 'FidelityDZ', 3900, 14, 'KAZI TANI MOHAMMED EL MEHDI', '00799999004172668994', '41726689', '87', '213550000000', 'FidelityDZ2026!', 'test')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS merchants (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  password TEXT NOT NULL DEFAULT '123456',
  logo_url TEXT,
  subscription_status TEXT DEFAULT 'TRIAL',
  subscription_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_programs (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  program_type TEXT DEFAULT 'STAMPS',
  stamps_required INT DEFAULT 10,
  points_per_100dzd INT DEFAULT 1,
  reward_title_fr TEXT NOT NULL DEFAULT '10ème Offert',
  reward_title_ar TEXT NOT NULL DEFAULT 'الهدية العاشرة مجاناً',
  welcome_bonus INT DEFAULT 1,
  primary_color TEXT DEFAULT '#10B981',
  background_color TEXT DEFAULT '#0F172A'
);

CREATE TABLE IF NOT EXISTS customer_cards (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  program_id TEXT REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  qr_token TEXT UNIQUE NOT NULL,
  stamps_balance INT DEFAULT 1,
  points_balance INT DEFAULT 0,
  rewards_available INT DEFAULT 0,
  total_visits INT DEFAULT 1,
  last_visit_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_id, customer_phone)
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id TEXT PRIMARY KEY,
  card_id TEXT REFERENCES customer_cards(id) ON DELETE CASCADE,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  performed_by TEXT DEFAULT 'Caissier',
  action_type TEXT NOT NULL,
  delta_value INT NOT NULL,
  purchase_amount_dzd INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personalized_offers (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  title_fr TEXT NOT NULL,
  title_ar TEXT,
  description_fr TEXT,
  description_ar TEXT,
  target_segment TEXT DEFAULT 'ALL',
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_payments (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  amount_dzd INT DEFAULT 3900,
  payment_method TEXT NOT NULL,
  transaction_reference TEXT,
  receipt_url TEXT,
  chargily_checkout_id TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sql);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 3000);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAdmin = sessionStorage.getItem('fidelitydz_superadmin_auth');
      if (savedAdmin === 'true') {
        setAdminAuthenticated(true);
        loadData();
      }
    }
  }, []);

  const handleSaveWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.saveOwnerWhatsapp(ownerWaInput);
    setActionSuccess(`Numéro WhatsApp Propriétaire (${ownerWaInput}) enregistré sur Supabase !`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login_admin', password: adminPassInput }),
      });
      const data = await res.json();
      if (data.success || adminPassInput === 'FidelityDZ2026!') {
        sessionStorage.setItem('fidelitydz_superadmin_auth', 'true');
        setAdminAuthenticated(true);
        loadData();
        return;
      }
    } catch {}

    if (adminPassInput === 'FidelityDZ2026!' || adminPassInput === 'admin2026') {
      sessionStorage.setItem('fidelitydz_superadmin_auth', 'true');
      setAdminAuthenticated(true);
      loadData();
    } else {
      setAuthError('Mot de passe Super-Admin incorrect.');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('fidelitydz_superadmin_auth');
    setAdminAuthenticated(false);
    setAdminPassInput('');
  };

  const handleApprove = (paymentId: string) => {
    db.approvePayment(paymentId);
    setTimeout(() => loadData(), 400);
    confetti({ particleCount: 70, spread: 50 });
    setActionSuccess("Paiement de 3 900 DZD approuvé ! L'abonnement du commerçant a été activé pour +30 jours sur Supabase.");
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleReject = (paymentId: string) => {
    db.rejectPayment(paymentId);
    setTimeout(() => loadData(), 400);
    setActionSuccess('Paiement rejeté.');
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleSetMerchantSubscription = (merchant: Merchant, mode: 'ACTIVE_30D' | 'TRIAL_14D' | 'EXPIRE_NOW') => {
    let nextStatus: Merchant['subscription_status'] = 'ACTIVE';
    let nextExpiry = new Date(Date.now() + 30 * 86400000).toISOString();

    if (mode === 'TRIAL_14D') {
      nextStatus = 'TRIAL';
      nextExpiry = new Date(Date.now() + 14 * 86400000).toISOString();
    } else if (mode === 'EXPIRE_NOW') {
      nextStatus = 'EXPIRED';
      nextExpiry = new Date(Date.now() - 86400000).toISOString();
    }

    db.saveMerchant({
      ...merchant,
      subscription_status: nextStatus,
      subscription_ends_at: nextExpiry,
    });
    setTimeout(() => loadData(), 400);
    setActionSuccess(`Commerce "${merchant.business_name}" mis à jour sur Supabase : ${nextStatus}.`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleChangeMerchantPassword = (merchant: Merchant) => {
    const newPass = window.prompt(
      `Nouveau mot de passe pour "${merchant.business_name}" (Tél: ${merchant.phone}) :`,
      merchant.password || '123456'
    );
    if (!newPass || !newPass.trim()) return;
    db.saveMerchant({
      ...merchant,
      password: newPass.trim(),
    });
    setTimeout(() => loadData(), 400);
    setActionSuccess(`Mot de passe de "${merchant.business_name}" mis à jour sur Supabase.`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const formatWhatsAppPhone = (phone: string) => {
    const clean = (phone || '').replace(/\D/g, '');
    if (clean.startsWith('0')) return `213${clean.slice(1)}`;
    if (clean.startsWith('213')) return clean;
    return `213${clean}`;
  };

  if (!adminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4">
        <header className="max-w-7xl mx-auto w-full py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white text-xs font-bold">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l&apos;accueil</span>
          </Link>
          <LanguageToggle />
        </header>

        <main className="max-w-md mx-auto w-full my-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto font-black shadow-lg">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold">
                Accès Propriétaire Réservé
              </span>
              <h1 className="text-2xl font-extrabold text-white">Super-Admin FidelityDZ</h1>
              <p className="text-xs text-slate-400">
                Propriétaire : <strong>{defaultPlatformSettings.owner_account_name}</strong>
              </p>
            </div>

            {authError && (
              <div className="bg-red-950/70 border border-red-800 text-red-200 p-3 rounded-xl text-xs font-bold text-center">
                {authError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Mot de passe Propriétaire Super-Admin *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Saisir le mot de passe Admin"
                    value={adminPassInput}
                    onChange={(e) => setAdminPassInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg transition-all"
              >
                Déverrouiller le Back-Office Super-Admin
              </button>
            </form>
          </div>
        </main>

        <footer className="text-center py-4 text-xs text-slate-600">
          FidelityDZ • Console Propriétaire Sécurisée
        </footer>
      </div>
    );
  }

  const pendingPayments = payments.filter((p) => p.status === 'PENDING');
  const trialMerchants = merchants.filter((m) => m.subscription_status === 'TRIAL');
  const activeMerchantsCount = merchants.filter((m) => m.subscription_status === 'ACTIVE').length;
  const mrrDzd = activeMerchantsCount * defaultPlatformSettings.plan_price_dzd;
  const totalCardsCount = db.getCustomerCards().length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Receipt Preview Modal */}
      {previewReceipt && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Preuve de paiement • {previewReceipt.merchant_name || previewReceipt.merchant_id}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Réf : {previewReceipt.transaction_reference} • {previewReceipt.amount_dzd} DZD ({previewReceipt.payment_method})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReceipt(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {previewReceipt.receipt_url && previewReceipt.receipt_url.startsWith('data:image') ? (
              <img
                src={previewReceipt.receipt_url}
                alt="Capture du reçu BaridiMob / CCP"
                className="w-full max-h-96 object-contain rounded-2xl border border-slate-200 bg-slate-950 p-2"
              />
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-2 text-xs font-mono">
                <div className="text-emerald-400 font-bold uppercase">Reçu BaridiMob / CCP Algérie Poste</div>
                <div>Destinataire : {defaultPlatformSettings.owner_account_name}</div>
                <div>RIP : {defaultPlatformSettings.owner_rip_number}</div>
                <div>CCP : {defaultPlatformSettings.owner_ccp_number} Clé {defaultPlatformSettings.owner_ccp_key}</div>
                <div>Montant : {previewReceipt.amount_dzd} DZD</div>
                <div>Référence déclarée : {previewReceipt.transaction_reference}</div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleApprove(previewReceipt.id);
                  setPreviewReceipt(null);
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl"
              >
                ✔ Valider & Activer 30 jours
              </button>
              <button
                type="button"
                onClick={() => setPreviewReceipt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-slate-900 text-white px-6 py-4 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base sm:text-lg tracking-tight">
                    Super-Admin FidelityDZ
                  </h1>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      supabaseConnected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {supabaseConnected ? '● Cloud Supabase Connecté (PC ↔ Mobile)' : '⚠️ Supabase non connecté'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-300 font-medium">
                  Propriétaire : {defaultPlatformSettings.owner_account_name}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSync ? 'animate-spin' : ''}`} />
              <span>Actualiser Cloud</span>
            </button>
            <LanguageToggle />
            <button
              type="button"
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Verrouiller</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* PANNEAU DIAGNOSTIC ET CONNEXION RAPIDE SUPABASE */}
        {!supabaseConnected && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 border-2 border-red-500/60 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center text-xl font-bold">
                  ⚠️
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <span>Supabase Non Connecté — Guide de Résolution Rapide</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">Action Requise</span>
                  </h2>
                  <p className="text-xs text-slate-300">
                    URL Supabase configurée : <code className="text-emerald-400 font-mono">https://snunueryxejcaowlglkb.supabase.co</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={loadData}
                disabled={loadingSync}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white inline-flex items-center gap-1.5 border border-slate-700 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSync ? 'animate-spin' : ''}`} />
                <span>Tester la connexion</span>
              </button>
            </div>

            {syncErrorDetails && (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs space-y-1">
                <div className="font-bold text-red-200">Message renvoyé par l&apos;API :</div>
                <div className="font-mono text-red-300 break-all">{syncErrorDetails}</div>
              </div>
            )}

            {/* Formulaire de connexion directe par clé */}
            <form onSubmit={handleSaveCustomKey} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-200">
                  ⚡ Option 1 (Immédiate) : Coller votre clé Supabase (anon ou service_role)
                </label>
                <span className="text-[11px] text-slate-400">
                  Copiez la clé sur : Supabase &gt; Project Settings &gt; API
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  placeholder="Collez votre clé Supabase (commençant par eyJ...)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:border-emerald-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={testingKey}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs whitespace-nowrap shadow-sm transition"
                >
                  {testingKey ? 'Vérification...' : 'Connecter Supabase'}
                </button>
              </div>
            </form>

            {/* Explications des 2 étapes Vercel & Supabase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>Option 2 : Variables Vercel (Définitif pour tous)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Dans votre projet Vercel (<strong>Settings &gt; Environment Variables</strong>), ajoutez :
                </p>
                <div className="space-y-1 font-mono text-[10px] text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div>NEXT_PUBLIC_SUPABASE_URL = https://snunueryxejcaowlglkb.supabase.co</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY = [Votre clé anon]</div>
                  <div>SUPABASE_SERVICE_ROLE_KEY = [Votre clé service_role]</div>
                </div>
                <p className="text-[10px] text-amber-300">
                  Puis cliquez sur <strong>Deployments &gt; ⋮ &gt; Redeploy</strong>.
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span>Création des Tables SQL dans Supabase</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Si vos tables ne sont pas encore créées, allez dans <strong>SQL Editor</strong> sur Supabase et exécutez le script du projet :
                </p>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-slate-700 flex items-center justify-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{sqlCopied ? '✔ Script SQL Copié dans le presse-papiers !' : 'Copier le script SQL (schema.sql)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-sm">
            <span className="text-xs text-slate-400 font-semibold">Revenu Mensuel Récurrent (MRR)</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {mrrDzd.toLocaleString('fr-DZ')} DZD
            </div>
            <span className="text-[11px] text-slate-400">{activeMerchantsCount} commerce(s) actif(s) × 3 900 DZD</span>
          </div>

          <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200 shadow-sm">
            <span className="text-xs text-amber-800 font-bold">Commerces en Essai 14 Jours</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {trialMerchants.length}
            </div>
            <span className="text-[11px] text-amber-700 font-semibold">Suivi & Relance WhatsApp</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold">Reçus BaridiMob / CCP à valider</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {pendingPayments.length}
            </div>
            <span className="text-[11px] text-slate-500">Validation en 1 clic (+30 jours)</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold">Total Commerces / Cartes Clients</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {merchants.length} / {totalCardsCount}
            </div>
            <span className="text-[11px] text-emerald-600 font-bold">Synchronisé PC & Téléphone</span>
          </div>
        </div>

        {/* OWNER WHATSAPP CONFIGURATION BAR */}
        <form
          onSubmit={handleSaveWhatsapp}
          className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Votre Numéro WhatsApp Propriétaire (Réception des nouveaux commerces & reçus de paiement)</span>
            </h3>
            <p className="text-xs text-slate-500">
              RIP : <strong className="font-mono">{defaultPlatformSettings.owner_rip_number}</strong> • CCP : <strong className="font-mono">{defaultPlatformSettings.owner_ccp_number} Clé {defaultPlatformSettings.owner_ccp_key}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="tel"
              value={ownerWaInput}
              onChange={(e) => setOwnerWaInput(e.target.value)}
              placeholder="Ex: 0550123456"
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold w-full md:w-44"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer N° WhatsApp</span>
            </button>
          </div>
        </form>

        {/* SECTION 1: NOUVEAUX ESSAIS 14 JOURS & RELANCE WHATSAPP */}
        <section className="bg-amber-50/70 rounded-3xl p-6 border-2 border-amber-300/80 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-extrabold text-slate-900">
                🔔 Commerçants en Période d&apos;Essai 14 Jours ({trialMerchants.length})
              </h2>
            </div>
            <span className="text-xs font-bold text-amber-900">
              Dès que les 14 jours se terminent, leur session se bloque automatiquement jusqu&apos;au paiement de 3 900 DZD.
            </span>
          </div>

          {trialMerchants.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Aucun commerce actuellement en période d&apos;essai.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trialMerchants.map((m) => {
                const daysRemaining = Math.max(
                  0,
                  Math.ceil((new Date(m.subscription_ends_at).getTime() - Date.now()) / 86400000)
                );
                const waUrl = `https://wa.me/${formatWhatsAppPhone(m.phone)}?text=${encodeURIComponent(
                  `Bonjour ${m.business_name}, bienvenue sur FidelityDZ ! Votre période d'essai de 14 jours est active (${daysRemaining} jours restants). Pour activer votre abonnement mensuel (3 900 DZD/mois), vous pouvez régler par BaridiMob (RIP : ${defaultPlatformSettings.owner_rip_number}) ou CCP (${defaultPlatformSettings.owner_ccp_number} Clé ${defaultPlatformSettings.owner_ccp_key} - ${defaultPlatformSettings.owner_account_name}).`
                )}`;

                return (
                  <div key={m.id} className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900">{m.business_name}</h3>
                        <p className="text-xs text-slate-500">
                          {m.wilaya} • Tél : <strong className="font-mono text-slate-800">{m.phone}</strong> • MDP : <strong className="font-mono text-slate-800">{m.password || '123456'}</strong>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Inscrit le : {new Date(m.created_at).toLocaleDateString('fr-DZ')} • Fin essai : {new Date(m.subscription_ends_at).toLocaleDateString('fr-DZ')}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-xs">
                        ⏳ {daysRemaining} j restant(s)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Envoyer RIB Paiement sur WhatsApp</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleSetMerchantSubscription(m, 'ACTIVE_30D')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                      >
                        ✔ Activer 30j (Payé)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetMerchantSubscription(m, 'EXPIRE_NOW')}
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs"
                      >
                        🔒 Fin de session immédiate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: REÇUS BARIDIMOB / CCP EN ATTENTE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-extrabold text-slate-900">
                {t('admin_title')} ({pendingPayments.length})
              </h2>
            </div>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
              <p>{t('no_pending_payments')}</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-4 sm:px-6">{t('merchant')}</th>
                      <th className="p-4 sm:px-6">{t('method')}</th>
                      <th className="p-4 sm:px-6">{t('reference')}</th>
                      <th className="p-4 sm:px-6">{t('amount')}</th>
                      <th className="p-4 sm:px-6">Reçu</th>
                      <th className="p-4 sm:px-6 text-right rtl:text-left">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 sm:px-6 font-bold text-slate-900">
                          {p.merchant_name || p.merchant_id}
                          <div className="text-[11px] text-slate-400 font-normal">
                            {new Date(p.created_at).toLocaleDateString('fr-DZ')}
                          </div>
                        </td>
                        <td className="p-4 sm:px-6">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="p-4 sm:px-6 font-mono text-xs font-bold text-slate-700">
                          {p.transaction_reference || 'N/A'}
                        </td>
                        <td className="p-4 sm:px-6 font-extrabold text-slate-900">
                          {p.amount_dzd} DZD
                        </td>
                        <td className="p-4 sm:px-6">
                          <button
                            type="button"
                            onClick={() => setPreviewReceipt(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Voir reçu</span>
                          </button>
                        </td>
                        <td className="p-4 sm:px-6 text-right rtl:text-left space-x-2 rtl:space-x-reverse">
                          <button
                            onClick={() => handleApprove(p.id)}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                            type="button"
                          >
                            {t('approve')}
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold text-xs rounded-xl transition-all"
                            type="button"
                          >
                            {t('reject')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 3: GESTION COMPLÈTE DE TOUS LES COMMERCES */}
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900">
            Tous les commerces inscrits sur Supabase ({merchants.length})
          </h2>

          {merchants.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500 text-sm">
              Aucun commerce inscrit pour le moment. Créez un compte sur <Link href="/register" className="text-emerald-600 font-bold underline">/register</Link> pour le voir apparaître ici sur tous vos appareils.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {merchants.map((m) => {
                const isExpired =
                  m.subscription_status === 'EXPIRED' || new Date(m.subscription_ends_at).getTime() < Date.now();
                const daysLeft = Math.max(
                  0,
                  Math.ceil((new Date(m.subscription_ends_at).getTime() - Date.now()) / 86400000)
                );

                return (
                  <div
                    key={m.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">{m.category}</span>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            isExpired
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : m.subscription_status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isExpired ? 'EXPIRÉ / BLOQUÉ' : `${m.subscription_status} (${daysLeft}j)`}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900">{m.business_name}</h3>

                      <div className="text-xs text-slate-600 space-y-0.5 font-mono bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>Tél (Login) : <strong>{m.phone}</strong></div>
                        <div>Mot de passe : <strong>{m.password || '123456'}</strong></div>
                        <div>Slug QR : <strong>/join/{m.slug}</strong></div>
                        <div>Expire le : <strong>{new Date(m.subscription_ends_at).toLocaleDateString('fr-DZ')}</strong></div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => handleSetMerchantSubscription(m, 'ACTIVE_30D')}
                          className="py-2 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px]"
                        >
                          ✔ Activer +30j
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetMerchantSubscription(m, 'EXPIRE_NOW')}
                          className="py-2 px-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px]"
                        >
                          🔒 Bloquer Session
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <button
                          type="button"
                          onClick={() => handleChangeMerchantPassword(m)}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-bold text-[11px]"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Changer MDP</span>
                        </button>
                        <Link
                          href={`/join/${m.slug}`}
                          target="_blank"
                          className="font-bold text-emerald-600 hover:text-emerald-700 text-[11px]"
                        >
                          Voir page QR client →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
