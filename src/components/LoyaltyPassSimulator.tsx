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

        {/* Digital Pass Card - MATCHING NEW DESIGN */}
        <div
          className="rounded-[2rem] p-5 text-white shadow-2xl relative overflow-hidden"
          style={{ backgroundColor }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="flex justify-between items-start mb-5 relative z-10">
            <div className="flex-1 min-w-0 pr-2">
              <h2 className="text-lg font-black text-white leading-tight truncate">{businessName}</h2>
              <p className="text-[10px] font-mono text-slate-300 opacity-80 mt-1">{customerPhone}</p>
            </div>
            {isRewardReady && (
              <div className="bg-amber-500 text-slate-900 px-2 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)] flex-shrink-0">
                <Gift className="w-2.5 h-2.5" /> {isArabic ? 'هدية' : 'Cadeau'}
              </div>
            )}
          </div>

          {/* SECTION PROGRESSION (TAMPONS/POINTS) */}
          <div className="relative z-10 bg-slate-900/40 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 mb-4">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-300 mb-2.5">
              <span>{programType === 'STAMPS' ? (isArabic ? 'التقدم' : 'Progression') : (isArabic ? 'رصيد النقاط' : 'Solde')}</span>
              <span className="text-emerald-400">{programType === 'STAMPS' ? `${stampsCount} / ${stampsRequired}` : `${pointsCount} pts`}</span>
            </div>
            
            {programType === 'STAMPS' ? (
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: stampsRequired }).map((_, i) => {
                  const isFilled = i < stampsCount;
                  const isLast = i === stampsRequired - 1;
                  return (
                    <div key={i} className={`relative h-10 rounded-xl flex items-center justify-center ${isFilled ? 'shadow-md scale-[1.02]' : 'border border-dashed border-white/20 bg-white/5'}`} style={{ background: isFilled ? (isLast ? 'linear-gradient(135deg, #F59E0B, #D97706)' : `linear-gradient(135deg, ${primaryColor || '#10B981'}, #047857)`) : 'transparent' }}>
                      {isFilled ? (isLast ? <Trophy className="w-4 h-4 text-white" /> : <Check className="w-4 h-4 text-white stroke-[3]" />) : (isLast ? <Gift className="w-4 h-4 text-amber-400/30" /> : <span className="text-[10px] font-black text-white/20">{i + 1}</span>)}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full" style={{ width: `${Math.min(100, (pointsCount / 200) * 100)}%`, backgroundColor: primaryColor || '#10B981' }}></div>
              </div>
            )}
          </div>

          {/* QR CODE CAISSE INTÉGRÉ DANS LA CARTE */}
          <div className="relative z-10 bg-white rounded-[1.5rem] p-3 flex items-center gap-3 shadow-xl">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex-shrink-0">
              <QRCodeSVG value={qrToken || 'https://fidelitydz.com'} size={50} level="M" includeMargin={false} fgColor="#0F172A" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] font-black uppercase text-slate-500 mb-0.5 leading-tight">{isArabic ? 'أظهر الرمز' : 'QR EN CAISSE'}</p>
              <p className="text-[11px] font-bold text-slate-800 leading-tight truncate">{isArabic ? rewardTitleAr : rewardTitleFr}</p>
            </div>
          </div>
        </div>

        {/* Home bar indicator */}
        <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-3"></div>
      </div>
    </div>
  );
}
