'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import LanguageToggle from '@/components/LanguageToggle';
import { db } from '@/lib/db';
import { Merchant } from '@/lib/types';
import {
  QrCode,
  Store,
  MapPin,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function RegisterMerchantPage() {
  const { t, language } = useLanguage();
  const { switchMerchant, refreshMerchantData } = useMerchant();
  const router = useRouter();
  const isAr = language === 'ar';

  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Café & Restauration');
  const [wilaya, setWilaya] = useState('16 - Alger');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-slugify
  const handleNameChange = (val: string) => {
    setBusinessName(val);
    if (!slug || slug === businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!businessName.trim() || !slug.trim()) {
      setError('Veuillez renseigner le nom de votre commerce.');
      return;
    }

    const cleanedPhone = phone.replace(/\s+/g, '');
    if (!/^(0)(5|6|7)[0-9]{8}$/.test(cleanedPhone)) {
      setError('Veuillez saisir un numéro de mobile algérien valide (05, 06 ou 07, 10 chiffres).');
      return;
    }

    setLoading(true);

    const newMerchant: Merchant = {
      id: `m-${Date.now()}`,
      business_name: businessName.trim(),
      slug: slug.toLowerCase().trim(),
      category,
      wilaya,
      phone: cleanedPhone,
      subscription_status: 'TRIAL',
      subscription_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
    };

    try {
      db.saveMerchant(newMerchant);
      refreshMerchantData();
      switchMerchant(newMerchant.id);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      setError(msg);
      setLoading(false);
    }
  };

  const algerianWilayas = [
    '16 - Alger',
    '31 - Oran',
    '25 - Constantine',
    '19 - Sétif',
    '09 - Blida',
    '23 - Annaba',
    '06 - Béjaïa',
    '15 - Tizi Ouzou',
    '13 - Tlemcen',
    '35 - Boumerdès',
    '05 - Batna',
    '27 - Mostaganem',
    '30 - Ouargla',
  ];

  const categories = [
    'Café, Salon de thé & Pâtisserie',
    'Restauration rapide & Fast-food',
    'Boutique de Mode & Prêt-à-porter',
    'Coiffure, Beauté & Spa',
    'Optique & Lunetterie',
    'Superette & Épicerie fine',
    'Parfumerie & Cosmétiques',
    'Autre commerce de détail',
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Fidelity<span className="text-emerald-500">DZ</span>
            </span>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto w-full p-4 sm:p-6 my-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Essai gratuit 14 jours • Zéro engagement</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isAr ? 'إنشاء حساب تاجر جديد' : 'Créer votre compte commerce'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Configurez votre programme de fidélité digitale en moins de 2 minutes.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Nom du commerce */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Nom de votre établissement <span className="text-emerald-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Café El Bahdja ou Boutique Tassili"
                value={businessName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Slug URL */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Lien personnalisé de votre carte client
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 font-mono">
                <span>fidelitydz.com/join/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1 bg-transparent text-slate-900 font-bold outline-none pl-1"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Catégorie d&apos;activité
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:border-emerald-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Wilaya */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Wilaya
              </label>
              <select
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:border-emerald-500 font-medium"
              >
                {algerianWilayas.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Numéro de téléphone du gérant <span className="text-emerald-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="0550 12 34 56"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm font-mono tracking-wider tabular-nums outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400">Pour les notifications et l&apos;assistance WhatsApp dédiée.</p>
            </div>

            {/* Submit */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Création en cours...</span>
                ) : (
                  <>
                    <span>Activer mes 14 jours d&apos;essai gratuit</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Existing account link */}
          <div className="text-center pt-2 text-xs text-slate-500">
            Déjà inscrit ?{' '}
            <Link href="/dashboard" className="font-bold text-emerald-600 hover:text-emerald-700">
              Accéder à l&apos;espace commerçant
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        FidelityDZ SaaS • Plateforme N°1 en Algérie 🇩🇿
      </footer>
    </div>
  );
}
