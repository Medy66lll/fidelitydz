'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Send, HelpCircle, Store, User, Globe } from 'lucide-react';
import { db } from '@/lib/db';

interface SupportWidgetProps {
  defaultRole?: 'MERCHANT' | 'CUSTOMER' | 'VISITOR';
  merchantName?: string;
  merchantPhone?: string;
}

const TOPICS_BY_ROLE = {
  MERCHANT: [
    'Augmenter mes Quotas (Cartes / Push / Offres / Appareils)',
    'Ajouter un nouveau Point de Vente (Multi-Locaux)',
    'Validation de paiement BaridiMob / CCP',
    'Assistance technique (Scanner / Studio Carte)',
    'Autre demande commerçant',
  ],
  CUSTOMER: [
    'Je ne retrouve pas ma carte de fidélité',
    'Mes tampons ou points ne se sont pas affichés',
    'Problème avec une récompense ou offre en magasin',
    'Autre question client',
  ],
  VISITOR: [
    'Demander une démonstration pour mon commerce',
    'Questions sur l\'offre à 3 900 DZD/mois et l\'essai 14j',
    'Offre Multi-Locaux / Franchise',
    'Autre renseignement',
  ],
};

export default function SupportWidget({
  defaultRole = 'VISITOR',
  merchantName = '',
  merchantPhone = '',
}: SupportWidgetProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<'MERCHANT' | 'CUSTOMER' | 'VISITOR'>(defaultRole);
  const [topic, setTopic] = useState(TOPICS_BY_ROLE[defaultRole][0]);
  const [senderName, setSenderName] = useState(merchantName);
  const [senderPhone, setSenderPhone] = useState(merchantPhone);
  const [details, setDetails] = useState('');

  const handleRoleChange = (newRole: 'MERCHANT' | 'CUSTOMER' | 'VISITOR') => {
    setRole(newRole);
    setTopic(TOPICS_BY_ROLE[newRole][0]);
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const ownerWa = db.getOwnerWhatsapp() || '213541534762';
    const roleLabel =
      role === 'MERCHANT' ? '🏪 COMMERÇANT' : role === 'CUSTOMER' ? '📱 CLIENT CARTE' : '🌐 VISITEUR SITE';
    const text = `🆘 *SUPPORT FIDELITYDZ FILTRÉ*\n\n👤 *Profil :* ${roleLabel}\n📌 *Sujet :* ${topic}\n🏷️ *Nom / Commerce :* ${senderName || 'Non précisé'}\n📞 *Téléphone :* ${senderPhone || 'Non précisé'}\n\n💬 *Message :*\n${details || 'Bonjour, j\'ai besoin d\'assistance concernant ce sujet.'}`;
    window.open(`https://wa.me/${ownerWa}?text=${encodeURIComponent(text)}`, '_blank');
    setOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="bg-white text-slate-900 rounded-3xl w-[340px] sm:w-[380px] shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm">Support & Assistance 7j/7</h3>
                <p className="text-[11px] text-emerald-400">Réponse rapide par message filtré</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSendWhatsApp} className="p-4 space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">1. Vous êtes :</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRoleChange('MERCHANT')}
                  className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition ${
                    role === 'MERCHANT'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Commerçant</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('CUSTOMER')}
                  className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition ${
                    role === 'CUSTOMER'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Client Carte</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('VISITOR')}
                  className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center gap-1 border transition ${
                    role === 'VISITOR'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Visiteur</span>
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">2. Sujet de votre demande :</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-500"
              >
                {TOPICS_BY_ROLE[role].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom / Enseigne *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Café El Bahdja"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Téléphone *</label>
                <input
                  type="tel"
                  required
                  placeholder="05 / 06 / 07..."
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 font-mono outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Détails (optionnel) :</label>
              <textarea
                rows={2}
                placeholder="Expliquez brièvement votre besoin..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>Envoyer au Support FidelityDZ</span>
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-2xl shadow-emerald-600/30 transition-all hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Support & Aide</span>
        </button>
      )}
    </div>
  );
}
