'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import LanguageToggle from '@/components/LanguageToggle';
import { db, defaultPlatformSettings } from '@/lib/db';
import { Merchant } from '@/lib/types';
import {
  QrCode,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';

export default function RegisterMerchantPage() {
  const { language } = useLanguage();
  const { loginMerchantSession, refreshMerchantData } = useMerchant();
  const router = useRouter();
  const isAr = language === 'ar';

  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Café, Salon de thé & Pâtisserie');
  const [wilaya, setWilaya] = useState('16 - Alger');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdMerchant, setCreatedMerchant] = useState<Merchant | null>(null);

  const handleNameChange = (val: string) => {
    setBusinessName(val);
    const generated = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generated);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!businessName.trim() || !slug.trim()) {
      setError('Veuillez renseigner le nom de votre commerce.');
      return;
    }

    const cleanedPhone = phone.replace(/\s+/g, '');
    if (!/^(0)(5|6|7)[0-9]{8}$/.test(cleanedPhone)) {
      setError('Veuillez saisir un numéro de mobile algérien valide (05, 06 ou 07 sur 10 chiffres).');
      return;
    }

    if (password.trim().length < 4) {
      setError('Veuillez choisir un mot de passe d\'au moins 4 caractères pour sécuriser votre espace.');
      return;
    }

    setLoading(true);

    // Vérifier si le slug ou téléphone existe déjà
    await db.syncFromSupabase();
    const existingBySlug = db.getMerchantBySlug(slug.toLowerCase().trim());
    const finalSlug = existingBySlug
      ? `${slug.toLowerCase().trim()}-${Math.floor(100 + Math.random() * 900)}`
      : slug.toLowerCase().trim();

    const newMerchant: Merchant = {
      id: `m-${Date.now()}`,
      business_name: businessName.trim(),
      slug: finalSlug,
      category,
      wilaya,
      phone: cleanedPhone,
      email: email.trim() || undefined,
      password: password.trim(),
      subscription_status: 'TRIAL',
      subscription_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
    };

    try {
      await db.registerMerchantAsync(newMerchant);
      loginMerchantSession(newMerchant);
      await refreshMerchantData();
      setCreatedMerchant(newMerchant);
      setLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(msg);
      setLoading(false);
    }
  };

  const algerianWilayas = [
    '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna',
    '06 - Béjaïa', '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira',
    '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou', '16 - Alger', '17 - Djelfa',
    '18 - Jijel', '19 - Sétif', '20 - Saïda', '21 - Skikda', '22 - Sidi Bel Abbès',
    '23 - Annaba', '24 - Guelma', '25 - Constantine', '26 - Médéa', '27 - Mostaganem',
    '28 - M\'Sila', '29 - Mascara', '30 - Ouargla', '31 - Oran', '34 - Bordj Bou Arréridj',
    '35 - Boumerdès', '42 - Tipaza', '45 - Naâma',
  ];

  const categories = [
    'Café, Salon de thé & Pâtisserie',
    'Restauration rapide, Pizza & Fast-food',
    'Boutique de Mode & Prêt-à-porter',
    'Coiffure, Barber Shop & Beauté',
    'Optique & Lunetterie',
    'Superette & Épicerie fine',
    'Parfumerie & Cosmétiques',
    'Autre commerce de détail',
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
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
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 hover:text-emerald-600 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              Se connecter
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto w-full p-4 sm:p-6 my-auto">
        {createdMerchant ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-500 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">
                ⏳ Essai Gratuit de 14 Jours Activé
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Bienvenue, {createdMerchant.business_name} !
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Votre compte sécurisé est créé sur Supabase. À la fin de vos 14 jours d&apos;essai, votre abonnement est à <strong>3 900 DZD / mois</strong> (via BaridiMob, CCP ou Edahabia/CIB).
              </p>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-2xl text-left text-xs space-y-1.5 font-mono">
              <div className="text-emerald-400 font-bold uppercase">Vos identifiants de connexion :</div>
              <div>Identifiant (Tél) : <strong>{createdMerchant.phone}</strong></div>
              <div>Lien QR Client : <strong>/join/{createdMerchant.slug}</strong></div>
              <div>Expiration essai 14j : <strong>{new Date(createdMerchant.subscription_ends_at).toLocaleDateString('fr-DZ')}</strong></div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <span>Accéder à mon Espace Commerçant</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/${defaultPlatformSettings.owner_whatsapp || '213550000000'}?text=${encodeURIComponent(
                  `Bonjour FidelityDZ, je viens d'activer mon essai de 14 jours pour mon commerce "${createdMerchant.business_name}" (${createdMerchant.wilaya}) avec le numéro ${createdMerchant.phone}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Notifier le support WhatsApp FidelityDZ (Optionnel)</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Essai gratuit 14 jours • Puis 3 900 DZD/mois</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {isAr ? 'إنشاء حساب تاجر جديد' : 'Créer votre compte commerce'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Créez votre espace privé protégé par mot de passe en 1 minute.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Nom de votre établissement <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pizzeria El Djazair ou Café El Bahdja"
                  value={businessName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Lien QR Code unique de votre commerce
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 font-mono">
                  <span>/join/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 bg-transparent text-slate-900 font-bold outline-none pl-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Wilaya</label>
                  <select
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold outline-none focus:border-emerald-500"
                  >
                    {algerianWilayas.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Téléphone Gérant (Identifiant) <span className="text-emerald-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="0550 12 34 56"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Mot de passe Commerçant <span className="text-emerald-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Min. 4 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Email (Optionnel)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="contact@moncommerce.dz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Création sécurisée en cours...</span>
                  ) : (
                    <>
                      <span>Activer mes 14 jours d&apos;essai gratuit</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center pt-2 text-xs text-slate-500">
              Vous avez déjà un compte commerce ?{' '}
              <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-700 underline">
                Se connecter avec votre mot de passe
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-slate-400">
        FidelityDZ SaaS • Plateforme N°1 en Algérie 🇩🇿
      </footer>
    </div>
  );
}
