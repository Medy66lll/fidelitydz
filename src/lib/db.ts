// Base de données FidelityDZ v4 — Synchronisation Cloud Supabase 100% Temps Réel (PC ↔ Mobile)

import {
  PlatformSettings,
  Merchant,
  LoyaltyProgram,
  CustomerCard,
  LoyaltyTransaction,
  PersonalizedOffer,
  SubscriptionPayment,
} from './types';

export function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function toValidUuid(val?: string): string {
  const s = String(val || '').trim();
  if (UUID_REGEX.test(s)) return s.toLowerCase();
  if (!s) return generateUuid();

  let h1 = 0xdeadbeef ^ s.length;
  let h2 = 0x41c6ce57 ^ s.length;
  let h3 = 0x12345678 ^ s.length;
  let h4 = 0x87654321 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822507);
    h4 = Math.imul(h4 ^ ch, 3266489909);
  }
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  const full = hex(h1) + hex(h2) + hex(h3) + hex(h4);
  return `${full.slice(0, 8)}-${full.slice(8, 12)}-4${full.slice(13, 16)}-8${full.slice(17, 20)}-${full.slice(20, 32)}`;
}

// Paramètres de la plateforme avec coordonnées officielles du propriétaire
export const defaultPlatformSettings: PlatformSettings = {
  id: 1,
  platform_name: 'FidelityDZ',
  plan_price_dzd: 3900,
  trial_days: 14,
  owner_account_name: 'KAZI TANI MOHAMMED EL MEHDI',
  owner_rip_number: '00799999004172668994',
  owner_ccp_number: '41726689',
  owner_ccp_key: '87',
  owner_whatsapp: '213550000000',
  chargily_mode: 'test',
};

const DEMO_SLUGS = new Set(['el-bahdja', 'tassili-mode', 'optique-elmanar']);

export const initialMerchants: Merchant[] = [];
export const initialPrograms: LoyaltyProgram[] = [];
export const initialCustomerCards: CustomerCard[] = [];
export const initialOffers: PersonalizedOffer[] = [];
export const initialPayments: SubscriptionPayment[] = [];

async function postApiDb(payload: Record<string, unknown>): Promise<any> {
  if (typeof window === 'undefined') return null;
  try {
    const rawKey = localStorage.getItem('fidelitydz_custom_supabase_key');
    const rawUrl = localStorage.getItem('fidelitydz_custom_supabase_url');
    let customKey = '';
    let customUrl = '';
    if (rawKey) {
      try { customKey = JSON.parse(rawKey); } catch { customKey = rawKey; }
    }
    if (rawUrl) {
      try { customUrl = JSON.parse(rawUrl); } catch { customUrl = rawUrl; }
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (customKey && customKey.length > 15) {
      headers['x-supabase-key'] = customKey;
    }
    if (customUrl && customUrl.startsWith('http')) {
      headers['x-supabase-url'] = customUrl;
    }
    const res = await fetch('/api/db', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    return await res.json();
  } catch {
    return null;
  }
}

class FidelityDatabase {
  private getStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(`fidelitydz_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`fidelitydz_${key}`, JSON.stringify(value));
    } catch {}
  }

  getOwnerWhatsapp(): string {
    return this.getStorage('owner_whatsapp', defaultPlatformSettings.owner_whatsapp || '213550000000');
  }

  async saveOwnerWhatsapp(phone: string): Promise<void> {
    const cleaned = phone.replace(/\D/g, '');
    const formatted = cleaned.startsWith('0') ? `213${cleaned.slice(1)}` : cleaned;
    this.setStorage('owner_whatsapp', formatted);
    await postApiDb({ action: 'save_owner_whatsapp', owner_whatsapp: formatted });
  }

  getCustomSupabaseKey(): string {
    return this.getStorage('custom_supabase_key', '');
  }

  setCustomSupabaseKey(key: string): void {
    this.setStorage('custom_supabase_key', key.trim());
  }

  getCustomSupabaseUrl(): string {
    return this.getStorage('custom_supabase_url', '');
  }

  setCustomSupabaseUrl(url: string): void {
    this.setStorage('custom_supabase_url', url.trim());
  }

  clearSensitiveCache(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('fidelitydz_merchants');
      localStorage.removeItem('fidelitydz_programs');
      localStorage.removeItem('fidelitydz_customer_cards');
      localStorage.removeItem('fidelitydz_cards');
      localStorage.removeItem('fidelitydz_offers');
      localStorage.removeItem('fidelitydz_payments');
      localStorage.removeItem('fidelitydz_transactions');
    } catch {}
  }

  getLastSyncDetails(): { connected: boolean; error_details?: string; keys_configured?: boolean; supabase_url?: string } {
    return this.getStorage('last_sync_details', { connected: false });
  }

  // Synchronisation bidirectionnelle intelligente avec Supabase
  async syncFromSupabase(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const customKey = this.getCustomSupabaseKey();
      const customUrl = this.getCustomSupabaseUrl();
      const sessionMerchantId = localStorage.getItem('fidelitydz_merchant_session') || '';
      const adminAuth = sessionStorage.getItem('fidelitydz_superadmin_auth') === 'true';
      const adminExp = Number(sessionStorage.getItem('fidelitydz_superadmin_expiry') || '0');
      const isAdminActive = adminAuth && (adminExp === 0 || Date.now() < adminExp);

      const headers: Record<string, string> = {};
      if (customKey && customKey.length > 15) {
        headers['x-supabase-key'] = customKey;
      }
      if (customUrl && customUrl.startsWith('http')) {
        headers['x-supabase-url'] = customUrl;
      }
      if (sessionMerchantId) {
        headers['x-merchant-id'] = sessionMerchantId;
      }
      if (isAdminActive) {
        headers['x-admin-session'] = 'true';
      }
      const res = await fetch('/api/db?type=init', { headers, cache: 'no-store' });
      if (!res.ok) {
        this.setStorage('last_sync_details', {
          connected: false,
          error_details: 'Erreur HTTP ' + res.status + ': ' + res.statusText,
        });
        return false;
      }
      const data = await res.json();
      this.setStorage('last_sync_details', {
        connected: !!data.connected,
        error_details: data.error_details,
        keys_configured: data.keys_configured,
        supabase_url: data.supabase_url,
      });

      if (!data.connected) return false;

      if (data.owner_whatsapp) {
        this.setStorage('owner_whatsapp', data.owner_whatsapp);
      }

      const remoteMerchants: Merchant[] = Array.isArray(data.merchants) ? data.merchants : [];

      // Supabase est l'unique source de vérité absolue :
      // On remplace directement le cache local par les données réelles de Supabase.
      // Tout commerce supprimé sur Supabase est définitivement effacé du cache et ne revient JAMAIS.
      const cleanRemoteMerchants = remoteMerchants.filter((m) => !DEMO_SLUGS.has(m.slug));
      this.setStorage('merchants', cleanRemoteMerchants);

      if (Array.isArray(data.programs)) {
        this.setStorage('programs', data.programs);
      }
      if (Array.isArray(data.cards)) {
        this.setStorage('customer_cards', data.cards);
      }
      if (Array.isArray(data.offers)) {
        this.setStorage('offers', data.offers);
      }
      if (Array.isArray(data.payments)) {
        this.setStorage('payments', data.payments);
      }
      if (Array.isArray(data.transactions)) {
        this.setStorage('transactions', data.transactions);
      }

      return true;
    } catch {
      return false;
    }
  }

  // Authentification Commerçant 100% connectée à Supabase
  async loginMerchantAsync(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; merchant?: Merchant; error?: string }> {
    await this.syncFromSupabase();
    try {
      const apiRes = await postApiDb({
        action: 'login_merchant',
        identifier,
        password,
      });
      if (apiRes && apiRes.success && apiRes.merchant) {
        this.saveMerchantLocalOnly(apiRes.merchant);
        return { success: true, merchant: apiRes.merchant };
      }
      if (apiRes && apiRes.error) {
        return { success: false, error: apiRes.error };
      }
    } catch {}

    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = cleanId.replace(/\s+/g, '');
    const merchants = this.getMerchants();
    const found = merchants.find((m) => {
      const mPhone = (m.phone || '').replace(/\s+/g, '').toLowerCase();
      const mEmail = (m.email || '').trim().toLowerCase();
      const mSlug = (m.slug || '').trim().toLowerCase();
      const mName = (m.business_name || '').trim().toLowerCase();
      return mPhone === cleanPhone || mEmail === cleanId || mSlug === cleanId || mName === cleanId;
    });

    if (!found) {
      return { success: false, error: 'Aucun compte commerçant trouvé avec ce numéro ou identifiant.' };
    }

    const expectedPass = found.password || '123456';
    if (expectedPass !== password.trim()) {
      return { success: false, error: 'Mot de passe incorrect.' };
    }

    return { success: true, merchant: found };
  }

  // Récupération directe d'un commerce par son slug depuis Supabase (pour le scan QR client)
  async fetchMerchantBySlugAsync(slug: string): Promise<{ merchant: Merchant | null; program: LoyaltyProgram | null }> {
    const cleanSlug = (slug || '').toLowerCase().trim();
    try {
      const res = await fetch(`/api/db?type=merchant_by_slug&slug=${encodeURIComponent(cleanSlug)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.merchant) {
          this.saveMerchantLocalOnly(data.merchant);
          const prog = data.program || this.getProgramByMerchantId(data.merchant.id);
          this.saveProgramLocalOnly(prog);
          return { merchant: data.merchant, program: prog };
        }
      }
    } catch {}

    // Tenter une synchro complète si non trouvé du premier coup
    await this.syncFromSupabase();
    const localM = this.getMerchantBySlug(cleanSlug);
    if (localM) {
      return { merchant: localM, program: this.getProgramByMerchantId(localM.id) };
    }
    return { merchant: null, program: null };
  }

  // Récupération directe d'une carte client par son qrToken depuis Supabase
  async fetchCardByTokenAsync(token: string): Promise<{
    card: CustomerCard | null;
    merchant: Merchant | null;
    program: LoyaltyProgram | null;
    offers: PersonalizedOffer[];
  }> {
    const cleanToken = decodeURIComponent(token || '').trim();
    try {
      const res = await fetch(`/api/db?type=card_by_token&token=${encodeURIComponent(cleanToken)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.card) {
          this.saveCardLocalOnly(data.card);
          if (data.merchant) this.saveMerchantLocalOnly(data.merchant);
          if (data.program) this.saveProgramLocalOnly(data.program);
          const m = data.merchant || this.getMerchantById(data.card.merchant_id) || null;
          const p = data.program || (m ? this.getProgramByMerchantId(m.id) : null);
          const rawOffers: PersonalizedOffer[] =
            Array.isArray(data.offers) && data.offers.length > 0 ? data.offers : this.getOffersForCard(data.card);
          return {
            card: data.card,
            merchant: m,
            program: p,
            offers: rawOffers,
          };
        }
      }
    } catch {}

    const localCard = this.getCardByToken(cleanToken);
    if (localCard) {
      const m = this.getMerchantById(localCard.merchant_id) || null;
      const p = this.getProgramByMerchantId(localCard.merchant_id);
      const offers = this.getOffersForCard(localCard);
      return { card: localCard, merchant: m, program: p, offers };
    }

    return { card: null, merchant: null, program: null, offers: [] };
  }

  // Merchants
  getMerchants(): Merchant[] {
    return this.getStorage('merchants', initialMerchants);
  }

  getMerchantBySlug(slug: string): Merchant | undefined {
    const list = this.getMerchants();
    return list.find((m) => (m.slug || '').toLowerCase() === (slug || '').toLowerCase().trim());
  }

  getMerchantById(id: string): Merchant | undefined {
    const list = this.getMerchants();
    const uuid = toValidUuid(id);
    return list.find((m) => m.id === id || m.id === uuid);
  }

  private saveMerchantLocalOnly(merchant: Merchant): void {
    const list = this.getMerchants();
    const index = list.findIndex((m) => m.id === merchant.id || m.slug === merchant.slug);
    if (index >= 0) {
      list[index] = { ...list[index], ...merchant };
    } else {
      list.unshift(merchant);
    }
    this.setStorage('merchants', list);
  }

  saveMerchant(merchant: Merchant): void {
    const fixed: Merchant = { ...merchant, id: toValidUuid(merchant.id) };
    this.saveMerchantLocalOnly(fixed);
    const program = this.getProgramByMerchantId(fixed.id);
    postApiDb({ action: 'save_merchant', merchant: fixed, program });
  }

  async registerMerchantAsync(merchant: Merchant): Promise<Merchant> {
    const fixed: Merchant = {
      ...merchant,
      id: toValidUuid(merchant.id),
    };
    const program = this.getProgramByMerchantId(fixed.id);
    const res = await postApiDb({ action: 'save_merchant', merchant: fixed, program });
    const finalMerchant = res && res.success && res.merchant ? res.merchant : fixed;
    this.saveMerchantLocalOnly(finalMerchant);
    if (res && res.program) {
      this.saveProgramLocalOnly(res.program);
    }
    await this.syncFromSupabase();
    return finalMerchant;
  }

  async deleteMerchant(merchantId: string): Promise<boolean> {
    const mUuid = toValidUuid(merchantId);
    // Supprimer des données locales
    const merchants = this.getMerchants().filter((m) => m.id !== merchantId && m.id !== mUuid);
    this.setStorage('merchants', merchants);

    const programs = this.getStorage('programs', initialPrograms).filter((p: any) => p.merchant_id !== merchantId && p.merchant_id !== mUuid);
    this.setStorage('programs', programs);

    const cards = this.getStorage('customer_cards', initialCustomerCards).filter((c: any) => c.merchant_id !== merchantId && c.merchant_id !== mUuid);
    this.setStorage('customer_cards', cards);
    this.setStorage('cards', cards);

    const offers = this.getStorage('offers', initialOffers).filter((o: any) => o.merchant_id !== merchantId && o.merchant_id !== mUuid);
    this.setStorage('offers', offers);

    const payments = this.getStorage('payments', initialPayments).filter((p: any) => p.merchant_id !== merchantId && p.merchant_id !== mUuid);
    this.setStorage('payments', payments);

    // Supprimer de Supabase
    const res = await postApiDb({ action: 'delete_merchant', merchant_id: mUuid });
    await this.syncFromSupabase();
    return res?.success ?? true;
  }

  // Loyalty Program
  getProgramByMerchantId(merchantId: string): LoyaltyProgram {
    const mUuid = toValidUuid(merchantId);
    const list = this.getStorage('programs', initialPrograms);
    const found = list.find((p) => p.merchant_id === merchantId || p.merchant_id === mUuid);
    if (found) return found;

    const newProg: LoyaltyProgram = {
      id: toValidUuid(`prog-${mUuid}`),
      merchant_id: mUuid,
      program_type: 'STAMPS',
      stamps_required: 10,
      points_per_100dzd: 1,
      reward_title_fr: '10ème Offert',
      reward_title_ar: 'الهدية العاشرة مجاناً',
      welcome_bonus: 1,
      primary_color: '#10B981',
      background_color: '#0F172A',
    };
    list.push(newProg);
    this.setStorage('programs', list);
    return newProg;
  }

  private saveProgramLocalOnly(program: LoyaltyProgram): void {
    const list = this.getStorage('programs', initialPrograms);
    const index = list.findIndex((p) => p.id === program.id || p.merchant_id === program.merchant_id);
    if (index >= 0) {
      list[index] = program;
    } else {
      list.push(program);
    }
    this.setStorage('programs', list);
  }

  saveProgram(program: LoyaltyProgram): void {
    const fixed: LoyaltyProgram = {
      ...program,
      id: toValidUuid(program.id),
      merchant_id: toValidUuid(program.merchant_id),
    };
    this.saveProgramLocalOnly(fixed);
    postApiDb({ action: 'save_program', program: fixed });
  }

  // Customer Cards
  getCustomerCards(merchantId?: string): CustomerCard[] {
    const all = this.getStorage('customer_cards', initialCustomerCards);
    if (merchantId) {
      const mUuid = toValidUuid(merchantId);
      return all.filter((c) => c.merchant_id === merchantId || c.merchant_id === mUuid);
    }
    return all;
  }

  saveCardLocalOnly(card: CustomerCard): void {
    const cards = this.getCustomerCards();
    const idx = cards.findIndex((c) => c.id === card.id || c.qr_token === card.qr_token);
    if (idx >= 0) {
      cards[idx] = card;
    } else {
      cards.unshift(card);
    }
    this.setStorage('customer_cards', cards);
  }

  saveCard(card: CustomerCard, transaction?: LoyaltyTransaction): void {
    const fixed: CustomerCard = {
      ...card,
      id: toValidUuid(card.id),
      merchant_id: toValidUuid(card.merchant_id),
      program_id: toValidUuid(card.program_id),
    };
    this.saveCardLocalOnly(fixed);
    if (transaction) {
      this.addTransaction(transaction);
    }
    postApiDb({ action: 'save_card', card: fixed, transaction });
  }

  getCardByToken(token: string): CustomerCard | undefined {
    const all = this.getCustomerCards();
    const tUuid = toValidUuid(token);
    return all.find((c) => c.qr_token === token || c.id === token || c.qr_token === tUuid || c.id === tUuid);
  }

  getCardByPhone(merchantId: string, phone: string): CustomerCard | undefined {
    const cleaned = phone.replace(/\s+/g, '');
    const cards = this.getCustomerCards(merchantId);
    return cards.find((c) => c.customer_phone.replace(/\s+/g, '') === cleaned);
  }

  async getOrCreateCustomerCardAsync(
    merchantSlug: string,
    phone: string,
    name: string
  ): Promise<{ card: CustomerCard; isNew: boolean; merchant: Merchant }> {
    const cleanedPhone = phone.replace(/\s+/g, '');
    try {
      const apiRes = await postApiDb({
        action: 'get_or_create_card',
        merchantSlug,
        phone: cleanedPhone,
        name,
      });
      if (apiRes && apiRes.success && apiRes.card && apiRes.merchant) {
        this.saveMerchantLocalOnly(apiRes.merchant);
        if (apiRes.program) this.saveProgramLocalOnly(apiRes.program);
        this.saveCardLocalOnly(apiRes.card);
        return {
          card: apiRes.card,
          isNew: Boolean(apiRes.isNew),
          merchant: apiRes.merchant,
        };
      }
    } catch {}

    return this.getOrCreateCustomerCard(merchantSlug, cleanedPhone, name);
  }

  getOrCreateCustomerCard(
    merchantSlug: string,
    phone: string,
    name: string
  ): { card: CustomerCard; isNew: boolean; merchant: Merchant } {
    const merchant = this.getMerchantBySlug(merchantSlug);
    if (!merchant) {
      throw new Error(`Commerce "${merchantSlug}" introuvable.`);
    }

    const program = this.getProgramByMerchantId(merchant.id);
    const cleanedPhone = phone.replace(/\s+/g, '');
    const existing = this.getCardByPhone(merchant.id, cleanedPhone);

    if (existing) {
      return { card: existing, isNew: false, merchant };
    }

    const newCardId = generateUuid();
    const newQrToken = generateUuid();
    const newCard: CustomerCard = {
      id: newCardId,
      merchant_id: toValidUuid(merchant.id),
      program_id: toValidUuid(program.id),
      customer_phone: cleanedPhone,
      customer_name: name.trim() || 'Client Fidélité',
      qr_token: newQrToken,
      stamps_balance: program.welcome_bonus || 1,
      points_balance: program.program_type === 'POINTS' ? program.welcome_bonus || 10 : 0,
      rewards_available: 0,
      total_visits: 1,
      last_visit_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const cards = this.getCustomerCards();
    cards.unshift(newCard);
    this.setStorage('customer_cards', cards);

    const welcomeTx: LoyaltyTransaction = {
      id: generateUuid(),
      card_id: newCard.id,
      merchant_id: newCard.merchant_id,
      performed_by: 'Système (Bienvenue)',
      action_type: program.program_type === 'POINTS' ? 'ADD_POINTS' : 'ADD_STAMP',
      delta_value: program.welcome_bonus || 1,
      purchase_amount_dzd: 0,
      created_at: new Date().toISOString(),
    };
    this.addTransaction(welcomeTx);

    postApiDb({ action: 'save_card', card: newCard, transaction: welcomeTx });

    return { card: newCard, isNew: true, merchant };
  }

  // Transactions caisse
  getTransactions(merchantId?: string): LoyaltyTransaction[] {
    const list = this.getStorage('transactions', [] as LoyaltyTransaction[]);
    if (merchantId) {
      const mUuid = toValidUuid(merchantId);
      return list.filter((t) => t.merchant_id === merchantId || t.merchant_id === mUuid);
    }
    return list;
  }

  addTransaction(tx: LoyaltyTransaction): void {
    const list = this.getTransactions();
    list.unshift(tx);
    this.setStorage('transactions', list);
  }

  addStampToCard(cardId: string, count: number = 1): { card: CustomerCard; unlockedReward: boolean } {
    const cards = this.getCustomerCards();
    const card = cards.find((c) => c.id === cardId || c.qr_token === cardId);
    if (!card) throw new Error('Carte non trouvée');

    const program = this.getProgramByMerchantId(card.merchant_id);
    card.stamps_balance += count;
    card.total_visits += 1;
    card.last_visit_at = new Date().toISOString();

    let unlockedReward = false;
    if (card.stamps_balance >= program.stamps_required) {
      card.rewards_available += Math.floor(card.stamps_balance / program.stamps_required);
      card.stamps_balance = card.stamps_balance % program.stamps_required;
      unlockedReward = true;
    }

    this.setStorage('customer_cards', cards);

    const tx: LoyaltyTransaction = {
      id: generateUuid(),
      card_id: card.id,
      merchant_id: card.merchant_id,
      performed_by: 'Caissier',
      action_type: 'ADD_STAMP',
      delta_value: count,
      purchase_amount_dzd: 0,
      created_at: new Date().toISOString(),
    };
    this.addTransaction(tx);
    postApiDb({ action: 'save_card', card, transaction: tx });

    return { card, unlockedReward };
  }

  addPointsToCard(cardId: string, purchaseAmountDzd: number): { card: CustomerCard; pointsAdded: number } {
    const cards = this.getCustomerCards();
    const card = cards.find((c) => c.id === cardId || c.qr_token === cardId);
    if (!card) throw new Error('Carte non trouvée');

    const program = this.getProgramByMerchantId(card.merchant_id);
    const pointsRatio = program.points_per_100dzd || 1;
    const pointsAdded = Math.max(1, Math.floor((purchaseAmountDzd / 100) * pointsRatio));

    card.points_balance += pointsAdded;
    card.total_visits += 1;
    card.last_visit_at = new Date().toISOString();

    this.setStorage('customer_cards', cards);

    const tx: LoyaltyTransaction = {
      id: generateUuid(),
      card_id: card.id,
      merchant_id: card.merchant_id,
      performed_by: 'Caissier',
      action_type: 'ADD_POINTS',
      delta_value: pointsAdded,
      purchase_amount_dzd: purchaseAmountDzd,
      created_at: new Date().toISOString(),
    };
    this.addTransaction(tx);
    postApiDb({ action: 'save_card', card, transaction: tx });

    return { card, pointsAdded };
  }

  redeemReward(cardId: string): { card: CustomerCard; success: boolean } {
    const cards = this.getCustomerCards();
    const card = cards.find((c) => c.id === cardId || c.qr_token === cardId);
    if (!card) throw new Error('Carte non trouvée');

    if (card.rewards_available > 0) {
      card.rewards_available -= 1;
    } else {
      const program = this.getProgramByMerchantId(card.merchant_id);
      if (card.stamps_balance >= program.stamps_required) {
        card.stamps_balance -= program.stamps_required;
      }
    }

    card.last_visit_at = new Date().toISOString();
    this.setStorage('customer_cards', cards);

    const tx: LoyaltyTransaction = {
      id: generateUuid(),
      card_id: card.id,
      merchant_id: card.merchant_id,
      performed_by: 'Caissier',
      action_type: 'REDEEM_REWARD',
      delta_value: -1,
      purchase_amount_dzd: 0,
      created_at: new Date().toISOString(),
    };
    this.addTransaction(tx);
    postApiDb({ action: 'save_card', card, transaction: tx });

    return { card, success: true };
  }

  // Offres personnalisées
  getOffers(merchantId?: string): PersonalizedOffer[] {
    const all = this.getStorage('offers', initialOffers);
    if (merchantId) {
      const mUuid = toValidUuid(merchantId);
      return all.filter((o) => o.merchant_id === merchantId || o.merchant_id === mUuid);
    }
    return all;
  }

  createOffer(offer: PersonalizedOffer): void {
    const fixed: PersonalizedOffer = {
      ...offer,
      id: toValidUuid(offer.id),
      merchant_id: toValidUuid(offer.merchant_id),
    };
    const all = this.getOffers();
    all.unshift(fixed);
    this.setStorage('offers', all);
    postApiDb({ action: 'save_offer', offer: fixed });
  }

  updateOffer(offer: PersonalizedOffer): void {
    const fixed = { ...offer, id: toValidUuid(offer.id), merchant_id: toValidUuid(offer.merchant_id) };
    const all = this.getOffers();
    const idx = all.findIndex((o) => o.id === fixed.id);
    if (idx >= 0) all[idx] = fixed as PersonalizedOffer;
    else all.unshift(fixed as PersonalizedOffer);
    this.setStorage('offers', all);
    postApiDb({ action: 'save_offer', offer: fixed });
  }

  deleteOffer(offerId: string): void {
    const id = toValidUuid(offerId);
    const all = this.getOffers().filter((o) => o.id !== id);
    this.setStorage('offers', all);
    postApiDb({ action: 'delete_offer', offer_id: id });
  }

  getOffersForCard(card: CustomerCard): PersonalizedOffer[] {
    const offers = this.getOffers(card.merchant_id).filter((o) => o.is_active);
    const daysSinceLastVisit = (Date.now() - new Date(card.last_visit_at).getTime()) / (1000 * 3600 * 24);

    return offers.filter((offer) => {
      if (offer.target_segment === 'ALL') return true;
      if (offer.target_segment === 'VIP' && card.total_visits >= 5) return true;
      if (offer.target_segment === 'INACTIVE_30D' && daysSinceLastVisit >= 30) return true;
      return false;
    });
  }

  // Paiements & Abonnements
  getPayments(): SubscriptionPayment[] {
    return this.getStorage('payments', initialPayments);
  }

  async addPaymentAsync(payment: SubscriptionPayment): Promise<SubscriptionPayment> {
    const fixed: SubscriptionPayment = {
      ...payment,
      id: toValidUuid(payment.id),
      merchant_id: toValidUuid(payment.merchant_id),
    };
    const all = this.getPayments();
    all.unshift(fixed);
    this.setStorage('payments', all);
    await postApiDb({ action: 'save_payment', payment: fixed });
    await this.syncFromSupabase();
    return fixed;
  }

  addPayment(payment: SubscriptionPayment): void {
    this.addPaymentAsync(payment);
  }

  approvePayment(paymentId: string): void {
    const payments = this.getPayments();
    const p = payments.find((pay) => pay.id === paymentId);
    if (!p) return;

    p.status = 'APPROVED';
    p.reviewed_at = new Date().toISOString();
    this.setStorage('payments', payments);

    const merchant = this.getMerchantById(p.merchant_id);
    if (merchant) {
      const currentExpiry = new Date(merchant.subscription_ends_at).getTime();
      const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
      merchant.subscription_status = 'ACTIVE';
      merchant.subscription_ends_at = new Date(baseTime + 30 * 86400000).toISOString();
      this.saveMerchantLocalOnly(merchant);
      postApiDb({ action: 'update_payment_and_merchant', payment: p, merchant });
    } else {
      postApiDb({ action: 'save_payment', payment: p });
    }
  }

  rejectPayment(paymentId: string): void {
    const payments = this.getPayments();
    const p = payments.find((pay) => pay.id === paymentId);
    if (!p) return;
    p.status = 'REJECTED';
    p.reviewed_at = new Date().toISOString();
    this.setStorage('payments', payments);
    postApiDb({ action: 'save_payment', payment: p });
  }

  activateChargilySubscription(merchantId: string, checkoutId: string): void {
    const merchant = this.getMerchantById(merchantId);
    if (merchant) {
      const currentExpiry = new Date(merchant.subscription_ends_at).getTime();
      const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
      merchant.subscription_status = 'ACTIVE';
      merchant.subscription_ends_at = new Date(baseTime + 30 * 86400000).toISOString();
      this.saveMerchant(merchant);

      const newPay: SubscriptionPayment = {
        id: generateUuid(),
        merchant_id: merchant.id,
        merchant_name: merchant.business_name,
        amount_dzd: 3900,
        payment_method: 'CHARGILY_PAY',
        chargily_checkout_id: checkoutId,
        status: 'APPROVED',
        created_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString(),
      };
      this.addPayment(newPay);
    }
  }
}

export const db = new FidelityDatabase();
