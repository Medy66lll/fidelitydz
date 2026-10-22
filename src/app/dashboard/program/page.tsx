'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import LoyaltyPassSimulator from '@/components/LoyaltyPassSimulator';
import { LoyaltyProgram, Merchant } from '@/lib/types';
import {
  Palette,
  CheckCircle2,
  Sparkles,
  Save,
  Gift,
  Coins,
  Check,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertCircle
} from 'lucide-react';

export default function LoyaltyStudioPage() {
  const { t, language } = useLanguage();
  const { currentMerchant, program, updateProgram, updateMerchant } = useMerchant();
  const isAr = language === 'ar';

  const [programType, setProgramType] = useState<'STAMPS' | 'POINTS'>('STAMPS');
  const [stampsRequired, setStampsRequired] = useState(10);
  const [pointsRatio, setPointsRatio] = useState(1);
  const [rewardTitleFr, setRewardTitleFr] = useState('10ème Café ou Pâtisserie Offert');
  const [rewardTitleAr, setRewardTitleAr] = useState('القهوة أو الحلوى العاشرة مجاناً');
  const [welcomeBonus, setWelcomeBonus] = useState(1);
  const [primaryColor, setPrimaryColor] = useState('#10B981');
  const [backgroundColor, setBackgroundColor] = useState('#0F172A');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialTiktok, setSocialTiktok] = useState('');
  const [socialMaps, setSocialMaps] = useState('');
  const [googleReviewRewardEnabled, setGoogleReviewRewardEnabled] = useState(false);
  const [googleReviewRewardBonus, setGoogleReviewRewardBonus] = useState(1);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (program) {
      setProgramType(program.program_type);
      setStampsRequired(program.stamps_required);
      setPointsRatio(program.points_per_100dzd || 1);
      setRewardTitleFr(program.reward_title_fr);
      setRewardTitleAr(program.reward_title_ar);
      setWelcomeBonus(program.welcome_bonus);
      setPrimaryColor(program.primary_color || '#10B981');
      setBackgroundColor(program.background_color || '#0F172A');
    }
    if (currentMerchant) {
      setLogoUrl(currentMerchant.logo_url || '');
      setSocialInstagram(currentMerchant.social_instagram || '');
      setSocialFacebook(currentMerchant.social_facebook || '');
      setSocialTiktok(currentMerchant.social_tiktok || '');
      setSocialMaps(currentMerchant.social_maps || currentMerchant.address || '');
      setGoogleReviewRewardEnabled(Boolean(currentMerchant.google_review_reward_enabled));
      setGoogleReviewRewardBonus(Number(currentMerchant.google_review_reward_bonus || 1));
    }
  }, [program, currentMerchant]);

  // Upload et compression client-side du logo en canvas (max 256x256)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError('');

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setLogoError(
        isAr
          ? 'صيغة غير مدعومة. يرجى اختيار صورة PNG أو JPG أو WEBP.'
          : 'Format non supporté. Utilisez uniquement PNG, JPG ou WEBP.'
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError(
        isAr
          ? 'حجم الصورة كبير جداً (الحد الأقصى 2 ميغابايت).'
          : 'Le fichier dépasse la taille maximale autorisée de 2 Mo.'
      );
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
        setLogoError(isAr ? 'تعذر قراءة ملف الصورة.' : 'Impossible de lire le fichier image.');
        setIsUploadingLogo(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    setLogoError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMerchant || !program) return;

    // Mise à jour du programme avec réseaux sociaux et avis Google
    const updatedProg: LoyaltyProgram = {
      ...program,
      program_type: programType,
      stamps_required: stampsRequired,
      points_per_100dzd: pointsRatio,
      reward_title_fr: rewardTitleFr,
      reward_title_ar: rewardTitleAr,
      welcome_bonus: welcomeBonus,
      primary_color: primaryColor,
      background_color: backgroundColor,
      social_instagram: socialInstagram.trim(),
      social_facebook: socialFacebook.trim(),
      social_tiktok: socialTiktok.trim(),
      social_maps: socialMaps.trim(),
      google_review_reward_enabled: googleReviewRewardEnabled,
      google_review_reward_bonus: Number(googleReviewRewardBonus) || 1,
    };
    updateProgram(updatedProg);

    // Mise à jour du commerçant (avec son logo, réseaux sociaux et localisation)
    const updatedMerchant: Merchant = {
      ...currentMerchant,
      logo_url: logoUrl,
      social_instagram: socialInstagram.trim(),
      social_facebook: socialFacebook.trim(),
      social_tiktok: socialTiktok.trim(),
      social_maps: socialMaps.trim(),
      google_review_reward_enabled: googleReviewRewardEnabled,
      google_review_reward_bonus: Number(googleReviewRewardBonus) || 1,
    };
    updateMerchant(updatedMerchant);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const colorPresets = [
    { name: 'Émeraude Algérie', primary: '#10B981', bg: '#0F172A' },
    { name: 'Or Ambré', primary: '#F59E0B', bg: '#0F172A' },
    { name: 'Bleu Royal', primary: '#2563EB', bg: '#0F172A' },
    { name: 'Rouge Rubis', primary: '#E11D48', bg: '#18181B' },
    { name: 'Violet Sombre', primary: '#8B5CF6', bg: '#09090B' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('studio_title')}
        </h2>
        <p className="text-sm text-slate-600">
          {t('studio_subtitle')}
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{t('saved_success')}</span>
        </div>
      )}

      {/* Grid: Form on Left, Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          
          {/* Logo du Commerce */}
          <div className="space-y-3 pb-6 border-b border-slate-100">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              {isAr ? 'شعار متجرك على البطاقة (Logo)' : 'Logo de votre commerce sur la carte'}
            </label>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'أضف شعار متجرك ليظهر أعلى بطاقة ولاء الزبون وعلى ملصق الصندوق QR.'
                : 'Ajoutez le logo de votre enseigne pour qu\'il apparaisse sur la carte de vos clients et sur l\'affiche QR de caisse.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
              {/* Preview Avatar */}
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner relative group">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={currentMerchant?.business_name || 'Logo'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2">
                    <ImageIcon className="w-7 h-7 text-slate-400 mx-auto" />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Sans logo</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2 w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isUploadingLogo ? 'Optimisation...' : (logoUrl ? 'Changer mon logo' : 'Téléverser mon logo')}</span>
                  </button>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400">
                  PNG, JPG ou WEBP (carré recommandé, max 2 Mo). Redimensionné automatiquement.
                </p>

                {logoError && (
                  <div className="text-xs text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{logoError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Mécanique du programme
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProgramType('STAMPS')}
                className={`p-4 rounded-2xl border text-left rtl:text-right transition-all ${
                  programType === 'STAMPS'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm text-slate-900">
                    {t('mode_stamps')}
                  </span>
                  {programType === 'STAMPS' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-xs text-slate-500">1 passage = 1 tampon. Idéal pour cafés & snacks.</p>
              </button>

              <button
                type="button"
                onClick={() => setProgramType('POINTS')}
                className={`p-4 rounded-2xl border text-left rtl:text-right transition-all ${
                  programType === 'POINTS'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm text-slate-900">
                    {t('mode_points')}
                  </span>
                  {programType === 'POINTS' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <p className="text-xs text-slate-500">Points cumulés selon le montant en DZD.</p>
              </button>
            </div>
          </div>

          {/* Stamps or Points Config */}
          {programType === 'STAMPS' ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {t('stamps_required_label')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[6, 8, 10, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setStampsRequired(num)}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      stampsRequired === num
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {num} tampons
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {t('points_ratio_label')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 5].map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => setPointsRatio(pts)}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      pointsRatio === pts
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pts} pt / 100 DZD
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reward Titles (Bilingual) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {t('reward_name_fr')}
              </label>
              <input
                type="text"
                required
                value={rewardTitleFr}
                onChange={(e) => setRewardTitleFr(e.target.value)}
                placeholder="Ex: 10ème Café Offert"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block font-arabic text-right">
                {t('reward_name_ar')}
              </label>
              <input
                type="text"
                dir="rtl"
                required
                value={rewardTitleAr}
                onChange={(e) => setRewardTitleAr(e.target.value)}
                placeholder="مثال: القهوة العاشرة مجاناً"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-arabic outline-none transition-all"
              />
            </div>
          </div>

          {/* Welcome Bonus */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {t('welcome_bonus_label')}
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={welcomeBonus}
              onChange={(e) => setWelcomeBonus(parseInt(e.target.value || '0', 10))}
              className="w-32 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-sm font-mono outline-none"
            />
            <p className="text-[11px] text-slate-500">
              Offert automatiquement au client lors de sa première inscription par téléphone.
            </p>
          </div>

          {/* Colors customization */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-slate-700 block">
              {t('card_colors')}
            </label>
            <div className="flex flex-wrap gap-2.5">
              {colorPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrimaryColor(preset.primary);
                    setBackgroundColor(preset.bg);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    primaryColor === preset.primary
                      ? 'border-emerald-500 bg-slate-50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.primary }}
                  ></span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Réseaux Sociaux & Avis Google Maps Récompensé */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {isAr ? 'روابط التواصل الاجتماعي وخرائط جوجل' : 'Réseaux Sociaux & Localisation du Commerce'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAr ? 'تظهر هذه الروابط كأزرار مباشرة في أسفل بطاقة الزبون الرقمية.' : 'Ces boutons s\'affichent directement sur la carte de fidélité de vos clients.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Instagram (Lien ou @pseudo)</label>
                <input
                  type="text"
                  placeholder="https://instagram.com/mon_commerce"
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Facebook (Lien de la page)</label>
                <input
                  type="text"
                  placeholder="https://facebook.com/mon_commerce"
                  value={socialFacebook}
                  onChange={(e) => setSocialFacebook(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">TikTok (Lien ou @pseudo)</label>
                <input
                  type="text"
                  placeholder="https://tiktok.com/@mon_commerce"
                  value={socialTiktok}
                  onChange={(e) => setSocialTiktok(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Google Maps (Lien itinéraire ou fiche)</label>
                <input
                  type="text"
                  placeholder="https://maps.app.goo.gl/..."
                  value={socialMaps}
                  onChange={(e) => setSocialMaps(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Récompense Avis Google Maps */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {isAr ? 'مكافأة الزبائن عند تقييم المحل على Google Maps' : 'Récompenser les avis Google Maps (+ Tampons / Points)'}
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      {isAr ? 'يحصل الزبون على مكافأة فورية في بطاقته عند الضغط على زر تقييم محلك.' : 'Le client clique pour noter votre établissement et reçoit un bonus instantané sur sa carte.'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={googleReviewRewardEnabled}
                  onChange={(e) => setGoogleReviewRewardEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {googleReviewRewardEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/60">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Bonus offert au client
                    </label>
                    <select
                      value={googleReviewRewardBonus}
                      onChange={(e) => setGoogleReviewRewardBonus(Number(e.target.value))}
                      className="w-full bg-white border border-amber-300 rounded-xl py-2 px-3 text-xs font-bold outline-none"
                    >
                      <option value={1}>+1 Tampon / +10 Points offert</option>
                      <option value={2}>+2 Tampons / +20 Points offerts</option>
                      <option value={3}>+3 Tampons / +30 Points offerts</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Lien direct pour laisser un avis Google Maps *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: https://g.page/r/.../review"
                      value={socialMaps}
                      onChange={(e) => setSocialMaps(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl py-2 px-3 text-xs outline-none font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Save Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{t('save_changes')}</span>
            </button>
          </div>
        </form>

        {/* Right: Real-time Live Preview */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-center">
          <div className="w-full text-center pb-4 mb-4 border-b border-slate-100">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Aperçu Smartphone en direct
            </span>
          </div>

          <LoyaltyPassSimulator
            businessName={currentMerchant?.business_name}
            category={currentMerchant?.category}
            logoUrl={logoUrl}
            programType={programType}
            stampsCount={7}
            stampsRequired={stampsRequired}
            pointsCount={140}
            rewardTitleFr={rewardTitleFr}
            rewardTitleAr={rewardTitleAr}
            primaryColor={primaryColor}
            backgroundColor={backgroundColor}
            isArabic={isAr}
          />
        </div>
      </div>
    </div>
  );
}
