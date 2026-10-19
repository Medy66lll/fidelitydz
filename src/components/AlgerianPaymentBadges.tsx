import React from 'react';

export default function AlgerianPaymentBadges({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const heightClass = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-10' : 'h-8';

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Chargily Pay V2 */}
      <div className={`flex items-center gap-1.5 px-3 ${heightClass} bg-white border border-slate-200 rounded-lg shadow-sm hover:border-emerald-500 transition-colors`}>
        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-[10px]">
          C
        </div>
        <span className="font-extrabold text-xs tracking-tight text-slate-800">
          Chargily <span className="text-emerald-600">Pay</span>
        </span>
      </div>

      {/* Carte Edahabia */}
      <div className={`flex items-center gap-1.5 px-3 ${heightClass} bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 rounded-lg shadow-sm`}>
        <div className="w-3.5 h-3.5 rounded bg-amber-500 flex items-center justify-center text-white font-black text-[9px]">
          ★
        </div>
        <span className="font-bold text-xs text-amber-900 tracking-tight">
          Edahabia <span className="font-arabic text-[11px] text-amber-700">الذهبية</span>
        </span>
      </div>

      {/* Carte CIB */}
      <div className={`flex items-center gap-1.5 px-3 ${heightClass} bg-white border border-blue-200 rounded-lg shadow-sm`}>
        <div className="px-1 py-0.5 bg-blue-600 rounded text-white font-black text-[9px] tracking-tighter">
          CIB
        </div>
        <span className="font-bold text-xs text-blue-900">Banques DZ</span>
      </div>

      {/* BaridiMob */}
      <div className={`flex items-center gap-1.5 px-3 ${heightClass} bg-white border border-yellow-300 rounded-lg shadow-sm`}>
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
        <span className="font-bold text-xs text-slate-800">
          Baridi<span className="text-yellow-600 font-extrabold">Mob</span>
        </span>
      </div>

      {/* Algérie Poste CCP */}
      <div className={`flex items-center gap-1.5 px-3 ${heightClass} bg-white border border-slate-200 rounded-lg shadow-sm`}>
        <span className="font-extrabold text-xs text-emerald-700">CCP</span>
        <span className="font-arabic text-[11px] text-slate-600">بريد الجزائر</span>
      </div>
    </div>
  );
}
