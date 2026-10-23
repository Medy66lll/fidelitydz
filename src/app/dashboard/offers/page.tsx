'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import { db } from '@/lib/db';
import { PersonalizedOffer, TargetSegment } from '@/lib/types';
import { Tag, Plus, Clock, Users, Sparkles, CheckCircle2, Calendar, AlertCircle, Bell, BellRing, Send, Check } from 'lucide-react';

export default function OffersPage() {
  const { t, language } = useLanguage();
  const { currentMerchant } = useMerchant();
  const isAr = language === 'ar';

  const [offers, setOffers] = useState<PersonalizedOffer[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [broadcastedOfferId, setBroadcastedOfferId] = useState<string | null>(null);

  // Form fields
  const [titleFr, setTitleFr] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descFr, setDescFr] = useState('');
  const [descAr, setDescAr] = useState('');
  const [targetSegment, setTargetSegment] = useState<TargetSegment>('ALL');
  const [isActive, setIsActive] = useState(true);
  const [validDays, setValidDays] = useState(14);

  useEffect(() => {
    if (currentMerchant) {
      setOffers(db.getOffers(currentMerchant.id));
    }
  }, [currentMerchant]);

  const handleEdit = (offer: PersonalizedOffer) => {
    setEditingOfferId(offer.id);
    setTitleFr(offer.title_fr);
    setTitleAr(offer.title_ar || '');
    setDescFr(offer.description_fr || '');
    setDescAr(offer.description_ar || '');
    setTargetSegment(offer.target_segment || 'ALL');
    setIsActive(offer.is_active ?? true);
    setValidDays(14);
    setShowCreateModal(true);
  };

  const handleDelete = (offerId: string) => {
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذا العرض؟' : 'Voulez-vous vraiment supprimer cette offre ?')) {
      db.deleteOffer(offerId);
      setOffers(db.getOffers(currentMerchant?.id));
    }
  };

  const handleToggleActive = (offer: PersonalizedOffer) => {
    db.updateOffer({ ...offer, is_active: !offer.is_active });
    setOffers(db.getOffers(currentMerchant?.id));
  };

  const handleBroadcastNotification = (offer: PersonalizedOffer) => {
    setBroadcastedOfferId(offer.id);
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`📢 ${currentMerchant?.business_name || 'FidelityDZ'} (Alerte Promo)`, {
          body: isAr && offer.title_ar ? offer.title_ar : offer.title_fr,
          icon: currentMerchant?.logo_url || 'https://cdn-icons-png.flaticon.com/512/1041/1041888.png',
        });
      } catch {}
    }
    setTimeout(() => setBroadcastedOfferId(null), 4000);
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMerchant) return;

    if (editingOfferId) {
      const offer = offers.find(o => o.id === editingOfferId);
      if (offer) {
        db.updateOffer({
          ...offer,
          title_fr: titleFr,
          title_ar: titleAr,
          description_fr: descFr,
          description_ar: descAr,
          target_segment: targetSegment,
          is_active: isActive
        });
      }
    } else {
      const newOffer: PersonalizedOffer = {
        id: crypto.randomUUID(),
        merchant_id: currentMerchant.id,
        title_fr: titleFr,
        title_ar: titleAr,
        description_fr: descFr,
        description_ar: descAr,
        target_segment: targetSegment,
        valid_until: new Date(Date.now() + validDays * 86400000).toISOString(),
        is_active: isActive,
        created_at: new Date().toISOString(),
      };
      db.createOffer(newOffer);
    }
    
    setOffers(db.getOffers(currentMerchant.id));
    setShowCreateModal(false);
    setEditingOfferId(null);
    setTitleFr('');
    setTitleAr('');
    setDescFr('');
    setDescAr('');
    setTargetSegment('ALL');
    setIsActive(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {isAr ? 'العروض والحملات' : 'Offres & Campagnes'}
          </h2>
          <p className="text-slate-400">
            {isAr
              ? 'إنشاء عروض ترويجية مستهدفة لعملائك'
              : 'Créez des promotions ciblées pour vos clients'}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingOfferId(null);
            setTitleFr(''); setTitleAr(''); setDescFr(''); setDescAr('');
            setTargetSegment('ALL'); setIsActive(true); setValidDays(14);
            setShowCreateModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>{isAr ? 'عرض جديد' : 'Nouvelle offre'}</span>
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {isAr ? 'لا توجد عروض نشطة' : 'Aucune offre active'}
          </h3>
          <p className="text-slate-400 max-w-md mx-auto">
            {isAr
              ? 'قم بإنشاء عرضك الأول لجذب عملائك وزيادة مبيعاتك.'
              : 'Créez votre première offre pour attirer vos clients et booster vos ventes.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`bg-slate-800 border ${offer.is_active ? 'border-slate-700' : 'border-slate-700/50 opacity-75'} rounded-2xl p-5 hover:border-emerald-500/30 transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${offer.is_active ? 'bg-emerald-500/10' : 'bg-slate-700/50'} rounded-xl flex items-center justify-center`}>
                    <Tag className={`w-5 h-5 ${offer.is_active ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">
                      {isAr && offer.title_ar ? offer.title_ar : offer.title_fr}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${offer.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                        {offer.is_active ? (isAr ? 'نشط' : 'Actif') : (isAr ? 'غير نشط' : 'Inactif')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                {isAr && offer.description_ar ? offer.description_ar : offer.description_fr}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-700/50">
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleToggleActive(offer)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border flex-1 sm:flex-none text-center ${
                      offer.is_active
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    {offer.is_active ? (isAr ? 'إيقاف' : 'Désactiver') : (isAr ? 'تفعيل' : 'Activer')}
                  </button>
                  <button
                    onClick={() => handleEdit(offer)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 flex-1 sm:flex-none text-center"
                  >
                    {isAr ? 'تعديل' : 'Modifier'}
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-sm font-medium text-rose-400 flex-1 sm:flex-none text-center"
                  >
                    {isAr ? 'حذف' : 'Supprimer'}
                  </button>
                </div>
                
                {offer.is_active && (
                  <button
                    onClick={() => handleBroadcastNotification(offer)}
                    disabled={broadcastedOfferId === offer.id}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      broadcastedOfferId === offer.id
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    }`}
                  >
                    {broadcastedOfferId === offer.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{isAr ? 'تم الإرسال' : 'Envoyé'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isAr ? 'إرسال إشعار' : 'Diffuser l\'alerte'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg my-8">
            <h3 className="text-xl font-bold text-white mb-6">
              {editingOfferId
                ? (isAr ? 'تعديل العرض' : 'Modifier l\'offre')
                : (isAr ? 'إنشاء عرض جديد' : 'Créer une nouvelle offre')}
            </h3>

            <form onSubmit={handleSaveOffer} className="space-y-4">
              <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">Fr</span>
                  Version Française
                </h4>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Titre de l'offre *</label>
                  <input
                    type="text"
                    required
                    value={titleFr}
                    onChange={(e) => setTitleFr(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="ex: -20% sur les cafés"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    value={descFr}
                    onChange={(e) => setDescFr(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 h-20 resize-none"
                    placeholder="Détails de l'offre..."
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">Ar</span>
                  النسخة العربية
                </h4>
                <div dir="rtl">
                  <label className="block text-sm font-medium text-slate-300 mb-1">عنوان العرض</label>
                  <input
                    type="text"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="مثال: خصم 20٪ على القهوة"
                  />
                </div>
                <div dir="rtl">
                  <label className="block text-sm font-medium text-slate-300 mb-1">الوصف</label>
                  <textarea
                    value={descAr}
                    onChange={(e) => setDescAr(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500 h-20 resize-none"
                    placeholder="تفاصيل العرض..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {isAr ? 'العملاء المستهدفون' : 'Clients ciblés'}
                </label>
                <select
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value as TargetSegment)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">{isAr ? 'جميع العملاء' : 'Tous les clients'}</option>
                  <option value="VIP">{isAr ? 'العملاء الدائمين (VIP)' : 'Clients Fidèles (VIP)'}</option>
                  <option value="INACTIVE_30D">{isAr ? 'عملاء غائبين (+30 يوم)' : 'Clients Inactifs (+30j)'}</option>
                </select>
              </div>

              {!editingOfferId && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {isAr ? 'صالح لمدة' : 'Valable pour'}
                  </label>
                  <div className="flex gap-2">
                    {[7, 14, 30].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setValidDays(days)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                          validDays === days
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {days} {isAr ? 'أيام' : 'jours'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingOfferId(null);
                    setTitleFr(''); setTitleAr(''); setDescFr(''); setDescAr('');
                    setTargetSegment('ALL'); setIsActive(true);
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  disabled={!titleFr}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-medium transition-all"
                >
                  {editingOfferId ? (isAr ? 'حفظ التعديلات' : 'Enregistrer') : (isAr ? 'إنشاء العرض' : 'Créer l\'offre')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
