'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import { db } from '@/lib/db';
import { CustomerCard } from '@/lib/types';
import {
  Users,
  Search,
  ExternalLink,
  Gift,
  Phone,
  Calendar,
  Sparkles,
  QrCode
} from 'lucide-react';

export default function CustomersPage() {
  const { t, language } = useLanguage();
  const { currentMerchant, program } = useMerchant();
  const isAr = language === 'ar';

  const [cards, setCards] = useState<CustomerCard[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (currentMerchant) {
      setCards(db.getCustomerCards(currentMerchant.id));
    }
  }, [currentMerchant]);

  const filtered = cards.filter(
    (c) =>
      c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_phone.includes(search)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('nav_customers')}
          </h2>
          <p className="text-sm text-slate-600">
            Base de données de vos clients fidélisés par numéro de téléphone.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm">
          <Users className="w-4 h-4 text-emerald-600" />
          <span>{cards.length} clients enregistrés</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)]">
        <div className="relative group">
          <Search className="w-5 h-5 absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder={isAr ? 'ابحث برقم الهاتف أو اسم الزبون...' : 'Rechercher par numéro ou prénom...'}
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
                <th className="p-4 sm:px-6 text-right rtl:text-left">Carte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((card) => {
                const hasReward = card.rewards_available > 0 || (program && card.stamps_balance >= program.stamps_required);
                return (
                  <tr key={card.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 sm:px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{card.customer_name}</span>
                        {card.total_visits >= 5 && (
                          <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            VIP
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 sm:px-6 font-mono text-xs text-slate-600">
                      {card.customer_phone}
                    </td>
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
                    <td className="p-4 sm:px-6 font-semibold text-slate-700">
                      {card.points_balance} pts
                    </td>
                    <td className="p-4 sm:px-6 font-semibold text-slate-700">
                      {card.total_visits}
                    </td>
                    <td className="p-4 sm:px-6 text-xs text-slate-500 font-mono">
                      {new Date(card.last_visit_at).toLocaleDateString('fr-DZ')}
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
