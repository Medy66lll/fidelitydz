// Base de données FidelityDZ v3 avec synchronisation temps réel Supabase + Cache Local

import {
  PlatformSettings,
  Merchant,
  LoyaltyProgram,
  CustomerCard,
  LoyaltyTransaction,
  PersonalizedOffer,
  SubscriptionPayment,
} from './types';

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

// Commerces préconfigurés d'exemple en Algérie
export const initialMerchants: Merchant[] = [
  {
    id: 'm-el-bahdja',
    business_name: 'Café & Pâtisserie El Bahdja',
    slug: 'el-bahdja',
    category: 'Café & Restauration',
    wilaya: '16 - Alger (Didouche Mourad)',
    phone: '0550123456',
    email: 'contact@elbahdja.dz',
    password: '123456',
    logo_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=160&h=160&fit=crop',
    subscription_status: 'ACTIVE',
    subscription_ends_at: new Date(Date.now() + 24 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'm-tassili',
    business_name: 'Boutique Tassili Mode',
    slug: 'tassili-mode',
    category: 'Mode & Prêt-à-porter',
    wilaya: '31 - Oran (Front de Mer)',
    phone: '0770987654',
    email: 'contact@tassilimode.dz',
    password: '123456',
    logo_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=160&h=160&fit=crop',
    subscription_status: 'TRIAL',
    subscription_ends_at: new Date(Date.now() + 10 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'm-el-manar',
    business_name: 'Optique & Lunetterie El Manar',
    slug: 'optique-elmanar',
    category: 'Santé & Optique',
    wilaya: '25 - Constantine (Sidi Mabrouk)',
    phone: '0661234567',
    email: 'contact@elmanar.dz',
    password: '123456',
    logo_url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=160&h=160&fit=crop',
    subscription_status: 'ACTIVE',
    subscription_ends_at: new Date(Date.now() + 18 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

// Programmes de fidélité associés
export const initialPrograms: LoyaltyProgram[] = [
  {
    id: 'prog-el-bahdja',
    merchant_id: 'm-el-bahdja',
    program_type: 'STAMPS',
    stamps_required: 10,
    points_per_100dzd: 1,
    reward_title_fr: '10ème Café ou Pâtisserie Offert',
    reward_title_ar: 'القهوة أو الحلوى العاشرة مجاناً',
    welcome_bonus: 1,
    primary_color: '#10B981',
    background_color: '#0F172A',
  },
  {
    id: 'prog-tassili',
    merchant_id: 'm-tassili',
    program_type: 'POINTS',
    stamps_required: 10,
    points_per_100dzd: 2,
    reward_title_fr: "Bon d'achat de 1 500 DZD",
    reward_title_ar: 'قسيمة شراء بقيمة 1500 دج',
    welcome_bonus: 10,
    primary_color: '#F59E0B',
    background_color: '#0F172A',
  },
  {
    id: 'prog-el-manar',
    merchant_id: 'm-el-manar',
    program_type: 'STAMPS',
    stamps_required: 8,
    points_per_100dzd: 1,
    reward_title_fr: 'Nettoyage & Étui de lunettes offert',
    reward_title_ar: 'تنظيف مجاني وحافظة نظارات هدية',
    welcome_bonus: 1,
    primary_color: '#10B981',
    background_color: '#0F172A',
  },
];

// Cartes clients initiales
export const initialCustomerCards: CustomerCard[] = [
  {
    id: 'card-1',
    merchant_id: 'm-el-bahdja',
    program_id: 'prog-el-bahdja',
    customer_phone: '0555123456',
    customer_name: 'Amine Benaissa',
    qr_token: 'card-token-amine-555',
    stamps_balance: 7,
    points_balance: 70,
    rewards_available: 0,
    total_visits: 7,
    last_visit_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'card-2',
    merchant_id: 'm-el-bahdja',
    program_id: 'prog-el-bahdja',
    customer_phone: '0770112233',
    customer_name: 'Sara Meziani',
    qr_token: 'card-token-sara-770',
    stamps_balance: 9,
    points_balance: 90,
    rewards_available: 1,
    total_visits: 12,
    last_visit_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: 'card-3',
    merchant_id: 'm-el-bahdja',
    customer_phone: '0661998877',
    customer_name: 'Karim Bouzid',
    program_id: 'prog-el-bahdja',
    qr_token: 'card-token-karim-661',
    stamps_balance: 3,
    points_balance: 30,
    rewards_available: 0,
    total_visits: 3,
    last_visit_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

// Offres personnalisées initiales
export const initialOffers: PersonalizedOffer[] = [
  {
    id: 'off-1',
    merchant_id: 'm-el-bahdja',
    title_fr: 'Croissant au beurre offert chaque matin',
    title_ar: 'كرواسون زبدة مجاني كل صباح',
    description_fr: 'Pour tout grand café acheté entre 07h30 et 10h00.',
    description_ar: 'مع كل قهوة كبيرة تشتريها بين 07:30 و 10:00 صباحاً.',
    target_segment: 'ALL',
    valid_until: new Date(Date.now() + 15 * 86400000).toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'off-2',
    merchant_id: 'm-el-bahdja',
    title_fr: 'Statut VIP : Tampons doublés ce week-end',
    title_ar: 'ميزة VIP: مضاعفة الأختام نهاية هذا الأسبوع',
    description_fr: 'Réservé à nos clients fidèles avec plus de 5 visites.',
    description_ar: 'خاص بزبائننا الأوفياء الذين قاموا بأكثر من 5 زيارات.',
    target_segment: 'VIP',
    valid_until: new Date(Date.now() + 7 * 86400000).toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'off-3',
    merchant_id: 'm-el-bahdja',
    title_fr: 'On vous a manqué ! 2 tampons bonus',
    title_ar: 'اشتقنا إليكم ! ختَمان إضافيان هدية',
    description_fr: 'Passez nous voir cette semaine pour débloquer 2 tampons de bienvenue.',
    description_ar: 'تفضل بزيارتنا هذا الأسبوع لتحصل على ختمين ترحيبيين فوراً.',
    target_segment: 'INACTIVE_30D',
    valid_until: new Date(Date.now() + 10 * 86400000).toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// Paiements initiaux
export const initialPayments: SubscriptionPayment[] = [
  {
    id: 'pay-sample-1',
    merchant_id: 'm-el-bahdja',
    merchant_name: 'Café & Pâtisserie El Bahdja',
    amount_dzd: 3900,
    payment_method: 'BARIDIMOB',
    transaction_reference: 'BM-2026-9845120',
    receipt_url: '',
    status: 'APPROVED',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    reviewed_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

function postApiDb(payload: Record<string, unknown>) {
  if (typeof window === 'undefined') return Promise.resolve(null);
  return fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then((r) => r.json())
    .catch(() => null);
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

  // Synchronisation complète depuis Supabase vers le cache local
  async syncFromSupabase(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const res = await fetch('/api/db?type=init', { cache: 'no-store' });
      if (!res.ok) return false;
      const data = await res.json();

      if (Array.isArray(data.merchants) && data.merchants.length > 0) {
        const localMerchants = this.getMerchants();
        const mergedMap = new Map<string, Merchant>();
        localMerchants.forEach((m) => mergedMap.set(m.id, m));
        data.merchants.forEach((m: Merchant) => mergedMap.set(m.id, m));
        this.setStorage('merchants', Array.from(mergedMap.values()));
      }

      if (Array.isArray(data.programs) && data.programs.length > 0) {
        const localProgs = this.getStorage('programs', initialPrograms);
        const mergedMap = new Map<string, LoyaltyProgram>();
        localProgs.forEach((p) => mergedMap.set(p.merchant_id, p));
        data.programs.forEach((p: LoyaltyProgram) => mergedMap.set(p.merchant_id, p));
        this.setStorage('programs', Array.from(mergedMap.values()));
      }

      if (Array.isArray(data.cards) && data.cards.length > 0) {
        const localCards = this.getCustomerCards();
        const mergedMap = new Map<string, CustomerCard>();
        localCards.forEach((c) => mergedMap.set(c.id, c));
        data.cards.forEach((c: CustomerCard) => mergedMap.set(c.id, c));
        this.setStorage('customer_cards', Array.from(mergedMap.values()));
      }

      if (Array.isArray(data.offers) && data.offers.length > 0) {
        const localOffers = this.getOffers();
        const mergedMap = new Map<string, PersonalizedOffer>();
        localOffers.forEach((o) => mergedMap.set(o.id, o));
        data.offers.forEach((o: PersonalizedOffer) => mergedMap.set(o.id, o));
        this.setStorage('offers', Array.from(mergedMap.values()));
      }

      if (Array.isArray(data.payments) && data.payments.length > 0) {
        const localPayments = this.getPayments();
        const mergedMap = new Map<string, SubscriptionPayment>();
        localPayments.forEach((p) => mergedMap.set(p.id, p));
        data.payments.forEach((p: SubscriptionPayment) => mergedMap.set(p.id, p));
        this.setStorage('payments', Array.from(mergedMap.values()));
      }

      return true;
    } catch {
      return false;
    }
  }

  // Authentification Commerçant (Serveur Supabase + fallback local)
  async loginMerchantAsync(identifier: string, password: string): Promise<{ success: boolean; merchant?: Merchant; error?: string }> {
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
    } catch {}

    // Fallback recherche dans la liste synchronisée
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = cleanId.replace(/\s+/g, '');
    const merchants = this.getMerchants();
    const found = merchants.find((m) => {
      const mPhone = (m.phone || '').replace(/\s+/g, '').toLowerCase();
      const mEmail = (m.email || '').trim().toLowerCase();
      const mSlug = (m.slug || '').trim().toLowerCase();
      return mPhone === cleanPhone || mEmail === cleanId || mSlug === cleanId;
    });

    if (!found) {
      return { success: false, error: 'Aucun compte commerçant trouvé avec ce numéro ou email.' };
    }

    const expectedPass = found.password || '123456';
    if (expectedPass !== password) {
      return { success: false, error: 'Mot de passe incorrect.' };
    }

    return { success: true, merchant: found };
  }

  // Récupération directe d'un commerce par son slug depuis Supabase (pour le scan QR client sur n'importe quel téléphone)
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

    const localM = this.getMerchantBySlug(cleanSlug);
    if (localM) {
      return { merchant: localM, program: this.getProgramByMerchantId(localM.id) };
    }
    return { merchant: null, program: null };
  }

  // Récupération directe d'une carte client par son qrToken depuis Supabase (pour ne jamais bloquer sur "Chargement...")
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
            Array.isArray(data.offers) && data.offers.length > 0
              ? data.offers
              : this.getOffersForCard(data.card);
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
    return list.find((m) => m.slug.toLowerCase() === (slug || '').toLowerCase().trim());
  }

  getMerchantById(id: string): Merchant | undefined {
    const list = this.getMerchants();
    return list.find((m) => m.id === id);
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
    this.saveMerchantLocalOnly(merchant);
    const program = this.getProgramByMerchantId(merchant.id);
    postApiDb({ action: 'save_merchant', merchant, program });
  }

  async registerMerchantAsync(merchant: Merchant): Promise<Merchant> {
    this.saveMerchantLocalOnly(merchant);
    const program = this.getProgramByMerchantId(merchant.id);
    await postApiDb({ action: 'save_merchant', merchant, program });
    return merchant;
  }

  // Loyalty Program
  getProgramByMerchantId(merchantId: string): LoyaltyProgram {
    const list = this.getStorage('programs', initialPrograms);
    const found = list.find((p) => p.merchant_id === merchantId);
    if (found) return found;

    const newProg: LoyaltyProgram = {
      id: `prog-${merchantId}`,
      merchant_id: merchantId,
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
    this.saveProgramLocalOnly(program);
    postApiDb({ action: 'save_program', program });
  }

  // Customer Cards
  getCustomerCards(merchantId?: string): CustomerCard[] {
    const all = this.getStorage('customer_cards', initialCustomerCards);
    if (merchantId) {
      return all.filter((c) => c.merchant_id === merchantId);
    }
    return all;
  }

  private saveCardLocalOnly(card: CustomerCard): void {
    const cards = this.getCustomerCards();
    const idx = cards.findIndex((c) => c.id === card.id || c.qr_token === card.qr_token);
    if (idx >= 0) {
      cards[idx] = card;
    } else {
      cards.unshift(card);
    }
    this.setStorage('customer_cards', cards);
  }

  getCardByToken(token: string): CustomerCard | undefined {
    const all = this.getCustomerCards();
    return all.find((c) => c.qr_token === token || c.id === token);
  }

  getCardByPhone(merchantId: string, phone: string): CustomerCard | undefined {
    const cleaned = phone.replace(/\s+/g, '');
    const cards = this.getCustomerCards(merchantId);
    return cards.find((c) => c.customer_phone.replace(/\s+/g, '') === cleaned);
  }

  // Version asynchrone connectée à Supabase pour l'inscription client sur mobile
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

  // ZÉRO FRICTION : Trouve la carte existante ou la crée instantanément
  getOrCreateCustomerCard(merchantSlug: string, phone: string, name: string): { card: CustomerCard; isNew: boolean; merchant: Merchant } {
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

    const newCard: CustomerCard = {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      merchant_id: merchant.id,
      program_id: program.id,
      customer_phone: cleanedPhone,
      customer_name: name.trim() || 'Client Fidélité',
      qr_token: `token-${merchant.slug}-${cleanedPhone.slice(-6)}-${Date.now()}`,
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
      id: `tx-welcome-${Date.now()}`,
      card_id: newCard.id,
      merchant_id: merchant.id,
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
      return list.filter((t) => t.merchant_id === merchantId);
    }
    return list;
  }

  addTransaction(tx: LoyaltyTransaction): void {
    const list = this.getTransactions();
    list.unshift(tx);
    this.setStorage('transactions', list);
  }

  // Action caissier : Ajouter tampon
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
      id: `tx-${Date.now()}`,
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

  // Action caissier : Ajouter des points
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
      id: `tx-${Date.now()}`,
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

  // Action caissier : Valider / Réclamer récompense
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
      id: `tx-reward-${Date.now()}`,
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
      return all.filter((o) => o.merchant_id === merchantId);
    }
    return all;
  }

  createOffer(offer: PersonalizedOffer): void {
    const all = this.getOffers();
    all.unshift(offer);
    this.setStorage('offers', all);
    postApiDb({ action: 'save_offer', offer });
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

  addPayment(payment: SubscriptionPayment): void {
    const all = this.getPayments();
    all.unshift(payment);
    this.setStorage('payments', all);
    postApiDb({ action: 'save_payment', payment });
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
        id: `pay-chargily-${Date.now()}`,
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
