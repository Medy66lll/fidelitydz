'use client';

import { soundFX } from '@/lib/sound';
import { getPublicOrigin } from '@/lib/url';

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
  Bell,
  BellRing,
  Sparkles,
  Facebook,
  Instagram,
  Music
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
  const [notifPermission, setNotifPermission] = useState<string>('default');
  const [livePushOffer, setLivePushOffer] = useState<PersonalizedOffer | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const triggerPhoneNotification = (title: string, body: string, tag: string) => {
    const iconUrl = `/api/icon?token=${encodeURIComponent(qrToken)}`;
    soundFX.playReward();
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
    const options: any = {
      body,
      icon: iconUrl,
      badge: iconUrl,
      vibrate: [200, 100, 200, 100, 200],
      tag,
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => reg.showNotification(title, options))
        .catch(() => {
          try { new Notification(title, options); } catch {}
        });
    } else {
      try { new Notification(title, options); } catch {}
    }
  };

  const handleRequestNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert(isAr ? 'المتصفح لا يدعم الإشعارات' : 'Sur iPhone, ajoutez d’abord la carte « Sur l’écran d’accueil » puis activez les alertes.');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        localStorage.setItem('fidelitydz_notifications_enabled', 'true');
        triggerPhoneNotification(
          `🔔 ${merchant?.business_name || 'Club Fidélité'}`,
          isAr ? 'تم تفعيل إشعارات العروض بنجاح!' : 'Alertes activées ! Vous recevrez nos offres en direct.',
          'welcome-' + Date.now()
        );
      }
    } catch {}
  };

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
        const claimed = Boolean(res.card.google_review_claimed) || localStorage.getItem(`fidelitydz_gr_claimed_${res.card.id}`) === 'true';
        setGoogleReviewClaimed(claimed);

        if (Array.isArray(res.offers) && res.offers.length > 0) {
          res.offers.forEach((off: PersonalizedOffer) => {
            if (!off.is_active) return;
            const stamp = off.updated_at || off.created_at || off.id;
            const storageKey = `fidelitydz_offer_seen_${off.id}`;
            const prevStamp = localStorage.getItem(storageKey);
            if (prevStamp !== stamp) {
              localStorage.setItem(storageKey, stamp);
              setLivePushOffer(off);
              triggerPhoneNotification(
                `📢 ${res.merchant?.business_name} : Nouvelle Offre !`,
                isAr && off.title_ar ? off.title_ar : off.title_fr,
                `offer-${off.id}-${stamp}`
              );
            }
          });
        }
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
    const iconUrl = `/api/icon?token=${encodeURIComponent(card.qr_token)}`;
    link.href = `/api/manifest?token=${encodeURIComponent(card.qr_token)}&name=${encodeURIComponent(merchant.business_name)}`;
    document.title = merchant.business_name;
    document.querySelectorAll("link[rel='apple-touch-icon'], link[rel='icon']").forEach((el) => el.remove());
    const appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    appleLink.href = iconUrl;
    document.head.appendChild(appleLink);

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
    updatedCard.google_review_claimed = true;
    db.saveCard(updatedCard, {
      id: `tx-gr-${card.id}`,
      card_id: card.id,
      merchant_id: merchant.id,
      performed_by: 'Client (Google Maps)',
      action_type: 'GOOGLE_REVIEW_BONUS',
      delta_value: program?.program_type === 'STAMPS' ? bonus : bonus * 10,
      purchase_amount_dzd: 0,
      created_at: new Date().toISOString(),
    });
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
            url: `${getPublicOrigin()}/card/${card?.qr_token}`,
          })
          .catch(() => {});
      } else {
        navigator.clipboard.writeText(`${getPublicOrigin()}/card/${card?.qr_token}`);
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
          <button type="button" onClick={() => setAppleWalletFullscreen(false)} className="px-3 py-1.5 rounded-full bg-white/15 text-xs font-bold">
            Fermer ✕
          </button>
        </div>
        <div className="max-w-sm mx-auto w-full rounded-[2rem] p-6 shadow-2xl border-2 border-emerald-500/50 space-y-5 my-auto" style={{ backgroundColor: program.background_color || '#0F172A' }}>
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div className="flex items-center gap-3">
              {merchant.logo_url && <img src={merchant.logo_url} alt="Logo" className="w-10 h-10 rounded-xl object-cover bg-white" />}
              <div>
                <p className="text-[10px] font-black uppercase text-emerald-400">FidelityDZ Pass</p>
                <h2 className="text-xl font-black">{merchant.business_name}</h2>
                <p className="text-xs text-slate-300">{card.customer_name} • {card.customer_phone}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-400">{card.stamps_balance}/{program.stamps_required}</div>
              <span className="text-[10px] text-slate-400 uppercase">Tampons</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 text-slate-950 flex flex-col items-center shadow-2xl">
            <QRCodeSVG value={card.qr_token} size={200} level="H" includeMargin={false} />
            <p className="mt-3 font-mono font-black text-base tracking-wider">{card.customer_phone}</p>
          </div>
          <div className="text-center text-xs text-amber-300 font-bold">🎁 Récompense : {isAr ? program.reward_title_ar : program.reward_title_fr}</div>
        </div>
        <div className="max-w-sm mx-auto w-full pb-4">
          <button type="button" onClick={handleSaveAppleWalletPass} className="w-full py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            <span>Enregistrer dans Photos/Wallet</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-10 font-sans selection:bg-emerald-500/30">
      <div ref={hiddenQrRef} className="hidden" aria-hidden="true">
        <QRCodeCanvas value={card.qr_token} size={360} level="H" includeMargin={false} />
      </div>

      {walletModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-extrabold">Carte Mobile</h3>
              <button onClick={() => setWalletModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3">
              <button onClick={() => { setWalletModalOpen(false); setAppleWalletFullscreen(true); }} className="w-full p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-left flex items-center gap-3">
                <Maximize2 className="w-6 h-6"/>
                <div><div className="text-sm">Plein Écran (Caisse)</div><div className="text-[11px] opacity-80">Affiche le Pass pour le scan</div></div>
              </button>
              <button onClick={handleSaveAppleWalletPass} className="w-full p-4 rounded-2xl bg-slate-800 text-white font-bold text-left flex items-center gap-3">
                <Download className="w-6 h-6 text-emerald-400"/>
                <div><div className="text-sm">Enregistrer l'image</div><div className="text-[11px] text-slate-400">Sauvegarde dans vos Photos</div></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {livePushOffer && (
        <div className="fixed top-3 inset-x-3 z-50 max-w-md mx-auto bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 rounded-2xl p-4 shadow-2xl flex gap-3 animate-bounce-in">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-white">{isAr && livePushOffer.title_ar ? livePushOffer.title_ar : livePushOffer.title_fr}</h4>
            <p className="text-[11px] text-slate-300 line-clamp-1">{isAr && livePushOffer.description_ar ? livePushOffer.description_ar : livePushOffer.description_fr}</p>
          </div>
          <button onClick={() => setLivePushOffer(null)} className="text-slate-400"><X className="w-4 h-4"/></button>
        </div>
      )}

      {/* HEADER COMPACT */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {merchant.logo_url ? (
              <img src={merchant.logo_url} alt="Logo" className="w-10 h-10 rounded-full border border-slate-800 object-cover bg-white" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black">{merchant.business_name[0]}</div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white truncate max-w-[140px]">{merchant.business_name}</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1"><Sparkles className="w-3 h-3"/> VIP CLUB</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={notifPermission !== 'granted' ? handleRequestNotifications : undefined} className={`p-2 rounded-full ${notifPermission === 'granted' ? 'text-emerald-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'}`}>
              {notifPermission === 'granted' ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </button>
            <button onClick={() => loadCardLive(false)} className="p-2 text-slate-300"><RefreshCw className="w-4 h-4" /></button>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full px-4 pt-6 space-y-6">
        
        {/* LA CARTE DIGITALE (HERO) */}
        <div className="relative rounded-[2rem] p-6 shadow-2xl overflow-hidden" style={{ backgroundColor: program.background_color || '#0F172A' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h2 className="text-xl font-black text-white">{card.customer_name}</h2>
              <p className="text-xs font-mono text-slate-300 opacity-80">{card.customer_phone}</p>
            </div>
            {isRewardReady && (
              <div className="bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                <Gift className="w-3 h-3" /> {isAr ? 'هدية جاهزة' : 'Cadeau Prêt'}
              </div>
            )}
          </div>

          {/* SECTION PROGRESSION (TAMPONS/POINTS) */}
          <div className="relative z-10 bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-6">
            <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-3">
              <span>{program.program_type === 'STAMPS' ? t('stamps_progress') : t('points_balance')}</span>
              <span className="text-emerald-400">{program.program_type === 'STAMPS' ? `${card.stamps_balance} / ${program.stamps_required}` : `${card.points_balance} pts`}</span>
            </div>
            
            {program.program_type === 'STAMPS' ? (
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: program.stamps_required }).map((_, i) => {
                  const isFilled = i < card.stamps_balance;
                  const isLast = i === program.stamps_required - 1;
                  return (
                    <div key={i} className={`h-12 rounded-xl flex items-center justify-center ${isFilled ? 'shadow-md' : 'border border-dashed border-white/20'}`} style={{ background: isFilled ? (isLast ? 'linear-gradient(135deg, #F59E0B, #D97706)' : `linear-gradient(135deg, ${program.primary_color || '#10B981'}, #047857)`) : 'transparent' }}>
                      {isFilled ? (isLast ? <Trophy className="w-5 h-5 text-white" /> : <Check className="w-5 h-5 text-white stroke-[3]" />) : (isLast ? <Gift className="w-5 h-5 text-amber-400/30" /> : null)}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full" style={{ width: `${Math.min(100, (card.points_balance / 200) * 100)}%`, backgroundColor: program.primary_color || '#10B981' }}></div>
              </div>
            )}
          </div>

          {/* QR CODE CAISSE INTÉGRÉ DANS LA CARTE (Cliquable pour plein écran) */}
          <button 
            onClick={() => setAppleWalletFullscreen(true)}
            className="w-full relative z-10 bg-white rounded-2xl p-4 flex items-center gap-4 shadow-xl hover:bg-slate-50 transition-colors group text-left"
          >
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex-shrink-0 relative">
              <QRCodeSVG value={card.qr_token} size={80} level="M" includeMargin={false} fgColor="#0F172A" />
              <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                <Maximize2 className="w-6 h-6 text-slate-900 drop-shadow-md" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-slate-500 mb-1 leading-tight">
                {isAr ? 'اضغط لتكبير الرمز' : 'Cliquez pour agrandir'}
              </p>
              <p className="text-xs font-bold text-slate-800">{isAr ? program.reward_title_ar : program.reward_title_fr}</p>
            </div>
          </button>
        </div>

        {/* MISSION GOOGLE MAPS (Si non réclamée) */}
        {merchant.google_review_reward_enabled && (merchant.social_maps || merchant.address) && !googleReviewClaimed && (
          <div className="bg-gradient-to-r from-amber-500/10 to-amber-900/10 border border-amber-500/30 rounded-[1.5rem] p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Star className="w-6 h-6 fill-slate-950" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black uppercase text-amber-400">{isAr ? 'مكافأة التقييم' : 'Mission Google Maps'}</h4>
                <p className="text-[11px] text-slate-300 mt-1">
                  {isAr ? `قيّمنا واكسب +${merchant.google_review_reward_bonus || 1} رصيد` : `Laissez un avis et gagnez +${merchant.google_review_reward_bonus || 1} bonus`}
                </p>
              </div>
            </div>
            <button onClick={handleClaimGoogleReview} className="w-full mt-4 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-black uppercase flex items-center justify-center gap-2 transition">
              <span>{isAr ? 'تقييم الآن' : 'Noter & Débloquer'}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* OFFRES EXCLUSIVES */}
        {offers.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">{t('exclusive_offers')}</h3>
            <div className="space-y-3">
              {offers.map(offer => (
                <div key={offer.id} className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-lg">
                  {offer.image_url && (
                    <div className="h-40 w-full overflow-hidden">
                      <img src={offer.image_url} alt="Offre" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-sm">{isAr && offer.title_ar ? offer.title_ar : offer.title_fr}</h4>
                      {offer.target_segment === 'VIP' && <span className="bg-amber-500/20 text-amber-400 text-[9px] px-2 py-0.5 rounded-full font-bold">VIP</span>}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{isAr && offer.description_ar ? offer.description_ar : offer.description_fr}</p>
                    {offer.valid_until && (
                      <div className="text-[10px] text-emerald-500 font-medium pt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Expire le {new Date(offer.valid_until).toLocaleDateString('fr-DZ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIENS SOCIAUX */}
        {(merchant.social_instagram || merchant.social_facebook || merchant.social_tiktok || merchant.social_maps) && (
          <div className="flex justify-center gap-4 pt-4 border-t border-slate-800/50">
            {merchant.social_instagram && <a href={merchant.social_instagram.startsWith('http') ? merchant.social_instagram : `https://instagram.com/${merchant.social_instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-pink-500 hover:bg-slate-800 hover:scale-110 transition shadow-sm"><Instagram className="w-4 h-4"/></a>}
            {merchant.social_facebook && <a href={merchant.social_facebook.startsWith('http') ? merchant.social_facebook : `https://facebook.com/${merchant.social_facebook}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 hover:bg-slate-800 hover:scale-110 transition shadow-sm"><Facebook className="w-4 h-4 fill-current"/></a>}
            {merchant.social_tiktok && <a href={merchant.social_tiktok.startsWith('http') ? merchant.social_tiktok : `https://tiktok.com/@${merchant.social_tiktok.replace('@', '')}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-white hover:bg-slate-800 hover:scale-110 transition shadow-sm"><Music className="w-4 h-4"/></a>}
            {merchant.social_maps && <a href={merchant.social_maps.startsWith('http') ? merchant.social_maps : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(merchant.business_name)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-500 hover:bg-slate-800 hover:scale-110 transition shadow-sm"><MapPin className="w-4 h-4"/></a>}
          </div>
        )}
        
        {/* BANNIÈRE DE PROSPECTION FIDELITYDZ */}
        <div className="mt-8 pt-6 border-t border-slate-800/30">
          <a href="/" target="_blank" className="block bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl p-4 shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  {isAr ? 'هل أنت تاجر؟' : 'Vous êtes commerçant ?'}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isAr ? 'احصل على نظام ولاء مشابه لمحلك' : 'Créez un programme de fidélité pour votre boutique'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-500 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          </a>
        </div>
      </main>
      
      <footer className="text-center py-6 text-[10px] text-slate-600 font-medium">
        FidelityDZ • {merchant.business_name}
      </footer>
    </div>
  );
}
