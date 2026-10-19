'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import { db } from '@/lib/db';
import { PersonalizedOffer, TargetSegment } from '@/lib/types';
import {
  Tag,
  Plus,
  Clock,
  Users,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function OffersPage() {
  const { t, language } = useLanguage();
  const { currentMerchant } = useMerchant();
  const isAr = language === 'ar';

  const [offers, setOffers] = useState<PersonalizedOffer[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form fields
  const [titleFr, setTitleFr] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descFr, setDescFr] = useState('');
  const [descAr, setDescAr] = useState('');
  const [targetSegment, setTargetSegment] = useState<TargetSegment>('ALL');
  const [validDays, setValidDays] = useState(14);

  useEffect(() => {
    if (currentMerchant) {
      setOffers(db.getOffers(currentMerchant.id));
    }
  }, [currentMerchant]);

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMerchant) return;

    const newOffer: PersonalizedOffer = {
      id: `off-${Date.now()}`,
      merchant_id: currentMerchant.id,
      title_fr: titleFr,
      title_ar: titleAr,
      description_fr: descFr,
      description_ar: descAr,
      target_segment: targetSegment,
      valid_until: new Date(Date.now() + validDays * 86400000).toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
    };

    db.createOffer(newOffer);
    setOffers([newOffer, ...offers]);
    setShowCreateModal(false);
    // Reset form
    setTitleFr('');
    setTitleAr('');
    setDescFr('');
    setDescAr('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('offers_title')}
          </h2>
          <p className="text-sm text-slate-600">
            {t('offers_subtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
          type="button"
        >
          <Plus className="w-5 h-5" />
          <span>{t('create_offer')}</span>
        </button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden"
          >
            {/* Segment Badge */}
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  offer.target_segment === 'VIP'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : offer.target_segment === 'INACTIVE_30D'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {offer.target_segment === 'VIP'
                  ? 'Segment VIP'
                  : offer.target_segment === 'INACTIVE_30D'
                  ? 'Clients Inactifs 30j'
                  : 'Tous les clients'}
              </span>

              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>

            {/* Titles */}
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                {offer.title_fr}
              </h3>
              {offer.title_ar && (
                <p className="text-sm font-arabic font-bold text-slate-700" dir="rtl">
                  {offer.title_ar}
                </p>
              )}
            </div>

            {/* Descriptions */}
            <div className="space-y-1 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p>{offer.description_fr}</p>
              {offer.description_ar && (
                <p className="font-arabic pt-1 border-t border-slate-200/60" dir="rtl">
                  {offer.description_ar}
                </p>
              )}
            </div>

            {/* Expiry */}
            {offer.valid_until && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Expire le : {new Date(offer.valid_until).toLocaleDateString('fr-DZ')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CREATE OFFER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">
                {t('create_offer')}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
                type="button"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4">
              {/* Segment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {t('target_segment')}
                </label>
                <select
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value as TargetSegment)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-semibold outline-none focus:border-emerald-500"
                >
                  <option value="ALL">{t('segment_all')}</option>
                  <option value="VIP">{t('segment_vip')}</option>
                  <option value="INACTIVE_30D">{t('segment_inactive')}</option>
                </select>
              </div>

              {/* Title FR */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Titre en français
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Croissant offert chaque matin"
                  value={titleFr}
                  onChange={(e) => setTitleFr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              {/* Title AR */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block font-arabic text-right">
                  العنوان بالعربية
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: كرواسون زبدة مجاناً كل صباح"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-arabic outline-none focus:border-emerald-500"
                />
              </div>

              {/* Desc FR */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Description en français
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Valable pour tout grand café acheté entre 8h et 10h."
                  value={descFr}
                  onChange={(e) => setDescFr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              {/* Desc AR */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block font-arabic text-right">
                  الوصف بالعربية
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  placeholder="مثال: ساري المفعول مع كل قهوة كبيرة تُطلب صباحاً."
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-arabic outline-none focus:border-emerald-500"
                />
              </div>

              {/* Validity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Durée de validité
                </label>
                <select
                  value={validDays}
                  onChange={(e) => setValidDays(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none"
                >
                  <option value={7}>7 jours (1 semaine)</option>
                  <option value={14}>14 jours (2 semaines)</option>
                  <option value={30}>30 jours (1 mois)</option>
                  <option value={60}>60 jours (2 mois)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20"
                >
                  {t('publish_offer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
