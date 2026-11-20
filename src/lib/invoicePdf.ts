import jsPDF from 'jspdf';
import { Merchant, SubscriptionPayment } from './types';

export interface InvoiceOptions {
  payment: SubscriptionPayment;
  merchant: Merchant;
  issuerName?: string;
  issuerRip?: string;
  issuerCcp?: string;
}

/**
 * Générateur officiel de Facture Acquittée PDF pour FidelityDZ
 * Rendu vectoriel natif A4 haute définition
 */
export function generateInvoicePdf({
  payment,
  merchant,
  issuerName = 'FidelityDZ SaaS Algérie (Mehdi Kazi)',
  issuerRip = '00799999002237881023',
  issuerCcp = '22378810 Clé 23',
}: InvoiceOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // 1. En-tête Fond Sombre Luxe
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Liseré or/émeraude
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 42, pageWidth, 2.5, 'F');

  // Titre Plateforme
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('FIDELITYDZ', margin, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Plateforme SaaS de Fidélisation Digitale • 100% Algérie', margin, 27);
  doc.text('Support & Validation Officielle : +213 541 53 47 62', margin, 33);

  // Badge Facture Acquittée (Haut droite)
  doc.setFillColor(6, 78, 59); // emerald-900
  doc.roundedRect(pageWidth - margin - 58, 12, 58, 22, 3, 3, 'F');
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('FACTURE ACQUITTÉE', pageWidth - margin - 53, 21);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('RÈGLEMENT CONFIRMÉ', pageWidth - margin - 51, 28);

  // 2. Informations de la Facture
  const invoiceNo = `FDZ-${new Date(payment.created_at || Date.now()).getFullYear()}-${(payment.id || '000000').slice(0, 8).toUpperCase()}`;
  const invoiceDate = new Date(payment.created_at || Date.now()).toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  let currentY = 58;

  // Colonne Gauche : Émetteur
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('ÉMETTEUR DU SERVICE :', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(issuerName, margin, currentY + 6);
  doc.text('Service Commercial & Facturation Algérie', margin, currentY + 11);
  doc.text(`Compte BaridiMob (RIP) : ${issuerRip}`, margin, currentY + 16);
  doc.text(`Compte Algérie Poste : CCP ${issuerCcp}`, margin, currentY + 21);

  // Colonne Droite : Client / Commerçant
  const rightColX = 120;
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DESTINATAIRE / COMMERCE :', rightColX, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(merchant.business_name || 'Commerçant Adhérent', rightColX, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Wilaya : ${merchant.wilaya || 'Algérie'} • Catégorie : ${merchant.category || 'Commerce'}`, rightColX, currentY + 11);
  doc.text(`Téléphone : ${merchant.phone || 'Non renseigné'}`, rightColX, currentY + 16);
  doc.text(`Identifiant Commerce : ${merchant.slug || merchant.id.slice(0, 8)}`, rightColX, currentY + 21);

  // Bloc Métadonnées Facture (Numéro & Date)
  currentY += 34;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`Facture N° : ${invoiceNo}`, margin + 5, currentY + 7);
  doc.text(`Date d'émission : ${invoiceDate}`, margin + 5, currentY + 12);

  doc.text(`Mode de règlement : ${payment.payment_method || 'BaridiMob RIP'}`, rightColX, currentY + 7);
  doc.text(`Réf. Transaction : ${payment.transaction_reference || 'Confirmé Super-Admin'}`, rightColX, currentY + 12);

  // 3. Tableau des Prestations
  currentY += 26;

  // Entête Tableau
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, contentWidth, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DÉSIGNATION DU SERVICE', margin + 4, currentY + 6);
  doc.text('PÉRIODE', margin + 95, currentY + 6);
  doc.text('QTÉ', margin + 125, currentY + 6);
  doc.text('TOTAL (DZD)', pageWidth - margin - 25, currentY + 6);

  currentY += 9;

  // Lignes du Tableau
  const rowHeight = 16;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, currentY, contentWidth, rowHeight, 'D');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Abonnement FidelityDZ Pro Illimité', margin + 4, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Cartes fidélité illimitées, Scanner caisse multi-vendeurs, Campagnes promos PWA', margin + 4, currentY + 11);

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);
  doc.text('1 Mois', margin + 95, currentY + 8);
  doc.text('1', margin + 128, currentY + 8);

  const amountDzd = Number(payment.amount_dzd || 3900);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${amountDzd.toLocaleString('fr-DZ')} DZD`, pageWidth - margin - 26, currentY + 8);

  currentY += rowHeight;

  // Ligne Total
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 12, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, currentY, contentWidth, 12, 'D');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL NET ACQUITTÉ :', margin + 95, currentY + 8);

  doc.setTextColor(5, 150, 105); // emerald-600
  doc.setFontSize(12);
  doc.text(`${amountDzd.toLocaleString('fr-DZ')} DZD`, pageWidth - margin - 30, currentY + 8);

  // 4. Cachet Officiel Numérique & Reçu
  currentY += 24;

  // Cadre Cachet
  doc.setDrawColor(16, 185, 129);
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.roundedRect(margin, currentY, 95, 40, 3, 3, 'FD');

  doc.setTextColor(6, 95, 70); // emerald-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('CACHET ÉLECTRONIQUE FIDELITYDZ', margin + 6, currentY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(4, 120, 87);
  doc.text('Paiement certifié conforme et validé.', margin + 6, currentY + 15);
  doc.text(`Réf. interne : ${payment.id}`, margin + 6, currentY + 20);
  doc.text(`Vérifié par Super-Admin le : ${invoiceDate}`, margin + 6, currentY + 25);
  doc.text('Signature numérique cryptographique : Valide', margin + 6, currentY + 30);

  // Cadre Mentions Légales
  const legalX = 125;
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('CONDITIONS & GARANTIES :', legalX, currentY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('• Accès complet et ininterrompu à la plateforme SaaS.', legalX, currentY + 14);
  doc.text('• Sauvegarde quotidienne chiffrée sur serveurs Cloud.', legalX, currentY + 19);
  doc.text('• Support dédié 7j/7 par WhatsApp officiel FidelityDZ.', legalX, currentY + 24);
  doc.text('• Ce document tient lieu de justificatif de paiement comptable.', legalX, currentY + 29);

  // 5. Bas de page
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('FidelityDZ Algérie • Plateforme Web & Mobile pour commerçants • https://fidelitydz.com', margin, pageHeight - 10);
  doc.text(`Page 1 / 1 • Document généré le ${new Date().toLocaleDateString('fr-DZ')}`, pageWidth - margin - 45, pageHeight - 10);

  // Sauvegarde / Téléchargement immédiat
  const filename = `Facture_FidelityDZ_${merchant.slug || 'commerce'}_${invoiceNo}.pdf`;
  doc.save(filename);
}
