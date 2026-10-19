'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { CustomerCard, LoyaltyProgram } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import LanguageToggle from '@/components/LanguageToggle';
import { soundFX } from '@/lib/sound';
import confetti from 'canvas-confetti';
import {
  QrCode,
  Search,
  Camera,
  Plus,
  Gift,
  CheckCircle2,
  X,
  Phone,
  Trophy,
  ArrowLeft,
  AlertTriangle,
  UserPlus,
} from 'lucide-react';

export default function CashierScannerPage() {
  const { t, language } = useLanguage();
  const { currentMerchant, program, isAuthenticated, isLoadingAuth, isSubscriptionExpired } = useMerchant();
  const router = useRouter();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'camera' | 'search'>('search');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [activeCard, setActiveCard] = useState<CustomerCard | null>(null);
  const [activeProgram, setActiveProgram] = useState<LoyaltyProgram | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState('1500');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  useEffect(() => {
    if (program) {
      setActiveProgram(program);
    }
  }, [program]);

  if (isLoadingAuth || !isAuthenticated || !currentMerchant) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  // Recherche manuelle par téléphone ou token (Synchronisée avec Supabase)
  const handleSearchCard = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setFeedbackMessage(null);

    const term = phoneSearch.trim();
    if (!term) return;

    await db.syncFromSupabase();

    let found = db.getCardByToken(term);
    if (!found) {
      found = db.getCardByPhone(currentMerchant.id, term);
    }

    // S'assure que le client appartient bien à ce commerce
    if (found && found.merchant_id === currentMerchant.id) {
      soundFX.playBeep();
      setActiveCard(found);
      setActiveProgram(db.getProgramByMerchantId(currentMerchant.id));
      setFeedbackMessage(t('customer_found'));
    } else {
      setErrorMessage(
        isAr
          ? 'لم يتم العثور على أي بطاقة بهذا الرقم في متجرك. يمكنك إنشاؤها فوراً بزر الإضافة أدناه.'
          : "Aucune carte trouvée pour ce numéro dans votre commerce. Vous pouvez l'inscrire en 1 clic ci-dessous."
      );
    }
  };

  // Inscription rapide en caisse par numéro 05/06/07
  const handleQuickEnrollAtCashier = async () => {
    const cleaned = phoneSearch.replace(/\s+/g, '');
    if (!/^(0)(5|6|7)[0-9]{8}$/.test(cleaned)) {
      setErrorMessage('Numéro algérien valide requis (05, 06 ou 07 sur 10 chiffres).');
      return;
    }
    const res = await db.getOrCreateCustomerCardAsync(currentMerchant.slug, cleaned, `Client ${cleaned.slice(-4)}`);
    soundFX.playStamp();
    setActiveCard(res.card);
    setActiveProgram(db.getProgramByMerchantId(currentMerchant.id));
    setErrorMessage(null);
    setFeedbackMessage(`Carte créée en caisse pour ${cleaned} avec +1 tampon de bienvenue !`);
  };

  // Initialisation du scanner caméra via html5-qrcode
  useEffect(() => {
    if (activeTab === 'camera') {
      let isMounted = true;
      setCameraError(null);

      import('html5-qrcode')
        .then(({ Html5Qrcode }) => {
          if (!isMounted) return;
          try {
            const scanner = new Html5Qrcode('qr-reader');
            html5QrCodeRef.current = scanner;

            scanner
              .start(
                { facingMode: 'environment' },
                {
                  fps: 10,
                  qrbox: { width: 250, height: 250 },
                },
                async (decodedText) => {
                  soundFX.playBeep();
                  scanner
                    .stop()
                    .then(() => {
                      setScannerInitialized(false);
                    })
                    .catch(() => {});

                  const fetched = await db.fetchCardByTokenAsync(decodedText);
                  let found = fetched.card || db.getCardByToken(decodedText);
                  if (!found && currentMerchant) {
                    found = db.getCardByPhone(currentMerchant.id, decodedText);
                  }

                  if (found && found.merchant_id === currentMerchant.id) {
                    setActiveCard(found);
                    setActiveProgram(db.getProgramByMerchantId(currentMerchant.id));
                    setActiveTab('search');
                    setFeedbackMessage(t('customer_found'));
                  } else {
                    setErrorMessage(`QR Code invalide ou appartenant à un autre commerce (${decodedText})`);
                  }
                },
                () => {}
              )
              .then(() => {
                if (isMounted) setScannerInitialized(true);
              })
              .catch(() => {
                if (isMounted) {
                  setCameraError(
                    isAr
                      ? 'تعذر الوصول إلى الكاميرا. يمكنك استخدام البحث برقم الهاتف أدناه.'
                      : 'Caméra indisponible ou autorisation refusée. Utilisez la recherche par numéro.'
                  );
                }
              });
          } catch {}
        })
        .catch(() => {});

      return () => {
        isMounted = false;
        if (html5QrCodeRef.current) {
          try {
            html5QrCodeRef.current.stop().catch(() => {});
          } catch {}
        }
      };
    }
  }, [activeTab, currentMerchant, isAr, t]);

  const handleAddStamp = (count: number = 1) => {
    if (!activeCard) return;
    if (isSubscriptionExpired) {
      setErrorMessage('Votre période d\'essai de 14 jours ou abonnement est expiré : veuillez renouveler (3 900 DZD/mois) pour créditer des tampons.');
      return;
    }
    try {
      const result = db.addStampToCard(activeCard.id, count);
      setActiveCard({ ...result.card });
      soundFX.playStamp();

      if (result.unlockedReward) {
        soundFX.playReward();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        setFeedbackMessage(
          isAr
            ? `🎉 مبروك ! فتح الزبون هديته : ${activeProgram?.reward_title_ar}`
            : `🎉 Félicitations ! Le client a débloqué sa récompense : ${activeProgram?.reward_title_fr}`
        );
      } else {
        setFeedbackMessage(isAr ? `+${count} ختم تم تسجيله بنجاح` : `+${count} tampon(s) enregistré(s) avec succès !`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      setErrorMessage(msg);
    }
  };

  const handleAddPoints = () => {
    if (!activeCard) return;
    if (isSubscriptionExpired) {
      setErrorMessage('Abonnement expiré : veuillez renouveler votre abonnement (3 900 DZD/mois).');
      return;
    }
    const amount = parseInt(purchaseAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage(isAr ? 'يرجى إدخال مبلغ صحيح' : 'Veuillez saisir un montant valide en DZD');
      return;
    }

    try {
      const result = db.addPointsToCard(activeCard.id, amount);
      setActiveCard({ ...result.card });
      soundFX.playStamp();
      setFeedbackMessage(
        isAr
          ? `+${result.pointsAdded} نقطة مسجلة لمشتريات بقيمة ${amount} دج`
          : `+${result.pointsAdded} points crédités pour un achat de ${amount} DZD !`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      setErrorMessage(msg);
    }
  };

  const handleRedeemReward = () => {
    if (!activeCard) return;
    try {
      const result = db.redeemReward(activeCard.id);
      setActiveCard({ ...result.card });
      soundFX.playReward();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
      setFeedbackMessage(
        isAr
          ? '🎁 تم تسليم الهدية للزبون بنجاح واحتسابها في السجل !'
          : '🎁 Récompense validée et remise au client avec succès !'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between">
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Retour au Dashboard"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base text-white block">
                  {t('scanner_title')}
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  {currentMerchant.business_name}
                </span>
              </div>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full p-4 sm:p-6 flex-1 space-y-6">
        {isSubscriptionExpired && (
          <div className="bg-red-500/20 border-2 border-red-400 text-red-200 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>Fin des 14 jours d&apos;essai / Abonnement expiré : activez votre forfait (3 900 DZD/mois) pour continuer à scanner vos clients.</span>
            </div>
            <Link
              href="/dashboard/billing"
              className="px-3 py-1.5 rounded-xl bg-red-400 text-slate-950 font-black text-xs whitespace-nowrap"
            >
              Payer 3 900 DZD
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'camera'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            type="button"
          >
            <Camera className="w-4 h-4" />
            <span>{t('scan_camera')}</span>
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'search'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            type="button"
          >
            <Phone className="w-4 h-4" />
            <span>{t('search_by_phone')}</span>
          </button>
        </div>

        {activeTab === 'camera' && (
          <div className="bg-slate-950 rounded-3xl p-5 border border-slate-800 text-center space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-[320px] mx-auto border-2 border-emerald-500/50 flex items-center justify-center">
              <div id="qr-reader" className="w-full h-full"></div>
              {!scannerInitialized && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-4 space-y-3">
                  <Camera className="w-8 h-8 text-emerald-400 animate-pulse" />
                  <p className="text-xs">Activation de la caméra en cours...</p>
                </div>
              )}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-red-300 p-4 space-y-2 text-xs">
                  <p>{cameraError}</p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
                    type="button"
                  >
                    Utiliser la saisie manuelle
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Pointez l&apos;objectif vers le QR code présenté sur le smartphone du client.
            </p>
          </div>
        )}

        {activeTab === 'search' && (
          <form onSubmit={handleSearchCard} className="bg-slate-950 rounded-3xl p-5 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              {t('enter_phone_placeholder')}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ex: 0555123456"
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 px-4 text-white text-base placeholder-slate-600 font-mono tracking-wider tabular-nums outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">{t('find_card')}</span>
              </button>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>Le client n&apos;a pas son téléphone ?</span>
              <button
                type="button"
                onClick={handleQuickEnrollAtCashier}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg font-bold text-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Inscrire ce N° 05/06/07 directement en caisse</span>
              </button>
            </div>
          </form>
        )}

        {feedbackMessage && (
          <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-200 p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
            <button onClick={() => setFeedbackMessage(null)} className="text-emerald-400 hover:text-white p-1" type="button">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-950/80 border border-red-800 text-red-200 p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white p-1" type="button">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeCard && activeProgram && (
          <div className="bg-slate-950 rounded-3xl p-6 border-2 border-emerald-500/80 shadow-2xl space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  {isAr ? 'الزبون المختار' : 'Client Identifié'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {activeCard.customer_name}
                </h3>
                <p className="text-xs text-slate-400 font-mono tracking-wider pt-0.5">
                  {activeCard.customer_phone} • {activeCard.total_visits} {t('total_visits_count')}
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveCard(null);
                  setFeedbackMessage(null);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Fermer"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 font-semibold">{t('stamps_progress')}</span>
                <div className="text-2xl font-black text-white">
                  {activeCard.stamps_balance}{' '}
                  <span className="text-sm text-slate-500 font-normal">/ {activeProgram.stamps_required}</span>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400 font-semibold">{t('points_balance')}</span>
                <div className="text-2xl font-black text-amber-400">
                  {activeCard.points_balance} <span className="text-xs font-normal">pts</span>
                </div>
              </div>
            </div>

            {(activeCard.rewards_available > 0 || activeCard.stamps_balance >= activeProgram.stamps_required) && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/30 border-2 border-amber-400 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black flex-shrink-0">
                    <Trophy className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider">
                      {isAr ? '🎁 هدية مستحقة وجاهزة للتسليم' : '🎁 Récompense disponible !'}
                    </h4>
                    <p className="text-sm font-bold text-white">
                      {isAr ? activeProgram.reward_title_ar : activeProgram.reward_title_fr}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRedeemReward}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
                  type="button"
                >
                  <Gift className="w-5 h-5" />
                  <span>{t('redeem_reward_btn')}</span>
                </button>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {t('cashier_actions')}
              </span>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAddStamp(1)}
                  disabled={isSubscriptionExpired}
                  className="flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40"
                  type="button"
                >
                  <Plus className="w-5 h-5" />
                  <span>{t('add_stamp_btn')}</span>
                </button>

                <button
                  onClick={() => handleAddStamp(2)}
                  disabled={isSubscriptionExpired}
                  className="flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-40"
                  type="button"
                >
                  <Plus className="w-4 h-4" />
                  <span>+2 Tampons</span>
                </button>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>{t('purchase_amount_label')}</span>
                  <span className="text-emerald-400 font-mono">
                    = +{Math.max(1, Math.floor((parseInt(purchaseAmount || '0', 10) / 100) * (activeProgram.points_per_100dzd || 1)))} {t('points_to_add')}
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="50"
                      min="50"
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-white font-mono text-sm tabular-nums outline-none"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-500 font-bold">
                      DZD
                    </span>
                  </div>
                  <button
                    onClick={handleAddPoints}
                    disabled={isSubscriptionExpired}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-40"
                    type="button"
                  >
                    {t('validate_points_btn')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-3 border-t border-slate-800/60 text-xs text-slate-500">
        FidelityDZ • Scanner Caisse Privé ({currentMerchant.business_name})
      </footer>
    </div>
  );
}
