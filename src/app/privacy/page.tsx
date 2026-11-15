'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l&apos;accueil</span>
        </Link>
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Politique de Confidentialité (Privacy Policy)</h1>
              <p className="text-xs text-slate-500">Protection des données personnelles — FidelityDZ Algérie (Loi 18-07)</p>
            </div>
          </div>
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Collecte minimale des données</h2>
            <p>
              FidelityDZ collecte uniquement les informations strictement nécessaires au fonctionnement du programme de fidélité : le prénom et le numéro de téléphone des clients inscrits volontairement en caisse, ainsi que les coordonnées professionnelles des commerçants partenaires.
            </p>
            <h2 className="text-base font-bold text-slate-900">2. Utilisation des cookies techniques</h2>
            <p>
              Notre plateforme utilise exclusivement des cookies de session strictement nécessaires à la sécurité et à l&apos;authentification. Aucun cookie publicitaire tiers ou de revente de données n&apos;est utilisé.
            </p>
            <h2 className="text-base font-bold text-slate-900">3. Droits d&apos;accès et de suppression</h2>
            <p>
              Conformément à la réglementation en vigueur, chaque utilisateur ou commerçant peut demander la consultation, la modification ou la suppression intégrale de ses données à tout moment via notre support officiel.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
