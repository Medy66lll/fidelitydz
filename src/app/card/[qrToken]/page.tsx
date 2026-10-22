'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
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
  Maximize2,
  MapPin,
  ExternalLink,
  Star,
} from 'lucide-react';

export default function CustomerCardPage() {
  const params = useParams();
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

  // Apple / Google Wallet Pass & Kiosk Mode
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [appleWalletFullscreen, setAppleWalletFullscreen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [downloadingPass, setDownloadingPass] = useState(false);
  const [googleReviewClaimed, setGoogleReviewClaimed] = useState(false);
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
        const claimed = localStorage.getItem(`fidelitydz_gr_claimed_${res.card.id}`) === 'true';
        setGoogleReviewClaimed(claimed);
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
    const interval = setInterval(() => {
      loadCardLive(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [qrToken]);

  // Inject iOS Web App meta tags + dynamic PWA manifest so iPhone "Add to Home Screen" opens in standalone Apple Wallet style
  useEffect(() => {
    if (typeof document === 'undefined' || !card || !merchant) return;
    let link: HTMLLinkElement | null = document.querySelector("link[rel='manifest']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = `/api/manifest?token=${encodeURIComponent(card.qr_token)}&name=${encodeURIComponent(merchant.business_name)}`;

    const setMeta = (name: string, content: string) => {
      let m = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement | null;
      if (!m) {
        m = document.createElement('meta');
        m.name = name;
        document.head.appendChild(m);
      }
      m.content = content;
    };
    setMeta('apple-mobile-web-app-capable', 'yes');
    setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    setMeta('apple-mobile-web-app-title', merchant.business_name);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [card, merchant]);

  const handleClaimGoogleReview = () => {
    if (!card || !merchant || googleReviewClaimed) return;
    const mapsLink = merchant.social_maps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(merchant.business_name + ' ' + merchant.wilaya)}`;
    window.open(mapsLink, '_blank');

    const bonus = Number(merchant.google_review_reward_bonus || 1);
    const updatedCard = { ...card };
    if (program?.program_type === 'STAMPS') {
      updatedCard.stamps_balance += bonus;
      const req = program.stamps_required || 10;
      if (updatedCard.stamps_balance >= req) {
        updatedCard.rewards_available = (updatedCard.rewards_available || 0) + Math.floor(updatedCard.stamps_balance / req);
        updatedCard.stamps_balance = updatedCard.stamps_balance % req;
      }
    } else {
      updatedCard.points_balance += bonus * 10;
    }
    updatedCard.last_visit_at = new Date().toISOString();
    db.saveCard(updatedCard);
    setCard(updatedCard);
    setGoogleReviewClaimed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`fidelitydz_gr_claimed_${card.id}`, 'true');
    }
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator
          .share({
            title: `Carte Fidélité — ${merchant?.business_name}`,
            text: `Ma carte de fidélité digitale chez ${merchant?.business_name}`,
            url: window.location.href,
          })
          .catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    }
  };

  // Génère l'image Pass format Apple Wallet et ouvre le menu natif iOS/Android (Enregistrer l'image / Ajouter)
  const handleSaveAppleWalletPass = async () => {
    if (!card || !merchant || !program) return;
    setDownloadingPass(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 750;
      canvas.height = 1180;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fond style Apple Wallet
      ctx.fillStyle = program.background_color || '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Encoche supérieure Apple Wallet
      ctx.fillStyle = program.primary_color || '#10B981';
      ctx.fillRect(0, 0, canvas.width, 32);

      // En-tête Pass
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('APPLE / GOOGLE WALLET PASS • FIDELITYDZ', 50, 90);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(merchant.business_name, 50, 148);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '24px sans-serif';
      ctx.fillText(`${merchant.wilaya} • ${merchant.category}`, 50, 188);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 222);
      ctx.lineTo(700, 222);
      ctx.stroke();

      // Client & Solde
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('MEMBRE FIDÉLITÉ', 50, 270);
      ctx.fillText('SOLDE', 480, 270);

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
      ctx.fillText(`N° : ${card.customer_phone}`, 50, 355);

      // Récompense
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(50, 395, 650, 95);
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('🎁 RÉCOMPENSE :', 75, 435);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(program.reward_title_fr, 75, 472);

      // Zone QR Blanche haute luminosité
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(155, 530, 440, 470);

      const qrCanvas = hiddenQrRef.current?.querySelector('canvas');
      if (qrCanvas) {
        ctx.drawImage(qrCanvas, 195, 555, 360, 360);
      }

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(card.customer_phone, 375, 955);
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Présentez ce QR Code en caisse', 375, 985);

      // Utiliser navigator.share avec fichier sur iPhone/Android si supporté pour enregistrer directement dans Photos/Wallet
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob && typeof navigator !== 'undefined' && (navigator as any).canShare) {
        const file = new File([blob], `Pass_Fidelite_${merchant.slug}.png`, { type: 'image/png' });
        if ((navigator as any).canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Pass Fidélité ${merchant.business_name}`,
            text: `Ma carte de fidélité ${merchant.business_name}`,
          });
          setDownloadingPass(false);
          return;
        }
      }

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Pass_Wallet_${merchant.slug}_${card.customer_phone}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.warn('Wallet pass generation warning:', e);
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
      handleSaveAppleWalletPass();
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
            Scannez le QR code du commerce ou cliquez sur Réessayer pour charger vos tampons avec votre numéro <strong>05 / 06 / 07</strong>.
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

  // MODE PLEIN ÉCRAN STYLE APPLE WALLET
  if (appleWalletFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-4 overflow-y-auto">
        <div className="max-w-sm mx-auto w-full flex items-center justify-between py-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            <Wallet className="w-4 h-4" />
            <span>Mode Pass Wallet Actif</span>
          </span>
          <button
            type="button"
            onClick={() => setAppleWalletFullscreen(false)}
            className="px-3 py-1.5 rounded-full bg-white/15 text-xs font-bold"
          >
            Fermer ✕
          </button>
        </div>

        <div
          className="max-w-sm mx-auto w-full rounded-[2rem] p-6 shadow-2xl border-2 border-emerald-500/50 space-y-5 my-auto"
          style={{ backgroundColor: program.background_color || '#0F172A' }}
        >
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div className="flex items-center gap-3">
              {merchant.logo_url && (
                <img
                  src={merchant.logo_url}
                  alt={merchant.business_name}
                  className="w-10 h-10 rounded-xl object-cover shadow-md border border-white/20 bg-white"
                />
              )}
              <div>
                <p className="text-[10px] font-black uppercase text-emerald-400">FidelityDZ Pass</p>
                <h2 className="text-xl font-black">{merchant.business_name}</h2>
                <p className="text-xs text-slate-300">{card.customer_name} • {card.customer_phone}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-400">
                {card.stamps_balance}/{program.stamps_required}
              </div>
              <span className="text-[10px] text-slate-400 uppercase">Tampons</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 text-slate-950 flex flex-col items-center shadow-2xl">
            <QRCodeSVG value={card.qr_token} size={200} level="H" includeMargin={false} />
            <p className="mt-3 font-mono font-black text-base tracking-wider">{card.customer_phone}</p>
            <span className="text-[11px] font-bold text-emerald-600 mt-0.5">
              ● Luminosité optimale pour scan en caisse
            </span>
          </div>

          <div className="text-center text-xs text-amber-300 font-bold">
            🎁 Récompense : {isAr ? program.reward_title_ar : program.reward_title_fr}
          </div>
        </div>

        <div className="max-w-sm mx-auto w-full pb-4">
          <button
            type="button"
            onClick={handleSaveAppleWalletPass}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Enregistrer cette carte sur mon iPhone / Android</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pb-10">
      {/* Hidden high-res QR Canvas for Wallet Pass download */}
      <div ref={hiddenQrRef} className="hidden" aria-hidden="true">
        <QRCodeCanvas value={card.qr_token} size={360} level="H" includeMargin={false} />
      </div>

      {/* APPLE / GOOGLE WALLET MODAL */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Carte Wallet Mobile (iPhone & Android)</h3>
                  <p className="text-[11px] text-slate-400">Accès rapide sans application à télécharger</p>
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
              {/* Option 1: Open Fullscreen Apple Wallet Pass Mode */}
              <button
                type="button"
                onClick={() => {
                  setWalletModalOpen(false);
                  setAppleWalletFullscreen(true);
                }}
                className="w-full p-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-left flex items-center justify-between transition-all shadow-lg shadow-emerald-500/20"
              >
                <div className="flex items-center gap-3">
                  <Maximize2 className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <div className="text-sm">Ouvrir en Mode Apple Wallet Plein Écran</div>
                    <div className="text-[11px] font-semibold opacity-80">
                      Affiche votre Pass plein écran prêt à scanner en caisse
                    </div>
                  </div>
                </div>
              </button>

              {/* Option 2: Save / Share Pass Image directly to iPhone Photos / Android Gallery */}
              <button
                type="button"
                onClick={handleSaveAppleWalletPass}
                disabled={downloadingPass}
                className="w-full p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-sm">Enregistrer le Pass dans mon Téléphone (Hors-ligne)</div>
                    <div className="text-[11px] text-slate-400">
                      Sauvegarde votre carte avec QR Code dans vos Photos / Fichiers
                    </div>
                  </div>
                </div>
              </button>

              {/* Option 3: Direct Android Install if supported */}
              {deferredPrompt && (
                <button
                  type="button"
                  onClick={handleTriggerPwaInstall}
                  className="w-full p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-white font-bold text-left flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="text-sm">Installer l&apos;application Carte en 1 clic</div>
                      <div className="text-[11px] text-slate-400">
                        Ajoute l&apos;icône directe sur l&apos;écran d&apos;accueil
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {/* Guide iPhone Safari */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="font-bold text-amber-400">
                  📲 Astuce iPhone (Safari) & Android (Chrome) :
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Pour avoir l&apos;icône de votre carte sur l&apos;écran d&apos;accueil comme une application Wallet : appuyez sur <strong>Partager</strong> (ou <strong>⋮</strong>) dans votre navigateur puis sur <strong>« Sur l&apos;écran d&apos;accueil »</strong>. Vos tampons se mettront à jour en direct !
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
            {merchant.logo_url ? (
              <img
                src={merchant.logo_url}
                alt={merchant.business_name}
                className="w-8 h-8 rounded-lg object-cover shadow-sm border border-emerald-500/30 bg-white"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                <QrCode className="w-5 h-5" />
              </div>
            )}
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

            {merchant.logo_url ? (
              <img
                src={merchant.logo_url}
                alt={merchant.business_name}
                className="w-12 h-12 rounded-2xl object-cover shadow-lg border-2 border-white/20 bg-white"
              />
            ) : (
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg font-bold"
                style={{ backgroundColor: program.primary_color || '#10B981' }}
              >
                <Coffee className="w-6 h-6" />
              </div>
            )}
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
            <QRCodeSVG value={card.qr_token} size={145} level="M" includeMargin={false} />
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
            <span>{isAr ? 'فتح / حفظ في Wallet' : 'Pass Apple / Google Wallet'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl transition-all shadow-sm"
            type="button"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>{copiedLink ? (isAr ? 'تم نسخ الرابط !' : 'Lien copié !') : (isAr ? 'مشاركة بطاقتي' : 'Partager / Copier lien')}</span>
          </button>
        </div>

        {/* Google Maps Review Reward Banner */}
        {merchant.google_review_reward_enabled && (merchant.social_maps || merchant.address) && (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 rounded-2xl p-4 text-white space-y-3 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg flex-shrink-0">
                ⭐
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider">
                  {isAr ? 'مكافأة تقييم المتجر على Google Maps' : 'Cadeau Fidélité : Avis Google Maps'}
                </h4>
                <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                  {isAr
                    ? `اترك تقييماً على خرائط جوجل واكسب +${merchant.google_review_reward_bonus || 1} أختام/نقاط مجاناً !`
                    : `Laissez un avis 5 étoiles sur Google Maps et recevez +${merchant.google_review_reward_bonus || 1} ${program.program_type === 'STAMPS' ? 'tampon(s)' : 'points'} cadeau(x) sur votre carte !`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClaimGoogleReview}
              disabled={googleReviewClaimed}
              className={`w-full py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md ${
                googleReviewClaimed
                  ? 'bg-emerald-950/90 border border-emerald-600 text-emerald-300 cursor-default'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 hover:scale-[1.01]'
              }`}
            >
              {googleReviewClaimed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? '✔ تم استلام هدية التقييم بنجاح' : '✔ Cadeau avis Google déjà crédité sur votre carte !'}</span>
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 fill-current" />
                  <span>{isAr ? 'تقييم المتجر واستلام الهدية فوراً' : 'Déposer mon avis Google & Recevoir mon cadeau'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Social Networks & Google Maps Location Links */}
        {(merchant.social_instagram || merchant.social_facebook || merchant.social_tiktok || merchant.social_maps || merchant.address) && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>{isAr ? 'تابعنا على مواقع التواصل' : 'Suivre le commerce'}</span>
              {merchant.address && (
                <span className="text-[11px] text-slate-400 font-normal truncate max-w-[200px]">
                  📍 {merchant.address}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {merchant.social_instagram && (
                <a
                  href={merchant.social_instagram.startsWith('http') ? merchant.social_instagram : `https://instagram.com/${merchant.social_instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-pink-500/40 text-pink-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <span>📸 Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {merchant.social_facebook && (
                <a
                  href={merchant.social_facebook.startsWith('http') ? merchant.social_facebook : `https://facebook.com/${merchant.social_facebook}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <span>👍 Facebook</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {merchant.social_tiktok && (
                <a
                  href={merchant.social_tiktok.startsWith('http') ? merchant.social_tiktok : `https://tiktok.com/@${merchant.social_tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <span>🎵 TikTok</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {(merchant.social_maps || merchant.address) && (
                <a
                  href={merchant.social_maps && merchant.social_maps.startsWith('http') ? merchant.social_maps : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(merchant.business_name + ' ' + (merchant.address || merchant.wilaya))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <span>📍 Itinéraire Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

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
