'use client';

import { getPublicOrigin } from '@/lib/url';

import React, { useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import {
  Printer,
  Download,
  QrCode,
  Sparkles,
} from 'lucide-react';

export default function CounterPosterPage() {
  const { t, language } = useLanguage();
  const { currentMerchant, program } = useMerchant();
  const isAr = language === 'ar';

  const posterRef = useRef<HTMLDivElement>(null);
  const qrCanvasWrapRef = useRef<HTMLDivElement>(null);

  const joinUrl = `${getPublicOrigin()}/join/${currentMerchant?.slug || 'el-bahdja'}`;

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
    const rewardText = program?.reward_title_fr || '10eme Offert';
    
    // --- Design Premium de l'Affiche PDF ---

    // 1. Fond principal (très léger gris pour le contraste)
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(0, 0, 210, 297, 'F');

    // 2. En-tête / Header (Design arrondi moderne)
    doc.setFillColor(15, 23, 42); // slate-900
    // Draw a large rounded rectangle at the top, shifted up to hide top corners
    doc.roundedRect(-10, -10, 230, 70, 8, 8, 'F'); 

    // Logo / Titre
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text(bName.toUpperCase(), 105, 28, { align: 'center' });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Programme de Fidelite Exclusif', 105, 38, { align: 'center' });
    
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(10);
    doc.text(`${currentMerchant?.wilaya || 'Algerie'} ${currentMerchant?.address ? `• ${currentMerchant.address}` : ''}`, 105, 46, { align: 'center' });

    // 3. Cadre central blanc pour le QR Code avec effet d'ombre simulée
    doc.setFillColor(226, 232, 240); // ombre légère slate-200
    doc.roundedRect(36, 76, 138, 142, 10, 10, 'F');
    doc.setFillColor(255, 255, 255); // cadre principal
    doc.roundedRect(35, 75, 138, 142, 10, 10, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Scannez pour rejoindre', 105, 95, { align: 'center' });
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Zéro application a installer', 105, 103, { align: 'center' });

    // Insertion du QR Code
    const canvasEl = qrCanvasWrapRef.current?.querySelector('canvas');
    if (canvasEl) {
      try {
        const qrDataUrl = canvasEl.toDataURL('image/png');
        doc.addImage(qrDataUrl, 'PNG', 65, 115, 80, 80);
      } catch (err) {
        console.warn('Could not embed QR canvas in PDF:', err);
      }
    }
    
    // Lien sous le QR
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(10);
    doc.text(joinUrl.replace('https://', ''), 105, 205, { align: 'center' });

    // 4. Bloc Récompense (Design coloré)
    doc.setFillColor(254, 243, 199); // amber-50
    doc.setDrawColor(252, 211, 77); // amber-300
    doc.roundedRect(25, 225, 160, 24, 6, 6, 'FD');
    
    doc.setTextColor(180, 83, 9); // amber-700
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`🎁 Recompense : ${rewardText}`, 105, 240, { align: 'center' });

    // 5. Instructions (Icônes simulées avec numéros)
    doc.setTextColor(51, 65, 85); // slate-700
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.circle(30, 260, 3, 'F');
    doc.text('Entrez simplement votre numero de mobile (05/06/07)', 38, 261);
    
    doc.circle(30, 270, 3, 'F');
    doc.text('Presentez la carte digitale en caisse pour cumuler', 38, 271);
    
    doc.circle(30, 280, 3, 'F');
    doc.text(`Le 1er tampon vous est offert automatiquement !`, 38, 281);

    // 6. Footer discret
    doc.setTextColor(203, 213, 225); // slate-300
    doc.setFontSize(8);
    doc.text('Propulse par FidelityDZ - Plateforme de Fidelite Digitale', 105, 290, { align: 'center' });

    doc.save(`Affiche_Fidelite_${currentMerchant?.slug || 'comptoir'}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hidden high-res QR Canvas for PDF export */}
      <div ref={qrCanvasWrapRef} className="hidden" aria-hidden="true">
        <QRCodeCanvas value={joinUrl} size={420} level="H" includeMargin={true} />
      </div>

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
            {currentMerchant?.logo_url ? (
              <img
                src={currentMerchant.logo_url}
                alt={currentMerchant.business_name}
                className="w-16 h-16 rounded-2xl mx-auto object-cover border-2 border-emerald-400 shadow-lg bg-white mb-2"
              />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-xl tracking-tight">
                  Fidelity<span className="text-emerald-400">DZ</span>
                </span>
              </div>
            )}
            <h3 className="text-lg font-bold text-slate-200">
              {currentMerchant?.business_name}
            </h3>
            <p className="text-xs text-slate-400">
              {currentMerchant?.wilaya}{currentMerchant?.address ? ` • 📍 ${currentMerchant.address}` : ''}
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

          {/* Crisp Large QR Code (Design Raffiné) */}
          <div className="relative inline-block mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-[2.5rem] blur opacity-20"></div>
            <div className="relative bg-white p-8 rounded-[2rem] border border-slate-100 shadow-2xl flex flex-col items-center">
              <div className="relative">
                <QRCodeSVG 
                  value={joinUrl} 
                  size={200} 
                  level="H" 
                  includeMargin={false}
                  fgColor="#0F172A" 
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                {currentMerchant?.slug}
              </p>
            </div>
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
              <span>Saisissez uniquement votre numéro de mobile (05/06/07)</span>
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
