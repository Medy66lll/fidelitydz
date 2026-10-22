'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, Gift, Check, Coffee, Trophy } from 'lucide-react';

interface LoyaltyPassProps {
  businessName?: string;
  category?: string;
  logoUrl?: string;
  programType?: 'STAMPS' | 'POINTS';
  stampsCount?: number;
  stampsRequired?: number;
  pointsCount?: number;
  rewardTitleFr?: string;
  rewardTitleAr?: string;
  primaryColor?: string;
  backgroundColor?: string;
  customerName?: string;
  customerPhone?: string;
  qrToken?: string;
  isArabic?: boolean;
}

export default function LoyaltyPassSimulator({
  businessName = 'Café & Pâtisserie El Bahdja',
  category = 'Café & Restauration • Alger',
  logoUrl = '',
  programType = 'STAMPS',
  stampsCount = 7,
  stampsRequired = 10,
  pointsCount = 140,
  rewardTitleFr = '10ème Café ou Pâtisserie Offert',
  rewardTitleAr = 'القهوة أو الحلوى العاشرة مجاناً',
  primaryColor = '#10B981',
  backgroundColor = '#0F172A',
  customerName = 'Amine Benaissa',
  customerPhone = '0555 12 34 56',
  qrToken = 'token-demo-dz-fidelity',
  isArabic = false,
}: LoyaltyPassProps) {
  const isRewardReady = stampsCount >= stampsRequired;
  const stampsRemaining = Math.max(0, stampsRequired - stampsCount);

  return (
    <div className="w-full max-w-[340px] mx-auto select-none transition-all">
      {/* Smartphone frame styling */}
      <div className="relative rounded-[36px] p-3 bg-slate-900 border-[6px] border-slate-800 shadow-2xl">
        {/* Dynamic Island / Notch */}
        <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
        </div>

        {/* Digital Pass Card */}
        <div
          className="rounded-[24px] p-5 text-white shadow-lg relative overflow-hidden"
          style={{ backgroundColor }}
        >
          {/* Subtle Ambient Emerald / Accent Glow */}
          <div
            className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl opacity-25 pointer-events-none"
            style={{ backgroundColor: primaryColor }}
          ></div>

          {/* Header Pass */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                {isArabic ? 'بطاقة ولاء رقمية' : 'Carte Fidélité Digitale'}
              </span>
              <h3 className="font-extrabold text-base tracking-tight leading-tight">
                {businessName}
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">{category}</p>
            </div>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={businessName}
                className="w-10 h-10 rounded-xl object-cover shadow-md border border-white/20 bg-white"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md font-bold text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <Coffee className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Reward Status Banner */}
          <div className="my-4 py-2.5 px-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center flex-shrink-0">
                <Gift className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <p className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                  {isRewardReady
                    ? (isArabic ? 'مبروك ! هديتك جاهزة' : '🎉 Récompense débloquée !')
                    : (isArabic ? 'الهدية القادمة' : 'Récompense à débloquer')}
                </p>
                <p className="text-xs font-semibold text-white truncate max-w-[200px]">
                  {isArabic ? rewardTitleAr : rewardTitleFr}
                </p>
              </div>
            </div>
          </div>

          {/* Stamps Grid or Points Progress */}
          {programType === 'STAMPS' ? (
            <div className="my-4 relative z-10">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-medium">
                <span>
                  {isArabic
                    ? `${stampsCount} من ${stampsRequired} أختام`
                    : `${stampsCount} sur ${stampsRequired} tampons`}
                </span>
                <span className="text-emerald-400 font-bold">
                  {isRewardReady
                    ? (isArabic ? 'جاهز للاستلام' : 'Offert !')
                    : (isArabic ? `${stampsRemaining} متبقي` : `${stampsRemaining} restant(s)`)}
                </span>
              </div>

              {/* Grid of stamps */}
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: stampsRequired }).map((_, index) => {
                  const isFilled = index < stampsCount;
                  const isFinal = index === stampsRequired - 1;

                  return (
                    <div
                      key={index}
                      className={`h-11 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        isFilled
                          ? 'shadow-md scale-100 text-white'
                          : 'border-2 border-dashed border-white/20 bg-white/5 text-slate-400'
                      }`}
                      style={{
                        backgroundColor: isFilled
                          ? (isFinal ? '#F59E0B' : primaryColor)
                          : undefined,
                      }}
                    >
                      {isFilled ? (
                        isFinal ? (
                          <Trophy className="w-5 h-5 text-white animate-bounce" />
                        ) : (
                          <Check className="w-5 h-5 stroke-[3]" />
                        )
                      ) : isFinal ? (
                        <Gift className="w-4 h-4 text-amber-300 opacity-60" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Points Program View */
            <div className="my-4 py-3 px-4 rounded-xl bg-white/10 relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">
                  {isArabic ? 'رصيد النقاط' : 'Solde de points'}
                </span>
                <span className="text-lg font-black text-amber-400">{pointsCount} pts</span>
              </div>
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (pointsCount / 200) * 100)}%`,
                    backgroundColor: primaryColor,
                  }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-300 text-right">
                {isArabic ? '100 نقطة = هدية فورية' : '100 points = Récompense débloquée'}
              </p>
            </div>
          )}

          {/* QR Code Presentation for Cashier */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col items-center relative z-10 bg-white rounded-2xl p-4 text-slate-900 shadow-md">
            <QRCodeSVG
              value={qrToken || 'https://fidelitydz.com'}
              size={120}
              level="M"
              includeMargin={false}
            />
            <p className="mt-2 text-[10px] font-bold tracking-wider uppercase text-slate-500">
              {isArabic ? 'أظهر هذا الرمز للكاشير' : 'Présentez ce QR en caisse'}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span>{customerName}</span>
              <span className="text-slate-400">•</span>
              <span className="font-mono text-[11px] text-slate-600">{customerPhone}</span>
            </div>
          </div>
        </div>

        {/* Home bar indicator */}
        <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-3"></div>
      </div>
    </div>
  );
}
