'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Gift, Check, Trophy, Sparkles } from 'lucide-react';
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
  
  const allSimTiers = React.useMemo(() => {
    const list = Array.isArray(rewardTiers) ? [...rewardTiers] : [];
    if (programType === 'STAMPS') {
      const hasFinal = list.some((t) => Number(t.threshold) === Number(stampsRequired));
      if (!hasFinal && stampsRequired > 0) {
        list.push({
          threshold: stampsRequired,
          title_fr: rewardTitleFr,
          title_ar: rewardTitleAr,
        });
      }
    } else {
      if (list.length === 0) {
        list.push(
          { threshold: 50, title_fr: 'Boisson Offerte', title_ar: 'مشروب هدية' },
          { threshold: 100, title_fr: rewardTitleFr, title_ar: rewardTitleAr }
        );
      }
    }
    return list.sort((a, b) => Number(a.threshold) - Number(b.threshold));
  }, [rewardTiers, programType, stampsRequired, rewardTitleFr, rewardTitleAr]);

  const tierSimMap = React.useMemo(() => {
    const m = new Map<number, RewardTier>();
    allSimTiers.forEach((t) => m.set(Number(t.threshold), t));
    return m;
  }, [allSimTiers]);

  const currentCount = programType === 'STAMPS' ? stampsCount : pointsCount;
  const nextSimReward = allSimTiers.find((t) => currentCount < Number(t.threshold)) || null;
  const maxSimPoints = Math.max(100, ...allSimTiers.map((t) => Number(t.threshold)));

  return (
    <div className="w-full max-w-[350px] mx-auto select-none transition-all">
      {/* Smartphone Chassis with Gloss Rim */}
      <div className="relative rounded-[40px] p-3.5 bg-gradient-to-b from-slate-800 to-slate-950 border-[5px] border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
        {/* Dynamic Island / Speaker Notch */}
        <div className="w-28 h-4 bg-slate-900 rounded-full mx-auto mb-3.5 flex items-center justify-center gap-2 border border-slate-700/40">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></div>
        </div>

        {/* The Digital Card Body */}
        <div
          className="rounded-[2.2rem] p-5 text-white shadow-2xl relative overflow-hidden border border-white/15"
          style={{ backgroundColor }}
        >
          {/* Ambient Perceptual Glow in Card */}
          <div
            className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl -mr-20 -mt-20 opacity-35 pointer-events-none transition-all duration-700"
            style={{ backgroundColor: primaryColor }}
          ></div>
          <div className="absolute bottom-0 left-0 w-44 h-44 rounded-full blur-2xl -ml-16 -mb-16 bg-amber-400/10 pointer-events-none"></div>

          {/* Top Brand Header */}
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={businessName}
                  className="w-10 h-10 rounded-2xl object-cover bg-white border border-white/30 flex-shrink-0 shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 text-emerald-400 font-black shadow-md">
                  <Sparkles className="w-5 h-5 text-emerald-300" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-base font-extrabold text-white leading-tight truncate tracking-tight">
                  {businessName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <p className="text-[10px] font-mono font-medium text-slate-300 opacity-90 tabular-nums">
                    {customerPhone}
                  </p>
                </div>
              </div>
            </div>

            {/* Reward Ready Pulsing Badge */}
            {isRewardReady && (
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-2.5 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1 shadow-lg shadow-amber-500/30 animate-pulse flex-shrink-0">
                <Gift className="w-3 h-3" /> {isArabic ? 'هدية جاهزة' : 'Cadeau Prêt !'}
              </div>
            )}
          </div>

          {/* Dynamic Next Reward Milestone Banner */}
          {nextSimReward ? (
            <div className="relative z-10 mb-3 bg-gradient-to-r from-amber-500/25 via-emerald-500/15 to-amber-500/25 border border-amber-400/40 rounded-2xl p-2.5 shadow-md flex items-center justify-between gap-2 text-left">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center flex-shrink-0 font-black shadow-xs">
                  <Gift className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8.5px] font-black uppercase text-amber-300 truncate">
                    {programType === 'STAMPS'
                      ? isArabic
                        ? `🎁 الهدية القادمة (الختم ${nextSimReward.threshold}) :`
                        : `🎁 Prochain Cadeau (Tampon ${nextSimReward.threshold}) :`
                      : isArabic
                      ? `🎁 الهدية القادمة (${nextSimReward.threshold} نقطة) :`
                      : `🎁 Prochain Cadeau (${nextSimReward.threshold} pts) :`}
                  </p>
                  <p className="text-[10.5px] font-black text-white truncate">
                    {isArabic && nextSimReward.title_ar ? nextSimReward.title_ar : nextSimReward.title_fr}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[8.5px] whitespace-nowrap shadow-xs">
                {programType === 'STAMPS'
                  ? `+${Number(nextSimReward.threshold) - stampsCount} !`
                  : `+${Number(nextSimReward.threshold) - pointsCount} pts !`}
              </span>
            </div>
          ) : (
            <div className="relative z-10 mb-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-2.5 flex items-center gap-2 text-[10px] text-emerald-200">
              <Trophy className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span className="font-extrabold truncate">
                {isArabic ? '🎉 تم فتح جميع هدايا البرنامج !' : '🎉 Tous les cadeaux sont débloqués !'}
              </span>
            </div>
          )}

          {/* Stamps Progression Grid */}
          <div className="relative z-10 bg-black/40 backdrop-blur-md rounded-[1.75rem] p-3.5 border border-white/15 mb-3 shadow-inner">
            <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-300 mb-2.5">
              <span className="uppercase tracking-wider text-slate-400">
                {programType === 'STAMPS'
                  ? isArabic
                    ? 'التقدم في الأختام'
                    : 'Progression Tampons'
                  : isArabic
                  ? 'رصيد النقاط'
                  : 'Solde de points'}
              </span>
              <span className="font-mono text-emerald-400 font-black tabular-nums">
                {programType === 'STAMPS' ? `${stampsCount} / ${stampsRequired}` : `${pointsCount} pts`}
              </span>
            </div>

            {programType === 'STAMPS' ? (
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: stampsRequired }).map((_, i) => {
                  const stepNum = i + 1;
                  const isFilled = i < stampsCount;
                  const isLast = stepNum === stampsRequired;
                  const tier = tierSimMap.get(stepNum);
                  const isGiftSlot = Boolean(tier);

                  return (
                    <div
                      key={i}
                      className={`relative h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isFilled
                          ? isLast || isGiftSlot
                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-300 shadow-md shadow-amber-500/30 scale-[1.03]'
                            : 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-emerald-300 shadow-md shadow-emerald-500/25 scale-[1.03]'
                          : isGiftSlot
                          ? 'bg-amber-500/20 border-2 border-dashed border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.25)] scale-[1.03]'
                          : 'bg-black/30 border-2 border-white/35 shadow-inner'
                      }`}
                    >
                      {isFilled ? (
                        isLast ? (
                          <Trophy className="w-4 h-4 text-white drop-shadow" />
                        ) : isGiftSlot ? (
                          <div className="flex flex-col items-center">
                            <Trophy className="w-3.5 h-3.5 text-white drop-shadow" />
                            <span className="text-[6.5px] font-black uppercase text-white leading-none mt-0.5">
                              Gagné
                            </span>
                          </div>
                        ) : (
                          <Check className="w-4 h-4 text-white stroke-[3.5] drop-shadow" />
                        )
                      ) : isGiftSlot ? (
                        <div className="flex flex-col items-center justify-center">
                          <Gift className="w-4 h-4 text-amber-300 drop-shadow" />
                          <span className="text-[7px] font-black text-amber-300 uppercase tracking-tighter leading-none mt-0.5">
                            {isLast ? (isArabic ? 'كبير' : 'Cadeau') : (isArabic ? `ختم ${stepNum}` : `T.${stepNum}`)}
                          </span>
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center">
                          <span className="text-[9.5px] font-black text-white/80 font-mono leading-none">{stepNum}</span>
                        </div>
                      )}

                      {/* Étoile indicatrice sur le coin */}
                      {isGiftSlot && !isFilled && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 shadow-sm"
                    style={{
                      width: `${Math.min(100, (pointsCount / maxSimPoints) * 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-300 font-mono font-bold">
                  <span>0 pt</span>
                  <span className="text-amber-300">{maxSimPoints} pts</span>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Multi-Reward Breakdown List */}
          {allSimTiers.length > 0 && (
            <div className="relative z-10 mb-3 space-y-1 bg-black/35 backdrop-blur-md rounded-2xl p-2.5 border border-white/15 text-left">
              <p className="text-[9px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <span>🎁</span> {isArabic ? 'قائمة الهدايا التي تربحها :' : 'Ce que vous gagnez à chaque palier :'}
              </p>
              {allSimTiers.map((tier, idx) => {
                const threshold = Number(tier.threshold);
                const reached =
                  programType === 'STAMPS'
                    ? stampsCount >= threshold
                    : pointsCount >= threshold;
                const isNext = nextSimReward && Number(nextSimReward.threshold) === threshold;
                const diff =
                  programType === 'STAMPS'
                    ? threshold - stampsCount
                    : threshold - pointsCount;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-[10px] p-1.5 rounded-lg border ${
                      reached
                        ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                        : isNext
                        ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                        : 'bg-white/5 border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-1.5">
                      <span className="font-mono font-bold text-amber-300 text-[9px]">
                        {programType === 'STAMPS' ? `T.${threshold}` : `${threshold}p`} :
                      </span>{' '}
                      <span className="font-extrabold text-white">
                        {isArabic && tier.title_ar ? tier.title_ar : tier.title_fr}
                      </span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded-full font-black text-[8px] transition-colors flex-shrink-0 ${
                        reached
                          ? 'bg-emerald-400 text-slate-950'
                          : isNext
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {reached
                        ? (isArabic ? 'متاح ✓' : 'Débloqué ✓')
                        : isNext
                        ? `+${diff}`
                        : `À ${threshold}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom QR Code & Final Reward Box */}
          <div className="relative z-10 bg-white rounded-2xl p-3 flex items-center gap-3.5 shadow-xl border border-slate-100">
            <div className="bg-white p-1 rounded-xl shadow-xs border border-slate-200/60 flex-shrink-0">
              <QRCodeSVG
                value={qrToken || 'https://fidelitydz.com'}
                size={54}
                level="M"
                includeMargin={false}
                fgColor="#0F172A"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-700 mb-0.5 leading-tight flex items-center gap-1">
                <span>🎁</span> {isArabic ? 'الهدية الكبرى' : `CADEAU FINAL (${stampsRequired} ${programType === 'STAMPS' ? 'TAMPONS' : 'PTS'})`}
              </p>
              <p className="text-xs font-black text-slate-900 leading-snug line-clamp-2">
                {isArabic ? rewardTitleAr : rewardTitleFr}
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5 font-medium">
                {isArabic ? 'امسح الرمز عند الصندوق' : 'Présentez ce QR Code en caisse'}
              </p>
            </div>
          </div>
        </div>

        {/* Home Indicator Bar */}
        <div className="w-32 h-1 bg-slate-700/80 rounded-full mx-auto mt-3.5"></div>
      </div>
    </div>
  );
}
