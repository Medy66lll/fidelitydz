'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm ${className}`}>
      <button
        onClick={() => setLanguage('fr')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
          language === 'fr'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
        }`}
        type="button"
        aria-label="Français"
      >
        FR
      </button>
      <span className="text-slate-300 dark:text-slate-600 px-1 text-xs">|</span>
      <button
        onClick={() => setLanguage('ar')}
        className={`px-3 py-1 rounded-full text-xs font-bold font-arabic transition-all duration-200 ${
          language === 'ar'
            ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-extrabold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
        }`}
        type="button"
        aria-label="العربية"
      >
        عربي
      </button>
    </div>
  );
}
