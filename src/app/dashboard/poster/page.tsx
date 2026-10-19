'use client';

import React, { useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import {
  Printer,
  Download,
  QrCode,
  Sparkles,
  Smartphone,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function CounterPosterPage() {
  const { t, language } = useLanguage();
  const { currentMerchant, program } = useMerchant();
  const isAr = language === 'ar';

  const posterRef = useRef<HTMLDivElement>(null);

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${currentMerchant?.slug || 'el-bahdja'}`
    : `https://fidelitydz.com/join/${currentMerchant?.slug || 'el-bahdja'}`;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const bName = currentMerchant?.business_name || 'Commerce';

    // Header color banner
    doc.setFillColor(15, 23, 42); // #0F172A
    doc.rect(0, 0, 210, 45, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('FidelityDZ - Club Fidelite', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(bName, 105, 32, { align: 'center' });

    // Main Announcement
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.text('Rejoignez notre programme de fidelite !', 105, 60, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('Scannez ce QR Code pour ouvrir votre carte de fidelite', 105, 70, { align: 'center' });

    // QR Code note
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129); // #10B981
    doc.text(`1er tampon offert des aujourd'hui !`, 105, 160, { align: 'center' });

    // URL fallback
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Ou rendez-vous sur : ${joinUrl}`, 105, 175, { align: 'center' });

    // Step by step
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Scannez avec l\'appareil photo de votre smartphone', 25, 200);
    doc.text('2. Entrez votre numero de telephone mobile (05/06/07)', 25, 212);
    doc.text('3. Cumulez des tampons et debloquez vos recompenses !', 25, 224);

    // Save
    doc.save(`Affiche_Fidelite_${currentMerchant?.slug || 'comptoir'}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('poster_title')}
          </h2>
          <p className="text-sm text-slate-600">
            {t('poster_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            type="button"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Imprimer</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all"
            type="button"
          >
            <Download className="w-4 h-4" />
            <span>{t('download_pdf')}</span>
          </button>
        </div>
      </div>

      {/* POSTER PREVIEW CANVAS */}
      <div className="flex justify-center">
        <div
          ref={posterRef}
          className="w-full max-w-[500px] bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-4 border-slate-900 text-slate-900 text-center space-y-6 relative overflow-hidden"
        >
          {/* Top Banner */}
          <div className="bg-slate-900 -mx-8 -mt-8 sm:-mx-10 sm:-mt-10 p-6 text-white space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight">
                Fidelity<span className="text-emerald-400">DZ</span>
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-200">
              {currentMerchant?.business_name}
            </h3>
            <p className="text-xs text-slate-400">
              {currentMerchant?.wilaya}
            </p>
          </div>

          {/* Call to Action Badge */}
          <div className="space-y-2 pt-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>
                {isAr
                  ? 'الختم الأول مهداة لك فوراً !'
                  : '🎁 1er tampon offert automatiquement !'}
              </span>
            </div>

            <h4 className="text-2xl font-black text-slate-900 tracking-tight">
              {isAr ? 'انضم لبرنامج الولاء وامسح الرمز' : 'Rejoignez notre Club Fidélité'}
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              {isAr
                ? 'بدون تحميل أي تطبيق • برقم الهاتف فقط في 5 ثوانٍ'
                : 'Zéro application à télécharger • Votre numéro de téléphone suffit'}
            </p>
          </div>

          {/* Crisp Large QR Code */}
          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-200 inline-block mx-auto shadow-inner">
            <QRCodeSVG value={joinUrl} size={210} level="H" includeMargin={false} />
            <p className="mt-3 text-[11px] font-mono font-bold text-slate-500 break-all">
              {joinUrl}
            </p>
          </div>

          {/* Reward Preview */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center gap-2">
            <span>À gagner :</span>
            <span className="text-amber-800 underline font-black">
              {isAr ? program?.reward_title_ar : program?.reward_title_fr}
            </span>
          </div>

          {/* 3 Simple Instructions */}
          <div className="pt-2 border-t border-slate-100 text-left rtl:text-right space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                1
              </span>
              <span>Scannez ce QR Code avec l&apos;appareil photo de votre téléphone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                2
              </span>
              <span>Saisissez votre prénom et votre numéro de mobile (05/06/07)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                3
              </span>
              <span>Présentez votre carte en caisse à chaque visite pour recevoir vos tampons !</span>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-[10px] text-slate-400 pt-2">
            Plateforme FidelityDZ • 100% Algérie 🇩🇿
          </p>
        </div>
      </div>
    </div>
  );
}
