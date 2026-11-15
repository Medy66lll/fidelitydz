'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import AlgerianPaymentBadges from '@/components/AlgerianPaymentBadges';
import { db, defaultPlatformSettings, generateUuid } from '@/lib/db';
import { validateUploadedFile } from '@/lib/validation';
import { SubscriptionPayment, PaymentMethod } from '@/lib/types';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  CheckCircle2,
  Copy,
  Sparkles,
  ArrowRight,
  Send,
  Building2,
  MessageCircle,
} from 'lucide-react';

function BillingContent() {
  const { t, language } = useLanguage();
  const { currentMerchant, refreshMerchantData } = useMerchant();
  const searchParams = useSearchParams();
  const isAr = language === 'ar';

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BARIDIMOB');
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [lastSubmittedPayment, setLastSubmittedPayment] = useState<SubscriptionPayment | null>(null);
  const [submittingReceipt, setSubmittingReceipt] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isProcessingChargily, setIsProcessingChargily] = useState(false);
  const [chargilyMessage, setChargilyMessage] = useState<string | null>(null);
  const [addonCardsPack, setAddonCardsPack] = useState<number>(100);
  const [addonPushPack, setAddonPushPack] = useState<number>(100);
  const [addonOffersPack, setAddonOffersPack] = useState<number>(1);
  const [addonUsersPack, setAddonUsersPack] = useState<number>(1);
  const [addonLocationsPack, setAddonLocationsPack] = useState<number>(1);

  useEffect(() => {
    const payment = searchParams.get('payment');
    const simulated = searchParams.get('simulated_chargily');
    const checkoutId = searchParams.get('checkout_id');

    if ((payment === 'success' || simulated === 'true') && currentMerchant) {
      db.activateChargilySubscription(currentMerchant.id, checkoutId || `chk_${Date.now()}`);
      refreshMerchantData();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setChargilyMessage(
        isAr
          ? 'تم تأكيد الدفع بنجاح عبر Chargily Pay وتمديد اشتراكك لمدة 30 يوماً إضافية !'
          : 'Paiement confirmé par Chargily Pay ! Votre abonnement a été prolongé de 30 jours.'
      );
    }
  }, [searchParams, currentMerchant, isAr, refreshMerchantData]);

  const handleCopy = (text: string, fieldName: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Règle 11 : Valider le type MIME, l'extension (.jpg, .png, .webp) et la taille max (5 Mo)
    const check = validateUploadedFile({ name: file.name, type: file.type, size: file.size });
    if (!check.success) {
      setFormError(check.error || 'Fichier invalide.');
      e.target.value = '';
      return;
    }
    setFormError(null);
    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReceiptDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };


  const getWhatsAppAddonUrl = (addonType: string, priceDesc: string) => {
    const ownerWa = db.getOwnerWhatsapp() || '213541534762';
    const text = `🚀 *DEMANDE D'EXTENSION (ADD-ON)*

🏪 *Commerce :* ${currentMerchant?.business_name}
📞 *Téléphone :* ${currentMerchant?.phone}

Je souhaite augmenter ma limite pour : *${addonType}*
Tarif estimé : ${priceDesc}

Merci de mettre à jour mes limites sur le serveur Supabase.`;
    return `https://wa.me/${ownerWa}?text=${encodeURIComponent(text)}`;
  };

  const getReceiptWhatsAppUrl = (payment: SubscriptionPayment) => {
    const ownerWa = db.getOwnerWhatsapp() || '213541534762';
    const total = 3900 + (Math.max(0, (currentMerchant?.max_cards || 100) - 100) / 500) * 1000 + (Math.max(0, (currentMerchant?.max_push_per_week || 100) - 100) / 300) * 800 + (Math.max(0, (currentMerchant?.max_users || 2) - 2)) * 500 + (Math.max(0, (currentMerchant?.max_active_offers || 3) - 3) / 5) * 500 + (Math.max(0, (currentMerchant?.max_locations || 1) - 1)) * 1500;
    const text = `💳 *NOUVEAU REÇU DE PAIEMENT (${total} DZD)*\n\n🏪 *Commerce :* ${currentMerchant?.business_name}\n📞 *Tél Commerçant :* ${currentMerchant?.phone}\n🏦 *Méthode :* ${payment.payment_method}\n🔢 *Expéditeur :* ${payment.transaction_reference}\n💰 *Montant :* ${total} DZD\n\nMerci de valider mon abonnement sur l'espace Super-Admin FidelityDZ.`;
    return `https://wa.me/${ownerWa}?text=${encodeURIComponent(text)}`;
  };

  const handleChargilyCheckout = async () => {
    if (!currentMerchant) return;
    setIsProcessingChargily(true);
    setChargilyMessage(null);
    setFormError(null);

    try {
      const res = await fetch('/api/chargily/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: currentMerchant.id,
          merchant_name: currentMerchant.business_name,
        }),
      });

      const data = await res.json();
      if (data.success && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setFormError(data.error || "Erreur lors de l'initialisation de Chargily Pay");
        setIsProcessingChargily(false);
      }
    } catch {
      setIsProcessingChargily(false);
    }
  };

  // Soumettre reçu BaridiMob ou CCP vers Supabase + Admin + WhatsApp
  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!currentMerchant) return;

    if (!transactionRef.trim()) {
      setFormError('Veuillez renseigner le numéro de transaction ou la référence BaridiMob / CCP.');
      return;
    }

    if (!receiptDataUrl) {
      setFormError("La capture d'écran du reçu BaridiMob ou la photo du reçu CCP est obligatoire.");
      return;
    }

    setSubmittingReceipt(true);

    const newPayment: SubscriptionPayment = {
      id: generateUuid(),
      merchant_id: currentMerchant.id,
      merchant_name: currentMerchant.business_name,
      amount_dzd: 3900 + (Math.max(0, (currentMerchant?.max_cards || 100) - 100) / 500) * 1000 + (Math.max(0, (currentMerchant?.max_push_per_week || 100) - 100) / 300) * 800 + (Math.max(0, (currentMerchant?.max_users || 2) - 2)) * 500 + (Math.max(0, (currentMerchant?.max_active_offers || 3) - 3) / 5) * 500 + (Math.max(0, (currentMerchant?.max_locations || 1) - 1)) * 1500,
      payment_method: paymentMethod,
      transaction_reference: transactionRef.trim(),
      receipt_url: receiptDataUrl || receiptFileName || 'recu_baridimob_preuve.png',
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    await db.addPaymentAsync(newPayment);
    setLastSubmittedPayment(newPayment);
    setSubmittingReceipt(false);
    setSubmissionSuccess(true);
    setTransactionRef('');
  };

  const isTrial = currentMerchant?.subscription_status === 'TRIAL';
  const isActive = currentMerchant?.subscription_status === 'ACTIVE';
  const endsAt = currentMerchant?.subscription_ends_at ? new Date(currentMerchant.subscription_ends_at) : null;
  const daysLeft = endsAt ? Math.max(0, Math.ceil((endsAt.getTime() - Date.now()) / 86400000)) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('billing_title')}
        </h2>
        <p className="text-sm text-slate-600">
          Tarif unique : <strong className="text-slate-900">3 900 DZD / mois</strong> tout compris (cartes illimitées, scanner, offres).
        </p>
      </div>

      {chargilyMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-5 rounded-2xl flex items-center gap-3 shadow-md font-bold text-sm">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <span>{chargilyMessage}</span>
        </div>
      )}

      {formError && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-2xl text-xs font-bold">
          {formError}
        </div>
      )}

      {/* Subscription Status Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isTrial
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {isActive ? t('status_active') : isTrial ? t('status_trial') : t('status_expired')}
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight flex flex-col sm:flex-row sm:items-center gap-2">
              <span>Abonnement Mensuel</span>
              <span className="text-emerald-400">• {
                3900 
                + (Math.max(0, (currentMerchant?.max_cards || 100) - 100) / 500) * 1000 
                + (Math.max(0, (currentMerchant?.max_push_per_week || 100) - 100) / 300) * 800
                + (Math.max(0, (currentMerchant?.max_users || 2) - 2)) * 500
                + (Math.max(0, (currentMerchant?.max_active_offers || 3) - 3) / 5) * 500
                + (Math.max(0, (currentMerchant?.max_locations || 1) - 1)) * 1500
              } DZD</span>
            </h3>
            
            <div className="text-[11px] sm:text-xs text-slate-300 font-mono space-y-1 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between"><span>Forfait de Base (Starter)</span><span>3 900 DZD</span></div>
              {currentMerchant?.max_cards && currentMerchant.max_cards > 100 && (
                <div className="flex justify-between text-emerald-300"><span>+ Add-on Cartes ({currentMerchant.max_cards - 100} suppl.)</span><span>+ {((currentMerchant.max_cards - 100) / 500) * 1000} DZD</span></div>
              )}
              {currentMerchant?.max_push_per_week && currentMerchant.max_push_per_week > 100 && (
                <div className="flex justify-between text-emerald-300"><span>+ Add-on Push ({currentMerchant.max_push_per_week - 100} suppl.)</span><span>+ {((currentMerchant.max_push_per_week - 100) / 300) * 800} DZD</span></div>
              )}
              {currentMerchant?.max_users && currentMerchant.max_users > 2 && (
                <div className="flex justify-between text-emerald-300"><span>+ Add-on Caissiers ({currentMerchant.max_users - 2} suppl.)</span><span>+ {(currentMerchant.max_users - 2) * 500} DZD</span></div>
              )}
              {currentMerchant?.max_active_offers && currentMerchant.max_active_offers > 3 && (
                <div className="flex justify-between text-emerald-300"><span>+ Add-on Offres ({currentMerchant.max_active_offers - 3} suppl.)</span><span>+ {((currentMerchant.max_active_offers - 3) / 5) * 500} DZD</span></div>
              )}
              {currentMerchant?.max_locations && currentMerchant.max_locations > 1 && (
                <div className="flex justify-between text-emerald-300"><span>+ Add-on Locaux ({currentMerchant.max_locations - 1} suppl.)</span><span>+ {(currentMerchant.max_locations - 1) * 1500} DZD</span></div>
              )}
              <div className="border-t border-slate-700 mt-1 pt-1 flex justify-between font-bold text-white"><span>Total à payer</span><span>{
                3900 
                + (Math.max(0, (currentMerchant?.max_cards || 100) - 100) / 500) * 1000 
                + (Math.max(0, (currentMerchant?.max_push_per_week || 100) - 100) / 300) * 800
                + (Math.max(0, (currentMerchant?.max_users || 2) - 2)) * 500
                + (Math.max(0, (currentMerchant?.max_active_offers || 3) - 3) / 5) * 500
                + (Math.max(0, (currentMerchant?.max_locations || 1) - 1)) * 1500
              } DZD</span></div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300">
            {endsAt ? (
              <span>
                {isAr ? 'ينتهي اشتراكك في :' : 'Fin de la période en cours le :'}{' '}
                <strong className="text-white">{endsAt.toLocaleDateString('fr-DZ')}</strong> ({daysLeft} {t('days_left')})
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {/* TWO PAYMENT OPTIONS GRID */}
      <div className="max-w-2xl mx-auto items-start">


        {/* OPTION 2: VIREMENT BARIDIMOB / CCP OFFICIEL */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{isAr ? 'تحويل يدوي' : 'Virement BaridiMob / CCP'}</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {t('baridimob_ccp_title')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('baridimob_instructions')}
            </p>
          </div>

          {/* OFFICIAL OWNER DETAILS BOX */}
          <div className="bg-slate-950 text-white rounded-2xl p-5 space-y-3.5 text-xs font-mono shadow-inner">
            <div className="text-[11px] uppercase tracking-wider text-amber-400 font-bold border-b border-slate-800 pb-2">
              {t('owner_title')}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Titulaire :</span>
              <span className="font-bold text-white text-right">
                {defaultPlatformSettings.owner_account_name}
              </span>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">RIP BaridiMob (20 chiffres) :</span>
                <button
                  type="button"
                  onClick={() => handleCopy(defaultPlatformSettings.owner_rip_number, 'rip')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedField === 'rip' ? t('copied') : t('copy')}</span>
                </button>
              </div>
              <p className="text-emerald-400 font-mono text-sm tracking-widest bg-slate-900 p-2 rounded-lg text-center">
                {defaultPlatformSettings.owner_rip_number}
              </p>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Numéro CCP & Clé :</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(`${defaultPlatformSettings.owner_ccp_number} Clé ${defaultPlatformSettings.owner_ccp_key}`, 'ccp')
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedField === 'ccp' ? t('copied') : t('copy')}</span>
                </button>
              </div>
              <p className="text-amber-300 font-mono text-sm tracking-wider bg-slate-900 p-2 rounded-lg text-center">
                CCP : {defaultPlatformSettings.owner_ccp_number} — Clé : {defaultPlatformSettings.owner_ccp_key}
              </p>
            </div>
          </div>

          {/* Submission Form */}
          {submissionSuccess && lastSubmittedPayment ? (
            <div className="space-y-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
              <div className="text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Reçu enregistré sur Supabase et envoyé à l&apos;Espace Super-Admin !</span>
              </div>
              <a
                href={getReceiptWhatsAppUrl(lastSubmittedPayment)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>📲 Envoyer aussi la notification + reçu sur WhatsApp Admin</span>
              </a>
              <button
                type="button"
                onClick={() => setSubmissionSuccess(false)}
                className="text-xs font-bold text-slate-600 hover:underline block mx-auto pt-1"
              >
                Envoyer un autre reçu
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReceipt} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Méthode utilisée
                </label>
                <select aria-label="Champ de formulaire"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold outline-none focus:border-emerald-500"
                >
                  <option value="BARIDIMOB">📱 Virement BaridiMob (RIP)</option>
                  <option value="CCP_RECEIPT">🏦 Versement / Mandat CCP</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Nom Complet de l'expéditeur *
                </label>
                <input aria-label="Ex: Mohamed Ali"
                  type="text"
                  required
                  placeholder="Ex: Mohamed Ali"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-emerald-500 focus:bg-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Capture d&apos;écran du reçu BaridiMob ou photo du reçu CCP <span className="text-emerald-500">* (Obligatoire)</span>
                </label>
                <input aria-label="Champ de formulaire"
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleReceiptFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
                {receiptDataUrl && (
                  <div className="pt-2">
                    <img
                      src={receiptDataUrl}
                      alt="Aperçu du reçu"
                      className="h-24 rounded-xl border border-slate-200 object-cover"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingReceipt}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-emerald-400" />
                <span>
                  {submittingReceipt
                    ? 'Envoi en cours...'
                    : 'Envoyer ma preuve de paiement'}
                </span>
              </button>
            </form>
          )}
        </div>
      
      {/* SECTION QUOTAS, TARIFS FIXES & MULTI-LOCAUX */}
      <div id="quotas" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tarifs Officiels des Extensions (Add-ons)</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            Vos Quotas, Tarifs d'Extensions & Multi-Locaux
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sélectionnez la quantité exacte souhaitée selon l'évolution de votre commerce. Le tarif s'ajuste automatiquement selon votre besoin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Cartes Clients : +100 cartes = +500 DZD */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Cartes Clients Actives</span>
              <div className="text-xl font-black text-slate-900">
                {currentMerchant?.max_cards || 100} <span className="text-xs font-semibold text-slate-500">cartes incluses</span>
              </div>
              <p className="text-[11px] font-bold text-emerald-700">Tarif : +500 DZD / mois par +100 cartes</p>
              <select aria-label="Champ de formulaire"
                value={addonCardsPack}
                onChange={(e) => setAddonCardsPack(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-2.5 text-xs font-bold text-slate-800"
              >
                <option value={100}>+100 cartes (+500 DZD / mois)</option>
                <option value={200}>+200 cartes (+1 000 DZD / mois)</option>
                <option value={300}>+300 cartes (+1 500 DZD / mois)</option>
                <option value={500}>+500 cartes (+2 500 DZD / mois)</option>
                <option value={1000}>+1 000 cartes (+5 000 DZD / mois)</option>
              </select>
            </div>
            <a
              href={getWhatsAppAddonUrl(`+${addonCardsPack} Cartes Clients`, `+${(addonCardsPack / 100) * 500} DZD / mois`)}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl text-center transition-colors"
            >
              Commander +{addonCardsPack} cartes ({(addonCardsPack / 100) * 500} DZD)
            </a>
          </div>

          {/* 2. Notifications Push : +100 push = +400 DZD */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Notifications Push / Semaine</span>
              <div className="text-xl font-black text-slate-900">
                {currentMerchant?.max_push_per_week || 100} <span className="text-xs font-semibold text-slate-500">push / semaine</span>
              </div>
              <p className="text-[11px] font-bold text-blue-700">Tarif : +400 DZD / mois par +100 push</p>
              <select aria-label="Champ de formulaire"
                value={addonPushPack}
                onChange={(e) => setAddonPushPack(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-2.5 text-xs font-bold text-slate-800"
              >
                <option value={100}>+100 push/sem (+400 DZD / mois)</option>
                <option value={200}>+200 push/sem (+800 DZD / mois)</option>
                <option value={300}>+300 push/sem (+1 200 DZD / mois)</option>
                <option value={500}>+500 push/sem (+2 000 DZD / mois)</option>
                <option value={1000}>+1 000 push/sem (+4 000 DZD / mois)</option>
              </select>
            </div>
            <a
              href={getWhatsAppAddonUrl(`+${addonPushPack} Notifications Push / semaine`, `+${(addonPushPack / 100) * 400} DZD / mois`)}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl text-center transition-colors"
            >
              Commander +{addonPushPack} push ({(addonPushPack / 100) * 400} DZD)
            </a>
          </div>

          {/* 3. Offres Promotionnelles : +1 offre = +300 DZD */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Offres Ciblées Actives</span>
              <div className="text-xl font-black text-slate-900">
                {currentMerchant?.max_active_offers || 3} <span className="text-xs font-semibold text-slate-500">offres incluses</span>
              </div>
              <p className="text-[11px] font-bold text-purple-700">Tarif : +300 DZD / mois par +1 offre</p>
              <select aria-label="Champ de formulaire"
                value={addonOffersPack}
                onChange={(e) => setAddonOffersPack(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-2.5 text-xs font-bold text-slate-800"
              >
                <option value={1}>+1 offre active (+300 DZD / mois)</option>
                <option value={2}>+2 offres actives (+600 DZD / mois)</option>
                <option value={3}>+3 offres actives (+900 DZD / mois)</option>
                <option value={5}>+5 offres actives (+1 500 DZD / mois)</option>
                <option value={10}>+10 offres actives (+3 000 DZD / mois)</option>
              </select>
            </div>
            <a
              href={getWhatsAppAddonUrl(`+${addonOffersPack} Offre(s) Promotionnelle(s)`, `+${addonOffersPack * 300} DZD / mois`)}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl text-center transition-colors"
            >
              Commander +{addonOffersPack} offre(s) ({addonOffersPack * 300} DZD)
            </a>
          </div>

          {/* 4. Appareils / Caissiers simultanés : +1 appareil = +500 DZD */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500">Appareils Connectés (Users)</span>
              <div className="text-xl font-black text-slate-900">
                {currentMerchant?.max_users || 2} <span className="text-xs font-semibold text-slate-500">appareils simultanés</span>
              </div>
              <p className="text-[11px] font-bold text-amber-700">Tarif : +500 DZD / mois par +1 appareil</p>
              <select aria-label="Champ de formulaire"
                value={addonUsersPack}
                onChange={(e) => setAddonUsersPack(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl py-2 px-2.5 text-xs font-bold text-slate-800"
              >
                <option value={1}>+1 appareil caissier (+500 DZD / mois)</option>
                <option value={2}>+2 appareils caissiers (+1 000 DZD / mois)</option>
                <option value={3}>+3 appareils caissiers (+1 500 DZD / mois)</option>
                <option value={5}>+5 appareils caissiers (+2 500 DZD / mois)</option>
              </select>
            </div>
            <a
              href={getWhatsAppAddonUrl(`+${addonUsersPack} Appareil(s) Simultané(s)`, `+${addonUsersPack * 500} DZD / mois`)}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl text-center transition-colors"
            >
              Commander +{addonUsersPack} appareil(s) ({addonUsersPack * 500} DZD)
            </a>
          </div>

          {/* 5. Multi-Locaux : +1 local = +1 500 DZD */}
          <div className="bg-emerald-50/70 border-2 border-emerald-300 p-4 rounded-2xl flex flex-col justify-between gap-3 sm:col-span-2">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black text-emerald-800">
                🏢 Points de Vente Supplémentaires (Multi-Locaux sur le même compte)
              </span>
              <div className="text-xl font-black text-slate-900">
                {currentMerchant?.max_locations || 1} <span className="text-xs font-bold text-emerald-700">point(s) de vente autorisé(s)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Tarif fixe : <strong>+1 500 DZD / mois par local supplémentaire</strong>. Chaque point de vente dispose de son propre profil, sa propre carte personnalisable, son QR code et ses statistiques, accessible depuis le sélecteur de votre menu latéral.
              </p>
              <select aria-label="Champ de formulaire"
                value={addonLocationsPack}
                onChange={(e) => setAddonLocationsPack(Number(e.target.value))}
                className="w-full sm:w-80 bg-white border border-emerald-400 rounded-xl py-2 px-3 text-xs font-bold text-slate-900"
              >
                <option value={1}>+1 Point de vente supplémentaire (+1 500 DZD / mois)</option>
                <option value={2}>+2 Points de vente supplémentaires (+3 000 DZD / mois)</option>
                <option value={3}>+3 Points de vente supplémentaires (+4 500 DZD / mois)</option>
                <option value={4}>+4 Points de vente supplémentaires (+6 000 DZD / mois)</option>
                <option value={5}>+5 Points de vente supplémentaires (+7 500 DZD / mois)</option>
              </select>
            </div>
            <a
              href={getWhatsAppAddonUrl(`+${addonLocationsPack} Point(s) de Vente (Multi-Locaux)`, `+${addonLocationsPack * 1500} DZD / mois`)}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl text-center transition-colors"
            >
              📲 Commander +{addonLocationsPack} Point(s) de Vente ({addonLocationsPack * 1500} DZD / mois)
            </a>
          </div>
        </div>
      </div></div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
          Chargement des paramètres de paiement...
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
