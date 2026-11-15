'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import { db } from '@/lib/db';
import { getPublicOrigin } from '@/lib/url';
import { CustomerCard } from '@/lib/types';
import {
  Users,
  Search,
  ExternalLink,
  Gift,
  Download,
  MessageCircle,
  Clock,
  Sparkles,
  Cake,
} from 'lucide-react';

export default function CustomersPage() {
  const { t, language } = useLanguage();
  const { currentMerchant, program } = useMerchant();
  const isAr = language === 'ar';

  const [cards, setCards] = useState<CustomerCard[]>([]);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'ALL' | 'INACTIVE_30D' | 'VIP' | 'REWARD_READY'>('ALL');

  useEffect(() => {
    if (currentMerchant) {
      setCards(db.getCustomerCards(currentMerchant.id));
    }
  }, [currentMerchant]);

  const maxCards = Number(currentMerchant?.max_cards || 100);
  const sortedByCreation = [...cards].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const blockedCardIds = new Set(sortedByCreation.slice(maxCards).map((c) => c.id));

  const getDaysInactive = (card: CustomerCard) => {
    return Math.floor((Date.now() - new Date(card.last_visit_at).getTime()) / (1000 * 3600 * 24));
  };

  const inactiveCount = cards.filter((c) => getDaysInactive(c) >= 30).length;
  const vipCount = cards.filter((c) => c.total_visits >= 5).length;
  const rewardReadyCount = cards.filter(
    (c) => c.rewards_available > 0 || (program && c.stamps_balance >= program.stamps_required)
  ).length;

  const filtered = cards.filter((c) => {
    const matchesSearch =
      c.customer_name.toLowerCase().includes(search.toLowerCase()) || c.customer_phone.includes(search);
    if (!matchesSearch) return false;
    if (segmentFilter === 'INACTIVE_30D') return getDaysInactive(c) >= 30;
    if (segmentFilter === 'VIP') return c.total_visits >= 5;
    if (segmentFilter === 'REWARD_READY') {
      return c.rewards_available > 0 || Boolean(program && c.stamps_balance >= program.stamps_required);
    }
    return true;
  });

  // Formatage du numéro 05/06/07 vers format international WhatsApp 213...
  const toWhatsAppPhone = (phone: string) => {
    const digits = (phone || '').replace(/\D/g, '');
    if (digits.startsWith('0')) return `213${digits.slice(1)}`;
    if (digits.startsWith('213')) return digits;
    return `213${digits}`;
  };

  const getInactiveWhatsAppUrl = (card: CustomerCard) => {
    const cardUrl = `${getPublicOrigin()}/card/${card.qr_token}`;
    const storeName = currentMerchant?.business_name || 'notre établissement';
    const msg = `Bonjour ${card.customer_name} 👋 !\n\nCela fait un petit moment qu'on ne vous a pas vu chez *${storeName}*. Pour votre prochain passage cette semaine, présentez votre carte digitale en caisse pour profiter de vos avantages fidélité !\n\n📲 Votre carte VIP (${card.stamps_balance}/${program?.stamps_required || 10} tampons) :\n${cardUrl}`;
    return `https://wa.me/${toWhatsAppPhone(card.customer_phone)}?text=${encodeURIComponent(msg)}`;
  };

  const getBirthdayWhatsAppUrl = (card: CustomerCard) => {
    const cardUrl = `${getPublicOrigin()}/card/${card.qr_token}`;
    const storeName = currentMerchant?.business_name || 'notre établissement';
    const msg = `🎉 Joyeux Anniversaire / Bonne Fête ${card.customer_name} ! 🎂\n\nToute l'équipe de *${storeName}* vous souhaite le meilleur et vous réserve une surprise fidélité lors de votre prochain passage en boutique !\n\n🎁 Ouvrir ma carte de fidélité :\n${cardUrl}`;
    return `https://wa.me/${toWhatsAppPhone(card.customer_phone)}?text=${encodeURIComponent(msg)}`;
  };

  const getRewardReadyWhatsAppUrl = (card: CustomerCard) => {
    const cardUrl = `${getPublicOrigin()}/card/${card.qr_token}`;
    const storeName = currentMerchant?.business_name || 'notre établissement';
    const rewardTitle = program?.reward_title_fr || 'votre cadeau fidélité';
    const msg = `🎁 Félicitations ${card.customer_name} !\n\nVotre récompense (*${rewardTitle}*) est débloquée et vous attend chez *${storeName}* ! Présentez simplement votre QR code en caisse :\n${cardUrl}`;
    return `https://wa.me/${toWhatsAppPhone(card.customer_phone)}?text=${encodeURIComponent(msg)}`;
  };

  // Export Excel / CSV (UTF-8 avec BOM pour ouverture directe dans Microsoft Excel en français et arabe)
  const handleExportCsv = () => {
    if (!currentMerchant) return;
    const headers = [
      'Prenom Client',
      'Telephone',
      'Tampons',
      'Objectif Tampons',
      'Points',
      'Recompenses Disponibles',
      'Total Visites',
      'Jours Sans Visite',
      'Segment',
      'Statut Quota',
      'Derniere Visite',
      'Date Inscription',
      'Lien Carte QR',
    ];

    const escapeCsv = (val: string | number) => {
      const s = String(val ?? '').replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = cards.map((c) => {
      const daysInact = getDaysInactive(c);
      const isVip = c.total_visits >= 5;
      const segment = daysInact >= 30 ? 'Inactif +30j' : isVip ? 'Client VIP' : 'Actif';
      const quotaStatus = blockedCardIds.has(c.id) ? 'En attente Quota' : 'Active';
      const cardUrl = `${getPublicOrigin()}/card/${c.qr_token}`;
      return [
        escapeCsv(c.customer_name),
        escapeCsv(c.customer_phone),
        c.stamps_balance,
        program?.stamps_required || 10,
        c.points_balance,
        c.rewards_available,
        c.total_visits,
        daysInact,
        escapeCsv(segment),
        escapeCsv(quotaStatus),
        escapeCsv(new Date(c.last_visit_at).toLocaleDateString('fr-DZ')),
        escapeCsv(new Date(c.created_at).toLocaleDateString('fr-DZ')),
        escapeCsv(cardUrl),
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Clients_${currentMerchant.slug}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('nav_customers')}
          </h2>
          <p className="text-sm text-slate-600">
            Base de données de vos clients fidélisés, relances WhatsApp en 1 clic et export Excel/CSV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl shadow-sm">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>{cards.length} clients inscrits</span>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={cards.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm transition disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exporter Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Filtres Rapides de Segmentation (Tous / Inactifs +30j / VIP / Cadeau Prêt) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSegmentFilter('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
            segmentFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tous les clients ({cards.length})
        </button>
        <button
          type="button"
          onClick={() => setSegmentFilter('INACTIVE_30D')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
            segmentFilter === 'INACTIVE_30D'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>💤 Inactifs +30 jours ({inactiveCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setSegmentFilter('VIP')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
            segmentFilter === 'VIP'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>⭐ Clients VIP ({vipCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setSegmentFilter('REWARD_READY')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
            segmentFilter === 'REWARD_READY'
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-purple-50'
          }`}
        >
          <Gift className="w-3.5 h-3.5 text-purple-500" />
          <span>🎁 Cadeau Prêt ({rewardReadyCount})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)]">
        <div className="relative group">
          <Search className="w-5 h-5 absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            aria-label="Rechercher par numéro ou prénom"
            type="text"
            placeholder={isAr ? 'ابحث برقم الهاتف أو اسم الزبون...' : 'Rechercher par numéro 05/06/07 ou prénom...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 rtl:pl-4 rtl:pr-12 text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="p-4 sm:px-6">Client</th>
                <th className="p-4 sm:px-6">Téléphone</th>
                <th className="p-4 sm:px-6">Solde Tampons</th>
                <th className="p-4 sm:px-6">Points</th>
                <th className="p-4 sm:px-6">Visites</th>
                <th className="p-4 sm:px-6">Dernière Visite</th>
                <th className="p-4 sm:px-6">Relances WhatsApp 1-Clic</th>
                <th className="p-4 sm:px-6 text-right rtl:text-left">Carte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((card) => {
                const hasReward =
                  card.rewards_available > 0 || (program && card.stamps_balance >= program.stamps_required);
                const daysInact = getDaysInactive(card);
                const isInactive30d = daysInact >= 30;
                return (
                  <tr key={card.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 sm:px-6 font-bold text-slate-900">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span>{card.customer_name}</span>
                        {blockedCardIds.has(card.id) && (
                          <span className="text-[10px] font-black uppercase text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                            🔒 En attente (Quota {maxCards})
                          </span>
                        )}
                        {card.total_visits >= 5 && !blockedCardIds.has(card.id) && (
                          <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            VIP
                          </span>
                        )}
                        {isInactive30d && (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            💤 {daysInact}j
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 sm:px-6 font-mono text-xs text-slate-600">{card.customer_phone}</td>
                    <td className="p-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">
                          {card.stamps_balance} / {program?.stamps_required || 10}
                        </span>
                        {hasReward && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            <Gift className="w-3 h-3" />
                            Cadeau !
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 sm:px-6 font-semibold text-slate-700">{card.points_balance} pts</td>
                    <td className="p-4 sm:px-6 font-semibold text-slate-700">{card.total_visits}</td>
                    <td className="p-4 sm:px-6 text-xs text-slate-500 font-mono">
                      {new Date(card.last_visit_at).toLocaleDateString('fr-DZ')}
                    </td>
                    <td className="p-4 sm:px-6">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <a
                          href={getInactiveWhatsAppUrl(card)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition"
                          title="Relancer ce client sur WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isInactive30d ? 'Relancer (+30j)' : 'WhatsApp'}</span>
                        </a>
                        <a
                          href={getBirthdayWhatsAppUrl(card)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold transition"
                          title="Envoyer une offre Anniversaire / Fête sur WhatsApp"
                        >
                          <Cake className="w-3.5 h-3.5 text-amber-600" />
                          <span>Anniv / Fête</span>
                        </a>
                        {hasReward && (
                          <a
                            href={getRewardReadyWhatsAppUrl(card)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-[11px] font-bold transition"
                            title="Prévenir le client que son cadeau est prêt"
                          >
                            <Gift className="w-3.5 h-3.5 text-purple-600" />
                            <span>Cadeau Prêt</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4 sm:px-6 text-right rtl:text-left">
                      <Link
                        href={`/card/${card.qr_token}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold rounded-xl transition-all border border-slate-200 hover:border-emerald-200 shadow-sm hover:shadow"
                      >
                        <span>Voir</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
