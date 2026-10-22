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
  XCircle,
  Clock,
  ArrowLeft,
  Building2,
  Store,
  Calendar,
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';

export default function SuperAdminPage() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = () => {
    setPayments([...db.getPayments()]);
    setMerchants([...db.getMerchants()]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (paymentId: string) => {
    db.approvePayment(paymentId);
    loadData();
    confetti({ particleCount: 70, spread: 50 });
    setActionSuccess('Paiement approuvé ! L\'abonnement du commerçant a été prolongé de 30 jours.');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleReject = (paymentId: string) => {
    db.rejectPayment(paymentId);
    loadData();
    setActionSuccess('Paiement rejeté.');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const pendingPayments = payments.filter((p) => p.status === 'PENDING');
  const pastPayments = payments.filter((p) => p.status !== 'PENDING');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Top Header */}
      <header className="bg-slate-900 text-white px-6 py-4 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Super Admin FidelityDZ
                </h1>
                <p className="text-[11px] text-amber-300 font-medium">
                  File de vérification BaridiMob & CCP
                </p>
              </div>
            </div>
          </div>

          <LanguageToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Platform Settings Summary Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Paramètres officiels de la plateforme
            </h3>
            <p className="text-xs text-slate-500">
              Titulaire : <strong className="text-slate-800">{defaultPlatformSettings.owner_account_name}</strong> • RIP : <strong className="text-slate-800">{defaultPlatformSettings.owner_rip_number}</strong> • CCP : <strong className="text-slate-800">{defaultPlatformSettings.owner_ccp_number} Clé {defaultPlatformSettings.owner_ccp_key}</strong>
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            Tarif unique : 3 900 DZD
          </span>
        </div>

        {/* PENDING PAYMENTS SECTION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-extrabold text-slate-900">
                {t('admin_title')} ({pendingPayments.length})
              </h2>
            </div>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm"
              type="button"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualiser</span>
            </button>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
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
                      <th className="p-4 sm:px-6">{t('date')}</th>
                      <th className="p-4 sm:px-6 text-right rtl:text-left">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 sm:px-6 font-bold text-slate-900">
                          {p.merchant_name || p.merchant_id}
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
                        <td className="p-4 sm:px-6 text-xs text-slate-500">
                          {new Date(p.created_at).toLocaleDateString('fr-DZ')}
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

        {/* ALL REGISTERED MERCHANTS */}
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900">
            Tous les commerces inscrits ({merchants.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {merchants.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">{m.category}</span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      m.subscription_status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {m.subscription_status}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {m.business_name}
                </h3>
                <p className="text-xs text-slate-600">
                  Wilaya : {m.wilaya} • Tél : <span className="font-mono">{m.phone}</span>
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Slug : /{m.slug}</span>
                  <Link
                    href={`/join/${m.slug}`}
                    target="_blank"
                    className="font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Ouvrir page client →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
