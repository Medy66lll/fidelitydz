'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import LanguageToggle from '@/components/LanguageToggle';
import SupportWidget from '@/components/SupportWidget';
import { db } from '@/lib/db';
import { QrCode, Lock, Phone, ArrowRight, Store, Sparkles, ShieldCheck } from 'lucide-react';

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
            : 'Identifiant ou mot de passe incorrect.')
      );
      setLoading(false);
      return;
    }

    loginMerchantSession(res.merchant);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between text-white overflow-hidden bg-slate-950">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      {/* Header */}
      <header className="border-b border-slate-800/80 px-6 py-4 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Fidelity<span className="text-emerald-400">DZ</span>
            </span>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      {/* Login Box */}
      <main className="max-w-md mx-auto w-full p-4 sm:p-6 my-auto">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Store className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isAr ? 'تسجيل دخول التاجر' : 'Connexion Espace Commerçant'}
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'أدخل رقم هاتفك وكلمة المرور للدخول إلى لوحة تحكم متجرك الخاصة'
                : 'Accès privé et sécurisé réservé uniquement à votre établissement.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-950/80 border-2 border-red-600/80 text-red-100 p-4 rounded-2xl text-xs space-y-3">
              <div className="font-bold leading-relaxed">{error}</div>
              {error.includes('appareils') && (
                <a
                  href={`https://wa.me/${db.getOwnerWhatsapp() || '213541534762'}?text=${encodeURIComponent(
                    `🚀 *DEMANDE EXTENSION APPAREILS (USERS)*\n\nIdentifiant : ${identifier}\nJe souhaite débloquer la connexion pour un appareil supplémentaire (+500 DZD/mois).`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>🔓 Débloquer un appareil supplémentaire (+500 DZD/mois)</span>
                </a>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                {isAr ? 'رقم الهاتف (05/06/07) أو المعرّف' : 'Téléphone du gérant (05/06/07) ou Email'} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ex: 0550123456"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                {isAr ? 'كلمة المرور' : 'Mot de passe'} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
            <p className="text-xs text-slate-400">
              {isAr ? 'ليس لديك حساب تاجر بعد؟' : 'Vous n\'avez pas encore de compte commerçant ?'}
            </p>
            <Link
              href="/register"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? 'إنشاء حساب متجر جديد (14 يوم مجاناً)' : 'Créer mon compte commerce (14 jours d\'essai)'}</span>
            </Link>
          </div>
        </div>
      </main>
      <SupportWidget defaultRole="MERCHANT" />

      <footer className="text-center py-4 text-xs text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Espace Commerçant Sécurisé • FidelityDZ Algérie</span>
      </footer>
    </div>
  );
}
