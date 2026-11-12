import Link from 'next/link';
import { QrCode, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-5 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto font-black text-xl">
          <QrCode className="w-7 h-7" />
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-mono font-bold">
          Erreur 404
        </span>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Cette page est introuvable
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Le lien que vous avez suivi n&apos;existe pas ou a été déplacé. Retournez à l&apos;accueil FidelityDZ ou
          connectez-vous à votre espace commerçant.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Accueil FidelityDZ</span>
          </Link>
          <Link
            href="/login"
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center transition"
          >
            Espace Commerçant
          </Link>
        </div>
      </div>
    </div>
  );
}
