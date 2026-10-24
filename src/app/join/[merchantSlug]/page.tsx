'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Merchant, LoyaltyProgram, CustomerCard } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import { QrCode, Phone, User, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CustomerJoinPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const rawSlug = params?.merchantSlug;
  const merchantSlug = decodeURIComponent(Array.isArray(rawSlug) ? rawSlug[0] : rawSlug || '').trim();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [existingCustomer, setExistingCustomer] = useState<CustomerCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStore, setCheckingStore] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadMerchant() {
      if (!merchantSlug) {
        setCheckingStore(false);
        return;
      }
      setCheckingStore(true);
      const { merchant: foundM, program: foundP } = await db.fetchMerchantBySlugAsync(merchantSlug);
      if (!mounted) return;

      if (foundM) {
        setMerchant(foundM);
        setProgram(foundP || db.getProgramByMerchantId(foundM.id));
        setError('');
      } else {
        setError(`Le commerce "${merchantSlug}" n'a pas été trouvé.`);
      }
      setCheckingStore(false);
    }
    loadMerchant();
    return () => {
      mounted = false;
    };
  }, [merchantSlug]);

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    const cleaned = val.replace(/\s+/g, '');
    if (merchant && /^(0)(5|6|7)[0-9]{8}$/.test(cleaned)) {
      const foundCard = db.getCardByPhone(merchant.id, cleaned);
      if (foundCard) {
        setExistingCustomer(foundCard);
        setName(foundCard.customer_name);
        return;
      }
    }
    setExistingCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleaned = phone.replace(/\s+/g, '');
    if (!/^(0)(5|6|7)[0-9]{8}$/.test(cleaned)) {
      setError(
        isAr
          ? 'يرجى إدخال رقم هاتف جزائري صحيح يبدأ بـ 05 أو 06 أو 07 (10 أرقام)'
          : 'Veuillez saisir un numéro de mobile algérien valide commençant par 05, 06 ou 07 (10 chiffres).'
      );
      return;
    }

    if (!name.trim()) {
      setError(
        isAr
          ? 'يرجى إدخال اسمك الأول (إجباري لإنشاء بطاقة الولاء).'
          : 'Votre prénom est obligatoire pour créer ou retrouver votre carte de fidélité.'
      );
      return;
    }
    if (name.trim().length < 2) {
      setError(
        isAr
          ? 'يجب أن يحتوي الاسم على حرفين على الأقل.'
          : 'Le prénom doit contenir au moins 2 caractères.'
      );
      return;
    }

    setLoading(true);

    try {
      const finalName = name.trim();
      const result = await db.getOrCreateCustomerCardAsync(merchantSlug, cleaned, finalName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('fidelitydz_last_card_token', result.card.qr_token);
      }
      router.push(`/card/${result.card.qr_token}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'accès à la carte";
      setError(msg);
      setLoading(false);
    }
  };

  if (checkingStore) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
        <p className="text-xs text-slate-400">Ouverture du programme de fidélité...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-between p-4 sm:p-6 text-white overflow-hidden bg-slate-950">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      {/* Top Header */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            Fidelity<span className="text-emerald-400">DZ</span>
          </span>
        </div>
        <LanguageToggle />
      </header>

      {/* Main Join Container */}
      <main className="max-w-md mx-auto w-full my-auto py-6">
        <div className="relative z-10 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          <div className="text-center space-y-2 pb-6 border-b border-slate-800">
            {merchant?.logo_url && (
              <img
                src={merchant.logo_url}
                alt={merchant.business_name}
                className="w-16 h-16 rounded-2xl mx-auto object-cover border-2 border-emerald-500 shadow-lg"
              />
            )}
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {merchant?.business_name || merchantSlug}
            </h1>
            {merchant && (
              <p className="text-xs text-slate-400 font-medium">
                {merchant.wilaya} • {merchant.category}
              </p>
            )}

            <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-800/80 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-bold mt-2">
              <Sparkles className="w-4 h-4" />
              <span>
                {isAr
                  ? `هدية ترحيبية: ختم مجاني فور تسجيلك !`
                  : `🎁 ${program?.reward_title_fr || '1er tampon offert automatiquement !'}`}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="bg-red-950/60 border border-red-800 text-red-200 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            {existingCustomer && (
              <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs p-3 rounded-xl flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  {isAr
                    ? `مرحباً بعودتك ${existingCustomer.customer_name} ! لديك ${existingCustomer.stamps_balance} أختام.`
                    : `Bon retour ${existingCustomer.customer_name} ! Vous avez ${existingCustomer.stamps_balance} tampon(s).`}
                </span>
              </div>
            )}

            {/* Phone Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                {t('customer_phone_label')} <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="0555 12 34 56"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full bg-slate-950/50 hover:bg-slate-950 border border-slate-700/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-2xl py-4 pl-12 rtl:pl-4 rtl:pr-12 text-white text-lg placeholder-slate-500 font-mono tracking-wider tabular-nums outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500">{t('phone_hint')}</p>
            </div>

            {/* Name Input - OBLIGATOIRE */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                {t('customer_name_label')} <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: أمين أو سارة' : 'Ex: Amine ou Sara'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/50 hover:bg-slate-950 border border-slate-700/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-2xl py-4 pl-12 rtl:pl-4 rtl:pr-12 text-white text-lg placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !merchant}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 active:scale-[0.98] text-slate-950 font-black text-lg shadow-[0_8px_25px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_35px_rgba(16,185,129,0.6)] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>{isAr ? 'جاري التحميل...' : 'Ouverture de votre carte...'}</span>
                ) : (
                  <>
                    <span>{existingCustomer ? (isAr ? 'فتح بطاقتي الحالية' : 'Ouvrir ma carte existante') : t('join_submit_btn')}</span>
                    <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('no_app_required')}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isAr
                ? 'إذا كان لديك حساب مسبقاً، سيتم فتح بطاقتك ونقاطك الحالية مباشرة.'
                : 'Si vous avez déjà une carte, vos tampons actuels seront chargés immédiatement.'}
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center py-2 text-[11px] text-slate-500">
        Propulsé par FidelityDZ SaaS • Algérie 🇩🇿
      </footer>
    </div>
  );
}
