'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import LanguageToggle from '@/components/LanguageToggle';
import SupportWidget from '@/components/SupportWidget';
import { db, FIDELITY_INSTAGRAM_URL, FIDELITY_INSTAGRAM_HANDLE, FIDELITY_WHATSAPP_URL } from '@/lib/db';
import { QrCode, Lock, Phone, ArrowRight, Store, Sparkles, ShieldCheck, Instagram, MessageCircle } from 'lucide-react';

export default function MerchantLoginPage() {
  const { language } = useLanguage();
  const { loginMerchantSession } = useMerchant();
  const router = useRouter();
  const isAr = language === 'ar';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let deviceId = typeof window !== 'undefined' ? localStorage.getItem('fidelitydz_device_id') : null;
    if (!deviceId) {
      deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      if (typeof window !== 'undefined') localStorage.setItem('fidelitydz_device_id', deviceId);
    }

    const res = await db.loginMerchantAsync(identifier, password, deviceId);
    if (!res.success || !res.merchant) {
      setError(
        res.error ||
          (isAr
            ? 'رقم الهاتف أو كلمة المرور غير صحيحة'
            : 'Identifiant, mot de passe Gérant ou Code PIN Caissier incorrect.')
      );
      setLoading(false);
      return;
    }

    loginMerchantSession(res.merchant);
    if (res.role === 'CASHIER') {
      router.push('/scanner');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between text-white overflow-hidden bg-slate-950">
      {/* Ambient OKLAB Light Fields */}
      <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <header className="border-b border-slate-800/80 px-6 py-4 bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl fdz-oklab-accent-bg text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
              <QrCode className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-black text-xl tracking-tight text-white">
              Fidelity<span className="text-emerald-400">DZ</span>
            </span>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      <main className="max-w-md mx-auto w-full p-4 sm:p-6 my-auto">
        <div className="fdz-glass-dark rounded-[2.5rem] p-6 sm:p-9 border border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Store className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {isAr ? 'تسجيل دخول التاجر أو الصندوق' : 'Connexion Gérant & Caisse'}
            </h1>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {isAr
                ? 'أدخل كلمة مرور المدير (لوحة التحكم) أو الرمز السري للصندوق PIN (الماسح فقط)'
                : 'Saisissez votre mot de passe Gérant (Dashboard complet) ou votre Code PIN Caissier (Scanner uniquement).'}
            </p>
          </div>

          {error && (
            <div className="bg-rose-950/80 border-2 border-rose-500/80 text-rose-100 p-4 rounded-2xl text-xs space-y-3 shadow-md">
              <div className="font-bold leading-relaxed">{error}</div>
              {error.includes('appareils') && (
                <a
                  href={`https://wa.me/${db.getOwnerWhatsapp() || '213541534762'}?text=${encodeURIComponent(
                    `📱 *DEMANDE EXTENSION APPAREILS*\n\nIdentifiant : ${identifier}\nJe souhaite débloquer la connexion pour un appareil supplémentaire.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <span>🔓 Débloquer un appareil supplémentaire (+500 DZD/mois)</span>
                </a>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 block">
                {isAr ? 'رقم الهاتف (05/06/07) أو المعرّف' : 'Téléphone du commerce (05/06/07) ou Email'} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  aria-label="Ex: 0550123456"
                  type="text"
                  required
                  placeholder="Ex: 0550123456"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={{ backgroundColor: '#0b1329', color: '#ffffff' }}
                  className="w-full bg-[#0b1329] border border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 rounded-xl py-3.5 pl-11 pr-4 text-base md:text-sm text-white placeholder-slate-400 outline-none font-mono transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 block">
                {isAr ? 'كلمة مرور المدير أو رمز الصندوق (PIN)' : 'Mot de passe Gérant ou Code PIN Caissier'} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  aria-label="Mot de passe ou Code PIN"
                  type="password"
                  required
                  placeholder="•••••••• ou Code PIN 4 chiffres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ backgroundColor: '#0b1329', color: '#ffffff' }}
                  className="w-full bg-[#0b1329] border border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 rounded-xl py-3.5 pl-11 pr-4 text-base md:text-sm text-white placeholder-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl fdz-oklab-accent-bg hover:brightness-105 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
            >
              {loading ? (
                <span>{isAr ? 'جاري التحقق...' : 'Connexion en cours...'}</span>
              ) : (
                <>
                  <span>{isAr ? 'دخول إلى متجري' : 'Se connecter à mon commerce'}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-400 font-medium">
              {isAr ? 'ليس لديك حساب تاجر بعد؟' : "Vous n'avez pas encore de compte commerçant ?"}
            </p>
            <Link
              href="/register"
              className="w-full py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700/80 transition-all hover:border-emerald-500/50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isAr ? 'إنشاء حساب متجر جديد (14 يوم مجاناً)' : "Créer mon compte commerce (14 jours d'essai)"}
              </span>
            </Link>
          </div>
        </div>
      </main>
      <SupportWidget defaultRole="MERCHANT" />

      <footer className="text-center py-6 text-xs text-slate-400 flex flex-col items-center justify-center gap-2 font-medium">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Espace Commerçant Sécurisé • FidelityDZ Algérie</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <a
            href={FIDELITY_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-pink-400 hover:text-pink-300 font-semibold transition"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>{FIDELITY_INSTAGRAM_HANDLE}</span>
          </a>
          <span>•</span>
          <a
            href={FIDELITY_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Support WhatsApp</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
