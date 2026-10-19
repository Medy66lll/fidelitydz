'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { CustomerCard, Merchant, LoyaltyProgram, PersonalizedOffer } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  QrCode,
  Gift,
  Check,
  Trophy,
  Share2,
  Wallet,
  Download,
  Tag,
  Clock,
  Coffee,
  CheckCircle2,
  Smartphone,
  X,
  RefreshCw,
} from 'lucide-react';

export default function CustomerCardPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const rawToken = params?.qrToken;
  const qrToken = decodeURIComponent(Array.isArray(rawToken) ? rawToken[0] : rawToken || '').trim();

  const [card, setCard] = useState<CustomerCard | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [offers, setOffers] = useState<PersonalizedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Wallet & PWA state
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [downloadingPass, setDownloadingPass] = useState(false);
  const hiddenQrRef = useRef<HTMLDivElement>(null);

  const loadCardLive = async (showSpinner = false) => {
    if (!qrToken) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    if (showSpinner) setLoading(true);

    const res = await db.fetchCardByTokenAsync(qrToken);
    if (res.card && res.merchant && res.program) {
      setCard(res.card);
      setMerchant(res.merchant);
      setProgram(res.program);
      setOffers(res.offers || []);
      setNotFound(false);
      setLoading(false);

      if (typeof window !== 'undefined') {
        localStorage.setItem('fidelitydz_last_card_token', res.card.qr_token);
      }

      if (showSpinner && (res.card.rewards_available > 0 || res.card.stamps_balance >= res.program.stamps_required)) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } else {
      setLoading(false);
      setNotFound(true);
    }
  };

  useEffect(() => {
    loadCardLive(true);

    // Rafraîchissement automatique toutes les 6 secondes pour voir les tampons ajoutés en caisse en direct
    const interval = setInterval(() => {
      loadCardLive(false);
    }, 6000);

    return () => clearInterval(interval);
  }, [qrToken]);

  // Inject dynamic PWA manifest so "Add to Home Screen" opens this exact card URL
  useEffect(() => {
    if (typeof document === 'undefined' || !card || !merchant) return;
    let link: HTMLLinkElement | null = document.querySelector("link[rel='manifest']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = `/api/manifest?token=${encodeURIComponent(card.qr_token)}&name=${encodeURIComponent(merchant.business_name)}`;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [card, merchant]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Génère et télécharge un vrai Pass Wallet HD (Format Apple/Google Wallet Pass Image avec QR Code intégré)
  const handleDownloadWalletPass = () => {
    if (!card || !merchant || !program) return;
    setDownloadingPass(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 750;
      canvas.height = 1150;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = program.background_color || '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top Header Accent Bar
      ctx.fillStyle = program.primary_color || '#10B981';
      ctx.fillRect(0, 0, canvas.width, 28);

      // Store Title
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('PASS FIDÉLITÉ WALLET • FIDELITYDZ', 50, 90);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText(merchant.business_name, 50, 145);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '24px sans-serif';
      ctx.fillText(`${merchant.wilaya} • ${merchant.category}`, 50, 185);

      // Divider
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 220);
      ctx.lineTo(700, 220);
      ctx.stroke();

      // Customer Info & Balance
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('TITULAIRE DE LA CARTE', 50, 270);
      ctx.fillText('SOLDE ACTUEL', 480, 270);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText(card.customer_name, 50, 315);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(
        program.program_type === 'STAMPS'
          ? `${card.stamps_balance} / ${program.stamps_required} Tampons`
          : `${card.points_balance} Points`,
        480,
        315
      );

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '24px monospace';
      ctx.fillText(`Tél : ${card.customer_phone}`, 50, 355);

      // Reward Box
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(50, 395, 650, 95);
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('🎁 RÉCOMPENSE FIDÉLITÉ :', 75, 435);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(program.reward_title_fr, 75, 472);

      // White QR Box
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(155, 535, 440, 460);

      const qrCanvas = hiddenQrRef.current?.querySelector('canvas');
      if (qrCanvas) {
        ctx.drawImage(qrCanvas, 195, 560, 360, 360);
      }

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(card.customer_phone, 375, 955);
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Présentez ce Pass en caisse pour scanner', 375, 982);

      // Footer
      ctx.fillStyle = '#64748B';
      ctx.font = '18px sans-serif';
      ctx.fillText(`Lien direct : ${window.location.origin}/card/${card.qr_token}`, 375, 1080);

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Wallet_Pass_${merchant.slug}_${card.customer_phone}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.warn('Error generating wallet pass:', e);
    }
    setDownloadingPass(false);
  };

  const handleTriggerPwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setWalletModalOpen(false);
    } else {
      handleDownloadWalletPass();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="text-sm text-slate-400">Chargement de votre carte de fidélité...</p>
        </div>
      </div>
    );
  }

  if (notFound || !card || !merchant || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold">Retrouver votre Carte de Fidélité</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ce lien de carte n&apos;est plus actif ou a changé. Scannez le QR code du commerce ou accédez à l&apos;accueil pour retrouver vos tampons avec votre numéro <strong>05 / 06 / 07</strong>.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => loadCardLive(true)}
              className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Réessayer le chargement</span>
            </button>
            <Link
              href="/"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs block"
            >
              Retour à l&apos;accueil FidelityDZ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isRewardReady = card.rewards_available > 0 || card.stamps_balance >= program.stamps_required;
  const stampsRemaining = Math.max(0, program.stamps_required - card.stamps_balance);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pb-10">
      {/* Hidden high-res QR Canvas for Wallet Pass download */}
      <div ref={hiddenQrRef} className="hidden" aria-hidden="true">
        <QRCodeCanvas value={card.qr_token} size={360} level="H" includeMargin={false} />
      </div>

      {/* APPLE / GOOGLE WALLET & PWA INSTALL MODAL */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Apple / Google Wallet & Écran</h3>
                  <p className="text-[11px] text-slate-400">Gardez votre carte toujours prête en caisse</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWalletModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Download Wallet Pass Card */}
              <button
                type="button"
                onClick={handleDownloadWalletPass}
                disabled={downloadingPass}
                className="w-full p-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-left flex items-center justify-between transition-all shadow-lg shadow-emerald-500/20"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <div className="text-sm">Télécharger mon Pass Wallet (HD)</div>
                    <div className="text-[11px] font-semibold opacity-80">
                      Enregistre la carte avec votre QR Code sur votre téléphone (hors-ligne)
                    </div>
                  </div>
                </div>
              </button>

              {/* Option 2: Direct Android Install if supported */}
              {deferredPrompt && (
                <button
                  type="button"
                  onClick={handleTriggerPwaInstall}
                  className="w-full p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-white font-bold text-left flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="text-sm">Installer l&apos;icône directe sur l&apos;écran</div>
                      <div className="text-[11px] text-slate-400">
                        Ouvre directement votre carte en 1 clic comme une application
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {/* Guide iPhone / Android */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="font-bold text-emerald-400">
                  📲 Raccourci direct sur l&apos;écran d&apos;accueil (Synchronisé en direct) :
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  • <strong>Sur iPhone (Safari) :</strong> appuyez sur le bouton <strong>Partager</strong> en bas puis sur <strong>« Sur l&apos;écran d&apos;accueil »</strong>.<br />
                  • <strong>Sur Android (Chrome) :</strong> appuyez sur le menu <strong>⋮</strong> en haut à droite puis sur <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong>.<br />
                  <span className="text-emerald-400 font-semibold">✔ Votre carte se chargera automatiquement depuis le serveur à chaque ouverture !</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setWalletModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">
                {merchant.business_name}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">
                {isAr ? 'عضو الولاء' : 'Membre Club Fidélité'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadCardLive(false)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              title="Actualiser mes points"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto w-full px-4 pt-6 space-y-6">
        {/* Pass Card Container */}
        <div
          className="rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-white/10"
          style={{ backgroundColor: program.background_color || '#0F172A' }}
        >
          <div
            className="absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ backgroundColor: program.primary_color || '#10B981' }}
          ></div>

          {/* Pass Header */}
          <div className="flex items-start justify-between pb-5 border-b border-white/10 relative z-10">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-1">
                {isAr ? 'بطاقة الولاء الرقمية' : 'Pass Fidélité Numérique'}
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                {card.customer_name}
              </h2>
              <p className="text-xs text-slate-400 font-mono tracking-wider pt-0.5">
                {card.customer_phone}
              </p>
            </div>

            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg font-bold"
              style={{ backgroundColor: program.primary_color || '#10B981' }}
            >
              <Coffee className="w-6 h-6" />
            </div>
          </div>

          {/* Reward Ready Alert */}
          {isRewardReady ? (
            <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/30 border border-amber-400/40 relative z-10 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center flex-shrink-0 font-bold">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                    {isAr ? '🎉 مبروك ! هديتك جاهزة' : '🎉 Récompense débloquée !'}
                  </h4>
                  <p className="text-sm font-bold text-white">
                    {isAr ? program.reward_title_ar : program.reward_title_fr}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="my-5 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Gift className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {isAr ? 'الهدية القادمة' : 'Prochaine récompense'}
                  </p>
                  <p className="text-xs font-bold text-white">
                    {isAr ? program.reward_title_ar : program.reward_title_fr}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                {isAr ? `${stampsRemaining} متبقي` : `${stampsRemaining} restant(s)`}
              </span>
            </div>
          )}

          {/* Stamps Progression Grid */}
          {program.program_type === 'STAMPS' ? (
            <div className="my-5 relative z-10">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-3 font-semibold">
                <span>{t('stamps_progress')}</span>
                <span className="text-emerald-400 font-bold">
                  {card.stamps_balance} / {program.stamps_required}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2.5">
                {Array.from({ length: program.stamps_required }).map((_, index) => {
                  const isFilled = index < card.stamps_balance;
                  const isLast = index === program.stamps_required - 1;

                  return (
                    <div
                      key={index}
                      className={`h-12 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                        isFilled
                          ? 'shadow-lg text-white scale-100'
                          : 'border-2 border-dashed border-white/15 bg-white/5 text-slate-500'
                      }`}
                      style={{
                        backgroundColor: isFilled
                          ? isLast
                            ? '#F59E0B'
                            : program.primary_color || '#10B981'
                          : undefined,
                      }}
                    >
                      {isFilled ? (
                        isLast ? (
                          <Trophy className="w-5 h-5 text-white animate-bounce" />
                        ) : (
                          <Check className="w-5 h-5 stroke-[3]" />
                        )
                      ) : isLast ? (
                        <Gift className="w-5 h-5 text-amber-400/60" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="my-5 p-4 rounded-2xl bg-white/5 border border-white/10 relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">{t('points_balance')}</span>
                <span className="text-2xl font-black text-amber-400">{card.points_balance} pts</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (card.points_balance / 200) * 100)}%`,
                    backgroundColor: program.primary_color || '#10B981',
                  }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-400 text-right">
                {isAr ? 'اجمع النقاط مع كل عملية شراء واستبدلها بهدايا' : "1 point par tranche de 100 DZD d'achat"}
              </p>
            </div>
          )}

          {/* Cashier QR Presentation */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col items-center bg-white rounded-2xl p-5 text-slate-900 shadow-xl relative z-10">
            <QRCodeSVG value={card.qr_token} size={140} level="M" includeMargin={false} />
            <p className="mt-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
              {t('show_qr_to_cashier')}
            </p>
            <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">
              {card.customer_phone}
            </p>
          </div>

          {/* Pass Stats Footer */}
          <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{card.total_visits} {t('total_visits_count')}</span>
            </span>
            <span>
              {t('member_since')} {new Date(card.created_at).toLocaleDateString('fr-DZ')}
            </span>
          </div>
        </div>

        {/* Action Buttons: Apple/Google Wallet Pass & Share */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setWalletModalOpen(true)}
            className="flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            type="button"
          >
            <Wallet className="w-4 h-4" />
            <span>{isAr ? 'إضافة إلى Wallet / الهاتف' : 'Ajouter à Apple / Google Wallet'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl transition-all shadow-sm"
            type="button"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>{copiedLink ? (isAr ? 'تم نسخ الرابط !' : 'Lien copié !') : (isAr ? 'نسخ رابط بطاقتي' : 'Copier le lien de ma carte')}</span>
          </button>
        </div>

        {/* Personalized Offers Section */}
        {offers.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span>{t('exclusive_offers')}</span>
              </h3>
              <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                {offers.length} {isAr ? 'عروض نشطة' : 'offres actives'}
              </span>
            </div>

            <div className="space-y-2.5">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1.5 shadow-md hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white">
                      {isAr && offer.title_ar ? offer.title_ar : offer.title_fr}
                    </span>
                    {offer.target_segment === 'VIP' && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full">
                        VIP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isAr && offer.description_ar ? offer.description_ar : offer.description_fr}
                  </p>
                  {offer.valid_until && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {isAr ? 'صالح حتى :' : "Valable jusqu'au :"}{' '}
                        {new Date(offer.valid_until).toLocaleDateString('fr-DZ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-xs text-slate-500">
        FidelityDZ • {merchant.business_name}
      </footer>
    </div>
  );
}
