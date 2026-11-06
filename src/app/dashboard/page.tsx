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
  Gift,
  AlertTriangle,
  Bell,
  Store,
  Smartphone,
  PlusCircle,
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

  const maxCards = Number(currentMerchant?.max_cards || 100);
  const maxPush = Number(currentMerchant?.max_push_per_week || 100);
  const pushSent = Number(currentMerchant?.push_sent_this_week || 0);
  const maxOffers = Number(currentMerchant?.max_active_offers || 3);
  const maxUsers = Number(currentMerchant?.max_users || 2);
  const maxLocations = Number(currentMerchant?.max_locations || 1);

  const activeDevicesCount = Math.max(
    1,
    String(currentMerchant?.active_device_ids || '')
      .split(',')
      .filter(Boolean).length
  );

  const allOffersCount = db.getOffers(currentMerchant?.id).length;
  const activeOffersCount = db.getOffers(currentMerchant?.id).filter((o) => o.is_active).length;

  const cardsRemaining = Math.max(0, maxCards - cards.length);
  const queuedBlockedCardsCount = Math.max(0, cards.length - maxCards);
  const pushRemaining = Math.max(0, maxPush - pushSent);
  const offersRemaining = Math.max(0, maxOffers - allOffersCount);
  const usersRemaining = Math.max(0, maxUsers - activeDevicesCount);

  const isCardsNearLimit = cards.length >= Math.floor(maxCards * 0.8) && cards.length < maxCards;
  const isCardsExceeded = cards.length >= maxCards;
  const isPushNearLimit = pushSent >= Math.floor(maxPush * 0.8) && pushSent < maxPush;
  const isPushExceeded = pushSent >= maxPush;
  const isOffersExceeded = allOffersCount >= maxOffers;

  const totalVisits = cards.reduce((acc, c) => acc + c.total_visits, 0);
  const totalRewardsClaimed = transactions.filter((tx) => tx.action_type === 'REDEEM_REWARD').length;

  const joinUrl = `${getPublicOrigin()}/join/${currentMerchant?.slug || 'el-bahdja'}`;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ALERTES AUTOMATIQUES DE QUOTAS (80% PROCHE OU 100% ATTEINT) */}
      {(isCardsNearLimit || isCardsExceeded || isPushNearLimit || isPushExceeded || isOffersExceeded) && (
        <div
          className={`p-5 rounded-3xl border-2 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isCardsExceeded || isPushExceeded
              ? 'bg-red-50 border-red-300 text-red-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                isCardsExceeded || isPushExceeded ? 'text-red-600' : 'text-amber-600'
              }`}
            />
            <div className="space-y-1 text-xs sm:text-sm">
              <p className="font-extrabold">
                {isCardsExceeded
                  ? `⚠️ Limite de ${maxCards} cartes clients atteinte (${queuedBlockedCardsCount} client(s) en file d'attente bloquée) !`
                  : isCardsNearLimit
                  ? `🔔 Attention : Il ne vous reste plus que ${cardsRemaining} carte(s) disponible(s) sur ${maxCards} !`
                  : isPushExceeded
                  ? `⚠️ Limite de ${maxPush} notifications Push atteinte cette semaine !`
                  : isPushNearLimit
                  ? `🔔 Attention : Il ne vous reste plus que ${pushRemaining} notification(s) Push cette semaine.`
                  : `🔔 Vous avez utilisé vos ${maxOffers}/${maxOffers} emplacements d'offres promotionnelles.`}
              </p>
              <p className="text-xs opacity-90">
                {isCardsExceeded
                  ? 'Les nouveaux clients qui scannent votre QR code sont mis en attente. Dès que vous augmentez votre quota, leurs cartes se débloquent automatiquement !'
                  : 'Anticipez dès maintenant et commandez une extension de quota pour ne bloquer aucun nouveau client.'}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/billing#quotas"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs whitespace-nowrap shadow-md"
          >
            + Acheter plus de Quotas
          </Link>
        </div>
      )}

      {/* BARRE COMPLÈTE DES 5 QUOTAS EN TEMPS RÉEL */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>État de vos Quotas & Capacités en temps réel</span>
            </h3>
            <p className="text-xs text-slate-500">
              Suivez ce qu&apos;il vous reste sur votre forfait et ajoutez des extensions sans aucune limite maximale.
            </p>
          </div>
          <Link
            href="/dashboard/billing#quotas"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Augmenter mes Quotas / Ajouter un Local</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Quota 1: Cartes */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>Cartes Clients</span>
              <Users className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-black text-slate-900">
              {Math.min(cards.length, maxCards)} <span className="text-xs font-semibold text-slate-400">/ {maxCards}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isCardsExceeded ? 'bg-red-500' : isCardsNearLimit ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (cards.length / Math.max(1, maxCards)) * 100)}%` }}
              />
            </div>
            <p className={`text-[10px] font-bold ${isCardsExceeded ? 'text-red-600' : 'text-emerald-700'}`}>
              {isCardsExceeded
                ? `0 restante (${queuedBlockedCardsCount} en attente)`
                : `${cardsRemaining} carte(s) restante(s)`}
            </p>
          </div>

          {/* Quota 2: Push */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>Push / Semaine</span>
              <Bell className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-lg font-black text-slate-900">
              {pushSent} <span className="text-xs font-semibold text-slate-400">/ {maxPush}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isPushExceeded ? 'bg-red-500' : isPushNearLimit ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, (pushSent / Math.max(1, maxPush)) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] font-bold text-blue-700">{pushRemaining} push restants</p>
          </div>

          {/* Quota 3: Offres */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>Offres Ciblées</span>
              <Tag className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-lg font-black text-slate-900">
              {allOffersCount} <span className="text-xs font-semibold text-slate-400">/ {maxOffers}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isOffersExceeded ? 'bg-amber-500' : 'bg-purple-500'}`}
                style={{ width: `${Math.min(100, (allOffersCount / Math.max(1, maxOffers)) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] font-bold text-purple-700">{offersRemaining} offre(s) restante(s)</p>
          </div>

          {/* Quota 4: Appareils / Users */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>Appareils (Users)</span>
              <Smartphone className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-lg font-black text-slate-900">
              {activeDevicesCount} <span className="text-xs font-semibold text-slate-400">/ {maxUsers}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${Math.min(100, (activeDevicesCount / Math.max(1, maxUsers)) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] font-bold text-amber-800">{usersRemaining} accès dispo</p>
          </div>

          {/* Quota 5: Locaux / Points de vente */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>Points de Vente</span>
              <Store className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-black text-slate-900">
              1 <span className="text-xs font-semibold text-slate-400">/ {maxLocations}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-emerald-600" style={{ width: '100%' }} />
            </div>
            <Link href="/dashboard/billing#quotas" className="text-[10px] font-bold text-emerald-700 hover:underline block">
              + Ajouter un 2ème local
            </Link>
          </div>
        </div>
      </div>

      {/* Top Banner / Welcome */}
      <div className="bg-slate-950 text-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden border border-slate-800/60">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Algérie • Programme {program?.program_type === 'STAMPS' ? 'Tampons' : 'Points'} Actif</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isAr ? `أهلاً بك في متجر ${currentMerchant?.business_name}` : `Bienvenue, ${currentMerchant?.business_name}`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Gérez votre programme de fidélité, vos locaux et suivez vos visites en temps réel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10 w-full sm:w-auto">
          <Link
            href="/scanner"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all"
          >
            <QrCode className="w-6 h-6" />
            <span>{t('open_scanner')}</span>
          </Link>
          <Link
            href="/dashboard/poster"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-sm rounded-2xl transition-all"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Affiche PDF</span>
          </Link>
        </div>
      </div>

      {/* 4 KPIs CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">{t('kpi_total_customers')}</span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{cards.length}</div>
          <p className="text-xs font-bold text-emerald-700">
            Reste : {cardsRemaining} carte(s) sur {maxCards}
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">{t('kpi_total_visits')}</span>
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalVisits}</div>
          <p className="text-xs font-bold text-blue-700">
            Push restants : {pushRemaining} / {maxPush}
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">{t('kpi_rewards_unlocked')}</span>
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalRewardsClaimed}</div>
          <p className="text-xs font-bold text-amber-700 truncate">{program?.reward_title_fr}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">{t('kpi_active_offers')}</span>
            <Tag className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{activeOffersCount}</div>
          <p className="text-xs font-bold text-purple-700">
            Reste : {offersRemaining} offre(s) sur {maxOffers}
          </p>
        </div>
      </div>

      {/* QR Code & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
          <h3 className="text-lg font-extrabold text-slate-900">{t('quick_qr_title')}</h3>
          <p className="text-xs text-slate-600">{t('quick_qr_desc')}</p>
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
              <QRCodeSVG value={joinUrl} size={150} level="M" />
            </div>
            <p className="mt-3 text-xs font-mono text-slate-700 font-bold break-all text-center">{joinUrl}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              type="button"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? t('copied') : t('copy_link')}</span>
            </button>
            <Link
              href="/dashboard/poster"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>{t('download_poster_cta')}</span>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900">{t('recent_activity')}</h3>
            <Link href="/dashboard/customers" className="text-xs font-bold text-emerald-700 hover:underline">
              Voir les clients →
            </Link>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Aucune transaction enregistrée pour le moment.
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 6).map((tx) => {
                const cardObj = cards.find((c) => c.id === tx.card_id);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        {tx.action_type === 'REDEEM_REWARD' ? <Gift className="w-4 h-4" /> : '+'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {cardObj?.customer_name || 'Client'} ({cardObj?.customer_phone || ''})
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {tx.action_type === 'REDEEM_REWARD'
                            ? 'Récompense remise en caisse'
                            : `+${tx.delta_value} tampon(s)/points`}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(tx.created_at).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
