'use client';

import { getPublicOrigin } from '@/lib/url';
import React, { useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useMerchant } from '@/context/MerchantContext';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import {
  Printer,
  Download,
  QrCode,
  Sparkles,
  Trophy,
  Crown,
  CheckCircle2,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';

type PosterTheme = 'DARK_LUXURY' | 'LIGHT_LUXURY';

export default function CounterPosterPage() {
  const { t, language } = useLanguage();
  const { currentMerchant, program } = useMerchant();
  const isAr = language === 'ar';

  const [theme, setTheme] = useState<PosterTheme>('DARK_LUXURY');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);

  const qrCanvasWrapRef = useRef<HTMLDivElement>(null);
  const joinUrl = `${getPublicOrigin()}/join/${currentMerchant?.slug || 'el-bahdja'}`;

  const bName = currentMerchant?.business_name || 'Votre Commerce';
  const wilaya = currentMerchant?.wilaya || '16 - Alger';
  const address = currentMerchant?.address || '';
  const rewardText = (program?.reward_title_fr || 'Un Cadeau Offert')
    .replace(/[🎁⭐🎉]/g, '')
    .trim();

  // Impression directe navigateur
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  /**
   * Générateur de Canvas A4 Haute Résolution (1240 x 1754 px)
   * Calibré au millimètre pour le format A4 à 150-300 DPI
   */
  const renderLuxuryCanvas = async (chosenTheme: PosterTheme): Promise<HTMLCanvasElement | null> => {
    const W = 1240;
    const H = 1754;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const isDark = chosenTheme === 'DARK_LUXURY';

    // 1. Fond luxueux
    if (isDark) {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#070B12');
      bgGrad.addColorStop(0.5, '#0B0F17');
      bgGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Halo d'ambiance Émeraude en haut
      const glowTop = ctx.createRadialGradient(W / 2, 250, 20, W / 2, 250, 480);
      glowTop.addColorStop(0, 'rgba(16, 185, 129, 0.16)');
      glowTop.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = glowTop;
      ctx.fillRect(0, 0, W, 700);

      // Halo d'ambiance Or chaud en bas
      const glowBottom = ctx.createRadialGradient(W / 2, 1400, 30, W / 2, 1400, 500);
      glowBottom.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
      glowBottom.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = glowBottom;
      ctx.fillRect(0, 1000, W, 754);
    } else {
      // Light Luxury (Blanc ivoire raffiné avec reflet or)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#FFFFFF');
      bgGrad.addColorStop(0.5, '#FBFBFA');
      bgGrad.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Halo or subtil
      const glowTop = ctx.createRadialGradient(W / 2, 300, 20, W / 2, 300, 500);
      glowTop.addColorStop(0, 'rgba(245, 158, 11, 0.08)');
      glowTop.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = glowTop;
      ctx.fillRect(0, 0, W, 800);
    }

    // 2. Double cadre de luxe or & ornementations
    const margin = 48;
    const innerMargin = 60;
    const goldColor = '#D4AF37';
    const goldLight = '#FCD34D';

    // Cadre extérieur or fin
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2);

    // Cadre intérieur fin
    ctx.strokeStyle = isDark ? 'rgba(16, 185, 129, 0.45)' : 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(innerMargin, innerMargin, W - innerMargin * 2, H - innerMargin * 2);

    // Ornements dorés aux 4 coins
    const cornerSize = 28;
    const drawCornerOrnament = (cx: number, cy: number, signX: number, signY: number) => {
      ctx.fillStyle = goldLight;
      ctx.fillRect(cx - 3, cy - 3, 6, 6);
      ctx.strokeStyle = goldColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + signX * cornerSize, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + signY * cornerSize);
      ctx.stroke();
    };
    drawCornerOrnament(margin, margin, 1, 1);
    drawCornerOrnament(W - margin, margin, -1, 1);
    drawCornerOrnament(margin, H - margin, 1, -1);
    drawCornerOrnament(W - margin, H - margin, -1, -1);

    // 3. En-tête de Prestige
    // Badge "VIP PRIVILÈGE"
    ctx.textAlign = 'center';
    ctx.fillStyle = isDark ? '#10B981' : '#047857';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('★   C L U B   P R I V I L È G E   &   F I D É L I T É   ★', W / 2, 115);

    // Nom du commerce
    ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
    ctx.font = '900 44px sans-serif';
    ctx.fillText(bName.toUpperCase(), W / 2, 175);

    // Localisation / Wilaya
    ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
    ctx.font = '500 18px sans-serif';
    const locText = address ? `${wilaya}  •  📍 ${address}` : wilaya;
    ctx.fillText(locText, W / 2, 208);

    // Ligne dorée de séparation sous l'en-tête
    const sepGrad = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
    sepGrad.addColorStop(0, 'rgba(212, 175, 55, 0)');
    sepGrad.addColorStop(0.5, goldColor);
    sepGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
    ctx.strokeStyle = sepGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 200, 230);
    ctx.lineTo(W / 2 + 200, 230);
    ctx.stroke();

    // 4. Cartouche d'Incentive de Bienvenue (1er Tampon Offert)
    const ribbonY = 255;
    const ribbonW = 620;
    const ribbonH = 54;
    const ribbonX = (W - ribbonW) / 2;

    ctx.fillStyle = isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)';
    ctx.beginPath();
    ctx.roundRect(ribbonX, ribbonY, ribbonW, ribbonH, 27);
    ctx.fill();

    ctx.strokeStyle = isDark ? 'rgba(16, 185, 129, 0.5)' : 'rgba(5, 150, 105, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(ribbonX, ribbonY, ribbonW, ribbonH, 27);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#34D399' : '#065F46';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('🎁   1ER TAMPON DE BIENVENUE OFFERT DÈS LE SCAN', W / 2, ribbonY + 34);

    // 5. Autel Central du QR Code (Lisibilité daylight 100% absolue)
    const qrBoxW = 660;
    const qrBoxH = 680;
    const qrBoxX = (W - qrBoxW) / 2;
    const qrBoxY = 340;

    // Ombre portée de la boîte QR
    ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(15, 23, 42, 0.08)';
    ctx.beginPath();
    ctx.roundRect(qrBoxX + 6, qrBoxY + 8, qrBoxW, qrBoxH, 36);
    ctx.fill();

    // Fond blanc pur de l'autel QR
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 36);
    ctx.fill();

    // Bordure or précieux autour de l'autel QR
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 36);
    ctx.stroke();

    // Filet intérieur émeraude fin
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(qrBoxX + 10, qrBoxY + 10, qrBoxW - 20, qrBoxH - 20, 28);
    ctx.stroke();

    // Titre d'action au-dessus du QR
    ctx.fillStyle = '#0F172A';
    ctx.font = '900 24px sans-serif';
    ctx.fillText('SCANNEZ POUR ACTIVER VOTRE CARTE', W / 2, qrBoxY + 54);

    ctx.fillStyle = '#64748B';
    ctx.font = '600 16px sans-serif';
    ctx.fillText('Pointez l’appareil photo de votre smartphone', W / 2, qrBoxY + 82);

    // Dessin du QR Code haute résolution
    const qrCanvas = qrCanvasWrapRef.current?.querySelector('canvas');
    if (qrCanvas) {
      const qrRenderSize = 440;
      const qrRenderX = (W - qrRenderSize) / 2;
      const qrRenderY = qrBoxY + 105;
      ctx.drawImage(qrCanvas, qrRenderX, qrRenderY, qrRenderSize, qrRenderSize);
    }

    // Pastille de réassurance sous le QR dans l'autel
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 17px monospace';
    ctx.fillText('05 / 06 / 07 • SANS AUCUNE APPLICATION', W / 2, qrBoxY + 580);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('✓ 100% Gratuit  •  ✓ Immédiat en 5 secondes', W / 2, qrBoxY + 610);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '13px monospace';
    ctx.fillText(joinUrl.replace('https://', ''), W / 2, qrBoxY + 642);

    // 6. Bannière Luxueuse du Cadeau / Récompense
    const rewardBoxY = 1055;
    const rewardBoxW = 760;
    const rewardBoxH = 110;
    const rewardBoxX = (W - rewardBoxW) / 2;

    // Gradient or pour la récompense
    const rewGrad = ctx.createLinearGradient(rewardBoxX, 0, rewardBoxX + rewardBoxW, 0);
    rewGrad.addColorStop(0, '#B45309');
    rewGrad.addColorStop(0.5, '#F59E0B');
    rewGrad.addColorStop(1, '#D97706');

    ctx.fillStyle = rewGrad;
    ctx.beginPath();
    ctx.roundRect(rewardBoxX, rewardBoxY, rewardBoxW, rewardBoxH, 24);
    ctx.fill();

    // Bordure or clair
    ctx.strokeStyle = '#FEF3C7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(rewardBoxX, rewardBoxY, rewardBoxW, rewardBoxH, 24);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('🏆   V O T R E   R É C O M P E N S E   F I D É L I T É', W / 2, rewardBoxY + 42);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 28px sans-serif';
    ctx.fillText(rewardText.toUpperCase(), W / 2, rewardBoxY + 82);

    // 7. Les 3 Étapes Numérotées en Bas
    const stepsY = 1220;
    const stepColW = 320;
    const stepPositions = [
      W / 2 - stepColW + 20,
      W / 2,
      W / 2 + stepColW - 20,
    ];

    const steps = [
      {
        num: '1',
        title: 'SCANNEZ LE CODE',
        desc: 'Ouvre directement votre\ncarte digitale en ligne.',
      },
      {
        num: '2',
        title: 'VOTRE NUMÉRO',
        desc: 'Saisissez votre mobile 05/06/07\npour valider votre profil.',
      },
      {
        num: '3',
        title: 'GAGNEZ DES CADEAUX',
        desc: 'Présentez votre pass en caisse\nà chacun de vos passages.',
      },
    ];

    steps.forEach((step, i) => {
      const sx = stepPositions[i];

      // Pastille numéro dorée
      ctx.fillStyle = isDark ? '#10B981' : '#059669';
      ctx.beginPath();
      ctx.arc(sx, stepsY, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = goldColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, stepsY, 26, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 22px sans-serif';
      ctx.fillText(step.num, sx, stepsY + 8);

      // Titre étape
      ctx.fillStyle = isDark ? '#F8FAFC' : '#0F172A';
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText(step.title, sx, stepsY + 54);

      // Description (2 lignes)
      ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
      ctx.font = '14px sans-serif';
      const lines = step.desc.split('\n');
      ctx.fillText(lines[0], sx, stepsY + 78);
      ctx.fillText(lines[1], sx, stepsY + 98);
    });

    // 8. Pied de Page Haute Couture & Sceau Algérie 🇩🇿
    const footerY = 1630;
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin + 60, footerY);
    ctx.lineTo(W - margin - 60, footerY);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#64748B' : '#94A3B8';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('FIDELITYDZ  •  PLATEFORME PRIVILÈGE DE FIDÉLISATION CLIENT', W / 2, footerY + 36);

    ctx.fillStyle = isDark ? '#10B981' : '#059669';
    ctx.font = '600 13px sans-serif';
    ctx.fillText('100% Algérie 🇩🇿  •  Apple Wallet & Google Pass Compatible  •  Support Commerçant Dédié', W / 2, footerY + 62);

    return canvas;
  };

  /**
   * Téléchargement du PDF A4 Haute Définition via jsPDF
   */
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const canvas = await renderLuxuryCanvas(theme);
      if (!canvas) throw new Error('Impossible de générer le rendu');

      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      doc.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      doc.save(`Affiche_Comptoir_Luxe_${currentMerchant?.slug || 'club'}_${theme.toLowerCase()}.pdf`);
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      alert('Une erreur est survenue lors de la création du PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  /**
   * Téléchargement Image HD PNG (idéal pour réseaux sociaux et tirage photo labo)
   */
  const handleDownloadPng = async () => {
    setIsGeneratingPng(true);
    try {
      const canvas = await renderLuxuryCanvas(theme);
      if (!canvas) throw new Error('Impossible de générer le rendu');

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Affiche_Comptoir_Luxe_${currentMerchant?.slug || 'club'}_${theme.toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Erreur export PNG:', err);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* High-res hidden canvas for rendering QR codes in exact vector clarity */}
      <div ref={qrCanvasWrapRef} className="hidden" aria-hidden="true">
        <QRCodeCanvas value={joinUrl} size={600} level="H" includeMargin={true} fgColor="#0F172A" />
      </div>

      {/* Page Header with Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-bold mb-1">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Édition Comptoir & Caisse Haute Définition</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Affiche Chevalet de Caisse & PDF de Luxe
          </h2>
          <p className="text-sm text-slate-600">
            Imprimez en A4 ou affichez sur votre comptoir pour que vos clients scannent et rejoignent votre club en 5 secondes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            type="button"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Imprimer</span>
          </button>
          <button
            onClick={handleDownloadPng}
            disabled={isGeneratingPng}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all disabled:opacity-50"
            type="button"
            title="Image HD 1240x1754 pour tirage photo ou Story Instagram"
          >
            <ImageIcon className="w-4 h-4 text-slate-600" />
            <span>{isGeneratingPng ? 'Génération...' : 'Image HD'}</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-5 py-2.5 fdz-oklab-accent-bg hover:brightness-105 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
            type="button"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Création PDF...' : 'Télécharger PDF A4'}</span>
          </button>
        </div>
      </div>

      {/* SELECTEUR DE THÈME LUXE (NOIR & OR vs BLANC HAUTE COUTURE) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
          <Palette className="w-4 h-4 text-emerald-600" />
          <span>Sélectionnez votre style d&apos;affiche :</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setTheme('DARK_LUXURY')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
              theme === 'DARK_LUXURY'
                ? 'bg-slate-950 text-white border-amber-400/80 shadow-md ring-2 ring-amber-400/30'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Noir & Or (Dark Luxury)</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('LIGHT_LUXURY')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
              theme === 'LIGHT_LUXURY'
                ? 'bg-amber-50 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Blanc & Or (Éco-Encre)</span>
          </button>
        </div>
      </div>

      {/* APERÇU FIDÈLE À L'ÉCRAN & ZONE D'IMPRESSION */}
      <div className="flex justify-center">
        <div
          id="counter-poster-printable"
          className={`w-full max-w-[560px] rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden transition-all duration-300 border-4 ${
            theme === 'DARK_LUXURY'
              ? 'bg-slate-950 text-white border-amber-400/70 shadow-[0_25px_60px_rgba(0,0,0,0.7)]'
              : 'bg-white text-slate-900 border-amber-400 shadow-xl'
          }`}
        >
          {/* Halos d'ambiance luxueux */}
          {theme === 'DARK_LUXURY' ? (
            <>
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
            </>
          ) : (
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          )}

          {/* Double filet or intérieur */}
          <div className="absolute inset-4 sm:inset-6 rounded-[2rem] border border-amber-400/30 pointer-events-none" />

          {/* En-tête de Prestige */}
          <div className="relative z-10 text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-400 text-[10px] font-black uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5" />
              <span>Programme Privilège & Fidélité</span>
            </div>

            {currentMerchant?.logo_url ? (
              <img
                src={currentMerchant.logo_url}
                alt={bName}
                className="w-16 h-16 rounded-2xl mx-auto object-cover border-2 border-amber-400 shadow-md bg-white"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl mx-auto fdz-oklab-accent-bg text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/30">
                {bName.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
                {bName}
              </h3>
              <p className={`text-xs mt-0.5 ${theme === 'DARK_LUXURY' ? 'text-slate-400' : 'text-slate-500'}`}>
                {wilaya}{address ? ` • 📍 ${address}` : ''}
              </p>
            </div>
          </div>

          {/* Cartouche d'Incentive 1er Tampon Offert */}
          <div className="relative z-10 mt-6">
            <div
              className={`p-3 rounded-2xl border text-center transition ${
                theme === 'DARK_LUXURY'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
              }`}
            >
              <p className="text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>1er Tampon de Bienvenue Offert dès le scan</span>
              </p>
            </div>
          </div>

          {/* Autel Central du QR Code (Lisibilité daylight 100%) */}
          <div className="relative z-10 mt-6">
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 text-slate-950 text-center shadow-2xl border-2 border-amber-400 relative">
              <div className="space-y-1 mb-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Scannez pour activer votre carte VIP
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Pointez l&apos;appareil photo de votre smartphone
                </p>
              </div>

              <div className="relative inline-block mx-auto bg-white p-3 rounded-2xl shadow-inner border border-slate-100">
                <QRCodeSVG
                  value={joinUrl}
                  size={220}
                  level="H"
                  includeMargin={false}
                  fgColor="#0F172A"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1.5 rounded-xl shadow-md border border-slate-100">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center font-black">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                <p className="font-mono text-xs font-black tracking-wider text-slate-900">
                  Numéro 05 / 06 / 07 • Sans Application
                </p>
                <p className="text-[11px] text-emerald-700 font-bold">
                  ✓ 100% Gratuit • ✓ Activé en 5 secondes
                </p>
              </div>
            </div>
          </div>

          {/* Cartouche Récompense à Débloquer */}
          <div className="relative z-10 mt-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg text-center space-y-1 border-2 border-amber-300">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-950 flex items-center justify-center gap-1.5">
                <Trophy className="w-4 h-4 text-slate-950" />
                <span>Récompense Exclusive à Gagner</span>
              </p>
              <p className="text-base font-black text-white drop-shadow-sm uppercase">
                {rewardText}
              </p>
            </div>
          </div>

          {/* Les 3 Étapes Rapides */}
          <div className="relative z-10 mt-6 pt-5 border-t border-amber-400/20 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="space-y-1">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs mx-auto flex items-center justify-center shadow-md">
                1
              </div>
              <p className="font-black text-[11px]">Scannez</p>
              <p className={`text-[10px] leading-tight ${theme === 'DARK_LUXURY' ? 'text-slate-400' : 'text-slate-500'}`}>
                Avec votre appareil photo
              </p>
            </div>

            <div className="space-y-1">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs mx-auto flex items-center justify-center shadow-md">
                2
              </div>
              <p className="font-black text-[11px]">Validez</p>
              <p className={`text-[10px] leading-tight ${theme === 'DARK_LUXURY' ? 'text-slate-400' : 'text-slate-500'}`}>
                Votre numéro mobile 05/06/07
              </p>
            </div>

            <div className="space-y-1">
              <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs mx-auto flex items-center justify-center shadow-md">
                3
              </div>
              <p className="font-black text-[11px]">Gagnez</p>
              <p className={`text-[10px] leading-tight ${theme === 'DARK_LUXURY' ? 'text-slate-400' : 'text-slate-500'}`}>
                Présentez votre pass en caisse
              </p>
            </div>
          </div>

          {/* Sceau de Garantie & Footer */}
          <div className="relative z-10 mt-6 pt-4 border-t border-slate-700/30 text-center space-y-1">
            <p className={`text-[10px] font-bold tracking-wider uppercase ${theme === 'DARK_LUXURY' ? 'text-slate-400' : 'text-slate-500'}`}>
              FidelityDZ • Système Privilège de Fidélité Digitale 🇩🇿
            </p>
            <p className="text-[9px] text-emerald-500 font-semibold">
              Compatible iPhone (Apple Wallet) & Android
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}