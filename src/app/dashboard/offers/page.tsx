'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import { db } from '@/lib/db';
import { PersonalizedOffer, TargetSegment } from '@/lib/types';
import {
  Tag,
  Plus,
  Clock,
  BellRing,
  Send,
  Check,
  Image as ImageIcon,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';

export default function OffersPage() {
  const { t, language } = useLanguage();
  const { currentMerchant } = useMerchant();
  const isAr = language === 'ar';

  const [offers, setOffers] = useState<PersonalizedOffer[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [broadcastedOfferId, setBroadcastedOfferId] = useState<string | null>(null);

  const [titleFr, setTitleFr] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descFr, setDescFr] = useState('');
  const [descAr, setDescAr] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetSegment, setTargetSegment] = useState<TargetSegment>('ALL');
  const [validDays, setValidDays] = useState(14);
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentMerchant) {
      setOffers(db.getOffers(currentMerchant.id));
    }
  }, [currentMerchant]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_W = 600;
        const MAX_H = 400;
        let w = img.width;
        let h = img.height;
        if (w > h && w > MAX_W) {
          h = Math.round((h * MAX_W) / w);
          w = MAX_W;
        } else if (h > MAX_H) {
          w = Math.round((w * MAX_H) / h);
          h = MAX_H;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        setImageUrl(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setEditingOfferId(null);
    setTitleFr('');
    setTitleAr('');
    setDescFr('');
    setDescAr('');
    setImageUrl('');
    setTargetSegment('ALL');
    setValidDays(14);
  };

  const handleOpenEdit = (offer: PersonalizedOffer) => {
    setEditingOfferId(offer.id);
    setTitleFr(offer.title_fr);
    setTitleAr(offer.title_ar || '');
    setDescFr(offer.description_fr || '');
    setDescAr(offer.description_ar || '');
    setImageUrl(offer.image_url || '');
    setTargetSegment(offer.target_segment || 'ALL');
    setShowCreateModal(true);
  };

  const handleDeleteOffer = (offerId: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا العرض؟' : 'Supprimer définitivement cette offre ?')) return;
    db.deleteOffer(offerId);
    if (currentMerchant) setOffers(db.getOffers(currentMerchant.id));
  };

  const handleBroadcastNotification = (offer: PersonalizedOffer) => {
    setBroadcastedOfferId(offer.id);
    const nowIso = new Date().toISOString();
    const updated: PersonalizedOffer = { ...offer, is_active: true, updated_at: nowIso };
    db.updateOffer(updated);
    if (currentMerchant) setOffers(db.getOffers(currentMerchant.id));
    setTimeout(() => setBroadcastedOfferId(null), 4000);
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMerchant) return;
    const nowIso = new Date().toISOString();

    if (editingOfferId) {
      const existing = offers.find((o) => o.id === editingOfferId);
      if (existing) {
        const updated: PersonalizedOffer = {
          ...existing,
          title_fr: titleFr,
          title_ar: titleAr,
          description_fr: descFr,
          description_ar: descAr,
          image_url: imageUrl,
          target_segment: targetSegment,
          updated_at: nowIso,
        };
        db.updateOffer(updated);
      }
    } else {
      const newOffer: PersonalizedOffer = {
        id: `off-${Date.now()}`,
        merchant_id: currentMerchant.id,
        title_fr: titleFr,
        title_ar: titleAr,
        description_fr: descFr,
        description_ar: descAr,
        image_url: imageUrl,
        target_segment: targetSegment,
        valid_until: new Date(Date.now() + validDays * 86400000).toISOString(),
        is_active: true,
        created_at: nowIso,
        updated_at: nowIso,
      };
      db.createOffer(newOffer);
    }

    setOffers(db.getOffers(currentMerchant.id));
    setShowCreateModal(false);
    resetForm();
    showToast(isAr ? 'تم حفظ العرض بنجاح' : 'Offre enregistrée avec succès');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce-in text-white text-sm font-bold ${toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('offers_title')}
          </h2>
          <p className="text-sm text-slate-600">{t('offers_subtitle')}</p>
        </div>

        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all"
          type="button"
        >
          <Plus className="w-5 h-5" />
          <span>{t('create_offer')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3.5 hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
                  {offer.target_segment === 'VIP' ? 'Segment VIP' : offer.target_segment === 'INACTIVE_30D' ? 'Inactifs 30j' : 'Tous les clients'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(offer)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Modifier"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {offer.image_url && (
                <div className="rounded-2xl overflow-hidden border border-slate-100 h-36 bg-slate-50">
                  <img src={offer.image_url} alt={offer.title_fr} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">{offer.title_fr}</h3>
                {offer.title_ar && (
                  <p className="text-sm font-arabic font-bold text-slate-700" dir="rtl">{offer.title_ar}</p>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p>{offer.description_fr}</p>
                {offer.description_ar && (
                  <p className="font-arabic pt-1 border-t border-slate-200/60" dir="rtl">{offer.description_ar}</p>
                )}
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              {offer.valid_until && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expire le : {new Date(offer.valid_until).toLocaleDateString('fr-DZ')}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <BellRing className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Notification Client</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleBroadcastNotification(offer)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    broadcastedOfferId === offer.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {broadcastedOfferId === offer.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Diffusée en direct !</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Diffuser sur téléphones</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl p-4 sm:p-5 max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingOfferId ? 'Modifier l’offre' : t('create_offer')}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold" type="button">✕</button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-3">
              <div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                {imageUrl ? (
                  <div className="relative h-24 w-full rounded-xl overflow-hidden border border-slate-200">
                    <img src={imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 text-white rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-16 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Ajouter une photo à l&apos;offre (optionnel)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">{t('target_segment')}</label>
                  <select
                    value={targetSegment}
                    onChange={(e) => setTargetSegment(e.target.value as TargetSegment)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 text-xs font-semibold outline-none"
                  >
                    <option value="ALL">{t('segment_all')}</option>
                    <option value="VIP">{t('segment_vip')}</option>
                    <option value="INACTIVE_30D">{t('segment_inactive')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Validité</label>
                  <select
                    value={validDays}
                    onChange={(e) => setValidDays(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 text-xs font-semibold outline-none"
                  >
                    <option value={7}>7 jours</option>
                    <option value={14}>14 jours</option>
                    <option value={30}>30 jours</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Titre (FR) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: -20% ce week-end"
                    value={titleFr}
                    onChange={(e) => setTitleFr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1 text-right">العنوان (AR)</label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="تخفيض 20%"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Description (FR) *</label>
                <textarea
                  rows={2}
                  required
                  value={descFr}
                  onChange={(e) => setDescFr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 text-right">الوصف (AR)</label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20"
                >
                  {editingOfferId ? 'Enregistrer' : t('publish_offer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
