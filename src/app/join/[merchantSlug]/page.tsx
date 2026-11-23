'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, normalizeDzPhone } from '@/lib/db';
import { Merchant, LoyaltyProgram } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import { QrCode, Phone, User, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleaned = normalizeDzPhone(phone);
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
        localStorage.setItem('fidelitydz_recent_pass_id', result.card.id);
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
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="text-xs text-slate-400 font-medium">Chargement du commerce...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-between text-white overflow-hidden bg-slate-950 p-4">
      {/* Ambient OKLAB Glow Background */}
      <div className="absolute top-[-20%] left-[-15%] w-[65%] h-[65%] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <header className="max-w-md mx-auto w-full flex items-center justify-between py-2 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl fdz-oklab-accent-bg flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
            <QrCode className="w-5 h-5 text-slate-950" />
          </div>
          <span className="font-black text-lg tracking-tight text-white">
            Fidelity<span className="text-emerald-400">DZ</span>
          </span>
        </div>
        <LanguageToggle />
      </header>

      <main className="max-w-md mx-auto w-full my-auto py-6 relative z-10">
        <div className="fdz-glass-dark rounded-[2.5rem] p-6 sm:p-9 border border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]">
          <div className="text-center space-y-2 pb-6 border-b border-slate-800">
            {merchant?.logo_url && (
              <img
                src={merchant.logo_url}
                alt={merchant.business_name}
                className="w-16 h-16 rounded-2xl mx-auto object-cover border-2 border-emerald-400/80 shadow-lg"
              />
            )}
            <h1 className="text-2xl font-black text-white tracking-tight">
              {merchant?.business_name || merchantSlug}
            </h1>
            {merchant && (
              <p className="text-xs text-slate-400 font-medium">
                {merchant.wilaya} • {merchant.category}
              </p>
            )}

            <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/60 px-3.5 py-1.5 rounded-full text-emerald-300 text-xs font-extrabold mt-2 shadow-inner">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>
                {isAr
                  ? `هدية ترحيبية: ختم مجاني فور تسجيلك !`
                  : `🎁 ${program?.reward_title_fr || '1er tampon offert automatiquement !'}`}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="bg-rose-950/80 border border-rose-500/80 text-rose-100 text-xs p-3.5 rounded-xl font-bold">
                {error}
              </div>
            )}

            {/* Phone Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 block">
                {t('customer_phone_label')} <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  aria-label="0555 12 34 56"
                  type="tel"
                  required
                  placeholder="0555 12 34 56"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  style={{ backgroundColor: '#0b1329', color: '#ffffff' }}
                  className="w-full bg-[#0b1329] border border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 rounded-xl py-3.5 pl-11 rtl:pl-4 rtl:pr-11 text-white text-base placeholder-slate-500 font-mono tracking-wider tabular-nums outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">{t('phone_hint')}</p>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 block">
                {t('customer_name_label')} <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  aria-label="Prénom du client"
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: أمين أو سارة' : 'Ex: Amine ou Sara'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ backgroundColor: '#0b1329', color: '#ffffff' }}
                  className="w-full bg-[#0b1329] border border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 rounded-xl py-3.5 pl-11 rtl:pl-4 rtl:pr-11 text-white text-base placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !merchant}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl fdz-oklab-accent-bg hover:brightness-105 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 transition-all disabled:opacity-50 hover:scale-[1.01]"
              >
                {loading ? (
                  <span>{isAr ? 'جاري التحميل...' : 'Ouverture de votre carte...'}</span>
                ) : (
                  <>
                    <span>{t('join_submit_btn')}</span>
                    <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('no_app_required')}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {isAr
                ? 'بياناتك محمية وخاصة 100% — بطاقة واحدة فقط لكل رقم هاتف.'
                : 'Données 100% privées et sécurisées — Une seule carte unique par numéro de téléphone.'}
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center py-2 text-[11px] text-slate-500 font-medium relative z-10">
        Propulsé par FidelityDZ SaaS • Algérie 🇩🇿
      </footer>
    </div>
  );
}
