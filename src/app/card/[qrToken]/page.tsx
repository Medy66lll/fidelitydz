'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/db';
import { CustomerCard, Merchant, LoyaltyProgram, PersonalizedOffer } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  QrCode,
  Sparkles,
  Gift,
  Check,
  Trophy,
  Share2,
  BookmarkPlus,
  Tag,
  Clock,
  Coffee,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function CustomerCardPage() {
  const params = useParams();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const qrToken = params?.qrToken as string;

  const [card, setCard] = useState<CustomerCard | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [offers, setOffers] = useState<PersonalizedOffer[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (qrToken) {
      const foundCard = db.getCardByToken(qrToken);
      if (foundCard) {
        setCard(foundCard);
        const m = db.getMerchantById(foundCard.merchant_id);
        if (m) setMerchant(m);
        const p = db.getProgramByMerchantId(foundCard.merchant_id);
        if (p) setProgram(p);
        const targetedOffers = db.getOffersForCard(foundCard);
        setOffers(targetedOffers);

        // Si récompense disponible, lancer les confettis !
        if (foundCard.rewards_available > 0 || (p && foundCard.stamps_balance >= p.stamps_required)) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      }
    }
  }, [qrToken]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (!card || !merchant || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="text-sm text-slate-400">Chargement de votre carte de fidélité...</p>
        </div>
      </div>
    );
  }

  const isRewardReady = card.rewards_available > 0 || card.stamps_balance >= program.stamps_required;
  const stampsRemaining = Math.max(0, program.stamps_required - card.stamps_balance);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pb-10">
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
          <LanguageToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto w-full px-4 pt-6 space-y-6">
        {/* Pass Card Container */}
        <div
          className="rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-white/10"
          style={{ backgroundColor: program.background_color || '#0F172A' }}
        >
          {/* Subtle Ambient Radial Glow */}
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
                          ? (isLast ? '#F59E0B' : program.primary_color || '#10B981')
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
            /* Points Program */
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
                {isAr ? 'اجمع النقاط مع كل عملية شراء واستبدلها بهدايا' : '1 point par tranche de 100 DZD d\'achat'}
              </p>
            </div>
          )}

          {/* Cashier QR Presentation */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col items-center bg-white rounded-2xl p-5 text-slate-900 shadow-xl relative z-10">
            <QRCodeSVG
              value={card.qr_token}
              size={140}
              level="M"
              includeMargin={false}
            />
            <p className="mt-3 text-[11px] font-black uppercase tracking-wider text-slate-600">
              {t('show_qr_to_cashier')}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Ref: {card.qr_token.slice(-10)}
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

        {/* Action Buttons: Add to Screen / Share */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl transition-all shadow-sm"
            type="button"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>{copiedLink ? (isAr ? 'تم نسخ الرابط !' : 'Lien copié !') : (isAr ? 'مشاركة بطاقتي' : 'Partager ma carte')}</span>
          </button>
          <button
            onClick={() => alert(isAr ? 'أضف هذه الصفحة إلى الشاشة الرئيسية لهاتفك للوصول السريع بدون إنترنت !' : 'Pour garder votre carte toujours à portée de main, appuyez sur "Partager" puis "Sur l\'écran d\'accueil" dans votre navigateur.')}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl transition-all shadow-sm"
            type="button"
          >
            <BookmarkPlus className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'حفظ في الشاشة' : 'Ajouter à l\'écran'}</span>
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
                        {isAr ? 'صالح حتى :' : 'Valable jusqu\'au :'}{' '}
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

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-500">
        FidelityDZ • {merchant.business_name}
      </footer>
    </div>
  );
}
