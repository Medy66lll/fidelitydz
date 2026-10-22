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
  CheckCircle2,
  Gift,
  Phone
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

    const bName = currentMerchant?.business_name || 'Commerce Fidélité';
    const rewardFr = program?.reward_title_fr || '10ème Offert';

    // Header color banner
    doc.setFillColor(15, 23, 42); // #0F172A
    doc.rect(0, 0, 210, 48, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('FidelityDZ - Club Fidelite Algerie', 105, 20, { align: 'center' });
    doc.setFontSize(15);
    doc.text(bName, 105, 33, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129);
    doc.text(`${currentMerchant?.wilaya || 'Algerie'} - Carte Digitale Sans Application`, 105, 42, { align: 'center' });

    // Main Announcement
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.text('REJOIGNEZ NOTRE PROGRAMME DE FIDELITE', 105, 62, { align: 'center' });
    
    // Exact requested mention
    doc.setFontSize(11);
    doc.setTextColor(5, 150, 105);
    doc.text('Scannez le QR code et entrez votre numero 05 / 06 / 07 - sans application a installer', 105, 72, { align: 'center' });

    // Reward Box
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(25, 80, 160, 20, 3, 3, 'F');
    doc.setTextColor(180, 83, 9);
    doc.setFontSize(13);
    doc.text(`CADEAU A GAGNER : ${rewardFr}`, 105, 93, { align: 'center' });

    // Instructions Box
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text('1. Scannez le QR Code ci-dessous avec votre smartphone', 25, 185);
    doc.text('2. Entrez votre numero de mobile (05, 06 ou 07) et prenom', 25, 195);
    doc.text('3. 1er tampon offert automatiquement des votre premiere visite !', 25, 205);

    // URL fallback & WhatsApp
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Lien direct : ${joinUrl}`, 105, 230, { align: 'center' });
    doc.text(`Support WhatsApp commerces : +213 541 53 47 62`, 105, 240, { align: 'center' });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Plateforme SaaS FidelityDZ - www.fidelitydz.com', 105, 275, { align: 'center' });

    // Save
    doc.save(`Affiche_Comptoir_A4_${currentMerchant?.slug || 'fidelitydz'}.pdf`);
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
            Affiche officielle bilingue A4 prête à imprimer et à poser sur votre caisse ou comptoir.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            type="button"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Imprimer (A4)</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all"
            type="button"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger l&apos;Affiche QR de caisse (A4 PDF)</span>
          </button>
        </div>
      </div>

      {/* POSTER PREVIEW CANVAS */}
      <div className="flex justify-center print:m-0 print:p-0">
        <div
          ref={posterRef}
          className="w-full max-w-[560px] bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border-4 border-slate-900 text-slate-900 text-center space-y-5 relative overflow-hidden print:border-none print:shadow-none print:max-w-full print:w-full print:rounded-none"
        >
          {/* Top Banner with Logo */}
          <div className="bg-slate-900 -mx-8 -mt-8 sm:-mx-10 sm:-mt-10 p-6 text-white space-y-2">
            <div className="flex items-center justify-center gap-3">
              {currentMerchant?.logo_url ? (
                <img
                  src={currentMerchant.logo_url}
                  alt={currentMerchant.business_name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400 shadow-md"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                  <QrCode className="w-6 h-6" />
                </div>
              )}
              <div className="text-left rtl:text-right">
                <span className="font-extrabold text-xl tracking-tight text-white block">
                  {currentMerchant?.business_name}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  Club Fidélité • {currentMerchant?.wilaya}
                </span>
              </div>
            </div>
          </div>

          {/* Mandatory Bilingual Mention */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
            <p className="text-xs sm:text-sm font-black text-emerald-900">
              Scannez le QR code et entrez votre numéro 05 / 06 / 07 — sans application à installer
            </p>
            <p className="text-xs sm:text-sm font-arabic font-extrabold text-emerald-800" dir="rtl">
              امسح رمز QR وأدخل رقم هاتفك 05 / 06 / 07 — بدون تحميل أي تطبيق
            </p>
          </div>

          {/* Welcome Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>🎁 1er tampon offert automatiquement dès votre inscription !</span>
          </div>

          {/* Large Crisp QR Code */}
          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-200 inline-block mx-auto shadow-inner">
            <QRCodeSVG value={joinUrl} size={220} level="H" includeMargin={false} />
            <p className="mt-3 text-xs font-mono font-bold text-slate-600 break-all">
              {joinUrl}
            </p>
          </div>

          {/* Reward Offer Preview (Bilingual) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/80 border-2 border-amber-300 text-amber-950 space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 block">
              Cadeau fidélité à débloquer :
            </span>
            <p className="text-base font-black text-amber-900">
              {program?.reward_title_fr}
            </p>
            {program?.reward_title_ar && (
              <p className="text-sm font-arabic font-bold text-amber-800" dir="rtl">
                {program.reward_title_ar}
              </p>
            )}
          </div>

          {/* 3 Clear Step Instructions */}
          <div className="pt-2 border-t border-slate-100 text-left rtl:text-right space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                1
              </span>
              <span>Scannez ce QR Code avec l&apos;appareil photo de votre téléphone (iPhone / Android)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                2
              </span>
              <span>Entrez votre numéro de mobile algérien (05, 06 ou 07) et votre prénom</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs flex-shrink-0">
                3
              </span>
              <span>Cumulez des tampons à chaque passage et recevez votre récompense !</span>
            </div>
          </div>

          {/* Footer note with WhatsApp support */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>FidelityDZ • Fidélité Digitale 🇩🇿</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <Phone className="w-3 h-3" />
              <span>WhatsApp : +213 541 53 47 62</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
