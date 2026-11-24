import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  Schemas,
  sanitizeString,
  sanitizeSafeUrl,
  sanitizePostgrestFilterValue,
  isSafeUuid,
  validateBase64ImageServer,
  consumeTokenBucket,
  recordAuthFailure,
  clearAuthFailures,
  isAuthLocked,
  logSecurityEvent,
  getRecentSecurityEvents,
} from '@/lib/validation';

const cleanKey = (k?: string) => (k || '').replace(/^["'\s]+|["'\s]+$/g, '');

// ============================================================================
// RÈGLES 1, 5, 9, 15, 17 : CRYPTOGRAPHIE SERVEUR (SCRYPT + SESSIONS SIGNÉES HMAC)
// ============================================================================
let _ephemeralHmacSecret: string | null = null;
function getRuntimeEphemeralSecret(): string {
  if (!_ephemeralHmacSecret) {
    _ephemeralHmacSecret = crypto.randomBytes(32).toString('hex');
  }
  return _ephemeralHmacSecret;
}

function getOwnerHmacSecret(): string {
  const base =
    process.env.SESSION_HMAC_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_SECRET_PASSWORD ||
    process.env.OWNER_PIN ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    getRuntimeEphemeralSecret();
  return `fidelitydz_owner_vault_secret_v83_${base}`;
}

function getMerchantHmacSecret(): string {
  const base =
    process.env.SESSION_HMAC_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_SECRET_PASSWORD ||
    process.env.OWNER_PIN ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    getRuntimeEphemeralSecret();
  return `fidelitydz_session_hmac_v83_${base}`;
}

// Règle 5 : Hachage irréversible scrypt avec sel aléatoire de 16 octets par mot de passe / PIN
function hashSecretScrypt(plain: string): string {
  const trimmed = String(plain || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('scrypt$')) return trimmed;
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(trimmed, salt, 32).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifySecretScrypt(inputPlain: string, storedSecret: string): boolean {
  const candidate = String(inputPlain || '').trim();
  const stored = String(storedSecret || '').trim();
  if (!candidate || !stored) return false;

  try {
    if (stored.startsWith('scrypt$')) {
      const parts = stored.split('$');
      if (parts.length !== 3) return false;
      const [, salt, hashHex] = parts;
      const derived = crypto.scryptSync(candidate, salt, 32);
      const expected = Buffer.from(hashHex, 'hex');
      if (derived.length !== expected.length) return false;
      return crypto.timingSafeEqual(derived, expected);
    }

    // Rétrocompatibilité en temps constant pour les anciens comptes (automatiquement migrés vers scrypt$)
    const a = crypto.scryptSync(candidate, 'fidelitydz_legacy_compare_salt', 32);
    const b = crypto.scryptSync(stored, 'fidelitydz_legacy_compare_salt', 32);
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function getPasswordTag(passwordHashOrPlain?: string): string {
  return crypto
    .createHash('sha256')
    .update(String(passwordHashOrPlain || 'default'))
    .digest('hex')
    .slice(0, 10);
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

function createMerchantSessionToken(
  merchantId: string,
  role: 'MANAGER' | 'CASHIER' = 'MANAGER',
  passwordStored?: string
): string {
  const exp = Date.now() + 6 * 60 * 60 * 1000; // Valide 6 heures
  const pwdTag = getPasswordTag(passwordStored);
  const payload = `m_sess:${merchantId}:${role}:${exp}:${pwdTag}`;
  const sig = crypto.createHmac('sha256', getMerchantHmacSecret()).update(payload).digest('hex');
  return `${payload}:${sig}`;
}

function verifyMerchantSessionToken(
  token?: string | null
): { merchantId: string; role: 'MANAGER' | 'CASHIER'; pwdTag: string } | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split(':');
  if (parts.length < 4) return null;
  const [prefix, merchantId, rawRole, expStr, ...rest] = parts;
  if (prefix !== 'm_sess' || !merchantId) return null;
  const sig = rest[rest.length - 1];
  const pwdTag = rest.length > 1 ? rest[0] : '';
  const exp = Number(expStr);
  if (!exp || Date.now() > exp) return null;

  const payload = pwdTag
    ? `${prefix}:${merchantId}:${rawRole}:${expStr}:${pwdTag}`
    : `${prefix}:${merchantId}:${rawRole}:${expStr}`;
  const expectedSig = crypto.createHmac('sha256', getMerchantHmacSecret()).update(payload).digest('hex');
  try {
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expectedSig, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const role: 'MANAGER' | 'CASHIER' = rawRole === 'CASHIER' ? 'CASHIER' : 'MANAGER';
    return { merchantId, role, pwdTag };
  } catch {
    return null;
  }
}

function setMerchantAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set('fidelitydz_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 6 * 60 * 60,
  });
}

function setAdminAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set('fidelitydz_admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 2 * 60 * 60,
  });
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

// ============================================================================
// RÈGLE 2 : PROTECTION DES CLÉS API & ANTI-SSRF SUPABASE
// ============================================================================
function getProjectRefFromKey(key: string): string | null {
  if (!key || !key.startsWith('eyJ')) return null;
  try {
    const parts = key.trim().split('.');
    if (parts.length >= 2) {
      let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      const decoded = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
      if (decoded && typeof decoded.ref === 'string' && /^[a-z0-9]{8,40}$/i.test(decoded.ref.trim())) {
        return decoded.ref.trim().toLowerCase();
      }
    }
  } catch {}
  return null;
}

function getCandidateKeys(): string[] {
  const kService = cleanKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const kAnon = cleanKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const kAnon2 = cleanKey(process.env.SUPABASE_ANON_KEY);
  const kKey = cleanKey(process.env.SUPABASE_KEY);
  const list = [kService, kAnon, kAnon2, kKey].filter((k) => k.length > 15 && k !== 'CHANGE_ME');
  list.sort((a, b) => {
    const aJwt = a.startsWith('eyJ') ? 0 : 1;
    const bJwt = b.startsWith('eyJ') ? 0 : 1;
    return aJwt - bJwt;
  });
  return Array.from(new Set(list));
}

function getEffectiveSupabaseUrl(): string {
  const rawEnv = cleanKey(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL).replace(/\/+$/, '');
  if (/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(rawEnv)) {
    return rawEnv;
  }

  const keys = getCandidateKeys();
  for (const k of keys) {
    const ref = getProjectRefFromKey(k);
    if (ref) {
      return `https://${ref}.supabase.co`;
    }
  }

  return '';
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
  return text.replace(/[<>]/g, (c) => ({ '<': '&lt;', '>': '&gt;' }[c] || c));
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ensureUuid(val?: string): string {
  const s = String(val || '').trim();
  if (UUID_REGEX.test(s)) return s.toLowerCase();

  if (!s) {
    return crypto.randomUUID();
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
      return { id: sanitizePostgrestFilterValue(id || '', 40), ts };
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
    business_name: sanitizeString(m.business_name, 80),
    slug: m.slug,
    category: sanitizeString(m.category, 60),
    wilaya: sanitizeString(m.wilaya, 80),
    address: sanitizeString(m.address || '', 200),
    logo_url: m.logo_url || '',
    social_instagram: sanitizeSafeUrl(m.social_instagram || ''),
    social_facebook: sanitizeSafeUrl(m.social_facebook || ''),
    social_tiktok: sanitizeSafeUrl(m.social_tiktok || ''),
    social_maps: sanitizeSafeUrl(m.social_maps || ''),
    google_review_reward_enabled: Boolean(m.google_review_reward_enabled),
    google_review_reward_bonus: Math.max(1, Math.min(5, Number(m.google_review_reward_bonus || 1))),
    subscription_status: m.subscription_status,
    subscription_ends_at: m.subscription_ends_at,
  };
}

// Supprime le hash du mot de passe, le hash du PIN et les jetons de réinitialisation avant tout retour JSON
function stripSensitiveMerchantFields(m: any) {
  if (!m) return null;
  const cleanDevs = parseActiveDevices(m.active_device_ids);
  const {
    password: _pw,
    reset_token_hash: _rth,
    reset_token_exp: _rte,
    cashier_pin: rawCpin,
    ...safeM
  } = m;
  return {
    ...safeM,
    cashier_pin: rawCpin ? '••••' : '',
    active_device_ids: serializeActiveDevices(cleanDevs),
  };
}

function packMerchantForDb(m: any) {
  // Règle 5 : Le mot de passe et le PIN caissier sont TOUJOURS hachés avec scrypt avant sauvegarde en DB
  const rawPass = String(m.password || '123456').trim();
  const pass = hashSecretScrypt(rawPass);

  const rawCpin = String(m.cashier_pin ?? '').trim();
  const hashedCpin = rawCpin && rawCpin !== '••••' ? hashSecretScrypt(rawCpin) : '';

  const email = sanitizeString(m.email || '', 120);
  const address = sanitizeString(m.address || '', 200);
  const socials = {
    ig: sanitizeSafeUrl(m.social_instagram || ''),
    fb: sanitizeSafeUrl(m.social_facebook || ''),
    tk: sanitizeSafeUrl(m.social_tiktok || ''),
    gm: sanitizeSafeUrl(m.social_maps || ''),
    gr_en: Boolean(m.google_review_reward_enabled),
    gr_bn: Math.max(1, Math.min(5, Number(m.google_review_reward_bonus || 1))),
  };
  let rawLogo = String(m.logo_url || '').trim();
  if (rawLogo.startsWith('__AUTH__:')) {
    const parts = rawLogo.split(':::');
    rawLogo = parts[1] || '';
  }
  const activeDevsClean = serializeActiveDevices(parseActiveDevices(m.active_device_ids));
  const quotas = {
    tier: m.plan_tier || 'STARTER',
    mc: Math.max(10, Math.min(100000, Number(m.max_cards ?? 100))),
    ml: Math.max(1, Math.min(100, Number(m.max_locations ?? 1))),
    mu: Math.max(1, Math.min(50, Number(m.max_users ?? 2))),
    mo: Math.max(1, Math.min(100, Number(m.max_active_offers ?? m.max_offers ?? 3))),
    mp: Math.max(10, Math.min(100000, Number(m.max_push_per_week ?? m.max_push_notifications ?? 100))),
    ps: Math.max(0, Number(m.push_sent_this_week ?? m.push_sent_count ?? 0)),
    pr: m.push_week_reset_at || new Date(Date.now() + 7 * 86400000).toISOString(),
    devs: activeDevsClean,
    parent: m.parent_merchant_id || '',
    cpin: hashedCpin,
    cdown: Math.max(0, Math.min(1440, Number(m.scan_cooldown_minutes ?? 15))),
    rth: m.reset_token_hash || '',
    rte: Number(m.reset_token_exp || 0),
  };
  const metaObj = { pass, email, address, socials, quotas };
  const packedLogo = `__AUTH__:${encodeURIComponent(JSON.stringify(metaObj))}:::${rawLogo}`;

  const cleanSlug = String(m.slug || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

  return {
    id: ensureUuid(m.id || cleanSlug),
    business_name: sanitizeString(m.business_name, 80),
    slug: cleanSlug || 'commerce-dz',
    category: sanitizeString(m.category || 'Commerce', 60),
    wilaya: sanitizeString(m.wilaya || '16 - Alger', 80),
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
  let reset_token_hash = '';
  let reset_token_exp = 0;

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
          social_instagram = sanitizeSafeUrl(parsed.socials.ig || '');
          social_facebook = sanitizeSafeUrl(parsed.socials.fb || '');
          social_tiktok = sanitizeSafeUrl(parsed.socials.tk || '');
          social_maps = sanitizeSafeUrl(parsed.socials.gm || '');
          google_review_reward_enabled = Boolean(parsed.socials.gr_en);
          google_review_reward_bonus = Math.max(1, Math.min(5, Number(parsed.socials.gr_bn || 1)));
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
          if (parsed.quotas.rth) reset_token_hash = String(parsed.quotas.rth);
          if (parsed.quotas.rte) reset_token_exp = Number(parsed.quotas.rte);
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
    reset_token_hash,
    reset_token_exp,
  };
}

function packProgramForDb(p: any, merchantUuid: string) {
  const pColor = /^#[0-9A-Fa-f]{6}$/.test(String(p.primary_color || '')) ? p.primary_color : '#10B981';
  const bgColor = /^#[0-9A-Fa-f]{6}$/.test(String(p.background_color || '')) ? p.background_color : '#0F172A';
  return {
    id: ensureUuid(p.id || `prog-${merchantUuid}`),
    merchant_id: merchantUuid,
    program_type: p.program_type === 'POINTS' ? 'POINTS' : 'STAMPS',
    stamps_required: Math.max(4, Math.min(50, Math.floor(Number(p.stamps_required) || 10))),
    points_per_100dzd: Math.max(1, Math.min(100, Math.floor(Number(p.points_per_100dzd) || 1))),
    reward_title_fr: sanitizeString(p.reward_title_fr || '10ème Offert', 120),
    reward_title_ar: sanitizeString(p.reward_title_ar || 'الهدية العاشرة مجاناً', 120),
    welcome_bonus: Math.max(0, Math.min(10, Math.floor(Number(p.welcome_bonus ?? 1)))),
    primary_color: pColor,
    background_color: bgColor,
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
    stamps_balance: Math.max(0, Math.min(500, Math.floor(Number(c.stamps_balance ?? 1)))),
    points_balance: Math.max(0, Math.min(1000000, Math.floor(Number(c.points_balance ?? 0)))),
    rewards_available: Math.max(0, Math.min(100, Math.floor(Number(c.rewards_available ?? 0)))),
    total_visits: Math.max(1, Math.min(100000, Math.floor(Number(c.total_visits ?? 1)))),
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
  const allowedActions = new Set(['ADD_STAMP', 'ADD_POINTS', 'REDEEM_REWARD', 'GOOGLE_REVIEW_BONUS']);
  const actionType = allowedActions.has(tx.action_type) ? tx.action_type : 'ADD_STAMP';
  return {
    id: ensureUuid(tx.id),
    card_id: ensureUuid(tx.card_id),
    merchant_id: ensureUuid(tx.merchant_id),
    performed_by: sanitizeString(tx.performed_by || 'Caissier', 80),
    action_type: actionType,
    delta_value: Math.max(-50, Math.min(10000, Math.floor(Number(tx.delta_value ?? 1)))),
    purchase_amount_dzd: Math.max(0, Math.min(10000000, Math.floor(Number(tx.purchase_amount_dzd ?? 0)))),
    created_at: tx.created_at || new Date().toISOString(),
  };
}

function packOfferForDb(o: any) {
  let rawDescAr = sanitizeString(o.description_ar || '', 300);
  if (rawDescAr.startsWith('__OFFER_META__:')) {
    const parts = rawDescAr.split(':::');
    rawDescAr = parts[1] || '';
  }
  const metaObj = {
    img: o.image_url || '',
    upd: o.updated_at || o.created_at || new Date().toISOString(),
  };
  const packedDescAr = `__OFFER_META__:${encodeURIComponent(JSON.stringify(metaObj))}:::${rawDescAr}`;
  const allowedSegs = new Set(['ALL', 'VIP', 'INACTIVE_30D']);

  return {
    id: ensureUuid(o.id),
    merchant_id: ensureUuid(o.merchant_id),
    title_fr: sanitizeString(o.title_fr, 120),
    title_ar: sanitizeString(o.title_ar || '', 120),
    description_fr: sanitizeHtml(sanitizeString(o.description_fr || '', 300)),
    description_ar: packedDescAr,
    target_segment: allowedSegs.has(o.target_segment) ? o.target_segment : 'ALL',
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

function packPaymentForDb(p: any, isAdminCaller = false) {
  const mName = sanitizeString(p.merchant_name || '', 80);
  let rawRef = sanitizeString(p.transaction_reference || '', 120);
  if (mName && !rawRef.includes(' :: ')) {
    rawRef = `${mName} :: ${rawRef}`;
  }
  const allowedMethods = new Set(['BARIDIMOB', 'CCP_RECEIPT', 'CHARGILY_PAY']);
  const allowedStatuses = new Set(['PENDING', 'APPROVED', 'REJECTED']);
  // Règle 19 : Seul le Super-Admin peut approuver ou rejeter un paiement
  const safeStatus = isAdminCaller && allowedStatuses.has(p.status) ? p.status : 'PENDING';

  return {
    id: ensureUuid(p.id),
    merchant_id: ensureUuid(p.merchant_id),
    amount_dzd: Math.max(400, Math.min(100000, Math.floor(Number(p.amount_dzd) || 3900))),
    payment_method: allowedMethods.has(p.payment_method) ? p.payment_method : 'BARIDIMOB',
    transaction_reference: rawRef,
    receipt_url: p.receipt_url || '',
    chargily_checkout_id: p.chargily_checkout_id ? sanitizeString(p.chargily_checkout_id, 80) : null,
    status: safeStatus,
    created_at: p.created_at || new Date().toISOString(),
    reviewed_at: isAdminCaller && p.reviewed_at ? p.reviewed_at : null,
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
  const baseUrl = getEffectiveSupabaseUrl();
  if (keys.length === 0 || !baseUrl) {
    return {
      ok: false,
      data: null,
      errorText: 'Configuration serveur Supabase manquante.',
    };
  }

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
    } catch {
      // Ne jamais exposer les URLs internes ni les stack traces
    }
  }

  // Règle 20 : Message d'erreur générique sans exposer le nom des tables ni les URLs internes
  return { ok: false, data: null, errorText: 'Service de base de données temporairement indisponible.' };
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

interface VerifiedSession {
  user: {
    id: string;
    role: 'OWNER_ADMIN' | 'MANAGER' | 'CASHIER';
    isAdmin: boolean;
    pwdTag?: string;
  };
}

// Règles 1 & 9 : Authentification serveur par jetons signés HMAC uniquement (zéro confiance dans un ID non signé)
async function getServerSession(
  req: NextRequest,
  bodyAdminToken?: string,
  bodyMerchantToken?: string
): Promise<VerifiedSession | null> {
  const cookieAdminToken = req.cookies.get('fidelitydz_admin_session')?.value || '';
  const headerAdminToken = req.headers.get('x-admin-token') || bodyAdminToken || '';

  if (verifyOwnerAdminToken(cookieAdminToken) || verifyOwnerAdminToken(headerAdminToken)) {
    return {
      user: {
        id: 'admin',
        role: 'OWNER_ADMIN',
        isAdmin: true,
      },
    };
  }

  const cookieMerchantToken = req.cookies.get('fidelitydz_session')?.value || '';
  const headerMerchantToken = req.headers.get('x-merchant-token') || bodyMerchantToken || '';

  const verifiedMerchant =
    verifyMerchantSessionToken(cookieMerchantToken) || verifyMerchantSessionToken(headerMerchantToken);

  if (verifiedMerchant) {
    return {
      user: {
        id: ensureUuid(verifiedMerchant.merchantId),
        role: verifiedMerchant.role,
        isAdmin: false,
        pwdTag: verifiedMerchant.pwdTag,
      },
    };
  }

  return null;
}

// Règle 3 : Vérifie que le commerçant connecté est bien propriétaire de la ressource (ou d'une succursale rattachée)
function canAccessMerchant(
  session: VerifiedSession | null,
  targetMerchantId: string,
  targetMerchantObj?: any
): boolean {
  if (!session) return false;
  if (session.user.isAdmin) return true;
  const sessionMId = ensureUuid(session.user.id);
  const targetMId = ensureUuid(targetMerchantId);
  if (sessionMId === targetMId) return true;
  if (targetMerchantObj?.parent_merchant_id && ensureUuid(targetMerchantObj.parent_merchant_id) === sessionMId) {
    return true;
  }
  return false;
}

export async function GET(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim();

  // Règle 12 : Rate Limiting Token Bucket sur GET /api/db
  const rate = consumeTokenBucket(ip, 'api_get', 120, 60);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez patienter.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  const session = await getServerSession(req);
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'init';

  if (!session && type !== 'merchant_by_slug' && type !== 'card_by_token' && searchParams.get('strict_auth') === '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (type === 'merchant_by_slug') {
    // Règle 10 : Sanitization stricte anti-injection PostgREST sur slug
    const slug = sanitizePostgrestFilterValue((searchParams.get('slug') || '').toLowerCase(), 60);
    if (!slug) {
      return NextResponse.json({ found: false }, { status: 200 });
    }
    const rows = await sbSelect('merchants', `slug=eq.${encodeURIComponent(slug)}&limit=1`);
    const merchant = rows && rows.length > 0 ? unpackMerchantFromDb(rows[0]) : null;
    if (!merchant) {
      return NextResponse.json({ found: false }, { status: 200 });
    }
    const progRows = await sbSelect('loyalty_programs', `merchant_id=eq.${encodeURIComponent(merchant.id)}&limit=1`);
    const program = progRows && progRows.length > 0 ? progRows[0] : null;
    const safePublicMerchant = sanitizeMerchantForPublicCustomer(merchant);
    return NextResponse.json({ found: true, merchant: safePublicMerchant, program }, { status: 200 });
  }

  if (type === 'card_by_token') {
    const rawParam = (searchParams.get('token') || '').split('#t=')[0].trim();
    const rawToken = sanitizePostgrestFilterValue(rawParam, 80);
    if (!rawToken) {
      return NextResponse.json({ found: false }, { status: 200 });
    }
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
      sbSelect(
        'personalized_offers',
        `merchant_id=eq.${encodeURIComponent(card.merchant_id)}&is_active=eq.true&order=created_at.desc`
      ),
      sbSelect('loyalty_transactions', `card_id=eq.${encodeURIComponent(card.id)}`),
      sbSelect(
        'customer_cards',
        `merchant_id=eq.${encodeURIComponent(card.merchant_id)}&select=id,merchant_id,created_at,customer_phone`
      ),
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

  const reqAdminSession = Boolean(session?.user?.isAdmin);
  const reqMerchantId = !reqAdminSession && session?.user?.id ? session.user.id : '';
  const reqDeviceId = sanitizePostgrestFilterValue(
    req.headers.get('x-device-id') || searchParams.get('device_id') || '',
    40
  );

  // Règle 2 & 20 : Si non authentifié, ne renvoyer AUCUNE donnée privée ni l'URL interne Supabase
  if (!reqMerchantId && !reqAdminSession) {
    const mPing = await sbRequest('platform_settings?id=eq.1', 'GET');
    return NextResponse.json({
      connected: mPing.ok,
      error_details: mPing.ok ? null : 'Connexion au service requise',
      keys_configured: getCandidateKeys().length > 0,
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

  // Règle 17 : Si le mot de passe du commerçant a été changé, invalider immédiatement l'ancienne session
  if (
    !reqAdminSession &&
    primaryMerchant &&
    session?.user?.pwdTag &&
    session.user.pwdTag !== getPasswordTag(primaryMerchant.password)
  ) {
    const expiredRes = NextResponse.json(
      { connected: true, device_unauthorized: true, error_details: 'Session expirée suite au changement de mot de passe.' },
      { status: 401 }
    );
    expiredRes.cookies.delete('fidelitydz_session');
    return expiredRes;
  }

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

  // Règle 5 : Ne jamais retourner le hash du mot de passe ni du PIN caissier dans les réponses JSON
  const merchants = reqAdminSession
    ? allMerchants.filter(Boolean).map(stripSensitiveMerchantFields)
    : allMerchants
        .filter((m: any) => {
          if (!m) return false;
          if (m.id === reqMerchantId || m.id === targetUuid || m.slug === reqMerchantId) return true;
          if (rootId && (m.id === rootId || m.parent_merchant_id === rootId)) return true;
          if (ownerPhone && normalizeDzPhone(m.phone) === ownerPhone) return true;
          return false;
        })
        .map(stripSensitiveMerchantFields);

  const allowedMerchantIds = new Set(merchants.filter(Boolean).map((m: any) => m.id));
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
  let ownerInstagram = 'https://www.instagram.com/fidelity.dz';
  if (settings) {
    if (settings.owner_whatsapp) {
      ownerWhatsapp = settings.owner_whatsapp;
    } else if (typeof settings.chargily_mode === 'string' && settings.chargily_mode.includes('|')) {
      ownerWhatsapp = settings.chargily_mode.split('|')[1] || ownerWhatsapp;
    }
    if (settings.owner_instagram) {
      ownerInstagram = settings.owner_instagram;
    }
  }

  return NextResponse.json({
    connected: Array.isArray(mRows),
    error_details: mRes.ok ? null : 'Erreur de connexion au service de données',
    keys_configured: getCandidateKeys().length > 0,
    owner_whatsapp: ownerWhatsapp,
    owner_instagram: ownerInstagram,
    merchants,
    programs: filterByMerchant(pRows),
    cards: annotatedCards,
    offers: filterByMerchant(Array.isArray(oRows) ? oRows.map(unpackOfferFromDb) : []),
    payments,
    transactions: filterByMerchant(txRows),
    ...(reqAdminSession ? { security_events: getRecentSecurityEvents(25) } : {}),
  });
}

export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim();

  // Règle 16 : Vérification CSRF du Content-Type JSON sur les mutations POST
  const contentType = (req.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    logSecurityEvent('CSRF_REJECTED', ip, { reason: 'invalid_content_type', contentType }, 'WARN');
    return NextResponse.json(
      { success: false, error: 'Format de requête refusé (Content-Type application/json requis).' },
      { status: 415 }
    );
  }

  // Règle 12 : Rate Limiting global sur POST /api/db (60 req/min par IP)
  const generalRate = consumeTokenBucket(ip, 'api_post_general', 60, 60);
  if (!generalRate.allowed) {
    return NextResponse.json(
      { success: false, error: 'Trop de requêtes. Veuillez patienter quelques secondes.' },
      { status: 429, headers: { 'Retry-After': String(generalRate.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const { action } = body;
    const session = await getServerSession(req, body.admin_token, body.merchant_token);

    const publicActions = new Set([
      'login_merchant',
      'login_admin',
      'logout_merchant',
      'get_or_create_card',
      'save_merchant',
      'save_card',
      'request_password_reset',
      'confirm_password_reset',
    ]);

    if (!publicActions.has(action) && !session) {
      logSecurityEvent('UNAUTHORIZED_ACCESS', ip, { action }, 'WARN');
      return NextResponse.json({ success: false, error: 'Non autorisé : veuillez vous reconnecter.' }, { status: 401 });
    }

    // Règle 9 : Actions exclusivement réservées au Propriétaire Super-Admin (Mehdi)
    const ownerOnlyActions = new Set([
      'save_owner_whatsapp',
      'save_owner_instagram',
      'update_payment_and_merchant',
      'delete_merchant',
    ]);
    if (ownerOnlyActions.has(action) && !session?.user?.isAdmin) {
      logSecurityEvent('UNAUTHORIZED_ACCESS', ip, { action, reason: 'owner_admin_required' }, 'CRITICAL');
      return NextResponse.json(
        { success: false, error: 'Accès refusé : Action réservée exclusivement au Propriétaire Super-Admin.' },
        { status: 403 }
      );
    }

    // ========================================================================
    // ACTION : LOGIN SUPER-ADMIN PROPRIÉTAIRE (/kazi-owner-dz)
    // ========================================================================
    if (action === 'login_admin') {
      const lockCheck = isAuthLocked(ip, 'admin');
      if (lockCheck.locked) {
        return NextResponse.json(
          {
            success: false,
            error: `Accès temporairement verrouillé suite à plusieurs échecs. Réessayez dans ${Math.ceil(
              lockCheck.retryAfterSeconds / 60
            )} min.`,
          },
          { status: 429, headers: { 'Retry-After': String(lockCheck.retryAfterSeconds) } }
        );
      }

      const adminRate = consumeTokenBucket(ip, 'login_admin', 5, 1);
      if (!adminRate.allowed) {
        return NextResponse.json(
          { success: false, error: 'Trop de tentatives Super-Admin. Veuillez patienter.' },
          { status: 429, headers: { 'Retry-After': String(adminRate.retryAfterSeconds) } }
        );
      }

      const { password, owner_pin } = body;
      const envAdminPass = (process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET_PASSWORD || '').trim();
      const envOwnerPin = (process.env.OWNER_PIN || '').trim();

      if (!envAdminPass || !envOwnerPin) {
        logSecurityEvent('ADMIN_AUTH_FAILED', ip, { reason: 'missing_admin_env_credentials' }, 'CRITICAL');
        return NextResponse.json(
          { success: false, error: 'Identifiants Super-Admin non configurés sur ce serveur.' },
          { status: 500 }
        );
      }

      const salt = 'fidelitydz_scrypt_salt_v1';
      const inputPassBuf = crypto.scryptSync(String(password || '').trim(), salt, 32);
      const expectedPassBuf = crypto.scryptSync(envAdminPass, salt, 32);

      const inputPinBuf = crypto.scryptSync(String(owner_pin || '').trim(), salt, 32);
      const expectedPinBuf = crypto.scryptSync(envOwnerPin, salt, 32);

      const isPassValid = crypto.timingSafeEqual(inputPassBuf, expectedPassBuf);
      const isPinValid = crypto.timingSafeEqual(inputPinBuf, expectedPinBuf);

      if (isPassValid && isPinValid) {
        clearAuthFailures(ip, 'admin');
        logSecurityEvent('AUTH_LOGIN_SUCCESS', ip, { role: 'OWNER_ADMIN' }, 'INFO');
        const ownerToken = createOwnerAdminToken();
        const adminResp = NextResponse.json({ success: true, admin_token: ownerToken });
        setAdminAuthCookie(adminResp, ownerToken);
        return adminResp;
      }

      recordAuthFailure(ip, 'admin', 5, 15 * 60 * 1000);
      return NextResponse.json(
        { success: false, error: 'Code PIN Propriétaire ou Mot de passe Super-Admin incorrect.' },
        { status: 401 }
      );
    }

    // ========================================================================
    // ACTION : LOGIN COMMERÇANT / CAISSIER (AVEC HACHAGE SCRYPT & RATE LIMITING)
    // ========================================================================
    if (action === 'login_merchant') {
      const lockCheck = isAuthLocked(ip, 'merchant');
      if (lockCheck.locked) {
        return NextResponse.json(
          {
            success: false,
            error: `Trop de tentatives échouées. Compte protégé pendant ${Math.ceil(
              lockCheck.retryAfterSeconds / 60
            )} minutes.`,
          },
          { status: 429, headers: { 'Retry-After': String(lockCheck.retryAfterSeconds) } }
        );
      }

      const loginRate = consumeTokenBucket(ip, 'login_merchant', 8, 2);
      if (!loginRate.allowed) {
        return NextResponse.json(
          { success: false, error: 'Trop de tentatives de connexion. Veuillez patienter.' },
          { status: 429, headers: { 'Retry-After': String(loginRate.retryAfterSeconds) } }
        );
      }

      const { identifier, password } = body;
      const cleanId = String(identifier || '').trim().toLowerCase().slice(0, 120);
      const cleanPhone = normalizeDzPhone(cleanId) || cleanId.replace(/\s+/g, '');
      const mRows = await sbSelect('merchants', '');

      if (!Array.isArray(mRows)) {
        return NextResponse.json(
          { success: false, error: 'Service de données temporairement indisponible. Veuillez réessayer.' },
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
        recordAuthFailure(ip, 'merchant', 5, 15 * 60 * 1000);
        return NextResponse.json(
          { success: false, error: 'Identifiant ou mot de passe incorrect.' },
          { status: 401 }
        );
      }

      const cleanPass = String(password || '').trim();
      const isManagerMatch = verifySecretScrypt(cleanPass, String(found.password || '123456'));
      const isCashierMatch =
        Boolean(found.cashier_pin && String(found.cashier_pin).trim().length >= 4) &&
        verifySecretScrypt(cleanPass, String(found.cashier_pin));

      if (!isManagerMatch && !isCashierMatch) {
        recordAuthFailure(ip, 'merchant', 5, 15 * 60 * 1000);
        return NextResponse.json(
          { success: false, error: 'Identifiant, mot de passe Gérant ou Code PIN Caissier incorrect.' },
          { status: 401 }
        );
      }

      clearAuthFailures(ip, 'merchant');
      const loginRole: 'MANAGER' | 'CASHIER' = isManagerMatch ? 'MANAGER' : 'CASHIER';

      // VÉRIFICATION STRICTE DES APPAREILS SIMULTANÉS (AVEC EXPIRATION AUTO APRÈS 6H AFK)
      const deviceId = sanitizePostgrestFilterValue(body.device_id || 'unknown_device', 40);
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
      // Sauvegarde (qui migre aussi automatiquement le mot de passe / PIN vers scrypt$ s'il était en clair)
      const packedRow = packMerchantForDb(found);
      await sbUpsert('merchants', packedRow, 'id');
      const updatedUnpacked = unpackMerchantFromDb(packedRow);

      const safeMerchant = stripSensitiveMerchantFields(updatedUnpacked);
      const merchantToken = createMerchantSessionToken(
        String(safeMerchant.id),
        loginRole,
        updatedUnpacked.password
      );
      logSecurityEvent('AUTH_LOGIN_SUCCESS', ip, { merchant_id: safeMerchant.id, role: loginRole }, 'INFO');

      const loginResp = NextResponse.json({
        success: true,
        merchant: safeMerchant,
        role: loginRole,
        merchant_token: merchantToken,
      });
      setMerchantAuthCookie(loginResp, merchantToken);
      return loginResp;
    }

    // ========================================================================
    // ACTION : VÉRIFICATION MOT DE PASSE GÉRANT (DEPUIS CAISSE)
    // ========================================================================
    if (action === 'verify_manager_password') {
      const verifyRate = consumeTokenBucket(ip, 'verify_manager', 8, 2);
      if (!verifyRate.allowed) {
        return NextResponse.json(
          { success: false, error: 'Trop de tentatives. Veuillez patienter.' },
          { status: 429, headers: { 'Retry-After': String(verifyRate.retryAfterSeconds) } }
        );
      }

      const targetId = ensureUuid(body.merchant_id || session?.user?.id);
      if (!canAccessMerchant(session, targetId)) {
        return NextResponse.json({ success: false, error: 'Non autorisé.' }, { status: 403 });
      }
      const passInput = String(body.password || '').trim();
      const mRows = await sbSelect('merchants', `id=eq.${encodeURIComponent(targetId)}&limit=1`);
      const unpacked = mRows && mRows.length > 0 ? unpackMerchantFromDb(mRows[0]) : null;
      if (!unpacked) {
        return NextResponse.json({ success: false, error: 'Commerce introuvable.' }, { status: 404 });
      }
      if (verifySecretScrypt(passInput, String(unpacked.password || '123456'))) {
        clearAuthFailures(ip, 'merchant');
        const managerToken = createMerchantSessionToken(unpacked.id, 'MANAGER', unpacked.password);
        const resp = NextResponse.json({ success: true, role: 'MANAGER', merchant_token: managerToken });
        setMerchantAuthCookie(resp, managerToken);
        return resp;
      }
      recordAuthFailure(ip, 'merchant', 5, 15 * 60 * 1000);
      return NextResponse.json({ success: false, error: 'Mot de passe Gérant incorrect.' }, { status: 401 });
    }

    // ========================================================================
    // RÈGLE 17 : LIENS / JETONS DE RÉINITIALISATION DE MOT DE PASSE EXPIRABLES (15 MIN, USAGE UNIQUE)
    // ========================================================================
    if (action === 'request_password_reset') {
      const resetRate = consumeTokenBucket(ip, 'password_reset_req', 5, 0.5);
      if (!resetRate.allowed) {
        return NextResponse.json(
          { success: false, error: 'Trop de demandes de réinitialisation. Veuillez patienter.' },
          { status: 429, headers: { 'Retry-After': String(resetRate.retryAfterSeconds) } }
        );
      }

      const cleanId = String(body.identifier || '').trim().toLowerCase();
      const cleanPhone = normalizeDzPhone(cleanId);
      const mRows = await sbSelect('merchants', '');
      if (Array.isArray(mRows)) {
        const unpackedList = mRows.map(unpackMerchantFromDb);
        const found = unpackedList.find((m: any) => {
          if (!m) return false;
          return (
            (cleanPhone && normalizeDzPhone(m.phone) === cleanPhone) ||
            (cleanId && String(m.email || '').toLowerCase() === cleanId) ||
            (cleanId && String(m.slug || '').toLowerCase() === cleanId)
          );
        });

        if (found) {
          const rawResetToken = crypto.randomBytes(32).toString('hex');
          const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');
          found.reset_token_hash = tokenHash;
          found.reset_token_exp = Date.now() + 15 * 60 * 1000; // Expire dans 15 minutes
          await sbUpsert('merchants', packMerchantForDb(found), 'id');
          logSecurityEvent('PASSWORD_RESET_REQUESTED', ip, { merchant_id: found.id }, 'INFO');
        }
      }

      return NextResponse.json({
        success: true,
        expires_in_minutes: 15,
        message: 'Si ce compte existe, un jeton de réinitialisation valable 15 minutes a été généré.',
      });
    }

    if (action === 'confirm_password_reset') {
      const confirmRate = consumeTokenBucket(ip, 'password_reset_confirm', 5, 0.5);
      if (!confirmRate.allowed) {
        return NextResponse.json(
          { success: false, error: 'Trop de tentatives. Veuillez patienter.' },
          { status: 429, headers: { 'Retry-After': String(confirmRate.retryAfterSeconds) } }
        );
      }

      const rawToken = String(body.reset_token || '').trim();
      const newPassword = String(body.new_password || '').trim();
      const targetId = ensureUuid(body.merchant_id);

      if (!rawToken || rawToken.length < 32 || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Jeton invalide ou nouveau mot de passe trop court (min. 6 caractères).' },
          { status: 400 }
        );
      }

      const mRows = await sbSelect('merchants', `id=eq.${encodeURIComponent(targetId)}&limit=1`);
      const found = mRows && mRows.length > 0 ? unpackMerchantFromDb(mRows[0]) : null;
      if (!found || !found.reset_token_hash || !found.reset_token_exp || Date.now() > found.reset_token_exp) {
        return NextResponse.json(
          { success: false, error: 'Le lien de réinitialisation a expiré (limite de 15 minutes) ou a déjà été utilisé.' },
          { status: 400 }
        );
      }

      const candidateHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const a = Buffer.from(candidateHash, 'hex');
      const b = Buffer.from(String(found.reset_token_hash), 'hex');
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return NextResponse.json({ success: false, error: 'Jeton de réinitialisation invalide.' }, { status: 401 });
      }

      // Invalidation immédiate du jeton (usage unique) + hachage du nouveau mot de passe + révocation des anciennes sessions
      found.password = hashSecretScrypt(newPassword);
      found.reset_token_hash = '';
      found.reset_token_exp = 0;
      found.active_device_ids = '';
      const packed = packMerchantForDb(found);
      await sbUpsert('merchants', packed, 'id');
      logSecurityEvent('PASSWORD_RESET_COMPLETED', ip, { merchant_id: found.id }, 'INFO');

      const unpackedAfter = unpackMerchantFromDb(packed);
      const freshToken = createMerchantSessionToken(found.id, 'MANAGER', unpackedAfter.password);
      const resp = NextResponse.json({
        success: true,
        merchant: stripSensitiveMerchantFields(unpackedAfter),
        merchant_token: freshToken,
      });
      setMerchantAuthCookie(resp, freshToken);
      return resp;
    }

    // ========================================================================
    // ACTION : DÉCONNEXION ET INVALIDATION DE SESSION
    // ========================================================================
    if (action === 'logout_merchant') {
      const merchantId = session?.user?.id && session.user.id !== 'admin' ? session.user.id : body.merchant_id;
      const deviceId = sanitizePostgrestFilterValue(body.device_id || '', 40);
      if (merchantId && (session?.user?.isAdmin || (session && canAccessMerchant(session, merchantId)))) {
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
        logoutResp.cookies.set('fidelitydz_session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 0,
        });
        logoutResp.cookies.set('fidelitydz_admin_session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 0,
        });
      }
      return logoutResp;
    }

    if (action === 'save_owner_whatsapp') {
      const cleanWa = String(body.owner_whatsapp || '').replace(/\D/g, '').slice(0, 15);
      await sbUpsert(
        'platform_settings',
        {
          id: 1,
          platform_name: 'FidelityDZ',
          plan_price_dzd: 3900,
          trial_days: 14,
          chargily_mode: `test|${cleanWa}`,
        },
        'id'
      );
      logSecurityEvent('ADMIN_ACTION', ip, { action: 'save_owner_whatsapp' }, 'INFO');
      return NextResponse.json({ success: true, owner_whatsapp: cleanWa });
    }

    if (action === 'save_owner_instagram') {
      const cleanIg = String(body.owner_instagram || '').trim().slice(0, 150);
      await sbUpsert(
        'platform_settings',
        {
          id: 1,
          platform_name: 'FidelityDZ',
          plan_price_dzd: 3900,
          trial_days: 14,
          owner_instagram: cleanIg,
        },
        'id'
      );
      logSecurityEvent('ADMIN_ACTION', ip, { action: 'save_owner_instagram' }, 'INFO');
      return NextResponse.json({ success: true, owner_instagram: cleanIg });
    }

    if (action === 'increment_push') {
      const merchantId = ensureUuid(body.merchant_id || session?.user?.id);
      const mRows = await sbSelect('merchants', `id=eq.${encodeURIComponent(merchantId)}&limit=1`);
      if (!mRows || mRows.length === 0) {
        return NextResponse.json({ success: false, error: 'Commerce introuvable.' }, { status: 404 });
      }
      const unpacked = unpackMerchantFromDb(mRows[0]);
      if (!canAccessMerchant(session, merchantId, unpacked)) {
        return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 403 });
      }

      if (isMerchantSubExpired(unpacked)) {
        return NextResponse.json(
          {
            success: false,
            quota_exceeded: true,
            error: 'Votre abonnement est expiré. Renouvelez votre abonnement pour envoyer des notifications Push.',
          },
          { status: 403 }
        );
      }

      const countToSend = Math.max(1, Math.min(100, Math.floor(Number(body.count || 1))));
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
      const parentId = ensureUuid(body.parent_merchant_id || session?.user?.id);
      if (!canAccessMerchant(session, parentId)) {
        return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 403 });
      }
      const branchName = sanitizeString(body.business_name || '', 80);
      if (branchName.length < 2) {
        return NextResponse.json(
          { success: false, error: 'Le nom du point de vente doit contenir au moins 2 caractères.' },
          { status: 400 }
        );
      }
      const branchWilaya = sanitizeString(body.wilaya || '16 - Alger', 80);
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
        merchant: stripSensitiveMerchantFields(unpackMerchantFromDb(dbBranch)),
      });
    }

    // ========================================================================
    // ACTION : CRÉATION / MISE À JOUR COMMERÇANT (VALIDATION SERVEUR + UPLOAD MAGIC BYTES)
    // ========================================================================
    if (action === 'save_merchant') {
      const rawM = body.merchant || {};
      const targetId = ensureUuid(rawM.id || rawM.slug);
      const existingRows = await sbSelect('merchants', `id=eq.${encodeURIComponent(targetId)}&limit=1`);
      const existingM = existingRows && existingRows.length > 0 ? unpackMerchantFromDb(existingRows[0]) : null;
      const isOwnerAdmin = Boolean(session?.user?.isAdmin);

      // Si c'est une nouvelle inscription publique, appliquer un Rate Limit strict (5 inscriptions / 10 min par IP)
      if (!existingM && !isOwnerAdmin) {
        const signupRate = consumeTokenBucket(ip, 'merchant_signup', 5, 0.5);
        if (!signupRate.allowed) {
          return NextResponse.json(
            { success: false, error: 'Trop de créations de comptes depuis cette connexion. Veuillez patienter.' },
            { status: 429, headers: { 'Retry-After': String(signupRate.retryAfterSeconds) } }
          );
        }
      }

      // Si le commerce existe déjà, exiger que la requête provienne de la session authentifiée de ce commerçant ou du Propriétaire
      if (existingM && !canAccessMerchant(session, existingM.id, existingM)) {
        logSecurityEvent('UNAUTHORIZED_ACCESS', ip, { action: 'save_merchant', targetId }, 'WARN');
        return NextResponse.json(
          { success: false, error: 'Accès non autorisé : vous ne pouvez modifier que votre propre commerce.' },
          { status: 403 }
        );
      }

      // Règle 6 : Validation serveur des champs commerçant lors d'une création
      if (!existingM) {
        const valRes = Schemas.merchantInput(rawM);
        if (!valRes.success) {
          return NextResponse.json({ success: false, error: valRes.error }, { status: 400 });
        }
      }

      // Règle 18 : Validation stricte du logo uploadé (Magic Bytes + Max 2 Mo)
      if (rawM.logo_url && !String(rawM.logo_url).startsWith('__AUTH__:')) {
        const logoCheck = validateBase64ImageServer(rawM.logo_url, 2 * 1024 * 1024, true);
        if (!logoCheck.success) {
          logSecurityEvent('UPLOAD_REJECTED', ip, { field: 'logo_url', error: logoCheck.error }, 'WARN');
          return NextResponse.json({ success: false, error: logoCheck.error }, { status: 400 });
        }
        rawM.logo_url = logoCheck.data;
      }

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

      // Préserver le hash du PIN caissier si l'interface renvoie le masque '••••'
      let nextCashierPin = existingM?.cashier_pin || '';
      if (rawM.cashier_pin !== undefined && rawM.cashier_pin !== '••••') {
        nextCashierPin = String(rawM.cashier_pin).trim();
      }

      const mergedMerchant = {
        ...(existingM || {}),
        ...rawM,
        id: targetId,
        password: rawM.password ? hashSecretScrypt(rawM.password) : existingM?.password || hashSecretScrypt('123456'),
        cashier_pin: nextCashierPin ? hashSecretScrypt(nextCashierPin) : '',
        scan_cooldown_minutes: Math.max(
          0,
          Math.min(1440, Number(rawM.scan_cooldown_minutes ?? existingM?.scan_cooldown_minutes ?? 15))
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
          { success: false, error: 'Impossible d\'enregistrer les modifications du commerce.' },
          { status: 500 }
        );
      }

      const savedMerchantRow = Array.isArray(mRes.data) && mRes.data[0] ? mRes.data[0] : dbMerchant;
      const unpacked = unpackMerchantFromDb(savedMerchantRow);
      const safeReturnedMerchant = stripSensitiveMerchantFields(unpacked);

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

      let savedProg = null;
      if (program) {
        const dbProg = packProgramForDb(program, dbMerchant.id);
        await sbUpsert('loyalty_programs', dbProg, 'id');
        savedProg = dbProg;
      }

      const freshToken = !isOwnerAdmin
        ? createMerchantSessionToken(dbMerchant.id, 'MANAGER', unpacked.password)
        : undefined;
      const resp = NextResponse.json({
        success: true,
        merchant: safeReturnedMerchant,
        ...(savedProg ? { program: savedProg } : {}),
        ...(freshToken ? { merchant_token: freshToken } : {}),
      });
      if (freshToken) {
        setMerchantAuthCookie(resp, freshToken);
      }
      return resp;
    }

    if (action === 'save_program') {
      const { program } = body;
      if (!program || typeof program !== 'object') {
        return NextResponse.json({ success: false, error: 'Données du programme invalides.' }, { status: 400 });
      }
      const mUuid = ensureUuid(program.merchant_id || session?.user?.id);
      if (!canAccessMerchant(session, mUuid)) {
        return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 403 });
      }
      const dbProg = packProgramForDb(program, mUuid);
      const pRes = await sbUpsert('loyalty_programs', dbProg, 'id');
      return NextResponse.json({
        success: pRes.ok,
        program: Array.isArray(pRes.data) && pRes.data[0] ? pRes.data[0] : dbProg,
      });
    }

    // ========================================================================
    // ACTION : SAUVEGARDE DE CARTE / TRANSACTION (PROTECTION CONTRE AUTO-AJOUT DE TAMPONS)
    // ========================================================================
    if (action === 'save_card') {
      const { card, transaction } = body;
      if (!card || typeof card !== 'object') {
        return NextResponse.json({ success: false, error: 'Données de carte invalides.' }, { status: 400 });
      }
      const normPhone = normalizeDzPhone(card?.customer_phone);
      const mId = ensureUuid(card?.merchant_id);

      const isGoogleBonus = transaction && transaction.action_type === 'GOOGLE_REVIEW_BONUS';
      const isCashierMutation =
        transaction && ['ADD_STAMP', 'ADD_POINTS', 'REDEEM_REWARD'].includes(transaction.action_type);

      // Règle 3 & 6 : Seul le commerçant/caissier authentifié peut créditer des tampons, points ou valider un cadeau !
      if (isCashierMutation && !canAccessMerchant(session, mId)) {
        logSecurityEvent('UNAUTHORIZED_ACCESS', ip, { action: 'save_card', txType: transaction.action_type }, 'CRITICAL');
        return NextResponse.json(
          { success: false, error: 'Accès refusé : session caisse ou gérant requise pour créditer une carte.' },
          { status: 403 }
        );
      }

      const existingMerchantCards = await sbSelect(
        'customer_cards',
        `merchant_id=eq.${encodeURIComponent(mId)}`
      );
      const duplicateCard = Array.isArray(existingMerchantCards)
        ? existingMerchantCards.find((c: any) => normalizeDzPhone(c.customer_phone) === normPhone || c.id === card.id)
        : null;

      if (isGoogleBonus) {
        if (!duplicateCard) {
          return NextResponse.json({ success: false, error: 'Carte introuvable.' }, { status: 404 });
        }
        const existingTx = await sbSelect(
          'loyalty_transactions',
          `card_id=eq.${encodeURIComponent(duplicateCard.id)}&action_type=eq.GOOGLE_REVIEW_BONUS&limit=1`
        );
        if (existingTx && existingTx.length > 0) {
          return NextResponse.json({
            success: false,
            already_claimed: true,
            card: { ...duplicateCard, google_review_claimed: true },
          });
        }

        // Calculer le bonus strictement côté serveur à partir de la configuration du commerçant
        const [mRows, pRows] = await Promise.all([
          sbSelect('merchants', `id=eq.${encodeURIComponent(mId)}&limit=1`),
          sbSelect('loyalty_programs', `merchant_id=eq.${encodeURIComponent(mId)}&limit=1`),
        ]);
        const merchantObj = mRows && mRows.length > 0 ? unpackMerchantFromDb(mRows[0]) : null;
        const progObj = pRows && pRows.length > 0 ? pRows[0] : null;
        if (!merchantObj || !merchantObj.google_review_reward_enabled) {
          return NextResponse.json(
            { success: false, error: 'Bonus Google Maps non activé pour ce commerce.' },
            { status: 403 }
          );
        }

        const bonusCount = Math.max(1, Math.min(5, Number(merchantObj.google_review_reward_bonus || 1)));
        const stampsReq = Number(progObj?.stamps_required || 10);
        let newStamps = Number(duplicateCard.stamps_balance || 0);
        let newPoints = Number(duplicateCard.points_balance || 0);
        let newRewards = Number(duplicateCard.rewards_available || 0);
        let deltaVal = bonusCount;

        if (progObj?.program_type === 'POINTS') {
          deltaVal = bonusCount * 10;
          newPoints += deltaVal;
        } else {
          newStamps += bonusCount;
          if (newStamps >= stampsReq) {
            newRewards += Math.floor(newStamps / stampsReq);
            newStamps = newStamps % stampsReq;
          }
        }

        const safeGoogleCard = packCardForDb({
          ...duplicateCard,
          stamps_balance: newStamps,
          points_balance: newPoints,
          rewards_available: newRewards,
          last_visit_at: new Date().toISOString(),
        });
        const cRes = await sbUpsert('customer_cards', safeGoogleCard, 'id');
        const dbTx = packTxForDb({
          id: ensureUuid(`tx-gr-${duplicateCard.id}`),
          card_id: duplicateCard.id,
          merchant_id: mId,
          performed_by: 'Client (Google Maps)',
          action_type: 'GOOGLE_REVIEW_BONUS',
          delta_value: deltaVal,
          purchase_amount_dzd: 0,
        });
        await sbUpsert('loyalty_transactions', dbTx, 'id');
        return NextResponse.json({
          success: cRes.ok,
          card: { ...safeGoogleCard, google_review_claimed: true },
        });
      }

      // Si un client non connecté appelle save_card sans transaction autorisée sur une carte déjà existante, bloquer la modification du solde
      if (duplicateCard && !canAccessMerchant(session, mId)) {
        return NextResponse.json({
          success: true,
          card: duplicateCard,
        });
      }

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
      const enrollRate = consumeTokenBucket(ip, 'customer_enroll', 15, 5);
      if (!enrollRate.allowed) {
        return NextResponse.json(
          { success: false, error: 'Trop de demandes. Veuillez patienter un instant.' },
          { status: 429, headers: { 'Retry-After': String(enrollRate.retryAfterSeconds) } }
        );
      }

      const { merchantSlug, phone, name } = body;
      const cleanSlug = sanitizePostgrestFilterValue(String(merchantSlug || '').toLowerCase(), 60);
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

      const mRows = await sbSelect('merchants', `slug=eq.${encodeURIComponent(cleanSlug)}&limit=1`);
      const merchant = mRows && mRows.length > 0 ? unpackMerchantFromDb(mRows[0]) : null;
      if (!merchant) {
        return NextResponse.json({ success: false, error: 'Ce commerce est introuvable.' }, { status: 404 });
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
      const safeName = sanitizeString(name || '', 60) || `Client ${cleanPhone.slice(-4)}`;
      const newCard = packCardForDb({
        id: deterministicCardId,
        merchant_id: merchant.id,
        program_id: program.id,
        customer_phone: cleanPhone,
        customer_name: safeName,
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
          { success: false, error: 'Impossible de générer la carte pour le moment.' },
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
      const valRes = Schemas.offerInput(offer);
      if (!valRes.success) {
        return NextResponse.json({ success: false, error: valRes.error }, { status: 400 });
      }

      if (offer?.image_url) {
        const imgCheck = validateBase64ImageServer(offer.image_url, 3 * 1024 * 1024, true);
        if (!imgCheck.success) {
          logSecurityEvent('UPLOAD_REJECTED', ip, { field: 'offer.image_url', error: imgCheck.error }, 'WARN');
          return NextResponse.json({ success: false, error: imgCheck.error }, { status: 400 });
        }
        offer.image_url = imgCheck.data;
      }

      const dbOffer = packOfferForDb({
        ...offer,
        merchant_id: offer.merchant_id || session?.user?.id,
      });

      const mRows = await sbSelect('merchants', `id=eq.${encodeURIComponent(dbOffer.merchant_id)}&limit=1`);
      const unpackedM = mRows && mRows.length > 0 ? unpackMerchantFromDb(mRows[0]) : null;

      if (!canAccessMerchant(session, dbOffer.merchant_id, unpackedM)) {
        return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 403 });
      }

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

      // Règle 3 : Vérifier que l'offre appartient bien au commerçant connecté avant suppression (Protection IDOR)
      const offerRows = await sbSelect('personalized_offers', `id=eq.${encodeURIComponent(oUuid)}&limit=1`);
      const targetOffer = offerRows && offerRows.length > 0 ? offerRows[0] : null;
      if (!targetOffer) {
        return NextResponse.json({ success: false, error: 'Offre introuvable.' }, { status: 404 });
      }
      if (!canAccessMerchant(session, targetOffer.merchant_id)) {
        logSecurityEvent('UNAUTHORIZED_ACCESS', ip, { action: 'delete_offer', offerId: oUuid }, 'WARN');
        return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 403 });
      }

      const res = await sbRequest(`personalized_offers?id=eq.${encodeURIComponent(oUuid)}`, 'DELETE');
      return NextResponse.json({ success: res.ok, error: res.ok ? null : 'Impossible de supprimer cette offre.' });
    }

    if (action === 'save_payment') {
      const { payment } = body;
      if (!payment || typeof payment !== 'object') {
        return NextResponse.json({ success: false, error: 'Données de paiement invalides.' }, { status: 400 });
      }

      const targetMerchantId = ensureUuid(payment.merchant_id || session?.user?.id);
      if (!canAccessMerchant(session, targetMerchantId)) {
        return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 403 });
      }

      // Règle 18 : Validation stricte du reçu uploadé (Magic Bytes + Max 5 Mo)
      if (payment.receipt_url) {
        const receiptCheck = validateBase64ImageServer(payment.receipt_url, 5 * 1024 * 1024, true);
        if (!receiptCheck.success) {
          logSecurityEvent('UPLOAD_REJECTED', ip, { field: 'payment.receipt_url', error: receiptCheck.error }, 'WARN');
          return NextResponse.json({ success: false, error: receiptCheck.error }, { status: 400 });
        }
        payment.receipt_url = receiptCheck.data;
      }

      const isAdminCaller = Boolean(session?.user?.isAdmin);
      const dbPay = packPaymentForDb({ ...payment, merchant_id: targetMerchantId }, isAdminCaller);
      const payRes = await sbUpsert('subscription_payments', dbPay, 'id');
      return NextResponse.json({
        success: payRes.ok,
        payment: unpackPaymentFromDb(Array.isArray(payRes.data) && payRes.data[0] ? payRes.data[0] : dbPay),
      });
    }

    if (action === 'update_payment_and_merchant') {
      const { payment, merchant } = body;
      if (payment) {
        const dbPay = packPaymentForDb(payment, true);
        await sbUpsert('subscription_payments', dbPay, 'id');
      }
      if (merchant) {
        const targetId = ensureUuid(merchant.id);
        const existingRows = await sbSelect('merchants', `id=eq.${encodeURIComponent(targetId)}&limit=1`);
        const existingM = existingRows && existingRows.length > 0 ? unpackMerchantFromDb(existingRows[0]) : null;
        const merged = {
          ...(existingM || {}),
          ...merchant,
          password:
            merchant.password && merchant.password !== '••••'
              ? hashSecretScrypt(merchant.password)
              : existingM?.password || hashSecretScrypt('123456'),
          cashier_pin:
            merchant.cashier_pin !== undefined && merchant.cashier_pin !== '••••'
              ? merchant.cashier_pin
                ? hashSecretScrypt(merchant.cashier_pin)
                : ''
              : existingM?.cashier_pin || '',
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
      logSecurityEvent('ADMIN_ACTION', ip, { action: 'update_payment_and_merchant', merchant_id: merchant?.id }, 'INFO');
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
      logSecurityEvent('ADMIN_ACTION', ip, { action: 'delete_merchant', merchant_id: mUuid }, 'CRITICAL');
      return NextResponse.json({ success: res.ok, error: res.ok ? null : 'Impossible de supprimer ce commerce.' });
    }

    return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erreur lors du traitement, veuillez réessayer.' },
      { status: 500 }
    );
  }
}
