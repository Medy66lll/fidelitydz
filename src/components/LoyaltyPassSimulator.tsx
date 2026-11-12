'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Gift, Check, Trophy } from 'lucide-react';
import { RewardTier } from '@/lib/types';

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
  rewardTiers?: RewardTier[];
  primaryColor?: string;
  backgroundColor?: string;
  customerName?: string;
  customerPhone?: string;
  qrToken?: string;
  isArabic?: boolean;
}

export default function LoyaltyPassSimulator({
  businessName = 'Café & Pâtisserie El Bahdja',
  logoUrl = '',
  programType = 'STAMPS',
  stampsCount = 7,
  stampsRequired = 10,
  pointsCount = 140,
  rewardTitleFr = '10ème Café ou Pâtisserie Offert',
  rewardTitleAr = 'القهوة أو الحلوى العاشرة مجاناً',
  rewardTiers = [],
  primaryColor = '#10B981',
  backgroundColor = '#0F172A',
  customerPhone = '0555 12 34 56',
  qrToken = 'token-demo-dz-fidelity',
  isArabic = false,
}: LoyaltyPassProps) {
  const isRewardReady = stampsCount >= stampsRequired;
  const tierThresholds = new Set((rewardTiers || []).map((t) => Number(t.threshold)));

  return (
    <div className="w-full max-w-[340px] mx-auto select-none transition-all">
      <div className="relative rounded-[36px] p-3 bg-slate-900 border-[6px] border-slate-800 shadow-2xl">
        <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
        </div>

        <div
          className="rounded-[2rem] p-5 text-white shadow-2xl relative overflow-hidden"
          style={{ backgroundColor }}
        >
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-16 -mt-16 opacity-30 pointer-events-none"
            style={{ backgroundColor: primaryColor }}
          ></div>

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              {logoUrl && (
                <img src={logoUrl} alt={businessName} className="w-9 h-9 rounded-xl object-cover bg-white border border-white/20 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-base font-black text-white leading-tight truncate">{businessName}</p>
                <p className="text-[10px] font-mono text-slate-300 opacity-80 mt-0.5">{customerPhone}</p>
              </div>
            </div>
            {isRewardReady && (
              <div className="bg-amber-500 text-slate-900 px-2 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1 animate-pulse flex-shrink-0">
                <Gift className="w-2.5 h-2.5" /> {isArabic ? 'هدية' : 'Cadeau'}
              </div>
            )}
          </div>

          {rewardTiers && rewardTiers.length > 0 && (
            <div className="relative z-10 mb-3 space-y-1 bg-white/10 rounded-xl p-2.5 border border-white/10">
              <p className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                🎁 Paliers de cadeaux sur cette carte :
              </p>
              {rewardTiers.map((tier, idx) => {
                const reached = programType === 'STAMPS' ? stampsCount >= tier.threshold : pointsCount >= tier.threshold;
                return (
                  <div key={idx} className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-white truncate">
                      Palier {tier.threshold} {programType === 'STAMPS' ? 'tampons' : 'pts'} : {tier.title_fr}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded font-black text-[9px] ${reached ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-300'}`}>
                      {reached ? 'Débloqué ✓' : 'À gagner'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="relative z-10 bg-slate-900/40 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 mb-4">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-300 mb-2.5">
              <span>{programType === 'STAMPS' ? (isArabic ? 'التقدم' : 'Progression') : (isArabic ? 'رصيد النقاط' : 'Solde')}</span>
              <span style={{ color: primaryColor }}>{programType === 'STAMPS' ? `${stampsCount} / ${stampsRequired}` : `${pointsCount} pts`}</span>
            </div>

            {programType === 'STAMPS' ? (
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: stampsRequired }).map((_, i) => {
                  const stepNum = i + 1;
                  const isFilled = i < stampsCount;
                  const isLast = stepNum === stampsRequired;
                  const isIntermediateGift = tierThresholds.has(stepNum);
                  return (
                    <div
                      key={i}
                      className={`relative h-9 rounded-xl flex items-center justify-center ${
                        isFilled ? 'shadow-md scale-[1.02]' : 'border border-dashed border-white/20 bg-white/5'
                      }`}
                      style={{
                        background: isFilled
                          ? isLast || isIntermediateGift
                            ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                            : primaryColor
                          : 'transparent',
                      }}
                    >
                      {isFilled ? (
                        isLast || isIntermediateGift ? (
                          <Trophy className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        )
                      ) : isLast || isIntermediateGift ? (
                        <Gift className="w-3.5 h-3.5 text-amber-400/70" />
                      ) : (
                        <span className="text-[10px] font-black text-white/30">{stepNum}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min(100, (pointsCount / Math.max(100, stampsRequired * 10)) * 100)}%`,
                    backgroundColor: primaryColor,
                  }}
                ></div>
              </div>
            )}
          </div>

          <div className="relative z-10 bg-white rounded-[1.5rem] p-3 flex items-center gap-3 shadow-xl">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex-shrink-0">
              <QRCodeSVG value={qrToken || 'https://fidelitydz.com'} size={50} level="M" includeMargin={false} fgColor="#0F172A" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] font-black uppercase text-slate-500 mb-0.5 leading-tight">
                {isArabic ? 'الهدية الرئيسية' : 'CADEAU FINAL (' + stampsRequired + (programType === 'STAMPS' ? ' TAMPONS)' : ' PTS)')}
              </p>
              <p className="text-[11px] font-bold text-slate-800 leading-tight truncate">
                {isArabic ? rewardTitleAr : rewardTitleFr}
              </p>
            </div>
          </div>
        </div>

        <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-3"></div>
      </div>
    </div>
  );
}
