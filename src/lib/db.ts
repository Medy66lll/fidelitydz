// Base de données FidelityDZ v4 — Synchronisation Cloud Supabase 100% Temps Réel (PC ↔ Mobile) + Mode Caisse Hors-Ligne (Offline Sync)

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

// Normalisation stricte des numéros de téléphone algériens (05 / 06 / 07 sur 10 chiffres)
export function normalizeDzPhone(raw: string): string {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('00213') && digits.length >= 14) {
    digits = '0' + digits.slice(5);
  } else if (digits.startsWith('213') && digits.length === 12) {
    digits = '0' + digits.slice(3);
  } else if (digits.length === 9 && /^[567]/.test(digits)) {
    digits = '0' + digits;
  }
  return digits.slice(0, 10);
}

export const defaultPlatformSettings: PlatformSettings = {
  id: 1,
  platform_name: 'FidelityDZ',
  plan_price_dzd: 3900,
  trial_days: 14,
  owner_account_name: 'KAZI TANI MOHAMMED EL MEHDI',
  owner_rip_number: '00799999004172668994',
  owner_ccp_number: '41726689',
  owner_ccp_key: '87',
  owner_whatsapp: '213541534762',
  chargily_mode: 'test',
};

const DEMO_SLUGS = new Set(['el-bahdja', 'tassili-mode', 'optique-elmanar']);

export const initialMerchants: Merchant[] = [];
export const initialPrograms: LoyaltyProgram[] = [];
export const initialCustomerCards: CustomerCard[] = [];
export const initialOffers: PersonalizedOffer[] = [];
export const initialPayments: SubscriptionPayment[] = [];

const OFFLINE_QUEUE_KEY = 'fidelitydz_offline_queue';

function enqueueOfflineAction(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    const list: { id: string; payload: Record<string, unknown>; createdAt: string }[] = raw
      ? JSON.parse(raw)
      : [];
    list.push({
      id: generateUuid(),
      payload,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(list));
  } catch {}
}

async function postApiDb(payload: Record<string, unknown>, skipQueueOnFail = false): Promise<any> {
  if (typeof window === 'undefined') return null;
  try {
    const rawKey = localStorage.getItem('fidelitydz_custom_supabase_key');
    const rawUrl = localStorage.getItem('fidelitydz_custom_supabase_url');
    const ownerHmacToken = sessionStorage.getItem('fidelitydz_owner_hmac') || '';
    let customKey = '';
    let customUrl = '';
    if (rawKey) {
      try {
        customKey = JSON.parse(rawKey);
      } catch {
        customKey = rawKey;
      }
    }
    if (rawUrl) {
      try {
        customUrl = JSON.parse(rawUrl);
      } catch {
        customUrl = rawUrl;
      }
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (customKey && customKey.length > 15) {
      headers['x-supabase-key'] = customKey;
    }
    if (customUrl && customUrl.startsWith('http')) {
      headers['x-supabase-url'] = customUrl;
    }
    if (ownerHmacToken) {
      headers['x-admin-token'] = ownerHmacToken;
    }
    const res = await fetch('/api/db', {
      method: 'POST',
      headers,
      body: JSON.stringify(ownerHmacToken ? { ...payload, admin_token: ownerHmacToken } : payload),
      cache: 'no-store',
    });
    if (!res.ok && res.status >= 500 && !skipQueueOnFail && payload.action === 'save_card') {
      enqueueOfflineAction(payload);
      return null;
    }
    return await res.json();
  } catch {
    if (!skipQueueOnFail && payload.action === 'save_card') {
      enqueueOfflineAction(payload);
    }
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

  getDeviceId(): string {
    if (typeof window === 'undefined') return '';
    let did = localStorage.getItem('fidelitydz_device_id');
    if (!did) {
      did = 'dev_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('fidelitydz_device_id', did);
    }
    return did;
  }

  getSessionRole(): 'MANAGER' | 'CASHIER' {
    if (typeof window === 'undefined') return 'MANAGER';
    const r = localStorage.getItem('fidelitydz_session_role');
    return r === 'CASHIER' ? 'CASHIER' : 'MANAGER';
  }

  setSessionRole(role: 'MANAGER' | 'CASHIER'): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('fidelitydz_session_role', role);
  }

  async verifyManagerPasswordAsync(merchantId: string, passwordInput: string): Promise<boolean> {
    const res = await postApiDb(
      {
        action: 'verify_manager_password',
        merchant_id: merchantId,
        password: passwordInput,
      },
      true
    );
    if (res && res.success) {
      this.setSessionRole('MANAGER');
      return true;
    }
    return false;
  }

  getOfflineQueueCount(): number {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.length : 0;
    } catch {
      return 0;
    }
  }

  async flushOfflineQueue(): Promise<{ synced: number; remaining: number }> {
    if (typeof window === 'undefined') return { synced: 0, remaining: 0 };
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return { synced: 0, remaining: this.getOfflineQueueCount() };
    }
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      const list: { id: string; payload: Record<string, unknown>; createdAt: string }[] = raw
        ? JSON.parse(raw)
        : [];
      if (!Array.isArray(list) || list.length === 0) {
        return { synced: 0, remaining: 0 };
      }

      const remainingList: typeof list = [];
      let syncedCount = 0;

      for (const item of list) {
        const res = await postApiDb(item.payload, true);
        if (res && res.success) {
          syncedCount += 1;
        } else {
          remainingList.push(item);
        }
      }

      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingList));
      return { synced: syncedCount, remaining: remainingList.length };
    } catch {
      return { synced: 0, remaining: this.getOfflineQueueCount() };
    }
  }

  getOwnerWhatsapp(): string {
    return this.getStorage('owner_whatsapp', defaultPlatformSettings.owner_whatsapp || '213541534762');
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
      localStorage.removeItem('fidelitydz_session_role');
    } catch {}
  }

  getLastSyncDetails(): {
    connected: boolean;
    error_details?: string;
    keys_configured?: boolean;
    supabase_url?: string;
    device_unauthorized?: boolean;
  } {
    return this.getStorage('last_sync_details', { connected: false });
  }

  async syncFromSupabase(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      if (this.getOfflineQueueCount() > 0) {
        await this.flushOfflineQueue();
      }

      const customKey = this.getCustomSupabaseKey();
      const customUrl = this.getCustomSupabaseUrl();
      const activeStoreId = localStorage.getItem('fidelitydz_current_store_id') || '';
      const deviceId = this.getDeviceId();
      const ownerViewMode = sessionStorage.getItem('fidelitydz_ui_owner_mode') === 'true';
      const ownerViewTtl = Number(sessionStorage.getItem('fidelitydz_ui_owner_ttl') || '0');
      const ownerHmacToken = sessionStorage.getItem('fidelitydz_owner_hmac') || '';
      const isOwnerView =
        ownerViewMode && Boolean(ownerHmacToken) && (ownerViewTtl === 0 || Date.now() < ownerViewTtl);

      const headers: Record<string, string> = {};
      if (customKey && customKey.length > 15) {
        headers['x-supabase-key'] = customKey;
      }
      if (customUrl && customUrl.startsWith('http')) {
        headers['x-supabase-url'] = customUrl;
      }
      if (activeStoreId) {
        headers['x-merchant-id'] = activeStoreId;
      }
      if (deviceId) {
        headers['x-device-id'] = deviceId;
      }
      if (isOwnerView && ownerHmacToken) {
        headers['x-admin-token'] = ownerHmacToken;
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
        device_unauthorized: Boolean(data.device_unauthorized),
      });

      if (data.device_unauthorized) {
        return false;
      }

      if (!data.connected) return false;

      if (data.owner_whatsapp) {
        this.setStorage('owner_whatsapp', data.owner_whatsapp);
      }

      const remoteMerchants: Merchant[] = Array.isArray(data.merchants) ? data.merchants : [];
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

  async loginMerchantAsync(
    identifier: string,
    password: string,
    deviceId?: string
  ): Promise<{
    success: boolean;
    merchant?: Merchant;
    role?: 'MANAGER' | 'CASHIER';
    error?: string;
    quota_users_exceeded?: boolean;
    max_users?: number;
  }> {
    const effectiveDeviceId = deviceId || this.getDeviceId();
    const apiRes = await postApiDb({
      action: 'login_merchant',
      identifier,
      password,
      device_id: effectiveDeviceId,
    });

    if (apiRes) {
      if (apiRes.success && apiRes.merchant) {
        const loginRole: 'MANAGER' | 'CASHIER' = apiRes.role === 'CASHIER' ? 'CASHIER' : 'MANAGER';
        this.setSessionRole(loginRole);
        this.saveMerchantLocalOnly(apiRes.merchant);
        if (typeof window !== 'undefined') {
          localStorage.setItem('fidelitydz_current_store_id', apiRes.merchant.id);
        }
        await this.syncFromSupabase();
        return { success: true, merchant: apiRes.merchant, role: loginRole };
      }
      return {
        success: false,
        error: apiRes.error || 'Connexion refusée.',
        quota_users_exceeded: Boolean(apiRes.quota_users_exceeded),
        max_users: apiRes.max_users,
      };
    }

    return {
      success: false,
      error: 'Impossible de vérifier votre session. Vérifiez votre connexion Internet.',
    };
  }

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

    await this.syncFromSupabase();
    const localM = this.getMerchantBySlug(cleanSlug);
    if (localM) {
      return { merchant: localM, program: this.getProgramByMerchantId(localM.id) };
    }
    return { merchant: null, program: null };
  }

  async fetchCardByTokenAsync(token: string): Promise<{
    card: CustomerCard | null;
    merchant: Merchant | null;
    program: LoyaltyProgram | null;
    offers: PersonalizedOffer[];
  }> {
    const cleanToken = decodeURIComponent(token || '').trim();
    try {
      const res = await fetch(`/api/db?type=card_by_token&token=${encodeURIComponent(cleanToken)}&_t=${Date.now()}`, {
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

  async logoutMerchantAsync(
    merchantId: string,
    deviceId: string,
    options?: { resetAllDevices?: boolean; keepCurrentDevice?: boolean }
  ): Promise<void> {
    await postApiDb({
      action: 'logout_merchant',
      merchant_id: merchantId,
      device_id: deviceId,
      reset_all_devices: options?.resetAllDevices,
      keep_current_device: options?.keepCurrentDevice,
    });
  }

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

  isMerchantExpired(merchant?: Merchant | null): boolean {
    if (!merchant) return false;
    if (merchant.subscription_status === 'EXPIRED') return true;
    if (merchant.subscription_ends_at && new Date(merchant.subscription_ends_at).getTime() < Date.now()) {
      return true;
    }
    return false;
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
    const merchants = this.getMerchants().filter((m) => m.id !== merchantId && m.id !== mUuid);
    this.setStorage('merchants', merchants);

    const programs = this.getStorage('programs', initialPrograms).filter(
      (p: any) => p.merchant_id !== merchantId && p.merchant_id !== mUuid
    );
    this.setStorage('programs', programs);

    const cards = this.getStorage('customer_cards', initialCustomerCards).filter(
      (c: any) => c.merchant_id !== merchantId && c.merchant_id !== mUuid
    );
    this.setStorage('customer_cards', cards);
    this.setStorage('cards', cards);

    const offers = this.getStorage('offers', initialOffers).filter(
      (o: any) => o.merchant_id !== merchantId && o.merchant_id !== mUuid
    );
    this.setStorage('offers', offers);

    const payments = this.getStorage('payments', initialPayments).filter(
      (p: any) => p.merchant_id !== merchantId && p.merchant_id !== mUuid
    );
    this.setStorage('payments', payments);

    const res = await postApiDb({ action: 'delete_merchant', merchant_id: mUuid });
    await this.syncFromSupabase();
    return res?.success ?? true;
  }

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

  getCustomerCards(merchantId?: string): CustomerCard[] {
    const all = this.getStorage('customer_cards', initialCustomerCards);
    if (merchantId) {
      const mUuid = toValidUuid(merchantId);
      const filtered = all.filter((c) => c.merchant_id === merchantId || c.merchant_id === mUuid);
      const seenPhones = new Set<string>();
      const uniqueCards: CustomerCard[] = [];
      for (const c of filtered) {
        const norm = normalizeDzPhone(c.customer_phone) || c.customer_phone;
        if (!seenPhones.has(norm)) {
          seenPhones.add(norm);
          uniqueCards.push({ ...c, customer_phone: norm });
        }
      }
      const merchant = this.getMerchantById(mUuid);
      const maxCards = Number(merchant?.max_cards || 100);
      const subExpired = this.isMerchantExpired(merchant);
      const sortedByCreation = [...uniqueCards].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const blockedIds = new Set(sortedByCreation.slice(maxCards).map((c) => c.id));
      return uniqueCards.map((c) => ({
        ...c,
        is_blocked_by_quota: blockedIds.has(c.id),
        is_pending_merchant_subscription: subExpired,
      }));
    }
    return all;
  }

  saveCardLocalOnly(card: CustomerCard): void {
    const cards = this.getStorage('customer_cards', initialCustomerCards);
    const normPhone = normalizeDzPhone(card.customer_phone) || card.customer_phone;
    const normalizedCard = { ...card, customer_phone: normPhone };
    const idx = cards.findIndex(
      (c) =>
        c.id === card.id ||
        c.qr_token === card.qr_token ||
        (c.merchant_id === card.merchant_id && normalizeDzPhone(c.customer_phone) === normPhone)
    );
    if (idx >= 0) {
      cards[idx] = { ...cards[idx], ...normalizedCard };
    } else {
      cards.unshift(normalizedCard);
    }
    this.setStorage('customer_cards', cards);
  }

  saveCard(card: CustomerCard, transaction?: LoyaltyTransaction): void {
    const normPhone = normalizeDzPhone(card.customer_phone) || card.customer_phone;
    const fixed: CustomerCard = {
      ...card,
      id: toValidUuid(card.id),
      merchant_id: toValidUuid(card.merchant_id),
      program_id: toValidUuid(card.program_id),
      customer_phone: normPhone,
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
    const cleaned = normalizeDzPhone(phone);
    if (!cleaned) return undefined;
    const cards = this.getCustomerCards(merchantId);
    return cards.find((c) => normalizeDzPhone(c.customer_phone) === cleaned);
  }

  async getOrCreateCustomerCardAsync(
    merchantSlug: string,
    phone: string,
    name: string
  ): Promise<{ card: CustomerCard; isNew: boolean; merchant: Merchant }> {
    const cleanedPhone = normalizeDzPhone(phone);
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
    const cleanedPhone = normalizeDzPhone(phone);
    const existing = this.getCardByPhone(merchant.id, cleanedPhone);

    if (existing) {
      return { card: existing, isNew: false, merchant };
    }

    const mUuid = toValidUuid(merchant.id);
    const subExpired = this.isMerchantExpired(merchant);
    const newCardId = toValidUuid(`card-${mUuid}-${cleanedPhone}`);
    const newQrToken = toValidUuid(`qr-${mUuid}-${cleanedPhone}`);
    const newCard: CustomerCard = {
      id: newCardId,
      merchant_id: mUuid,
      program_id: toValidUuid(program.id),
      customer_phone: cleanedPhone,
      customer_name: name.trim() || 'Client Fidélité',
      qr_token: newQrToken,
      stamps_balance: program.welcome_bonus || 1,
      points_balance: program.program_type === 'POINTS' ? program.welcome_bonus || 10 : 0,
      rewards_available: 0,
      total_visits: 1,
      last_visit_at: new Date().toISOString(),
      is_pending_merchant_subscription: subExpired,
      pending_stamps: subExpired && program.program_type !== 'POINTS' ? program.welcome_bonus || 1 : 0,
      pending_points: subExpired && program.program_type === 'POINTS' ? program.welcome_bonus || 10 : 0,
      created_at: new Date().toISOString(),
    };

    this.saveCardLocalOnly(newCard);

    const welcomeTx: LoyaltyTransaction = {
      id: toValidUuid(`tx-welcome-${newCardId}`),
      card_id: newCard.id,
      merchant_id: newCard.merchant_id,
      performed_by: subExpired ? 'Système (En attente abonnement)' : 'Système (Bienvenue)',
      action_type: program.program_type === 'POINTS' ? 'ADD_POINTS' : 'ADD_STAMP',
      delta_value: program.welcome_bonus || 1,
      purchase_amount_dzd: 0,
      created_at: new Date().toISOString(),
    };
    this.addTransaction(welcomeTx);

    postApiDb({ action: 'save_card', card: newCard, transaction: welcomeTx });

    return { card: newCard, isNew: true, merchant };
  }

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

  checkScanCooldown(card: CustomerCard, merchant?: Merchant | null): { blocked: boolean; remainingMinutes: number; cooldownMinutes: number } {
    const cooldownMinutes = Number(merchant?.scan_cooldown_minutes ?? 15);
    if (cooldownMinutes <= 0) {
      return { blocked: false, remainingMinutes: 0, cooldownMinutes: 0 };
    }
    const txs = this.getTransactions(card.merchant_id).filter(
      (t) =>
        t.card_id === card.id &&
        (t.action_type === 'ADD_STAMP' || t.action_type === 'ADD_POINTS') &&
        !String(t.performed_by || '').includes('Bienvenue') &&
        !String(t.performed_by || '').includes('Google')
    );
    if (txs.length === 0) {
      return { blocked: false, remainingMinutes: 0, cooldownMinutes };
    }
    const latestScanMs = Math.max(...txs.map((t) => new Date(t.created_at).getTime()));
    const elapsedMs = Date.now() - latestScanMs;
    const cooldownMs = cooldownMinutes * 60 * 1000;
    if (elapsedMs < cooldownMs) {
      const remainingMinutes = Math.max(1, Math.ceil((cooldownMs - elapsedMs) / 60000));
      return { blocked: true, remainingMinutes, cooldownMinutes };
    }
    return { blocked: false, remainingMinutes: 0, cooldownMinutes };
  }

  addStampToCard(
    cardId: string,
    count: number = 1,
    options?: { bypassCooldown?: boolean }
  ): { card: CustomerCard; unlockedReward: boolean; isPendingSubscription: boolean } {
    const cards = this.getStorage('customer_cards', initialCustomerCards);
    const card = cards.find((c) => c.id === cardId || c.qr_token === cardId);
    if (!card) throw new Error('Carte non trouvée');

    const merchant = this.getMerchantById(card.merchant_id);

    if (!options?.bypassCooldown) {
      const cd = this.checkScanCooldown(card, merchant);
      if (cd.blocked) {
        const err: any = new Error(
          `🛡️ Protection Anti-Fraude Caisse : Ce client a déjà été scanné il y a moins de ${cd.cooldownMinutes} min. Veuillez patienter encore ${cd.remainingMinutes} min (ou déverrouillez avec le code Gérant).`
        );
        err.cooldown_blocked = true;
        throw err;
      }
    }

    const isPendingSub = this.isMerchantExpired(merchant);
    const program = this.getProgramByMerchantId(card.merchant_id);

    card.stamps_balance += count;
    card.total_visits += 1;
    card.last_visit_at = new Date().toISOString();
    if (isPendingSub) {
      card.is_pending_merchant_subscription = true;
      card.pending_stamps = Number(card.pending_stamps || 0) + count;
    }

    let unlockedReward = false;
    if (!isPendingSub && card.stamps_balance >= program.stamps_required) {
      card.rewards_available += Math.floor(card.stamps_balance / program.stamps_required);
      card.stamps_balance = card.stamps_balance % program.stamps_required;
      unlockedReward = true;
    }

    this.setStorage('customer_cards', cards);

    const tx: LoyaltyTransaction = {
      id: generateUuid(),
      card_id: card.id,
      merchant_id: card.merchant_id,
      performed_by: isPendingSub ? 'Caissier (En attente abonnement)' : 'Caissier',
      action_type: 'ADD_STAMP',
      delta_value: count,
      purchase_amount_dzd: 0,
      created_at: new Date().toISOString(),
    };
    this.addTransaction(tx);
    postApiDb({ action: 'save_card', card, transaction: tx });

    return { card, unlockedReward, isPendingSubscription: isPendingSub };
  }

  addPointsToCard(
    cardId: string,
    purchaseAmountDzd: number,
    options?: { bypassCooldown?: boolean }
  ): { card: CustomerCard; pointsAdded: number; isPendingSubscription: boolean } {
    const cards = this.getStorage('customer_cards', initialCustomerCards);
    const card = cards.find((c) => c.id === cardId || c.qr_token === cardId);
    if (!card) throw new Error('Carte non trouvée');

    const merchant = this.getMerchantById(card.merchant_id);

    if (!options?.bypassCooldown) {
      const cd = this.checkScanCooldown(card, merchant);
      if (cd.blocked) {
        const err: any = new Error(
          `🛡️ Protection Anti-Fraude Caisse : Ce client a déjà été scanné il y a moins de ${cd.cooldownMinutes} min. Veuillez patienter encore ${cd.remainingMinutes} min (ou déverrouillez avec le code Gérant).`
        );
        err.cooldown_blocked = true;
        throw err;
      }
    }

    const isPendingSub = this.isMerchantExpired(merchant);
    const program = this.getProgramByMerchantId(card.merchant_id);
    const pointsRatio = program.points_per_100dzd || 1;
    const pointsAdded = Math.max(1, Math.floor((purchaseAmountDzd / 100) * pointsRatio));

    card.points_balance += pointsAdded;
    card.total_visits += 1;
    card.last_visit_at = new Date().toISOString();
    if (isPendingSub) {
      card.is_pending_merchant_subscription = true;
      card.pending_points = Number(card.pending_points || 0) + pointsAdded;
    }

    this.setStorage('customer_cards', cards);

    const tx: LoyaltyTransaction = {
      id: generateUuid(),
      card_id: card.id,
      merchant_id: card.merchant_id,
      performed_by: isPendingSub ? 'Caissier (En attente abonnement)' : 'Caissier',
      action_type: 'ADD_POINTS',
      delta_value: pointsAdded,
      purchase_amount_dzd: purchaseAmountDzd,
      created_at: new Date().toISOString(),
    };
    this.addTransaction(tx);
    postApiDb({ action: 'save_card', card, transaction: tx });

    return { card, pointsAdded, isPendingSubscription: isPendingSub };
  }

  redeemReward(cardId: string): { card: CustomerCard; success: boolean } {
    const cards = this.getStorage('customer_cards', initialCustomerCards);
    const card = cards.find((c) => c.id === cardId || c.qr_token === cardId);
    if (!card) throw new Error('Carte non trouvée');

    const merchant = this.getMerchantById(card.merchant_id);
    if (this.isMerchantExpired(merchant)) {
      throw new Error(
        "Impossible de remettre une récompense tant que l'abonnement du commerce est expiré. Renouvelez votre abonnement dans Abonnement & Paiement."
      );
    }

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

  getOffers(merchantId?: string): PersonalizedOffer[] {
    const all = this.getStorage('offers', initialOffers);
    if (merchantId) {
      const mUuid = toValidUuid(merchantId);
      return all.filter((o) => o.merchant_id === merchantId || o.merchant_id === mUuid);
    }
    return all;
  }

  async createOfferAsync(offer: PersonalizedOffer): Promise<{ success: boolean; error?: string }> {
    const fixed: PersonalizedOffer = {
      ...offer,
      id: toValidUuid(offer.id),
      merchant_id: toValidUuid(offer.merchant_id),
      updated_at: offer.updated_at || new Date().toISOString(),
    };
    const res = await postApiDb({ action: 'save_offer', offer: fixed, is_edit: false });
    if (res && res.success) {
      const all = this.getOffers();
      all.unshift(fixed);
      this.setStorage('offers', all);
      return { success: true };
    }
    return { success: false, error: res?.error || 'Erreur lors de la sauvegarde.' };
  }

  async updateOfferAsync(offer: PersonalizedOffer): Promise<{ success: boolean; error?: string }> {
    const fixed: PersonalizedOffer = {
      ...offer,
      id: toValidUuid(offer.id),
      merchant_id: toValidUuid(offer.merchant_id),
      updated_at: offer.updated_at || new Date().toISOString(),
    };
    const res = await postApiDb({ action: 'save_offer', offer: fixed, is_edit: true });
    if (res && res.success) {
      const all = this.getOffers();
      const idx = all.findIndex((o) => o.id === fixed.id);
      if (idx >= 0) all[idx] = fixed;
      else all.unshift(fixed);
      this.setStorage('offers', all);
      return { success: true };
    }
    return { success: false, error: res?.error || 'Erreur lors de la mise à jour.' };
  }

  createOffer(offer: PersonalizedOffer): void {
    this.createOfferAsync(offer);
  }

  updateOffer(offer: PersonalizedOffer): void {
    this.updateOfferAsync(offer);
  }

  deleteOffer(offerId: string): void {
    const id = toValidUuid(offerId);
    const all = this.getOffers().filter((o) => o.id !== offerId && o.id !== id);
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
