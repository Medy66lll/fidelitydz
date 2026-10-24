'use client';

import { getPublicOrigin } from '@/lib/url';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import { db } from '@/lib/db';
import { CustomerCard, LoyaltyTransaction } from '@/lib/types';
import { QRCodeSVG } from 'qrcode.react';
import {
  Users,
  Eye,
  Trophy,
  Tag,
  QrCode,
  Copy,
  Printer,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Gift
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { t, language } = useLanguage();
  const { currentMerchant, program } = useMerchant();
  const isAr = language === 'ar';

  const [cards, setCards] = useState<CustomerCard[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (currentMerchant) {
      setCards(db.getCustomerCards(currentMerchant.id));
      setTransactions(db.getTransactions(currentMerchant.id));
    }
  }, [currentMerchant]);

  const totalVisits = cards.reduce((acc, c) => acc + c.total_visits, 0);
  const totalRewardsClaimed = transactions.filter(t => t.action_type === 'REDEEM_REWARD').length + 3; // + sample baseline
  const activeOffersCount = db.getOffers(currentMerchant?.id).filter(o => o.is_active).length;

  const joinUrl = `${getPublicOrigin()}/join/${currentMerchant?.slug || 'el-bahdja'}`;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-slate-800">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Algérie • Programme {program?.program_type === 'STAMPS' ? 'Tampons' : 'Points'} Actif</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isAr ? `أهلاً بك في متجر ${currentMerchant?.business_name}` : `Bienvenue, ${currentMerchant?.business_name}`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {isAr
              ? 'تابع نمو قاعدة زبائنك والزيارات اليومية. كل زبون يسجل برقم هاتفه يضاف فوراً إلى قائمتك.'
              : 'Gérez votre programme de fidélité, suivez vos visites en temps réel et récompensez vos meilleurs clients.'}
          </p>
        </div>

        {/* Quick Cashier Button */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full sm:w-auto">
          <Link
            href="/scanner"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
          >
            <QrCode className="w-5 h-5" />
            <span>{t('open_scanner')}</span>
          </Link>
          <Link
            href="/dashboard/poster"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition-all"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Affiche PDF</span>
          </Link>
        </div>
      </div>

      {/* 4 KPIs CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('kpi_total_customers')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {cards.length}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12% cette semaine</span>
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('kpi_total_visits')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {totalVisits}
          </div>
          <p className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
            <span>Passages en caisse validés</span>
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('kpi_rewards_unlocked')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {totalRewardsClaimed}
          </div>
          <p className="text-[11px] text-amber-600 font-semibold">
            {program?.reward_title_fr}
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('kpi_active_offers')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {activeOffersCount}
          </div>
          <p className="text-[11px] text-purple-600 font-semibold">
            Segments ALL, VIP & Inactifs
          </p>
        </div>
      </div>

      {/* MIDDLE SECTION: QUICK JOIN LINK & RECENT TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Quick Join QR & Link Box */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isAr ? 'رمز الكاونتر للانضمام' : 'QR Code Client de Comptoir'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr ? 'يمسحه الزبون بهاتفه للتسجيل فوراً' : 'Scanné par les clients pour ouvrir leur carte'}
              </p>
            </div>
            <Link
              href="/dashboard/poster"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Affiche PDF</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* QR Box Élégant */}
          <div className="relative group overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100/50 p-8 rounded-[2rem] border border-slate-200 shadow-[inset_0_2px_10px_rgba(255,255,255,0.7)] flex flex-col items-center text-center">
            
            {/* Lueur d'arrière-plan douce */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/40 via-transparent to-blue-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative z-10 bg-white p-5 rounded-[1.75rem] shadow-xl shadow-slate-200/50 border border-slate-100 transition-transform duration-500 group-hover:scale-[1.02]">
              <QRCodeSVG 
                value={joinUrl} 
                size={160} 
                level="Q" 
                includeMargin={false}
                fgColor="#0F172A"
                className="drop-shadow-sm"
              />
              
              {/* Petit logo ou icône au centre (Optionnel, design épuré) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1.5 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-1.5 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/50 text-slate-700 text-[11px] font-black uppercase tracking-widest">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                {currentMerchant?.slug}
              </div>
              <p className="text-[10px] text-slate-400 font-mono break-all max-w-[220px] mx-auto opacity-70 group-hover:opacity-100 transition-opacity">
                {joinUrl}
              </p>
            </div>
          </div>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            type="button"
          >
            <Copy className="w-4 h-4 text-emerald-400" />
            <span>{copiedLink ? t('link_copied') : t('copy_join_link')}</span>
          </button>
        </div>

        {/* Right: Recent Customer Transactions */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {t('recent_transactions')}
              </h3>
              <p className="text-xs text-slate-500">
                Historique des scans et validations en caisse
              </p>
            </div>
            <Link
              href="/dashboard/customers"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Voir tous les clients →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Valeur</th>
                  <th className="pb-3 text-right rtl:text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cards.slice(0, 5).map((card, i) => (
                  <tr key={card.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-slate-900">
                      <div>
                        <p>{card.customer_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{card.customer_phone}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      {card.rewards_available > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <Gift className="w-3 h-3" />
                          Cadeau prêt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Passage validé
                        </span>
                      )}
                    </td>
                    <td className="py-3 font-semibold text-slate-700">
                      {card.stamps_balance} tampons ({card.points_balance} pts)
                    </td>
                    <td className="py-3 text-slate-400 text-right rtl:text-left font-mono text-[11px]">
                      {new Date(card.last_visit_at).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
