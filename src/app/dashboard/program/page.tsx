'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import LoyaltyPassSimulator from '@/components/LoyaltyPassSimulator';
import { LoyaltyProgram } from '@/lib/types';
import {
  Palette,
  CheckCircle2,
  Sparkles,
  Save,
  Gift,
  Coins,
  Check,
  RefreshCw
} from 'lucide-react';

export default function LoyaltyStudioPage() {
  const { t, language } = useLanguage();
  const { currentMerchant, program, updateProgram } = useMerchant();
  const isAr = language === 'ar';

  const [programType, setProgramType] = useState<'STAMPS' | 'POINTS'>('STAMPS');
  const [stampsRequired, setStampsRequired] = useState(10);
  const [pointsRatio, setPointsRatio] = useState(1);
  const [rewardTitleFr, setRewardTitleFr] = useState('10ème Café ou Pâtisserie Offert');
  const [rewardTitleAr, setRewardTitleAr] = useState('القهوة أو الحلوى العاشرة مجاناً');
  const [welcomeBonus, setWelcomeBonus] = useState(1);
  const [primaryColor, setPrimaryColor] = useState('#10B981');
  const [backgroundColor, setBackgroundColor] = useState('#0F172A');
  const [savedSuccess, setSavedSuccess] = useState(false);

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
  }, [program]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMerchant || !program) return;

    const updated: LoyaltyProgram = {
      ...program,
      program_type: programType,
      stamps_required: stampsRequired,
      points_per_100dzd: pointsRatio,
      reward_title_fr: rewardTitleFr,
      reward_title_ar: rewardTitleAr,
      welcome_bonus: welcomeBonus,
      primary_color: primaryColor,
      background_color: backgroundColor,
    };

    updateProgram(updated);
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
