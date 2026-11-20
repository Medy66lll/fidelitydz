'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import HeroScrollScrub from '@/components/HeroScrollScrub';
import Footer from '@/components/Footer';
import LoyaltyPassSimulator from '@/components/LoyaltyPassSimulator';
import AlgerianPaymentBadges from '@/components/AlgerianPaymentBadges';
import SupportWidget from '@/components/SupportWidget';
import { useLanguage } from '@/context/LanguageContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Zap,
  Star,
  HelpCircle,
  Plus
} from 'lucide-react';

export default function LandingPage() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  // Demo interactive state
  const [demoStamps, setDemoStamps] = useState(7);
  const [demoType, setDemoType] = useState<'STAMPS' | 'POINTS'>('STAMPS');

  const handleAddStamp = () => {
    setDemoStamps(prev => (prev >= 10 ? 1 : prev + 1));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header />

      <main className="flex-1">
        {/* EXPÉRIENCE CINÉMATIQUE SCROLL-SCRUB VIDÉO (GSAP + LENIS) */}
        <HeroScrollScrub />

        {/* CONTENU PRINCIPAL DE LA LANDING PAGE */}
        <div className="relative z-20 bg-slate-50">
          {/* DEMO SIMULATOR HERO SECTION */}
          <section id="demo" className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-white via-slate-50 to-emerald-50/25">
            {/* Ambient Perceptual Light Fields (OKLAB Glow) */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/3 -right-24 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Column: Copy */}
                <div className="lg:col-span-7 flex flex-col items-start space-y-6">
                  {/* Dual-script Pill Badge with Shimmer */}
                  <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/90 px-3.5 py-1.5 rounded-full shadow-xs fdz-shimmer-badge">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-xs font-black text-emerald-900 tracking-tight">
                      🇩🇿 N°1 de la Fidélité Digitale en Algérie
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-black font-arabic text-emerald-700">
                      منصة بطاقات الولاء الأولى
                    </span>
                  </div>

                  {/* Main Heading with Authentic Algerian Emerald Accent */}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.12]">
                    Fidélisez vos clients en Algérie{' '}
                    <span className="text-emerald-600 underline decoration-emerald-400 decoration-wavy decoration-2">
                      sans application
                    </span>{' '}
                    à installer
                  </h1>

                  {/* Arabic Subtitle Card */}
                  <div className="w-full bg-slate-100/90 p-4 rounded-2xl border border-slate-200/80 shadow-xs" dir="rtl">
                    <p className="font-arabic text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                      بطاقة ولاء رقمية لمتجرك في 5 دقائق بدون تطبيق — عبر رمز QR ورقم الهاتف فقط
                    </p>
                  </div>

                  {/* Supporting description */}
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-medium">
                    Passez au niveau supérieur. Créez un Club VIP digital pour votre commerce en quelques clics. 
                    Oubliez les applications compliquées : vos clients s&apos;inscrivent en 5 secondes en scannant votre QR code.
                    <strong className="text-slate-950 font-extrabold block mt-2">
                      ✨ Gérez vos clients, envoyez des notifications push et boostez vos avis Google Maps !
                    </strong>
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl fdz-oklab-accent-bg hover:brightness-105 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02]"
                    >
                      <Sparkles className="w-5 h-5 text-slate-950" />
                      <span>{t('start_free')}</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </Link>
                    <a
                      href="#demo"
                      className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-base border border-slate-200/80 shadow-sm transition-all hover:scale-[1.01]"
                    >
                      <Zap className="w-5 h-5 text-amber-500" />
                      <span>{t('see_demo')}</span>
                    </a>
                  </div>

                  {/* Social proof */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      <strong className="text-slate-950 font-bold">4.9/5</strong> • Plus de{' '}
                      <span className="text-emerald-600 font-extrabold">850 commerces</span> actifs à Alger, Oran, Constantine, Sétif & Blida
                    </p>
                  </div>
                </div>

                {/* Right Column: Live Interactive Simulator */}
                <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
                  {/* Floating Metric 1 */}
                  <div className="absolute -top-4 -left-4 z-20 fdz-glass p-3.5 rounded-2xl border border-white/80 flex items-center gap-3 shadow-xl">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-950">Scan en 2 secondes</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Zéro téléchargement</p>
                    </div>
                  </div>

                  {/* Floating Metric 2 */}
                  <div className="absolute -bottom-4 -right-4 z-20 fdz-glass p-3.5 rounded-2xl border border-white/80 flex items-center gap-3 shadow-xl">
                    <div className="w-9 h-9 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-600">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-950">+35% de retour client</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Mesuré sur 30 jours</p>
                    </div>
                  </div>

                  {/* Digital Pass Simulator */}
                  <div className="w-full">
                    <LoyaltyPassSimulator
                      stampsCount={demoStamps}
                      programType={demoType}
                      isArabic={isAr}
                    />

                    {/* Interactive Button to Try Stamping */}
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={handleAddStamp}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
                        type="button"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>{isAr ? 'اضغط لتجربة ختم البطاقة' : 'Cliquez pour tester un tampon'} ({demoStamps}/10)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS SECTION */}
          <section id="fonctionnement" className="py-20 bg-white border-y border-slate-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/80">
                  {isAr ? 'بساطة فائقة' : 'Simplicité Radicale'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  {isAr ? 'كيف يعمل برنامج الولاء في متجرك ؟' : 'Comment fonctionne FidelityDZ en 3 étapes ?'}
                </h2>
                <p className="text-base text-slate-600 font-medium">
                  {isAr
                    ? 'مصمم خصيصاً للتجارة في الجزائر دون أي تعقيد تقني للكاشير أو الزبون.'
                    : 'Une expérience fluide pensée pour le rush des commerces algériens, sans mot de passe ni SMS payant.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="bg-slate-50/90 rounded-3xl p-8 border border-slate-200/80 relative fdz-card-elevated shadow-sm">
                  <div className="w-12 h-12 rounded-2xl fdz-oklab-accent-bg text-slate-950 flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-emerald-500/20">
                    1
                  </div>
                  <h3 className="text-xl font-black text-slate-950 mb-2">
                    {isAr ? 'اطبع ملصق الـ QR على الكاونتر' : 'Affichez votre QR Code'}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 font-medium">
                    {isAr
                      ? 'قم بتحميل وطباعة ملصق الكاشير الجاهز من حسابك بضغطة واحدة وضعه بجانب جهاز الدفع.'
                      : 'Téléchargez votre affiche PDF officielle et posez-la sur votre comptoir. Vos clients la scannent en attendant leur commande.'}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{isAr ? 'ملصق احترافي A4 / A5 جاهز' : 'Affiche PDF prête en 1 clic'}</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-50/90 rounded-3xl p-8 border border-slate-200/80 relative fdz-card-elevated shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md">
                    2
                  </div>
                  <h3 className="text-xl font-black text-slate-950 mb-2">
                    {isAr ? 'الزبون يسجل برقم هاتفه فقط' : 'Le client saisit son numéro'}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 font-medium">
                    {isAr
                      ? 'يدخل الزبون رقم هاتفه (05 / 06 / 07) واسمه فقط. لا تطبيق، لا بريد إلكتروني، لا كلمة سر.'
                      : "Le client tape simplement son 05, 06 ou 07 et son prénom. Sa carte digitale s'ouvre immédiatement avec son 1er tampon offert."}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{isAr ? 'تسجيل في 5 ثوانٍ بدون كلمة سر' : 'Zéro friction : 5 secondes chrono'}</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-50/90 rounded-3xl p-8 border border-slate-200/80 relative fdz-card-elevated shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-amber-500/20">
                    3
                  </div>
                  <h3 className="text-xl font-black text-slate-950 mb-2">
                    {isAr ? 'الكاشير يمسح ويمنح النقاط' : 'Le caissier valide en caisse'}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 font-medium">
                    {isAr
                      ? 'يمسح الكاشير رمز الـ QR عبر كاميرا هاتفه أو جهاز التابلت ويضيف الختم أو النقاط فوراً مع رنة تأكيد.'
                      : 'Le caissier scanne avec son smartphone ou saisit le numéro pour ajouter des tampons ou valider les cadeaux débloqués.'}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{isAr ? 'رنة صوتية واهتزاز عند النجاح' : 'Bip sonore & animation festive'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* INTERACTIVE DEMO SECTION */}
          <section id="demo" className="py-20 bg-slate-50/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/80">
                    {isAr ? 'جرّب بنفسك' : 'Testez en direct'}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    {isAr ? 'برنامج أختام كلاسيكي أو نقاط شرائية' : 'Mode Tampons ou Mode Points au choix'}
                  </h2>
                  <p className="text-base text-slate-600 leading-relaxed font-medium">
                    Adaptez la mécanique de fidélité selon votre type d&apos;activité :
                    le <strong className="text-slate-950">mode tampons</strong> est idéal pour les cafés, boulangeries, salons de coiffure et fast-foods.
                    Le <strong className="text-slate-950">mode points</strong> convient parfaitement aux boutiques de prêt-à-porter, parfumeries et opticiens.
                  </p>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl w-fit">
                    <button
                      onClick={() => setDemoType('STAMPS')}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        demoType === 'STAMPS'
                          ? 'bg-white text-slate-950 shadow-md font-black'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                      type="button"
                    >
                      {isAr ? 'نظام الأختام (10 أختام)' : 'Mode Tampons (Classique)'}
                    </button>
                    <button
                      onClick={() => setDemoType('POINTS')}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        demoType === 'POINTS'
                          ? 'bg-white text-slate-950 shadow-md font-black'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                      type="button"
                    >
                      {isAr ? 'نظام النقاط (100 دج = نقطة)' : 'Mode Points (Fintech)'}
                    </button>
                  </div>

                  {/* Features list */}
                  <div className="space-y-3.5 pt-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-slate-700">
                        Personnalisation des couleurs et du titre du cadeau en français et arabe
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-slate-700">
                        Rappels automatiques et offres pour clients inactifs depuis 30 jours
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-slate-700">
                        Compatible avec tous les smartphones (Android, iPhone, tablettes caisse)
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/dashboard/program"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-sm shadow-md transition-all hover:scale-[1.02]"
                    >
                      <span>{isAr ? 'افتح استوديو تصميم البطاقة' : 'Ouvrir le Studio Carte'}</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 flex justify-center">
                  <LoyaltyPassSimulator
                    stampsCount={demoStamps}
                    programType={demoType}
                    isArabic={isAr}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* PRICING SECTION */}
          <section id="tarif" className="py-20 bg-white border-t border-slate-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/80">
                  {t('pricing_badge')}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  {t('pricing_title')}
                </h2>
                <p className="text-base text-slate-600 font-medium">
                  {isAr
                    ? 'اشتراك شهري واضح وبسيط بدون عمولات مخفية وبدون مصاريف إضافية.'
                    : "Pas de frais d'installation, pas de commission sur vos ventes. Un tarif forfaitaire tout compris."}
                </p>
              </div>

              {/* Luxury Pricing Card */}
              <div className="max-w-xl mx-auto bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-[2.5rem] p-8 sm:p-11 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden border border-slate-700/80 ring-1 ring-emerald-500/25">
                {/* Highlight ribbon with shimmer */}
                <div className="absolute top-0 right-0 fdz-oklab-accent-bg text-slate-950 text-[11px] font-black uppercase tracking-wider px-5 py-2 rounded-bl-2xl shadow-lg fdz-shimmer-badge">
                  {isAr ? 'العرض الشامل' : 'Tout Compris'}
                </div>

                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/60 px-3.5 py-1 rounded-full text-emerald-400 text-xs font-extrabold shadow-inner">
                    <span>14 jours d&apos;essai gratuit offerts</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-white tabular-nums">
                      3 900 DZD
                    </span>
                    <span className="text-slate-400 font-bold text-base sm:text-lg">
                      {t('per_month')}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {isAr
                      ? 'باقة البداية المثالية لمحلك. يمكنك دائماً زيادة السعة (عدد البطاقات أو الإشعارات) لاحقاً عند نمو عملك عبر إضافات بأسعار مدروسة.'
                      : 'Le forfait idéal pour démarrer. Vous dépassez les limites ? Ajoutez des extensions (cartes, push) sur mesure depuis votre espace admin, uniquement quand vous en avez besoin.'}
                  </p>

                  {/* Features List */}
                  <div className="pt-6 pb-8 border-y border-slate-800 space-y-3.5">
                    {[
                      isAr ? '100 بطاقة ولاء نشطة للزبائن (مع قائمة انتظار تلقائية)' : 'Jusqu\'à 100 cartes clients actives (déblocage auto)',
                      isAr ? 'إشعارات العروض: 100 إشعار / أسبوع' : 'Jusqu\'à 100 notifications push / semaine',
                      isAr ? '2 أجهزة متصلة في نفس الوقت (المدير + الكاشير)' : 'Accès simultané pour 2 appareils (Gérant + Caisse)',
                      isAr ? '3 عروض ترويجية نشطة في نفس الوقت' : 'Jusqu\'à 3 offres promotionnelles actives',
                      isAr ? '1 نقطة بيع رئيسية (إمكانية إضافة فروع متعددة)' : '1 point de vente inclus (multi-locaux sur demande)',
                      isAr ? 'مكافآت متعددة، ألوان مخصصة، وتقييم خرائط جوجل' : 'Multi-cadeaux, couleurs libres, Avis Google Maps & Support 7j/7',
                    ].map((feat, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-slate-200 font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="space-y-3 pt-2">
                    <Link
                      href="/register"
                      className="w-full flex items-center justify-center gap-2 py-4 fdz-oklab-accent-bg hover:brightness-105 text-slate-950 font-black text-base rounded-2xl transition-all shadow-xl shadow-emerald-500/25 hover:scale-[1.01]"
                    >
                      <span>{t('start_free')}</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </Link>

                    <p className="text-center text-xs text-slate-400 font-semibold">
                      {t('free_trial_note')} • Aucun engagement
                    </p>
                  </div>

                  {/* Algerian Payment Badges */}
                  <div className="pt-6 border-t border-slate-800/80">
                    <p className="text-xs text-slate-400 mb-3 text-center font-bold">
                      {isAr ? 'طرق الدفع الرسمية المعتمدة في الجزائر :' : 'Moyens de règlement en Algérie :'}
                    </p>
                    <div className="flex justify-center">
                      <AlgerianPaymentBadges size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ SECTION */}
          <section id="faq" className="py-20 bg-slate-50/70 border-t border-slate-200/80">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-4 mb-16">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/80">
                  FAQ
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  {isAr ? 'الأسئلة الشائعة حول FidelityDZ' : 'Questions Fréquentes'}
                </h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    qFr: 'Mes clients doivent-ils télécharger une application mobile ?',
                    qAr: 'هل يجب على الزبون تحميل تطبيق على هاتفه ؟',
                    aFr: 'Non ! C\'est la force de FidelityDZ. Le client scanne votre QR code avec l\'appareil photo de son smartphone et renseigne son numéro de téléphone. Sa carte s\'ouvre directement dans le navigateur et peut être ajoutée à l\'écran d\'accueil en 1 clic.',
                    aAr: 'إطلاقاً ! هذه هي الميزة الكبرى لـ FidelityDZ. يمسح الزبون رمز الـ QR بكاميرا الهاتف ويكتفي بكتابة رقم هاتفه فقط، فتفتح بطاقته مباشرة على المتصفح مع إمكانية حفظها على الشاشة الرئيسية بنقرة واحدة.'
                  },
                  {
                    qFr: 'Comment s\'effectue le règlement de l\'abonnement (3 900 DZD) ?',
                    qAr: 'كيف يتم تسديد قيمة الاشتراك الشهري (3900 دج) ؟',
                    aFr: 'Le règlement s\'effectue en toute simplicité par virement BaridiMob (RIP 20 chiffres) ou par versement / mandat CCP Algérie Poste. Dès la transmission de votre preuve de paiement depuis votre espace commerçant, votre abonnement est validé en priorité.',
                    aAr: 'يتم التسديد بكل سهولة وأمان عبر تحويل بريدي موب (RIP 20 رقم) أو عبر مكاتب بريد الجزائر (حساب CCP). بمجرد إرفاق صورة الوصل من لوحة التحكم، يتم تفعيل اشتراكك وحسابك فوراً وبأولوية.'
                  },
                  {
                    qFr: 'Quel équipement faut-il à la caisse pour scanner ?',
                    qAr: 'ما هي الأجهزة المطلوبة عند الكاشير لمسح البطاقات ؟',
                    aFr: 'Aucun matériel coûteux n\'est requis. N\'importe quel smartphone, tablette Android/iPad ou ordinateur de caisse avec caméra suffit pour ouvrir l\'interface de scan caissier ultra-rapide.',
                    aAr: 'لا تحتاج لأي جهاز مكلف ! أي هاتف ذكي، أو تابلت أندرويد/آيباد، أو حاسوب متصل بالإنترنت ومزود بكاميرا يفي بالغرض لفتح ماسح الكاشير السريع.'
                  },
                  {
                    qFr: 'Puis-je changer entre le mode tampons et le mode points ?',
                    qAr: 'هل يمكنني التبديل بين نظام الأختام ونظام النقاط ؟',
                    aFr: 'Oui, depuis le Studio de création dans votre espace commerçant, vous pouvez basculer entre le mode tampons et points, ajuster le nombre de tampons requis et modifier le titre de la récompense à tout moment.',
                    aAr: 'نعم بكل تأكيد، من خلال استوديو تصميم البطاقات في حسابك، يمكنك التبديل بين نظام الأختام والنقاط وتعديل عنوان الهدية والعدد المطلوب في أي وقت.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs fdz-card-elevated">
                    <h3 className="text-base sm:text-lg font-black text-slate-950 mb-2 flex items-center gap-2.5">
                      <HelpCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span>{isAr ? item.qAr : item.qFr}</span>
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed pl-7 rtl:pr-7 rtl:pl-0 font-medium">
                      {isAr ? item.aAr : item.aFr}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <SupportWidget defaultRole="VISITOR" />
      <div className="relative z-20"><Footer /></div>
    </div>
  );
}
