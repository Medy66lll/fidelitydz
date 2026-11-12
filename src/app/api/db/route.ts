import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { sanitizeString } from '@/lib/validation';

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aiaobpbouxzlfrfhludn.supabase.co')
  .replace(/^["'\s]+|["'\s]+$/g, '')
  .replace(/\/+$/, '');

const SUPABASE_URL = rawUrl.startsWith('http') ? rawUrl : 'https://aiaobpbouxzlfrfhludn.supabase.co';

const cleanKey = (k?: string) => (k || '').replace(/^["'\s]+|["'\s]+$/g, '');

let activeRequestKey = '';
let activeRequestUrl = '';

// Secret cryptographique Propriétaire pour signer les jetons Super-Admin (impossible à falsifier)
function getOwnerHmacSecret(): string {
  const base =
    process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_SECRET_PASSWORD ||
    process.env.OWNER_PIN ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    '98bd287fe4208b5d4b7a9a1b114a4080';
  return `fidelitydz_owner_vault_secret_v82_${base}`;
}

function createOwnerAdminToken(): string {
  const exp = Date.now() + 2 * 60 * 60 * 1000; // Valide 2 heures
  const payload = `owner_mehdi:${exp}`;
  const sig = crypto.createHmac('sha256', getOwnerHmacSecret()).update(payload).digest('hex');
  return `${payload}:${sig}`;
}

function verifyOwnerAdminToken(token?: string | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.trim().split(':');
  if (parts.length !== 3) return false;
  const [role, expStr, sig] = parts;
  if (role !== 'owner_mehdi') return false;
  const exp = Number(expStr);
  if (!exp || Date.now() > exp) return false;
  const expectedSig = crypto
    .createHmac('sha256', getOwnerHmacSecret())
    .update(`${role}:${expStr}`)
    .digest('hex');
  try {
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expectedSig, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function normalizeDzPhone(raw: string): string {
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

function getProjectRefFromKey(key: string): string | null {
  if (!key || !key.startsWith('eyJ')) return null;
  try {
    const parts = key.trim().split('.');
    if (parts.length >= 2) {
      let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      const decoded = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
      if (decoded && typeof decoded.ref === 'string' && decoded.ref.length >= 8) {
        return decoded.ref.trim().toLowerCase();
      }
    }
  } catch {}
  return null;
}

function getEffectiveSupabaseUrl(customUrl?: string, extraKey?: string): string {
  const cUrl = cleanKey(customUrl || activeRequestUrl);
  if (cUrl.startsWith('http')) {
    return cUrl.replace(/\/+$/, '');
  }

  const keys = getCandidateKeys(extraKey);
  for (const k of keys) {
    const ref = getProjectRefFromKey(k);
    if (ref) {
      return `https://${ref}.supabase.co`;
    }
  }

  const rawEnv = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://aiaobpbouxzlfrfhludn.supabase.co'
  )
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .replace(/\/+$/, '');

  return rawEnv.startsWith('http') ? rawEnv : 'https://aiaobpbouxzlfrfhludn.supabase.co';
}

function getCandidateKeys(extraKey?: string): string[] {
  const kService = cleanKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const kAnon = cleanKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const kAnon2 = cleanKey(process.env.SUPABASE_ANON_KEY);
  const kKey = cleanKey(process.env.SUPABASE_KEY);
  const kPub = cleanKey(process.env.NEXT_PUBLIC_SUPABASE_KEY);
  const kExtra = cleanKey(extraKey || activeRequestKey);
  const list = [kExtra, kService, kAnon, kAnon2, kKey, kPub].filter((k) => k.length > 15);
  list.sort((a, b) => {
    if (kExtra && a === kExtra) return -1;
    if (kExtra && b === kExtra) return 1;
    const aJwt = a.startsWith('eyJ') ? 0 : 1;
    const bJwt = b.startsWith('eyJ') ? 0 : 1;
    return aJwt - bJwt;
  });
  return Array.from(new Set(list));
}

function buildHeaders(key: string, preferRepresentation = true): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: key,
  };
  if (key.startsWith('eyJ')) {
    headers['Authorization'] = `Bearer ${key}`;
  }
  if (preferRepresentation) {
    headers['Prefer'] = 'return=representation,resolution=merge-duplicates';
  }
  return headers;
}

function sanitizeHtml(text: string): string {
  if (!text) return '';
  return text.replace(/[<>]/g, function (c) {
    return { '<': '&lt;', '>': '&gt;' }[c] || c;
  });
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ensureUuid(val?: string): string {
  const s = String(val || '').trim();
  if (UUID_REGEX.test(s)) return s.toLowerCase();

  if (!s) {
    return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

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

// Déconnexion automatique stricte après 6 heures d'inactivité (AFK)
const DEVICE_TTL_MS = 6 * 60 * 60 * 1000;

function parseActiveDevices(raw: string | undefined): { id: string; ts: number }[] {
  const now = Date.now();
  return String(raw || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [id, tsStr] = item.split(':');
      const ts = Number(tsStr) || now;
      return { id: (id || '').trim(), ts };
    })
    .filter((d) => d.id && now - d.ts < DEVICE_TTL_MS);
}

function serializeActiveDevices(list: { id: string; ts: number }[]): string {
  return list.map((d) => `${d.id}:${d.ts}`).join(',');
}

function isMerchantSubExpired(m: any): boolean {
  if (!m) return false;
  if (m.subscription_status === 'EXPIRED') return true;
  if (m.subscription_ends_at && new Date(m.subscription_ends_at).getTime() < Date.now()) return true;
  return false;
}

// Nettoie toutes les données privées d'un commerçant avant exposition à un client public (/join ou /card)
function sanitizeMerchantForPublicCustomer(m: any) {
  if (!m) return null;
  return {
    id: m.id,
    business_name: m.business_name,
    slug: m.slug,
    category: m.category,
    wilaya: m.wilaya,
    address: m.address || '',
    logo_url: m.logo_url || '',
    social_instagram: m.social_instagram || '',
    social_facebook: m.social_facebook || '',
    social_tiktok: m.social_tiktok || '',
    social_maps: m.social_maps || '',
    google_review_reward_enabled: Boolean(m.google_review_reward_enabled),
    google_review_reward_bonus: Number(m.google_review_reward_bonus || 1),
    subscription_status: m.subscription_status,
    subscription_ends_at: m.subscription_ends_at,
  };
}

function packMerchantForDb(m: any) {
  const pass = String(m.password || '123456').trim();
  const email = String(m.email || '').trim();
  const address = String(m.address || '').trim();
  const socials = {
    ig: m.social_instagram || '',
    fb: m.social_facebook || '',
    tk: m.social_tiktok || '',
    gm: m.social_maps || '',
    gr_en: Boolean(m.google_review_reward_enabled),
    gr_bn: Number(m.google_review_reward_bonus || 1),
  };
  let rawLogo = String(m.logo_url || '').trim();
  if (rawLogo.startsWith('__AUTH__:')) {
    const parts = rawLogo.split(':::');
    rawLogo = parts[1] || '';
  }
  const activeDevsClean = serializeActiveDevices(parseActiveDevices(m.active_device_ids));
  const quotas = {
    tier: m.plan_tier || 'STARTER',
    mc: Number(m.max_cards ?? 100),
    ml: Number(m.max_locations ?? 1),
    mu: Number(m.max_users ?? 2),
    mo: Number(m.max_active_offers ?? m.max_offers ?? 3),
    mp: Number(m.max_push_per_week ?? m.max_push_notifications ?? 100),
    ps: Number(m.push_sent_this_week ?? m.push_sent_count ?? 0),
    pr: m.push_week_reset_at || new Date(Date.now() + 7 * 86400000).toISOString(),
    devs: activeDevsClean,
    parent: m.parent_merchant_id || '',
    cpin: String(m.cashier_pin ?? '').trim(),
    cdown: Number(m.scan_cooldown_minutes ?? 15),
  };
  const metaObj = { pass, email, address, socials, quotas };
  const packedLogo = `__AUTH__:${encodeURIComponent(JSON.stringify(metaObj))}:::${rawLogo}`;

  return {
    id: ensureUuid(m.id || m.slug),
    business_name: sanitizeString(m.business_name, 80),
    slug: String(m.slug || '').toLowerCase().trim(),
    category: m.category || 'Commerce',
    wilaya: m.wilaya || '16 - Alger',
    phone: normalizeDzPhone(m.phone) || String(m.phone || '').replace(/\s+/g, ''),
    logo_url: packedLogo,
    subscription_status: m.subscription_status || 'TRIAL',
    subscription_ends_at: m.subscription_ends_at || new Date(Date.now() + 14 * 86400000).toISOString(),
    created_at: m.created_at || new Date().toISOString(),
    plan_tier: quotas.tier,
    max_cards: quotas.mc,
    max_locations: quotas.ml,
    max_users: quotas.mu,
    max_active_offers: quotas.mo,
    max_push_per_week: quotas.mp,
    push_sent_this_week: quotas.ps,
    active_device_ids: quotas.devs,
  };
}

function unpackMerchantFromDb(row: any) {
  if (!row) return null;
  let password = row.password || '123456';
  let email = row.email || '';
  let address = row.address || '';
  let logo_url = row.logo_url || '';
  let social_instagram = row.social_instagram || '';
  let social_facebook = row.social_facebook || '';
  let social_tiktok = row.social_tiktok || '';
  let social_maps = row.social_maps || '';
  let google_review_reward_enabled = Boolean(row.google_review_reward_enabled);
  let google_review_reward_bonus = Number(row.google_review_reward_bonus || 1);

  let plan_tier = row.plan_tier || 'STARTER';
  let max_cards = Number(row.max_cards ?? 100);
  let max_locations = Number(row.max_locations ?? 1);
  let max_users = Number(row.max_users ?? 2);
  let max_active_offers = Number(row.max_active_offers ?? 3);
  let max_push_per_week = Number(row.max_push_per_week ?? 100);
  let push_sent_this_week = Number(row.push_sent_this_week ?? 0);
  let push_week_reset_at = row.push_week_reset_at || '';
  let active_device_ids = row.active_device_ids || '';
  let parent_merchant_id = row.parent_merchant_id || '';
  let cashier_pin = row.cashier_pin || '';
  let scan_cooldown_minutes = Number(row.scan_cooldown_minutes ?? 15);

  if (typeof logo_url === 'string' && logo_url.startsWith('__AUTH__:')) {
    const [authPart, realLogo] = logo_url.split(':::');
    logo_url = realLogo || '';
    const content = authPart.slice(9);
    try {
      if (content.startsWith('%7B') || content.startsWith('{')) {
        const parsed = JSON.parse(decodeURIComponent(content));
        if (parsed.pass) password = parsed.pass;
        if (parsed.email) email = parsed.email;
        if (parsed.address) address = parsed.address;
        if (parsed.socials) {
          social_instagram = parsed.socials.ig || '';
          social_facebook = parsed.socials.fb || '';
          social_tiktok = parsed.socials.tk || '';
          social_maps = parsed.socials.gm || '';
          google_review_reward_enabled = Boolean(parsed.socials.gr_en);
          google_review_reward_bonus = Number(parsed.socials.gr_bn || 1);
        }
        if (parsed.quotas) {
          if (parsed.quotas.tier) plan_tier = parsed.quotas.tier;
          if (parsed.quotas.mc !== undefined) max_cards = Number(parsed.quotas.mc);
          if (parsed.quotas.ml !== undefined) max_locations = Number(parsed.quotas.ml);
          if (parsed.quotas.mu !== undefined) max_users = Number(parsed.quotas.mu);
          if (parsed.quotas.mo !== undefined) max_active_offers = Number(parsed.quotas.mo);
          if (parsed.quotas.mp !== undefined) max_push_per_week = Number(parsed.quotas.mp);
          if (parsed.quotas.ps !== undefined) push_sent_this_week = Number(parsed.quotas.ps);
          if (parsed.quotas.pr) push_week_reset_at = parsed.quotas.pr;
          if (parsed.quotas.devs !== undefined) active_device_ids = String(parsed.quotas.devs);
          if (parsed.quotas.parent) parent_merchant_id = String(parsed.quotas.parent);
          if (parsed.quotas.cpin !== undefined) cashier_pin = String(parsed.quotas.cpin);
          if (parsed.quotas.cdown !== undefined) scan_cooldown_minutes = Number(parsed.quotas.cdown);
        }
      } else {
        const segs = authPart.split(':');
        if (segs[1]) password = decodeURIComponent(segs[1]);
        if (segs[2]) email = decodeURIComponent(segs[2]);
      }
    } catch {}
  }

  if (push_week_reset_at && new Date(push_week_reset_at).getTime() < Date.now()) {
    push_sent_this_week = 0;
    push_week_reset_at = new Date(Date.now() + 7 * 86400000).toISOString();
  }

  const cleanActiveDevs = serializeActiveDevices(parseActiveDevices(active_device_ids));

  return {
    ...row,
    password,
    email,
    address,
    logo_url,
    social_instagram,
    social_facebook,
    social_tiktok,
    social_maps,
    google_review_reward_enabled,
    google_review_reward_bonus,
    plan_tier,
    max_cards,
    max_locations,
    max_users,
    max_active_offers,
    max_push_per_week,
    push_sent_this_week,
    push_week_reset_at,
    active_device_ids: cleanActiveDevs,
    parent_merchant_id: parent_merchant_id || undefined,
    cashier_pin,
    scan_cooldown_minutes,
  };
}

function packProgramForDb(p: any, merchantUuid: string) {
  return {
    id: ensureUuid(p.id || `prog-${merchantUuid}`),
    merchant_id: merchantUuid,
    program_type: p.program_type || 'STAMPS',
    stamps_required: Number(p.stamps_required) || 10,
    points_per_100dzd: Number(p.points_per_100dzd) || 1,
    reward_title_fr: p.reward_title_fr || '10ème Offert',
    reward_title_ar: p.reward_title_ar || 'الهدية العاشرة مجاناً',
    welcome_bonus: Number(p.welcome_bonus ?? 1),
    primary_color: p.primary_color || '#10B981',
    background_color: p.background_color || '#0F172A',
  };
}

function packCardForDb(c: any) {
  const mId = ensureUuid(c.merchant_id);
  const pId = ensureUuid(c.program_id || `prog-${mId}`);
  const normPhone = normalizeDzPhone(c.customer_phone) || String(c.customer_phone || '').replace(/\s+/g, '');
  const cId = ensureUuid(c.id || `card-${mId}-${normPhone}`);
  const qToken = ensureUuid(c.qr_token || cId);

  return {
    id: cId,
    merchant_id: mId,
    program_id: pId,
    customer_phone: normPhone,
    customer_name: sanitizeString(c.customer_name || 'Client Fidélité', 60),
    qr_token: qToken,
    stamps_balance: Number(c.stamps_balance ?? 1),
    points_balance: Number(c.points_balance ?? 0),
    rewards_available: Number(c.rewards_available ?? 0),
    total_visits: Number(c.total_visits ?? 1),
    last_visit_at: c.last_visit_at || new Date().toISOString(),
    created_at: c.created_at || new Date().toISOString(),
  };
}

function annotateCardsForMerchant(cards: any[], merchant: any, txList?: any[]) {
  if (!Array.isArray(cards) || !merchant) return cards || [];
  const maxCards = Number(merchant.max_cards || 100);
  const subExpired = isMerchantSubExpired(merchant);

  const merchantCards = cards.filter((c) => c && c.merchant_id === merchant.id);
  const sortedByCreation = [...merchantCards].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const blockedIds = new Set(sortedByCreation.slice(maxCards).map((c) => c.id));

  return cards.map((c) => {
    if (!c || c.merchant_id !== merchant.id) return c;
    let pendingStamps = 0;
    let pendingPoints = 0;
    if (subExpired && Array.isArray(txList)) {
      const cardPendingTxs = txList.filter(
        (t) => t.card_id === c.id && String(t.performed_by || '').includes('En attente')
      );
      pendingStamps = cardPendingTxs
        .filter((t) => t.action_type === 'ADD_STAMP')
        .reduce((sum, t) => sum + Number(t.delta_value || 0), 0);
      pendingPoints = cardPendingTxs
        .filter((t) => t.action_type === 'ADD_POINTS')
        .reduce((sum, t) => sum + Number(t.delta_value || 0), 0);
    }
    return {
      ...c,
      customer_phone: normalizeDzPhone(c.customer_phone) || c.customer_phone,
      is_blocked_by_quota: blockedIds.has(c.id),
      is_pending_merchant_subscription: subExpired,
      pending_stamps: pendingStamps,
      pending_points: pendingPoints,
    };
  });
}

function packTxForDb(tx: any) {
  return {
    id: ensureUuid(tx.id),
    card_id: ensureUuid(tx.card_id),
    merchant_id: ensureUuid(tx.merchant_id),
    performed_by: tx.performed_by || 'Caissier',
    action_type: tx.action_type || 'ADD_STAMP',
    delta_value: Number(tx.delta_value ?? 1),
    purchase_amount_dzd: Number(tx.purchase_amount_dzd ?? 0),
    created_at: tx.created_at || new Date().toISOString(),
  };
}

function packOfferForDb(o: any) {
  let rawDescAr = String(o.description_ar || '').trim();
  if (rawDescAr.startsWith('__OFFER_META__:')) {
    const parts = rawDescAr.split(':::');
    rawDescAr = parts[1] || '';
  }
  const metaObj = {
    img: o.image_url || '',
    upd: o.updated_at || o.created_at || new Date().toISOString(),
  };
  const packedDescAr = `__OFFER_META__:${encodeURIComponent(JSON.stringify(metaObj))}:::${rawDescAr}`;

  return {
    id: ensureUuid(o.id),
    merchant_id: ensureUuid(o.merchant_id),
    title_fr: sanitizeString(o.title_fr, 120),
    title_ar: o.title_ar || '',
    description_fr: sanitizeHtml(o.description_fr || ''),
    description_ar: packedDescAr,
    target_segment: o.target_segment || 'ALL',
    valid_until: o.valid_until || new Date(Date.now() + 14 * 86400000).toISOString(),
    is_active: Boolean(o.is_active ?? true),
    created_at: o.created_at || new Date().toISOString(),
  };
}

function unpackOfferFromDb(row: any) {
  if (!row) return null;
  let description_ar = row.description_ar || '';
  let image_url = row.image_url || '';
  let updated_at = row.updated_at || row.created_at || '';

  if (typeof description_ar === 'string' && description_ar.startsWith('__OFFER_META__:')) {
    const [metaPart, realDescAr] = description_ar.split(':::');
    description_ar = realDescAr || '';
    const content = metaPart.slice(15);
    try {
      const parsed = JSON.parse(decodeURIComponent(content));
      if (parsed.img) image_url = parsed.img;
      if (parsed.upd) updated_at = parsed.upd;
    } catch {}
  }

  return {
    ...row,
    description_ar,
    image_url,
    updated_at,
  };
}

function packPaymentForDb(p: any) {
  const mName = String(p.merchant_name || '').trim();
  let rawRef = String(p.transaction_reference || '').trim();
  if (mName && !rawRef.includes(' :: ')) {
    rawRef = `${mName} :: ${rawRef}`;
  }
  return {
    id: ensureUuid(p.id),
    merchant_id: ensureUuid(p.merchant_id),
    amount_dzd: Number(p.amount_dzd) || 3900,
    payment_method: p.payment_method || 'BARIDIMOB',
    transaction_reference: rawRef,
    receipt_url: p.receipt_url || '',
    chargily_checkout_id: p.chargily_checkout_id || null,
    status: p.status || 'PENDING',
    created_at: p.created_at || new Date().toISOString(),
    reviewed_at: p.reviewed_at || null,
  };
}

function unpackPaymentFromDb(row: any) {
  if (!row) return null;
  let merchant_name = row.merchant_name || '';
  let transaction_reference = row.transaction_reference || '';
  if (typeof transaction_reference === 'string' && transaction_reference.includes(' :: ')) {
    const [mName, realRef] = transaction_reference.split(' :: ');
    merchant_name = merchant_name || mName;
    transaction_reference = realRef;
  }
  return {
    ...row,
    merchant_name,
    transaction_reference,
  };
}

async function sbRequest(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: unknown
): Promise<{ ok: boolean; data: any; errorText?: string }> {
  const keys = getCandidateKeys();
  if (keys.length === 0) {
    return {
      ok: false,
      data: null,
      errorText:
        'Aucune clé Supabase configurée (NEXT_PUBLIC_SUPABASE_ANON_KEY ou SUPABASE_SERVICE_ROLE_KEY). Veuillez la renseigner sur Vercel ou dans le panneau Super-Admin.',
    };
  }

  const baseUrl = getEffectiveSupabaseUrl();
  let lastError = '';

  for (const key of keys) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(`${baseUrl}/rest/v1/${path}`, {
        method,
        headers: buildHeaders(key, method !== 'GET'),
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        return { ok: true, data };
      }

      lastError = await res.text();
    } catch (e: unknown) {
      const err = e as any;
      const cause = err?.cause?.code || err?.cause?.message || '';
      const causeStr = cause ? ` (${cause})` : '';
      lastError = `${err?.message || 'Network error'}${causeStr} [URL testée: ${baseUrl}/rest/v1/${path}]`;
    }
  }

  console.warn(`Supabase [${method} ${path}] failed:`, lastError);
  return { ok: false, data: null, errorText: lastError };
}

async function sbSelect(table: string, query = '') {
  const res = await sbRequest(`${table}${query ? `?${query}` : ''}`, 'GET');
  return res.ok && Array.isArray(res.data) ? res.data : null;
}

async function sbUpsert(table: string, payload: any, onConflict = 'id') {
  const q = onConflict ? `?on_conflict=${onConflict}` : '';
  const res = await sbRequest(`${table}${q}`, 'POST', payload);
  if (!res.ok && table === 'merchants' && payload && typeof payload === 'object') {
    const coreMerchantPayload = {
      id: payload.id,
      business_name: payload.business_name,
      slug: payload.slug,
      category: payload.category,
      wilaya: payload.wilaya,
      phone: payload.phone,
      logo_url: payload.logo_url,
      subscription_status: payload.subscription_status,
      subscription_ends_at: payload.subscription_ends_at,
      created_at: payload.created_at,
    };
    const retryRes = await sbRequest(`${table}${q}`, 'POST', coreMerchantPayload);
    if (retryRes.ok) return retryRes;
  }
  return res;
}

async function getServerSession(
  req: NextRequest,
  bodyToken?: string
): Promise<{ user: { id: string; isAdmin: boolean } } | null> {
  const { searchParams } = new URL(req.url);
  const cookieMerchantId = req.cookies.get('fidelitydz_session')?.value || '';
  const cookieAdminToken = req.cookies.get('fidelitydz_admin_session')?.value || '';
  const headerAdminToken = req.headers.get('x-admin-token') || bodyToken || '';
  const headerMerchantId = req.headers.get('x-merchant-id') || searchParams.get('merchant_id') || '';

  // L'accès Super-Admin exige OBLIGATOIREMENT un jeton cryptographique HMAC signé par le serveur !
  const isAdmin = verifyOwnerAdminToken(cookieAdminToken) || verifyOwnerAdminToken(headerAdminToken);
  const id = (cookieMerchantId || headerMerchantId).trim();
  if (!id && !isAdmin) return null;
  return { user: { id: id || 'admin', isAdmin } };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(req);
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'init';
  if (!session && type !== 'merchant_by_slug' && type !== 'card_by_token' && searchParams.get('strict_auth') === '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  activeRequestKey = req.headers.get('x-supabase-key') || searchParams.get('key') || '';
  activeRequestUrl = req.headers.get('x-supabase-url') || searchParams.get('url') || '';

  if (type === 'merchant_by_slug') {
    const slug = (searchParams.get('slug') || '').toLowerCase().trim();
    const rows = await sbSelect('merchants', `slug=ilike.${encodeURIComponent(slug)}&limit=1`);
    const merchant = rows && rows.length > 0 ? unpackMerchantFromDb(rows[0]) : null;
    if (!merchant) {
      return NextResponse.json({ found: false }, { status: 200 });
    }
    const progRows = await sbSelect('loyalty_programs', `merchant_id=eq.${encodeURIComponent(merchant.id)}&limit=1`);
    const program = progRows && progRows.length > 0 ? progRows[0] : null;
    // Confidentialité totale : ne jamais exposer mot de passe, PIN caissier, email, quotas ni appareils au client
    const safePublicMerchant = sanitizeMerchantForPublicCustomer(merchant);
    return NextResponse.json({ found: true, merchant: safePublicMerchant, program }, { status: 200 });
  }

  if (type === 'card_by_token') {
    const rawToken = (searchParams.get('token') || '').trim();
    const tokenUuid = ensureUuid(rawToken);
    let cardRows = await sbSelect('customer_cards', `qr_token=eq.${encodeURIComponent(tokenUuid)}&limit=1`);
    if (!cardRows || cardRows.length === 0) {
      cardRows = await sbSelect('customer_cards', `id=eq.${encodeURIComponent(tokenUuid)}&limit=1`);
    }
    const card = cardRows && cardRows.length > 0 ? cardRows[0] : null;
    if (!card) {
      return NextResponse.json({ found: false }, { status: 200 });
    }
    const [mRows, pRows, oRows, txRows, allMerchantCards] = await Promise.all([
      sbSelect('merchants', `id=eq.${encodeURIComponent(card.merchant_id)}&limit=1`),
      sbSelect('loyalty_programs', `merchant_id=eq.${encodeURIComponent(card.merchant_id)}&limit=1`),
      sbSelect('personalized_offers', `merchant_id=eq.${encodeURIComponent(card.merchant_id)}&is_active=eq.true&order=created_at.desc`),
      sbSelect('loyalty_transactions', `card_id=eq.${encodeURIComponent(card.id)}`),
      sbSelect('customer_cards', `merchant_id=eq.${encodeURIComponent(card.merchant_id)}&select=id,merchant_id,created_at,customer_phone`),
    ]);
    const merchant = mRows && mRows.length > 0 ? unpackMerchantFromDb(mRows[0]) : null;
    const program = pRows && pRows.length > 0 ? pRows[0] : null;
    const safeMerchant = sanitizeMerchantForPublicCustomer(merchant);
    const claimedGoogle =
      Array.isArray(txRows) && txRows.some((t: any) => t.action_type === 'GOOGLE_REVIEW_BONUS');
    const unpackedOffers = Array.isArray(oRows) ? oRows.map(unpackOfferFromDb) : [];

    const annotatedList = annotateCardsForMerchant(
      Array.isArray(allMerchantCards) && allMerchantCards.length > 0 ? allMerchantCards : [card],
      merchant,
      Array.isArray(txRows) ? txRows : []
    );
    const annotatedMeta = annotatedList.find((c: any) => c.id === card.id) || {};

    return NextResponse.json(
      {
        found: true,
        card: {
          ...card,
          customer_phone: normalizeDzPhone(card.customer_phone) || card.customer_phone,
          google_review_claimed: claimedGoogle,
          is_blocked_by_quota: Boolean(annotatedMeta.is_blocked_by_quota),
          is_pending_merchant_subscription: Boolean(annotatedMeta.is_pending_merchant_subscription),
          pending_stamps: Number(annotatedMeta.pending_stamps || 0),
          pending_points: Number(annotatedMeta.pending_points || 0),
        },
        merchant: safeMerchant,
        program,
        offers: unpackedOffers,
      },
      { status: 200 }
    );
  }

  const reqMerchantId = (
    session?.user?.id && session.user.id !== 'admin'
      ? session.user.id
      : req.headers.get('x-merchant-id') || searchParams.get('merchant_id') || ''
  ).trim();
  const reqAdminSession = Boolean(session?.user?.isAdmin);
  const reqDeviceId = (req.headers.get('x-device-id') || searchParams.get('device_id') || '').trim();

  if (!reqMerchantId && !reqAdminSession) {
    const mPing = await sbRequest('platform_settings?id=eq.1', 'GET');
    return NextResponse.json({
      connected: mPing.ok,
      error_details: mPing.ok ? null : 'Connexion Supabase requise',
      keys_configured: getCandidateKeys().length > 0,
      supabase_url: getEffectiveSupabaseUrl(),
      owner_whatsapp: '213541534762',
      merchants: [],
      programs: [],
      cards: [],
      offers: [],
      payments: [],
      transactions: [],
    });
  }

  const [mRes, pRows, cRows, oRows, payRows, txRows, settingsRows] = await Promise.all([
    sbRequest('merchants?order=created_at.desc', 'GET'),
    sbSelect('loyalty_programs', ''),
    sbSelect('customer_cards', 'order=last_visit_at.desc'),
    sbSelect('personalized_offers', 'order=created_at.desc'),
    sbSelect('subscription_payments', 'order=created_at.desc'),
    sbSelect('loyalty_transactions', 'order=created_at.desc&limit=200'),
    sbSelect('platform_settings', 'id=eq.1'),
  ]);

  const mRows = mRes.ok && Array.isArray(mRes.data) ? mRes.data : null;
  const allMerchants = Array.isArray(mRows) ? mRows.map(unpackMerchantFromDb) : [];
  const allPayments = Array.isArray(payRows) ? payRows.map(unpackPaymentFromDb) : [];
  const targetUuid = reqMerchantId ? ensureUuid(reqMerchantId) : '';

  const primaryMerchant = allMerchants.find(
    (m: any) => m && (m.id === reqMerchantId || m.id === targetUuid || m.slug === reqMerchantId)
  );

  // Vérification stricte de l'appareil actif et rafraîchissement du compteur 6h AFK
  if (!reqAdminSession && primaryMerchant && reqDeviceId) {
    const maxUsers = Number(primaryMerchant.max_users || 2);
    const activeList = parseActiveDevices(primaryMerchant.active_device_ids);
    const devIdx = activeList.findIndex((d) => d.id === reqDeviceId);
    if (devIdx >= 0) {
      if (Date.now() - activeList[devIdx].ts > 2 * 60 * 1000) {
        activeList[devIdx].ts = Date.now();
        primaryMerchant.active_device_ids = serializeActiveDevices(activeList);
        await sbUpsert('merchants', packMerchantForDb(primaryMerchant), 'id');
      }
    } else if (activeList.length >= maxUsers) {
      return NextResponse.json({
        connected: true,
        device_unauthorized: true,
        error_details: `Limite de ${maxUsers} appareils simultanés dépassée.`,
        merchants: [],
        programs: [],
        cards: [],
        offers: [],
        payments: [],
        transactions: [],
      });
    } else {
      activeList.push({ id: reqDeviceId, ts: Date.now() });
      primaryMerchant.active_device_ids = serializeActiveDevices(activeList);
      await sbUpsert('merchants', packMerchantForDb(primaryMerchant), 'id');
    }
  }

  const rootId = primaryMerchant ? primaryMerchant.parent_merchant_id || primaryMerchant.id : targetUuid;
  const ownerPhone = primaryMerchant ? normalizeDzPhone(primaryMerchant.phone) : '';

  const merchants = reqAdminSession
    ? allMerchants
    : allMerchants
        .filter((m: any) => {
          if (!m) return false;
          if (m.id === reqMerchantId || m.id === targetUuid || m.slug === reqMerchantId) return true;
          if (rootId && (m.id === rootId || m.parent_merchant_id === rootId)) return true;
          if (ownerPhone && normalizeDzPhone(m.phone) === ownerPhone) return true;
          return false;
        })
        .map((m: any) => {
          const cleanDevs = parseActiveDevices(m.active_device_ids);
          const { password: _pw, ...safeM } = m;
          return { ...safeM, active_device_ids: serializeActiveDevices(cleanDevs) };
        });

  const allowedMerchantIds = new Set(merchants.map((m: any) => m.id));
  const filterByMerchant = (rows: any[] | null) => {
    if (!Array.isArray(rows)) return [];
    if (reqAdminSession) return rows;
    return rows.filter((r) => allowedMerchantIds.has(r.merchant_id));
  };

  const filteredCardsRaw = filterByMerchant(cRows);
  const merchantMap = new Map(allMerchants.filter(Boolean).map((m: any) => [m.id, m]));
  let annotatedCards = filteredCardsRaw;
  for (const mId of Array.from(new Set(filteredCardsRaw.map((c: any) => c.merchant_id)))) {
    const mObj = merchantMap.get(mId);
    if (mObj) {
      annotatedCards = annotateCardsForMerchant(annotatedCards, mObj, Array.isArray(txRows) ? txRows : []);
    }
  }

  const payments = reqAdminSession
    ? allPayments
    : allPayments.filter((p: any) => allowedMerchantIds.has(p.merchant_id));
  const settings = Array.isArray(settingsRows) && settingsRows.length > 0 ? settingsRows[0] : null;
  let ownerWhatsapp = '213541534762';
  if (settings) {
    if (settings.owner_whatsapp) {
      ownerWhatsapp = settings.owner_whatsapp;
    } else if (typeof settings.chargily_mode === 'string' && settings.chargily_mode.includes('|')) {
      ownerWhatsapp = settings.chargily_mode.split('|')[1] || ownerWhatsapp;
    }
  }

  return NextResponse.json({
    connected: Array.isArray(mRows),
    error_details: mRes.ok ? null : mRes.errorText || 'Erreur de connexion Supabase',
    keys_configured: getCandidateKeys().length > 0,
    supabase_url: getEffectiveSupabaseUrl(),
    owner_whatsapp: ownerWhatsapp,
    merchants,
    programs: filterByMerchant(pRows),
    cards: annotatedCards,
    offers: filterByMerchant(Array.isArray(oRows) ? oRows.map(unpackOfferFromDb) : []),
    payments,
    transactions: filterByMerchant(txRows),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await getServerSession(req, body.admin_token);
    activeRequestKey = req.headers.get('x-supabase-key') || body.supabase_key || '';
    activeRequestUrl = req.headers.get('x-supabase-url') || body.supabase_url || '';
    const { action } = body;
    const publicActions = new Set([
      'login_merchant',
      'verify_manager_password',
      'login_admin',
      'logout_merchant',
      'get_or_create_card',
      'save_merchant',
      'save_card',
    ]);
    const hasEntityAuth = Boolean(
      session ||
        body.merchant_id ||
        body.merchant?.id ||
        body.program?.merchant_id ||
        body.card?.merchant_id ||
        body.offer?.merchant_id ||
        body.payment?.merchant_id ||
        body.parent_merchant_id
    );
    if (!publicActions.has(action) && !hasEntityAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Actions exclusivement réservées au Propriétaire Super-Admin (Mehdi)
    const ownerOnlyActions = new Set([
      'save_owner_whatsapp',
      'update_payment_and_merchant',
      'delete_merchant',
    ]);
    if (ownerOnlyActions.has(action) && !session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Accès refusé : Action réservée exclusivement au Propriétaire Super-Admin.' },
        { status: 403 }
      );
    }

    if (action === 'save_owner_whatsapp') {
      const cleanWa = String(body.owner_whatsapp || '').replace(/\D/g, '');
      await sbUpsert(
        'platform_settings',
        {
          id: 1,
          platform_name: 'FidelityDZ',
          plan_price_dzd: 3900,
          trial_days: 14,
          owner_account_name: 'KAZI TANI MOHAMMED EL MEHDI',
          owner_rip_number: '00799999004172668994',
          owner_ccp_number: '41726689',
          owner_ccp_key: '87',
          chargily_mode: `test|${cleanWa}`,
        },
        'id'
      );
      return NextResponse.json({ success: true, owner_whatsapp: cleanWa });
    }

    if (action === 'verify_manager_password') {
      const targetId = ensureUuid(body.merchant_id);
      const passInput = String(body.password || '').trim();
      const mRows = await sbSelect('merchants', `id=eq.${encodeURIComponent(targetId)}&limit=1`);
      const unpacked = mRows && mRows.length > 0 ? unpackMerchantFromDb(mRows[0]) : null;
      if (!unpacked) {
        return NextResponse.json({ success: false, error: 'Commerce introuvable.' }, { status: 404 });
      }
      if (String(unpacked.password || '123456').trim() === passInput) {
        return NextResponse.json({ success: true, role: 'MANAGER' });
      }
      return NextResponse.json({ success: false, error: 'Mot de passe Gérant incorrect.' }, { status: 401 });
    }

    if (action === 'login_merchant') {
      const { identifier, password } = body;
      const cleanId = String(identifier || '').trim().toLowerCase();
      const cleanPhone = normalizeDzPhone(cleanId) || cleanId.replace(/\s+/g, '');
      const mRows = await sbSelect('merchants', '');

      if (!Array.isArray(mRows)) {
        return NextResponse.json(
          { success: false, error: 'Erreur de connexion au serveur de données. Veuillez réessayer.' },
          { status: 500 }
        );
      }

      const unpackedList = mRows.map(unpackMerchantFromDb);
      const found = unpackedList.find((m: any) => {
        if (!m) return false;
        const mPhone = normalizeDzPhone(m.phone) || String(m.phone || '').replace(/\s+/g, '').toLowerCase();
        const mEmail = String(m.email || '').trim().toLowerCase();
        const mSlug = String(m.slug || '').trim().toLowerCase();
        const mName = String(m.business_name || '').trim().toLowerCase();
        return mPhone === cleanPhone || mEmail === cleanId || mSlug === cleanId || mName === cleanId;
      });

      if (!found) {
        return NextResponse.json(
          { success: false, error: 'Aucun compte commerçant trouvé avec cet identifiant.' },
          { status: 404 }
        );
      }

      const cleanPass = String(password || '').trim();
      const isManagerMatch = String(found.password || '123456').trim() === cleanPass;
      const isCashierMatch =
        Boolean(found.cashier_pin && String(found.cashier_pin).trim().length >= 4) &&
        String(found.cashier_pin).trim() === cleanPass;

      if (!isManagerMatch && !isCashierMatch) {
        return NextResponse.json(
          { success: false, error: 'Mot de passe Gérant ou Code PIN Caissier incorrect.' },
          { status: 401 }
        );
      }

      const loginRole = isManagerMatch ? 'MANAGER' : 'CASHIER';

      // VÉRIFICATION STRICTE DES APPAREILS SIMULTANÉS (AVEC EXPIRATION AUTO APRÈS 6H AFK)
      const deviceId = String(body.device_id || 'unknown_device').trim();
      const maxUsers = Number(found.max_users || 2);
      const activeList = parseActiveDevices(found.active_device_ids);
      const existingIdx = activeList.findIndex((d) => d.id === deviceId);

      if (existingIdx >= 0) {
        activeList[existingIdx].ts = Date.now();
      } else {
        if (activeList.length >= maxUsers) {
          return NextResponse.json(
            {
              success: false,
              quota_users_exceeded: true,
              max_users: maxUsers,
              active_devices_count: activeList.length,
              error: `Accès bloqué : ${activeList.length}/${maxUsers} appareils sont déjà connectés simultanément sur ce compte (expiration automatique après 6h d'inactivité AFK). Déconnectez un appareil ouvert ou ajoutez une extension Utilisateur (+500 DZD/mois).`,
            },
            { status: 403 }
          );
        }
        activeList.push({ id: deviceId, ts: Date.now() });
      }

      found.active_device_ids = serializeActiveDevices(activeList);
      await sbUpsert('merchants', packMerchantForDb(found), 'id');

      const { password: _pw, ...safeMerchant } = found;
      const loginResp = NextResponse.json({
        success: true,
        merchant: safeMerchant,
        role: loginRole,
      });
      loginResp.cookies.set('fidelitydz_session', String(safeMerchant.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 6 * 60 * 60,
      });
      return loginResp;
    }

    if (action === 'logout_merchant') {
      const merchantId = body.merchant_id;
      const deviceId = String(body.device_id || '').trim();
      if (merchantId) {
        const mUuid = ensureUuid(merchantId);
        const mRows = await sbSelect('merchants', `id=eq.${encodeURIComponent(mUuid)}&limit=1`);
        if (mRows && mRows.length > 0) {
          const unpacked = unpackMerchantFromDb(mRows[0]);
          const activeList = body.reset_all_devices
            ? body.keep_current_device && deviceId
              ? [{ id: deviceId, ts: Date.now() }]
              : []
            : parseActiveDevices(unpacked.active_device_ids).filter((d) => d.id !== deviceId);
          unpacked.active_device_ids = serializeActiveDevices(activeList);
          await sbUpsert('merchants', packMerchantForDb(unpacked), 'id');
        }
      }
      const logoutResp = NextResponse.json({ success: true });
      if (!body.keep_current_device) {
        logoutResp.cookies.delete('fidelitydz_session');
        logoutResp.cookies.delete('fidelitydz_admin_session');
      }
      return logoutResp;
    }

    if (action === 'increment_push') {
      const merchantId = ensureUuid(body.merchant_id);
      const countToSend = Math.max(1, Number(body.count || 1));
      const mRows = await sbSelect('merchants', `id=eq.${encodeURIComponent(merchantId)}&limit=1`);
      if (!mRows || mRows.length === 0) {
        return NextResponse.json({ success: false, error: 'Commerce introuvable.' }, { status: 404 });
      }
      const unpacked = unpackMerchantFromDb(mRows[0]);
      const isExpired = isMerchantSubExpired(unpacked);

      if (isExpired) {
        return NextResponse.json(
          {
            success: false,
            quota_exceeded: true,
            error: 'Votre abonnement est expiré. Renouvelez votre abonnement pour envoyer des notifications Push.',
          },
          { status: 403 }
        );
      }

      const maxPush = Number(unpacked.max_push_per_week || 100);
      const currentSent = Number(unpacked.push_sent_this_week || 0);

      if (currentSent >= maxPush) {
        return NextResponse.json(
          {
            success: false,
            quota_exceeded: true,
            error: `Limite de ${maxPush} notifications Push atteinte cette semaine (${currentSent}/${maxPush}). Demandez une extension Push (+400 DZD pour +100 push) dans Abonnement & Paiement.`,
          },
          { status: 403 }
        );
      }

      unpacked.push_sent_this_week = Math.min(maxPush, currentSent + countToSend);
      await sbUpsert('merchants', packMerchantForDb(unpacked), 'id');

      return NextResponse.json({
        success: true,
        push_sent_this_week: unpacked.push_sent_this_week,
        max_push_per_week: maxPush,
      });
    }

    if (action === 'create_branch') {
      const parentId = ensureUuid(body.parent_merchant_id);
      const branchName = sanitizeString(body.business_name || '', 80);
      const branchWilaya = body.wilaya || '16 - Alger';
      const branchAddress = sanitizeString(body.address || '', 120);

      const allRows = await sbSelect('merchants', '');
      const allUnpacked = Array.isArray(allRows) ? allRows.map(unpackMerchantFromDb) : [];
      const parent = allUnpacked.find((m: any) => m && m.id === parentId);

      if (!parent) {
        return NextResponse.json({ success: false, error: 'Compte principal introuvable.' }, { status: 404 });
      }

      if (isMerchantSubExpired(parent)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Votre abonnement est expiré. Renouvelez votre abonnement avant de créer un point de vente.',
          },
          { status: 403 }
        );
      }

      const rootId = parent.parent_merchant_id || parent.id;
      const parentNormPhone = normalizeDzPhone(parent.phone);
      const existingBranches = allUnpacked.filter(
        (m: any) =>
          m &&
          (m.id === rootId ||
            m.parent_merchant_id === rootId ||
            (parentNormPhone && normalizeDzPhone(m.phone) === parentNormPhone))
      );
      const maxLocations = Number(parent.max_locations || 1);

      if (existingBranches.length >= maxLocations) {
        return NextResponse.json(
          {
            success: false,
            quota_locations_exceeded: true,
            error: `Limite de points de vente atteinte (${existingBranches.length}/${maxLocations} local actif). Demandez l'extension Multi-Locaux (+1 500 DZD/mois par local) pour ouvrir un nouveau point de vente.`,
          },
          { status: 403 }
        );
      }

      const baseSlug = branchName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const finalSlug = `${baseSlug || parent.slug}-${Math.floor(100 + Math.random() * 900)}`;

      const newBranchObj = {
        ...parent,
        id: ensureUuid(),
        parent_merchant_id: rootId,
        business_name: branchName,
        slug: finalSlug,
        wilaya: branchWilaya,
        address: branchAddress,
        created_at: new Date().toISOString(),
      };

      const dbBranch = packMerchantForDb(newBranchObj);
      await sbUpsert('merchants', dbBranch, 'id');
      const dbProg = packProgramForDb({}, dbBranch.id);
      await sbUpsert('loyalty_programs', dbProg, 'id');

      return NextResponse.json({
        success: true,
        merchant: unpackMerchantFromDb(dbBranch),
      });
    }

    if (action === 'login_admin') {
      const { password, owner_pin } = body;
      const envAdminPass = (process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET_PASSWORD || '').trim();
      const envOwnerPin = (process.env.OWNER_PIN || '').trim();
      const salt = 'fidelitydz_scrypt_salt_v1';

      const inputPassBuf = crypto.scryptSync(String(password || '').trim(), salt, 32);
      const expectedPassBuf = envAdminPass
        ? crypto.scryptSync(envAdminPass, salt, 32)
        : Buffer.from('98bd287fe4208b5d4b7a9a1b114a40800a489f6d13616ecc24d6f13ede00101a', 'hex');

      const inputPinBuf = crypto.scryptSync(String(owner_pin || '').trim(), salt, 32);
      const expectedPinBuf = envOwnerPin
        ? crypto.scryptSync(envOwnerPin, salt, 32)
        : Buffer.from('5b36221b5cd6496063c979fd3f232b4cdc2cd9fb6426a68709f0d25501a0fdaa', 'hex');

      if (
        crypto.timingSafeEqual(inputPassBuf, expectedPassBuf) &&
        crypto.timingSafeEqual(inputPinBuf, expectedPinBuf)
      ) {
        const ownerToken = createOwnerAdminToken();
        const adminResp = NextResponse.json({ success: true, admin_token: ownerToken });
        adminResp.cookies.set('fidelitydz_admin_session', ownerToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 2 * 60 * 60,
        });
        return adminResp;
      }
      return NextResponse.json(
        { success: false, error: 'Code PIN Propriétaire ou Mot de passe Super-Admin incorrect.' },
        { status: 401 }
      );
    }

    if (action === 'save_merchant') {
      const rawM = body.merchant || {};
      const targetId = ensureUuid(rawM.id || rawM.slug);
      const existingRows = await sbSelect('merchants', `id=eq.${encodeURIComponent(targetId)}&limit=1`);
      const existingM = existingRows && existingRows.length > 0 ? unpackMerchantFromDb(existingRows[0]) : null;
      const isOwnerAdmin = Boolean(session?.user?.isAdmin);

      // Si le commerce existe déjà, exiger que la requête provienne de la session authentifiée de ce commerçant ou du Propriétaire
      if (existingM && !isOwnerAdmin) {
        const sessionMId = session?.user?.id ? ensureUuid(session.user.id) : '';
        const isSelfOrParent =
          sessionMId &&
          (sessionMId === existingM.id ||
            (existingM.parent_merchant_id && sessionMId === ensureUuid(existingM.parent_merchant_id)));
        if (!isSelfOrParent) {
          return NextResponse.json(
            { success: false, error: 'Accès non autorisé : vous ne pouvez modifier que votre propre commerce.' },
            { status: 403 }
          );
        }
      }

      // Sécurité stricte : Seul le Propriétaire Super-Admin peut modifier les quotas ou prolonger/activer un abonnement existant
      const safeMaxCards = isOwnerAdmin
        ? Number(rawM.max_cards ?? existingM?.max_cards ?? 100)
        : Number(existingM?.max_cards ?? 100);
      const safeMaxLocations = isOwnerAdmin
        ? Number(rawM.max_locations ?? existingM?.max_locations ?? 1)
        : Number(existingM?.max_locations ?? 1);
      const safeMaxUsers = isOwnerAdmin
        ? Number(rawM.max_users ?? existingM?.max_users ?? 2)
        : Number(existingM?.max_users ?? 2);
      const safeMaxOffers = isOwnerAdmin
        ? Number(rawM.max_active_offers ?? rawM.max_offers ?? existingM?.max_active_offers ?? 3)
        : Number(existingM?.max_active_offers ?? 3);
      const safeMaxPush = isOwnerAdmin
        ? Number(rawM.max_push_per_week ?? rawM.max_push_notifications ?? existingM?.max_push_per_week ?? 100)
        : Number(existingM?.max_push_per_week ?? 100);

      let safeSubStatus = existingM ? existingM.subscription_status : 'TRIAL';
      let safeSubEndsAt = existingM
        ? existingM.subscription_ends_at
        : new Date(Date.now() + 14 * 86400000).toISOString();

      if (isOwnerAdmin) {
        if (rawM.subscription_status) safeSubStatus = rawM.subscription_status;
        if (rawM.subscription_ends_at) safeSubEndsAt = rawM.subscription_ends_at;
      } else if (existingM && rawM.subscription_status === 'EXPIRED') {
        safeSubStatus = 'EXPIRED';
      }

      const mergedMerchant = {
        ...(existingM || {}),
        ...rawM,
        id: targetId,
        password: rawM.password || existingM?.password || '123456',
        cashier_pin:
          rawM.cashier_pin !== undefined ? String(rawM.cashier_pin).trim() : existingM?.cashier_pin || '',
        scan_cooldown_minutes: Number(
          rawM.scan_cooldown_minutes ?? existingM?.scan_cooldown_minutes ?? 15
        ),
        active_device_ids:
          rawM.active_device_ids !== undefined ? rawM.active_device_ids : existingM?.active_device_ids || '',
        parent_merchant_id:
          rawM.parent_merchant_id !== undefined ? rawM.parent_merchant_id : existingM?.parent_merchant_id || '',
        max_cards: safeMaxCards,
        max_locations: safeMaxLocations,
        max_users: safeMaxUsers,
        max_active_offers: safeMaxOffers,
        max_push_per_week: safeMaxPush,
        push_sent_this_week: Number(
          rawM.push_sent_this_week ?? rawM.push_sent_count ?? existingM?.push_sent_this_week ?? 0
        ),
        subscription_status: safeSubStatus,
        subscription_ends_at: safeSubEndsAt,
      };

      const program = body.program;
      const dbMerchant = packMerchantForDb(mergedMerchant);
      const mRes = await sbUpsert('merchants', dbMerchant, 'id');
      if (!mRes.ok) {
        return NextResponse.json(
          { success: false, error: `Erreur Supabase merchants: ${mRes.errorText}` },
          { status: 500 }
        );
      }

      const savedMerchantRow = Array.isArray(mRes.data) && mRes.data[0] ? mRes.data[0] : dbMerchant;
      const unpacked = unpackMerchantFromDb(savedMerchantRow);

      if (!isMerchantSubExpired(unpacked)) {
        const pendingTxs = await sbSelect(
          'loyalty_transactions',
          `merchant_id=eq.${encodeURIComponent(dbMerchant.id)}`
        );
        if (Array.isArray(pendingTxs)) {
          for (const tx of pendingTxs) {
            if (String(tx.performed_by || '').includes('En attente')) {
              await sbUpsert(
                'loyalty_transactions',
                packTxForDb({ ...tx, performed_by: 'Caissier (Validé après abonnement)' }),
                'id'
              );
            }
          }
        }
      }

      if (program) {
        const dbProg = packProgramForDb(program, dbMerchant.id);
        await sbUpsert('loyalty_programs', dbProg, 'id');
        return NextResponse.json({ success: true, merchant: unpacked, program: dbProg });
      }

      return NextResponse.json({ success: true, merchant: unpacked });
    }

    if (action === 'save_program') {
      const { program } = body;
      const mUuid = ensureUuid(program.merchant_id);
      const dbProg = packProgramForDb(program, mUuid);
      const pRes = await sbUpsert('loyalty_programs', dbProg, 'id');
      return NextResponse.json({
        success: pRes.ok,
        program: Array.isArray(pRes.data) && pRes.data[0] ? pRes.data[0] : dbProg,
      });
    }

    if (action === 'save_card') {
      const { card, transaction } = body;
      const normPhone = normalizeDzPhone(card?.customer_phone);
      const mId = ensureUuid(card?.merchant_id);

      const existingMerchantCards = await sbSelect(
        'customer_cards',
        `merchant_id=eq.${encodeURIComponent(mId)}`
      );
      const duplicateCard = Array.isArray(existingMerchantCards)
        ? existingMerchantCards.find((c: any) => normalizeDzPhone(c.customer_phone) === normPhone)
        : null;

      const effectiveCardInput = duplicateCard
        ? {
            ...card,
            id: duplicateCard.id,
            qr_token: duplicateCard.qr_token,
            customer_phone: normPhone,
          }
        : {
            ...card,
            customer_phone: normPhone,
          };

      const dbCard = packCardForDb(effectiveCardInput);
      if (transaction && transaction.action_type === 'GOOGLE_REVIEW_BONUS') {
        const existingTx = await sbSelect(
          'loyalty_transactions',
          `card_id=eq.${encodeURIComponent(dbCard.id)}&action_type=eq.GOOGLE_REVIEW_BONUS&limit=1`
        );
        if (existingTx && existingTx.length > 0) {
          return NextResponse.json({
            success: false,
            already_claimed: true,
            card: { ...dbCard, google_review_claimed: true },
          });
        }
      }
      const cRes = await sbUpsert('customer_cards', dbCard, 'id');
      if (transaction) {
        const dbTx = packTxForDb({ ...transaction, card_id: dbCard.id, merchant_id: dbCard.merchant_id });
        await sbUpsert('loyalty_transactions', dbTx, 'id');
      }
      return NextResponse.json({
        success: cRes.ok,
        card: Array.isArray(cRes.data) && cRes.data[0] ? cRes.data[0] : dbCard,
      });
    }

    if (action === 'get_or_create_card') {
      const { merchantSlug, phone, name } = body;
      const cleanSlug = String(merchantSlug || '').toLowerCase().trim();
      const cleanPhone = normalizeDzPhone(phone);

      if (!/^0[567]\d{8}$/.test(cleanPhone)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Numéro de téléphone algérien invalide (doit commencer par 05, 06 ou 07 sur 10 chiffres).',
          },
          { status: 400 }
        );
      }

      const mRows = await sbSelect('merchants', `slug=ilike.${encodeURIComponent(cleanSlug)}&limit=1`);
      const merchant = mRows && mRows.length > 0 ? unpackMerchantFromDb(mRows[0]) : null;
      if (!merchant) {
        return NextResponse.json(
          { success: false, error: `Le commerce "${merchantSlug}" n'existe pas dans la base.` },
          { status: 404 }
        );
      }

      const pRows = await sbSelect('loyalty_programs', `merchant_id=eq.${encodeURIComponent(merchant.id)}&limit=1`);
      let program = pRows && pRows.length > 0 ? pRows[0] : null;
      if (!program) {
        program = packProgramForDb({}, merchant.id);
        await sbUpsert('loyalty_programs', program, 'id');
      }

      const allMerchantCards = await sbSelect(
        'customer_cards',
        `merchant_id=eq.${encodeURIComponent(merchant.id)}&order=created_at.asc`
      );
      const existingCard = Array.isArray(allMerchantCards)
        ? allMerchantCards.find((c: any) => normalizeDzPhone(c.customer_phone) === cleanPhone)
        : null;

      const subExpired = isMerchantSubExpired(merchant);
      const maxCards = Number(merchant.max_cards || 100);
      const safePublicMerchant = sanitizeMerchantForPublicCustomer(merchant);

      if (existingCard) {
        const cardIdx = Array.isArray(allMerchantCards)
          ? allMerchantCards.findIndex((c: any) => c.id === existingCard.id)
          : 0;
        return NextResponse.json({
          success: true,
          isNew: false,
          card: {
            ...existingCard,
            customer_phone: cleanPhone,
            is_blocked_by_quota: cardIdx >= maxCards,
            is_pending_merchant_subscription: subExpired,
          },
          merchant: safePublicMerchant,
          program,
        });
      }

      const deterministicCardId = ensureUuid(`card-${merchant.id}-${cleanPhone}`);
      const newQrToken = ensureUuid(`qr-${merchant.id}-${cleanPhone}`);
      const newCard = packCardForDb({
        id: deterministicCardId,
        merchant_id: merchant.id,
        program_id: program.id,
        customer_phone: cleanPhone,
        customer_name: String(name || '').trim() || `Client ${cleanPhone.slice(-4)}`,
        qr_token: newQrToken,
        stamps_balance: program.welcome_bonus || 1,
        points_balance: program.program_type === 'POINTS' ? program.welcome_bonus || 10 : 0,
        rewards_available: 0,
        total_visits: 1,
        last_visit_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

      const cRes = await sbUpsert('customer_cards', newCard, 'id');
      if (!cRes.ok) {
        return NextResponse.json(
          { success: false, error: `Erreur création carte Supabase: ${cRes.errorText}` },
          { status: 500 }
        );
      }

      const currentCount = Array.isArray(allMerchantCards) ? allMerchantCards.length : 0;
      const isBlockedByQuota = currentCount >= maxCards;

      const welcomeTx = packTxForDb({
        id: ensureUuid(`tx-welcome-${deterministicCardId}`),
        card_id: newCard.id,
        merchant_id: merchant.id,
        performed_by: subExpired ? 'Système (En attente abonnement)' : 'Système (Bienvenue)',
        action_type: program.program_type === 'POINTS' ? 'ADD_POINTS' : 'ADD_STAMP',
        delta_value: program.welcome_bonus || 1,
        purchase_amount_dzd: 0,
        created_at: new Date().toISOString(),
      });
      await sbUpsert('loyalty_transactions', welcomeTx, 'id');

      return NextResponse.json({
        success: true,
        isNew: true,
        card: {
          ...newCard,
          is_blocked_by_quota: isBlockedByQuota,
          is_pending_merchant_subscription: subExpired,
          pending_stamps: subExpired && program.program_type !== 'POINTS' ? Number(program.welcome_bonus || 1) : 0,
          pending_points: subExpired && program.program_type === 'POINTS' ? Number(program.welcome_bonus || 10) : 0,
        },
        merchant: safePublicMerchant,
        program,
      });
    }

    if (action === 'save_offer') {
      const { offer } = body;
      const dbOffer = packOfferForDb(offer);

      const mRows = await sbSelect('merchants', `id=eq.${encodeURIComponent(dbOffer.merchant_id)}&limit=1`);
      const unpackedM = mRows && mRows.length > 0 ? unpackMerchantFromDb(mRows[0]) : null;

      if (unpackedM && isMerchantSubExpired(unpackedM)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Votre abonnement est expiré. Renouvelez votre abonnement pour créer ou modifier des offres.',
          },
          { status: 403 }
        );
      }

      if (!body.is_edit) {
        const allMerchantOffers = await sbSelect(
          'personalized_offers',
          `merchant_id=eq.${encodeURIComponent(dbOffer.merchant_id)}&select=id`
        );
        const currentOfferCount = Array.isArray(allMerchantOffers) ? allMerchantOffers.length : 0;
        const maxAllowedOffers = unpackedM ? Number(unpackedM.max_active_offers || 3) : 3;

        const isNew = !Array.isArray(allMerchantOffers) || !allMerchantOffers.some((o) => o.id === dbOffer.id);

        if (isNew && currentOfferCount >= maxAllowedOffers) {
          return NextResponse.json(
            {
              success: false,
              quota_exceeded: true,
              error: `Vous avez atteint votre limite maximale de ${maxAllowedOffers} offres. Veuillez supprimer une ancienne offre ou demander une extension (Add-on) pour en créer de nouvelles.`,
            },
            { status: 403 }
          );
        }
      }

      const oRes = await sbUpsert('personalized_offers', dbOffer, 'id');
      const savedRow = Array.isArray(oRes.data) && oRes.data[0] ? oRes.data[0] : dbOffer;
      return NextResponse.json({
        success: oRes.ok,
        offer: unpackOfferFromDb(savedRow),
      });
    }

    if (action === 'delete_offer') {
      const offerId = body.offer_id || body.id;
      if (!offerId) return NextResponse.json({ success: false, error: 'offer_id manquant' }, { status: 400 });
      const oUuid = ensureUuid(offerId);
      const res = await sbRequest(`personalized_offers?id=eq.${encodeURIComponent(oUuid)}`, 'DELETE');
      return NextResponse.json({ success: res.ok, error: res.ok ? null : res.errorText });
    }

    if (action === 'save_payment') {
      const { payment } = body;
      const dbPay = packPaymentForDb(payment);
      const payRes = await sbUpsert('subscription_payments', dbPay, 'id');
      return NextResponse.json({
        success: payRes.ok,
        payment: unpackPaymentFromDb(Array.isArray(payRes.data) && payRes.data[0] ? payRes.data[0] : dbPay),
      });
    }

    if (action === 'update_payment_and_merchant') {
      const { payment, merchant } = body;
      if (payment) {
        const dbPay = packPaymentForDb(payment);
        await sbUpsert('subscription_payments', dbPay, 'id');
      }
      if (merchant) {
        const targetId = ensureUuid(merchant.id);
        const existingRows = await sbSelect('merchants', `id=eq.${encodeURIComponent(targetId)}&limit=1`);
        const existingM = existingRows && existingRows.length > 0 ? unpackMerchantFromDb(existingRows[0]) : null;
        const merged = {
          ...(existingM || {}),
          ...merchant,
          password: merchant.password || existingM?.password || '123456',
          active_device_ids:
            merchant.active_device_ids !== undefined
              ? merchant.active_device_ids
              : existingM?.active_device_ids || '',
        };
        const dbMerchant = packMerchantForDb(merged);
        await sbUpsert('merchants', dbMerchant, 'id');

        const pendingTxs = await sbSelect(
          'loyalty_transactions',
          `merchant_id=eq.${encodeURIComponent(dbMerchant.id)}`
        );
        if (Array.isArray(pendingTxs)) {
          for (const tx of pendingTxs) {
            if (String(tx.performed_by || '').includes('En attente')) {
              await sbUpsert(
                'loyalty_transactions',
                packTxForDb({ ...tx, performed_by: 'Caissier (Validé après abonnement)' }),
                'id'
              );
            }
          }
        }
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_merchant') {
      const merchantId = body.merchant_id || body.id;
      if (!merchantId) {
        return NextResponse.json({ success: false, error: 'merchant_id manquant' }, { status: 400 });
      }
      const mUuid = ensureUuid(merchantId);
      await Promise.allSettled([
        sbRequest(`loyalty_transactions?merchant_id=eq.${encodeURIComponent(mUuid)}`, 'DELETE'),
        sbRequest(`customer_cards?merchant_id=eq.${encodeURIComponent(mUuid)}`, 'DELETE'),
        sbRequest(`personalized_offers?merchant_id=eq.${encodeURIComponent(mUuid)}`, 'DELETE'),
        sbRequest(`subscription_payments?merchant_id=eq.${encodeURIComponent(mUuid)}`, 'DELETE'),
        sbRequest(`loyalty_programs?merchant_id=eq.${encodeURIComponent(mUuid)}`, 'DELETE'),
      ]);
      const res = await sbRequest(`merchants?id=eq.${encodeURIComponent(mUuid)}`, 'DELETE');
      return NextResponse.json({ success: res.ok, error: res.ok ? null : res.errorText });
    }

    return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erreur lors du traitement, veuillez réessayer.' },
      { status: 500 }
    );
  }
}
