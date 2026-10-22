'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoyaltyPassSimulator from '@/components/LoyaltyPassSimulator';
import AlgerianPaymentBadges from '@/components/AlgerianPaymentBadges';
import { useLanguage } from '@/context/LanguageContext';
import {
  Sparkles,
  ArrowRight,
  QrCode,
  Smartphone,
  CheckCircle2,
  TrendingUp,
  Zap,
  Shield,
  Star,
  Users,
  Building2,
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
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />

      <main className="flex-1 pt-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-white via-slate-50 to-emerald-50/20">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-emerald-300/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/3 -right-24 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Copy */}
              <div className="lg:col-span-7 flex flex-col items-start space-y-6">
                {/* Dual-script Badge */}
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-bold text-emerald-900">
                    🇩🇿 N°1 de la Fidélité Digitale en Algérie
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs font-bold font-arabic text-emerald-700">
                    منصة بطاقات الولاء الأولى
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Fidélisez vos clients en Algérie{' '}
                  <span className="text-emerald-600 underline decoration-emerald-400 decoration-wavy decoration-2">
                    sans application
                  </span>{' '}
                  à installer
                </h1>

                {/* Arabic Subtitle */}
                <div className="w-full bg-slate-100/80 p-4 rounded-xl border border-slate-200/70" dir="rtl">
                  <p className="font-arabic text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
                    بطاقة ولاء رقمية لمتجرك في 5 دقائق بدون تطبيق — عبر رمز QR ورقم الهاتف فقط
                  </p>
                </div>

                {/* Supporting description */}
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  Remplacez vos cartes de fidélité papier perdues ou oubliées par une carte digitale interactive stockée dans le smartphone du client.
                  <strong className="text-slate-900 font-semibold"> Zéro friction :</strong> inscription immédiate par numéro de téléphone algérien.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02]"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>{t('start_free')}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Link>
                  <a
                    href="#demo"
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base border border-slate-200 shadow-sm transition-all"
                  >
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span>{t('see_demo')}</span>
                  </a>
                </div>

                {/* Social proof */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    <strong className="text-slate-900 font-bold">4.9/5</strong> • Plus de{' '}
                    <span className="text-emerald-600 font-bold">850 commerces</span> actifs à Alger, Oran, Constantine, Sétif & Blida
                  </p>
                </div>
              </div>

              {/* Right Column: Live Interactive Simulator */}
              <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
                {/* Floating Metric 1 */}
                <div className="absolute -top-4 -left-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Scan en 2 secondes</p>
                    <p className="text-[10px] text-slate-500">Zéro téléchargement</p>
                  </div>
                </div>

                {/* Floating Metric 2 */}
                <div className="absolute -bottom-4 -right-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">+35% de retour client</p>
                    <p className="text-[10px] text-slate-500">Mesuré sur 30 jours</p>
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
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-md transition-all hover:scale-105"
                      type="button"
                    >
                      <Plus className="w-4 h-4" />
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
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                {isAr ? 'بساطة فائقة' : 'Simplicité Radicale'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {isAr ? 'كيف يعمل برنامج الولاء في متجرك ؟' : 'Comment fonctionne FidelityDZ en 3 étapes ?'}
              </h2>
              <p className="text-base text-slate-600">
                {isAr
                  ? 'مصمم خصيصاً للتجارة في الجزائر دون أي تعقيد تقني للكاشير أو الزبون.'
                  : 'Une expérience fluide pensée pour le rush des commerces algériens, sans mot de passe ni SMS payant.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/70 relative hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-emerald-500/20">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {isAr ? 'اطبع ملصق الـ QR على الكاونتر' : 'Affichez votre QR Code'}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {isAr
                    ? 'قم بتحميل وطباعة ملصق الكاشير الجاهز من حسابك بضغطة واحدة وضعه بجانب جهاز الدفع.'
                    : 'Téléchargez votre affiche PDF officielle et posez-la sur votre comptoir. Vos clients la scannent en attendant leur commande.'}
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{isAr ? 'ملصق احترافي A4 / A5 جاهز' : 'Affiche PDF prête en 1 clic'}</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/70 relative hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {isAr ? 'الزبون يسجل برقم هاتفه فقط' : 'Le client saisit son numéro'}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {isAr
                    ? 'يدخل الزبون رقم هاتفه (05 / 06 / 07) واسمه فقط. لا تطبيق، لا بريد إلكتروني، لا كلمة سر.'
                    : 'Le client tape simplement son 05, 06 ou 07 et son prénom. Sa carte digitale s\'ouvre immédiatement avec son 1er tampon offert.'}
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{isAr ? 'تسجيل في 5 ثوانٍ بدون كلمة سر' : 'Zéro friction : 5 secondes chrono'}</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/70 relative hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-amber-500/20">
                  3
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {isAr ? 'الكاشير يمسح ويمنح النقاط' : 'Le caissier valide en caisse'}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {isAr
                    ? 'يمسح الكاشير رمز الـ QR عبر كاميرا هاتفه أو جهاز التابلت ويضيف الختم أو النقاط فوراً مع رنة تأكيد.'
                    : 'Le caissier scanne avec son smartphone ou saisit le numéro pour ajouter des tampons ou valider les cadeaux débloqués.'}
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{isAr ? 'رنة صوتية واهتزاز عند النجاح' : 'Bip sonore & animation festive'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE DEMO SECTION */}
        <section id="demo" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                  {isAr ? 'جرّب بنفسك' : 'Testez en direct'}
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {isAr ? 'برنامج أختام كلاسيكي أو نقاط شرائية' : 'Mode Tampons ou Mode Points au choix'}
                </h2>
                <p className="text-base text-slate-600 leading-relaxed">
                  Adaptez la mécanique de fidélité selon votre type d&apos;activité :
                  le <strong className="text-slate-900">mode tampons</strong> est idéal pour les cafés, boulangeries, salons de coiffure et fast-foods.
                  Le <strong className="text-slate-900">mode points</strong> convient parfaitement aux boutiques de prêt-à-porter, parfumeries et opticiens.
                </p>

                {/* Mode Selector */}
                <div className="flex items-center gap-3 p-1.5 bg-slate-200/80 rounded-xl w-fit">
                  <button
                    onClick={() => setDemoType('STAMPS')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      demoType === 'STAMPS'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    type="button"
                  >
                    {isAr ? 'نظام الأختام (10 أختام)' : 'Mode Tampons (Classique)'}
                  </button>
                  <button
                    onClick={() => setDemoType('POINTS')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      demoType === 'POINTS'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    type="button"
                  >
                    {isAr ? 'نظام النقاط (100 دج = نقطة)' : 'Mode Points (Fintech)'}
                  </button>
                </div>

                {/* Features list */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-700">
                      Personnalisation des couleurs et du titre du cadeau en français et arabe
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-700">
                      Rappels automatiques et offres pour clients inactifs depuis 30 jours
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-700">
                      Compatible avec tous les smartphones (Android, iPhone, tablettes caisse)
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/dashboard/program"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md"
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
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                {t('pricing_badge')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {t('pricing_title')}
              </h2>
              <p className="text-base text-slate-600">
                {isAr
                  ? 'اشتراك شهري واضح وبسيط بدون عمولات مخفية وبدون مصاريف إضافية.'
                  : 'Pas de frais d\'installation, pas de commission sur vos ventes. Un tarif forfaitaire tout compris.'}
              </p>
            </div>

            {/* Single Pricing Card */}
            <div className="max-w-xl mx-auto bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
              {/* Highlight ribbon */}
              <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-bl-xl shadow-md">
                {isAr ? 'العرض الشامل' : 'Tout Compris'}
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold">
                  <span>14 jours d&apos;essai gratuit offerts</span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                    3 900 DZD
                  </span>
                  <span className="text-slate-400 font-semibold text-base sm:text-lg">
                    {t('per_month')}
                  </span>
                </div>

                <p className="text-sm text-slate-300">
                  {isAr
                    ? 'كل ما تحتاجه لبدء وإدارة برنامج الولاء لجميع فروعك ومحلاتك.'
                    : 'Rentabilisé dès la première semaine grâce à l\'augmentation du panier moyen et de la fréquence de visite.'}
                </p>

                {/* Features List */}
                <div className="pt-6 pb-8 border-y border-slate-800 space-y-3.5">
                  {[
                    t('pricing_feature_1'),
                    t('pricing_feature_2'),
                    t('pricing_feature_3'),
                    t('pricing_feature_4'),
                    t('pricing_feature_5'),
                    t('pricing_feature_6'),
                  ].map((feat, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-slate-200">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="space-y-3 pt-2">
                  <Link
                    href="/register"
                    className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.01]"
                  >
                    <span>{t('start_free')}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Link>

                  <p className="text-center text-xs text-slate-400 font-medium">
                    {t('free_trial_note')} • Aucun engagement
                  </p>
                </div>

                {/* Algerian Payment Badges */}
                <div className="pt-6 border-t border-slate-800">
                  <p className="text-xs text-slate-400 mb-3 text-center">
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
        <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
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
                  aFr: 'Deux modes de paiement algériens sont proposés : (1) Paiement automatique et instantané par carte Edahabia ou CIB via la passerelle officielle Chargily Pay V2. (2) Virement manuel par BaridiMob ou CCP vers le compte officiel de la plateforme, avec activation après vérification du reçu.',
                  aAr: 'نوفر خيارين للدفع الجزائري : (1) دفع تلقائي وفوري عبر البطاقة الذهبية أو بطاقة CIB عبر بوابة Chargily Pay V2 المعتمدة. (2) أو تحويل يدوي عبر بريدي موب / CCP نحو الحساب الرسمي للمنصة ورفع صورة الوصل للتفعيل السريع.'
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
                <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>{isAr ? item.qAr : item.qFr}</span>
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed pl-7 rtl:pr-7 rtl:pl-0">
                    {isAr ? item.aAr : item.aFr}
                  </p>
                </div>
              ))}
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="mt-10 p-6 bg-emerald-950 text-white rounded-3xl border border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1 text-center sm:text-left rtl:sm:text-right">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Une question sur la mise en place de votre carte ?
                </span>
                <h4 className="text-lg font-black text-white">
                  Contactez directement notre équipe commerciale en Algérie
                </h4>
                <p className="text-xs text-slate-300">
                  Assistance disponible 7j/7 pour les commerçants de toutes les wilayas.
                </p>
              </div>
              <a
                href="https://wa.me/213541534762"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-md flex items-center gap-2 flex-shrink-0"
              >
                <span>WhatsApp : +213 541 53 47 62</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
