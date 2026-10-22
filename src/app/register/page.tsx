'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import LanguageToggle from '@/components/LanguageToggle';
import { db, generateUuid } from '@/lib/db';
import { Merchant, ALGERIAN_WILAYAS_69 } from '@/lib/types';
import {
  QrCode,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  MessageCircle,
  MapPin,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';

export default function RegisterMerchantPage() {
  const { language } = useLanguage();
  const { loginMerchantSession, refreshMerchantData } = useMerchant();
  const router = useRouter();
  const isAr = language === 'ar';

  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Café, Salon de thé & Pâtisserie');
  const [wilaya, setWilaya] = useState('16 - Alger (الجزائر العاصمة)');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdMerchant, setCreatedMerchant] = useState<Merchant | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type.toLowerCase())) {
      setError(isAr ? 'صيغة غير مدعومة. يرجى اختيار صورة PNG أو JPG أو WEBP.' : 'Format non supporté. Utilisez PNG, JPG ou WEBP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(isAr ? 'حجم الصورة كبير جداً (الحد الأقصى 2 ميغابايت).' : 'Image trop volumineuse (max 2 Mo).');
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/png', 0.9);
          setLogoUrl(compressed);
        }
        setIsUploadingLogo(false);
      };
      img.onerror = () => {
        setError('Impossible de lire le fichier image.');
        setIsUploadingLogo(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const getWhatsAppAdminNotificationUrl = (m: Merchant) => {
    const ownerWa = db.getOwnerWhatsapp() || '213550000000';
    const text = `🆕 *NOUVEAU COMMERCE INSCRIT (ESSAI 14 JOURS)*\n\n🏪 *Commerce :* ${m.business_name}\n📍 *Wilaya :* ${m.wilaya}\n📍 *Localisation :* ${m.address || 'Non renseignée'}\n📧 *Email :* ${m.email}\n📂 *Catégorie :* ${m.category}\n📞 *Tél Gérant (Login) :* ${m.phone}\n🔑 *Mot de passe :* ${m.password}\n🔗 *Lien QR Client :* ${typeof window !== 'undefined' ? window.location.origin : 'https://fidelitydz.vercel.app'}/join/${m.slug}\n⏳ *Fin essai 14j :* ${new Date(m.subscription_ends_at).toLocaleDateString('fr-DZ')}`;
    return `https://wa.me/${ownerWa}?text=${encodeURIComponent(text)}`;
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

    if (!email.trim() || !email.includes('@')) {
      setError("L'adresse email est obligatoire pour votre compte commerce.");
      return;
    }

    if (!address.trim()) {
      setError('Veuillez indiquer la localisation ou adresse de votre commerce.');
      return;
    }

    if (password.trim().length < 4) {
      setError("Veuillez choisir un mot de passe d'au moins 4 caractères pour sécuriser votre espace.");
      return;
    }

    setLoading(true);

    await db.syncFromSupabase();
    const existingBySlug = db.getMerchantBySlug(slug.toLowerCase().trim());
    const finalSlug = existingBySlug
      ? `${slug.toLowerCase().trim()}-${Math.floor(100 + Math.random() * 900)}`
      : slug.toLowerCase().trim();

    const newMerchant: Merchant = {
      id: generateUuid(),
      business_name: businessName.trim(),
      slug: finalSlug,
      category,
      wilaya,
      address: address.trim(),
      phone: cleanedPhone,
      email: email.trim(),
      password: password.trim(),
      logo_url: logoUrl || undefined,
      subscription_status: 'TRIAL',
      subscription_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
    };

    try {
      const saved = await db.registerMerchantAsync(newMerchant);
      loginMerchantSession(saved);
      await refreshMerchantData();
      setCreatedMerchant(saved);
      setLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(msg);
      setLoading(false);
    }
  };

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
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-extrabold text-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Fidelity<span className="text-emerald-500">DZ</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Déjà inscrit ? Connexion
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
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                ✔ Enregistré sur Supabase & Espace Admin (PC & Mobile)
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Bienvenue, {createdMerchant.business_name} !
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Vos <strong>14 jours d&apos;essai gratuit</strong> sont activés. Vous pouvez maintenant vous connecter depuis votre PC ou votre téléphone avec votre numéro et votre mot de passe.
              </p>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-2xl text-left text-xs space-y-1.5 font-mono">
              <div className="text-emerald-400 font-bold uppercase">Vos identifiants de connexion (PC & Téléphone) :</div>
              <div>Téléphone (Identifiant) : <strong>{createdMerchant.phone}</strong></div>
              <div>Email : <strong>{createdMerchant.email}</strong></div>
              <div>Localisation : <strong>{createdMerchant.address || createdMerchant.wilaya}</strong></div>
              <div>Mot de passe : <strong>{createdMerchant.password}</strong></div>
              <div>Lien QR Client : <strong>/join/{createdMerchant.slug}</strong></div>
              <div>Fin de l&apos;essai 14j : <strong>{new Date(createdMerchant.subscription_ends_at).toLocaleDateString('fr-DZ')}</strong></div>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={getWhatsAppAdminNotificationUrl(createdMerchant)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>1. Envoyer ma confirmation d&apos;inscription sur WhatsApp Admin</span>
              </a>

              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>2. Ouvrir mon Espace Commerçant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
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
                Synchronisé automatiquement entre votre PC, votre téléphone et Supabase.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Logo Upload Option */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl border border-slate-300 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800">
                    Logo du commerce (Optionnel)
                  </div>
                  <p className="text-[11px] text-slate-500">Visible sur la carte de vos clients</p>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800 flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3 text-emerald-400" />
                      <span>{isUploadingLogo ? '...' : logoUrl ? 'Changer' : 'Téléverser'}</span>
                    </button>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[11px] font-bold border border-red-200 hover:bg-red-100 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Effacer</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Nom du Commerce */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Nom du Commerce / Enseigne <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pâtisserie La Rose d'Alger"
                  value={businessName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              {/* URL Slug */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Lien QR pour vos clients (Slug) <span className="text-emerald-500">*</span>
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono">
                  <span className="text-slate-400">fidelitydz.com/join/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="bg-transparent font-bold text-emerald-600 outline-none flex-1 ml-1"
                  />
                </div>
              </div>

              {/* Catégorie & 69 Wilayas */}
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
                  <label className="text-xs font-bold text-slate-700 block">
                    Wilaya (69 Wilayas d&apos;Algérie) <span className="text-emerald-500">*</span>
                  </label>
                  <select
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold outline-none focus:border-emerald-500"
                  >
                    {ALGERIAN_WILAYAS_69.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Localisation / Adresse */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Localisation / Adresse ou Lien Google Maps <span className="text-emerald-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: 14 Rue Didouche Mourad, Alger Centre (ou lien Google Maps)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Téléphone & Mot de Passe */}
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

              {/* Email Obligatoire */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Email du Commerce <span className="text-emerald-500">* (Obligatoire)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
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
                    <span>Enregistrement sur Supabase en cours...</span>
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
