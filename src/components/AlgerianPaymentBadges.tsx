import React from 'react';

export default function AlgerianPaymentBadges({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const heightClass = size === 'sm' ? 'h-7 text-xs px-2.5' : size === 'lg' ? 'h-10 text-sm px-4' : 'h-8 text-xs px-3';

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {/* Carte Edahabia */}
      <div className={`flex items-center gap-2 ${heightClass} bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-400/50 rounded-xl shadow-xs backdrop-blur-sm transition-transform hover:scale-105`}>
        <div className="w-4 h-4 rounded bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black text-[10px] shadow-xs">
          ★
        </div>
        <span className="font-extrabold text-amber-300 tracking-tight flex items-center gap-1">
          Edahabia <span className="font-arabic font-bold text-amber-200">الذهبية</span>
        </span>
      </div>

      {/* BaridiMob */}
      <div className={`flex items-center gap-2 ${heightClass} bg-slate-900/80 border border-amber-300/40 rounded-xl shadow-xs backdrop-blur-sm transition-transform hover:scale-105`}>
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
        <span className="font-bold text-white tracking-tight">
          Baridi<span className="text-amber-400 font-black">Mob</span>
        </span>
      </div>

      {/* Algérie Poste CCP & CIB */}
      <div className={`flex items-center gap-2 ${heightClass} bg-slate-900/80 border border-emerald-500/30 rounded-xl shadow-xs backdrop-blur-sm transition-transform hover:scale-105`}>
        <span className="font-black text-emerald-400">CCP & CIB</span>
        <span className="font-arabic text-slate-300 font-semibold">بريد الجزائر</span>
      </div>
    </div>
  );
}
