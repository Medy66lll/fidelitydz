// ============================================================================
// FidelityDZ — Module de Sécurité & Validation Stricte (27-Point Security Hardened)
// Validation Client & Serveur, Anti-XSS, Token Bucket Rate Limiting, Magic Bytes Upload, Audit Logs
// ============================================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------------------------------
// RÈGLE 7 : PROTECTION XSS & SANITIZATION DES URLS / ENTRÉES
// ----------------------------------------------------------------------------
export function sanitizeString(input: unknown, maxLength = 250): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeSafeUrl(input: unknown, maxLength = 300): string {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim().slice(0, maxLength);
  if (!trimmed) return '';
  if (/^(javascript|vbscript|data|file|blob)\s*:/i.test(trimmed)) {
    return '';
  }
  if (/^https?:\/\/[^\s<>"']+$/i.test(trimmed)) {
    return trimmed;
  }
  // Allow clean social handles (e.g. @store or store_dz) by stripping dangerous chars
  return trimmed.replace(/[<>"'`\\]/g, '');
}

// ----------------------------------------------------------------------------
// RÈGLE 10 : PROTECTION ANTI-INJECTION SUR LES FILTRES POSTGREST / SQL
// ----------------------------------------------------------------------------
export const REGEX_DZ_PHONE = /^(05|06|07)[0-9]{8}$/;
export const REGEX_SLUG = /^[a-z0-9-]{2,60}$/;
export const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const REGEX_HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export function isSafeUuid(val: unknown): boolean {
  return typeof val === 'string' && REGEX_UUID.test(val.trim());
}

export function isSafeSlug(val: unknown): boolean {
  return typeof val === 'string' && REGEX_SLUG.test(val.trim().toLowerCase());
}

export function sanitizePostgrestFilterValue(val: unknown, maxLen = 80): string {
  if (typeof val !== 'string') return '';
  // Strip PostgREST meta-characters: commas, parens, wildcards, quotes, semicolons
  return val.replace(/[,()*%'"\\;\r\n]/g, '').trim().slice(0, maxLen);
}

export function normalizeDzPhone(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00213') && digits.length >= 14) {
    digits = '0' + digits.slice(5);
  } else if (digits.startsWith('213') && digits.length === 12) {
    digits = '0' + digits.slice(3);
  } else if (digits.length === 9 && /^[567]/.test(digits)) {
    digits = '0' + digits;
  }
  return digits.slice(0, 10);
}

// ----------------------------------------------------------------------------
// RÈGLE 6 : SCHÉMAS DE VALIDATION SERVEUR & CLIENT STRICTS
// ----------------------------------------------------------------------------
export const Schemas = {
  merchantInput(raw: any): ValidationResult<{
    business_name: string;
    slug: string;
    category: string;
    wilaya: string;
    phone: string;
    email: string;
    password?: string;
    address?: string;
    logo_url?: string;
  }> {
    if (!raw || typeof raw !== 'object') {
      return { success: false, error: 'Données commerçant invalides.' };
    }
    const business_name = sanitizeString(raw.business_name, 80);
    if (business_name.length < 2) {
      return { success: false, error: 'Le nom du commerce doit contenir entre 2 et 80 caractères.' };
    }

    const phone = normalizeDzPhone(raw.phone);
    if (!REGEX_DZ_PHONE.test(phone)) {
      return {
        success: false,
        error: 'Numéro de téléphone algérien invalide (format requis : 05, 06 ou 07 suivi de 8 chiffres).',
      };
    }

    const rawSlug = typeof raw.slug === 'string' ? raw.slug.toLowerCase().trim() : '';
    const slug = rawSlug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
    if (!slug || slug.length < 2) {
      return { success: false, error: 'Identifiant URL (slug) invalide.' };
    }

    const category = sanitizeString(raw.category || 'Commerce', 60);
    const wilaya = sanitizeString(raw.wilaya || '16 - Alger', 80);
    const address = sanitizeString(raw.address || '', 200);
    const email = sanitizeString(raw.email || '', 120);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Une adresse email valide est obligatoire pour votre compte commerce.' };
    }
    const password = typeof raw.password === 'string' ? raw.password.trim().slice(0, 100) : undefined;

    if (password !== undefined && password.length > 0 && password.length < 6) {
      return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères.' };
    }

    return {
      success: true,
      data: { business_name, slug, category, wilaya, phone, email, password, address, logo_url: raw.logo_url },
    };
  },

  customerEnrollInput(raw: any): ValidationResult<{
    merchant_id: string;
    customer_phone: string;
    customer_name: string;
  }> {
    if (!raw || typeof raw !== 'object') {
      return { success: false, error: 'Données client invalides.' };
    }
    const merchant_id = sanitizeString(raw.merchant_id, 80);
    if (!merchant_id) {
      return { success: false, error: 'Commerce non identifié.' };
    }

    const customer_phone = normalizeDzPhone(raw.customer_phone || raw.phone);
    if (!REGEX_DZ_PHONE.test(customer_phone)) {
      return {
        success: false,
        error: 'Numéro de téléphone invalide (entrez un numéro 05, 06 ou 07 à 10 chiffres).',
      };
    }

    const customer_name = sanitizeString(raw.customer_name || raw.name || '', 60);
    if (!customer_name || customer_name.length < 2) {
      return {
        success: false,
        error: 'Le prénom du client est obligatoire (minimum 2 caractères).',
      };
    }

    return {
      success: true,
      data: { merchant_id, customer_phone, customer_name },
    };
  },

  offerInput(raw: any): ValidationResult<{
    title_fr: string;
    title_ar: string;
    description_fr: string;
    description_ar: string;
    target_segment: 'ALL' | 'VIP' | 'INACTIVE_30D';
  }> {
    if (!raw || typeof raw !== 'object') {
      return { success: false, error: 'Données offre invalides.' };
    }
    const title_fr = sanitizeString(raw.title_fr, 120);
    if (title_fr.length < 3) {
      return { success: false, error: "Le titre de l'offre doit contenir au moins 3 caractères." };
    }
    const title_ar = sanitizeString(raw.title_ar || '', 120);
    const description_fr = sanitizeString(raw.description_fr || '', 300);
    const description_ar = sanitizeString(raw.description_ar || '', 300);
    const allowedSegments = ['ALL', 'VIP', 'INACTIVE_30D'] as const;
    const target_segment = allowedSegments.includes(raw.target_segment) ? raw.target_segment : 'ALL';

    return {
      success: true,
      data: { title_fr, title_ar, description_fr, description_ar, target_segment },
    };
  },

  paymentInput(raw: any): ValidationResult<{
    transaction_reference: string;
    amount_dzd: number;
    payment_method: 'BARIDIMOB' | 'CCP_RECEIPT' | 'CHARGILY_PAY';
  }> {
    if (!raw || typeof raw !== 'object') {
      return { success: false, error: 'Données de paiement invalides.' };
    }
    const transaction_reference = sanitizeString(raw.transaction_reference, 120);
    if (transaction_reference.length < 3) {
      return { success: false, error: 'La référence de transaction est requise (min. 3 caractères).' };
    }
    const amount_dzd = Math.max(400, Math.min(100000, Number(raw.amount_dzd) || 3900));
    const allowedMethods = ['BARIDIMOB', 'CCP_RECEIPT', 'CHARGILY_PAY'] as const;
    const payment_method = allowedMethods.includes(raw.payment_method) ? raw.payment_method : 'BARIDIMOB';

    return {
      success: true,
      data: { transaction_reference, amount_dzd, payment_method },
    };
  },
};

// ----------------------------------------------------------------------------
// RÈGLE 18 : VALIDATION STRICTE DES FICHIERS UPLOADÉS (MIME + Extension + Magic Bytes + Taille)
// ----------------------------------------------------------------------------
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB max

export function validateUploadedFile(file: {
  name: string;
  type: string;
  size: number;
}): ValidationResult<true> {
  if (!file) {
    return { success: false, error: 'Aucun fichier sélectionné.' };
  }
  if (file.size <= 0 || file.size > MAX_UPLOAD_SIZE_BYTES) {
    return {
      success: false,
      error: 'Le fichier dépasse la taille maximale autorisée de 5 Mo.',
    };
  }
  const lowerName = (file.name || '').toLowerCase().trim();
  const dotIndex = lowerName.lastIndexOf('.');
  const ext = dotIndex >= 0 ? lowerName.slice(dotIndex) : '';

  if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      success: false,
      error: 'Format de fichier non autorisé. Utilisez uniquement JPG, PNG ou WEBP.',
    };
  }
  return { success: true, data: true };
}

function decodeBase64Prefix(b64: string, maxBytes = 16): number[] {
  const clean = b64.replace(/\s+/g, '').slice(0, 64);
  if (!clean) return [];
  try {
    if (typeof Buffer !== 'undefined') {
      const buf = Buffer.from(clean, 'base64');
      return Array.from(buf.subarray(0, maxBytes));
    }
    if (typeof atob === 'function') {
      const bin = atob(clean);
      const out: number[] = [];
      for (let i = 0; i < Math.min(bin.length, maxBytes); i++) {
        out.push(bin.charCodeAt(i));
      }
      return out;
    }
  } catch {}
  return [];
}

/**
 * Vérifie côté serveur le type réel (Magic Bytes : JPEG FF D8 FF, PNG 89 50 4E 47, WEBP RIFF..WEBP)
 * et la taille maximale d'une image encodée en Base64 ou d'une URL https://.
 */
export function validateBase64ImageServer(
  rawUrlOrData: unknown,
  maxBytes = MAX_UPLOAD_SIZE_BYTES,
  allowEmpty = true
): ValidationResult<string> {
  if (rawUrlOrData === undefined || rawUrlOrData === null || rawUrlOrData === '') {
    return allowEmpty
      ? { success: true, data: '' }
      : { success: false, error: 'Fichier image obligatoire.' };
  }
  if (typeof rawUrlOrData !== 'string') {
    return { success: false, error: 'Format de fichier invalide.' };
  }
  const trimmed = rawUrlOrData.trim();
  if (!trimmed) {
    return allowEmpty
      ? { success: true, data: '' }
      : { success: false, error: 'Fichier image obligatoire.' };
  }

  // Reject dangerous schemes (SVG, HTML, JS, executable data URLs)
  if (/^(javascript|vbscript|file):/i.test(trimmed) || /^data:(?!image\/(jpeg|jpg|png|webp);base64,)/i.test(trimmed)) {
    return {
      success: false,
      error: 'Type de fichier refusé par sécurité. Seuls JPG, PNG et WEBP sont acceptés.',
    };
  }

  if (/^https:\/\/[^\s<>"']+$/i.test(trimmed)) {
    return { success: true, data: trimmed.slice(0, 500) };
  }

  const match = /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/i.exec(trimmed);
  if (!match) {
    return {
      success: false,
      error: 'Format image non reconnu. Utilisez uniquement JPG, PNG ou WEBP.',
    };
  }

  const declaredSubType = match[1].toLowerCase();
  const base64Body = match[2].replace(/\s+/g, '');
  const estimatedByteLength = Math.floor((base64Body.length * 3) / 4);

  if (estimatedByteLength > maxBytes) {
    const maxMb = (maxBytes / (1024 * 1024)).toFixed(1);
    return {
      success: false,
      error: `L'image dépasse la taille maximale autorisée (${maxMb} Mo).`,
    };
  }

  // Vérification des Magic Bytes réels du binaire (pas seulement l'extension / MIME déclaré)
  const magic = decodeBase64Prefix(base64Body, 16);
  if (magic.length < 8) {
    return { success: false, error: 'Fichier image vide ou corrompu.' };
  }

  const isJpeg = magic[0] === 0xff && magic[1] === 0xd8 && magic[2] === 0xff;
  const isPng =
    magic[0] === 0x89 &&
    magic[1] === 0x50 &&
    magic[2] === 0x4e &&
    magic[3] === 0x47 &&
    magic[4] === 0x0d &&
    magic[5] === 0x0a &&
    magic[6] === 0x1a &&
    magic[7] === 0x0a;
  const isWebp =
    magic[0] === 0x52 &&
    magic[1] === 0x49 &&
    magic[2] === 0x46 &&
    magic[3] === 0x46 &&
    magic[8] === 0x57 &&
    magic[9] === 0x45 &&
    magic[10] === 0x42 &&
    magic[11] === 0x50;

  if (
    ((declaredSubType === 'jpeg' || declaredSubType === 'jpg') && !isJpeg) ||
    (declaredSubType === 'png' && !isPng) ||
    (declaredSubType === 'webp' && !isWebp)
  ) {
    return {
      success: false,
      error: 'Signature binaire du fichier invalide (le contenu réel ne correspond pas à une image JPG/PNG/WEBP).',
    };
  }

  return { success: true, data: `data:image/${declaredSubType === 'jpg' ? 'jpeg' : declaredSubType};base64,${base64Body}` };
}

/**
 * RÈGLE 28 : PROTECTION SSRF (Server-Side Request Forgery)
 * Bloque l'accès aux réseaux internes, métadonnées cloud, et protocoles non sécurisés.
 */
export function isSafeExternalImageUrl(rawUrl: unknown): { safe: boolean; error?: string; url?: string } {
  if (typeof rawUrl !== 'string') return { safe: false, error: 'URL invalide' };
  const trimmed = rawUrl.trim();
  if (!trimmed) return { safe: false, error: 'URL vide' };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { safe: false, error: 'Format URL non valide' };
  }

  // Seul le protocole HTTPS est autorisé pour les requêtes distantes
  if (parsed.protocol !== 'https:') {
    return { safe: false, error: 'Seul le protocole HTTPS est autorisé' };
  }

  // Ne pas autoriser les identifiants utilisateur (ex: https://user:pass@host)
  if (parsed.username || parsed.password) {
    return { safe: false, error: 'Identifiants utilisateur non autorisés dans l’URL' };
  }

  // Ports non standard interdits (seul 443 autorisé pour HTTPS)
  if (parsed.port && parsed.port !== '443') {
    return { safe: false, error: 'Port non standard interdit' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Bloquer les adresses de bouclage et locales
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname === '0.0.0.0'
  ) {
    return { safe: false, error: 'Accès aux domaines internes / locaux interdit' };
  }

  // Bloquer les métadonnées Cloud (AWS, GCP, Azure, DigitalOcean)
  if (
    hostname === '169.254.169.254' ||
    hostname === 'metadata.google.internal' ||
    hostname === 'metadata' ||
    hostname.includes('metadata.google')
  ) {
    return { safe: false, error: 'Accès aux métadonnées cloud strictement interdit' };
  }

  // Bloquer les adresses IPv4 privées / réservées (127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, 100.64.0.0/10)
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const a = Number(ipv4Match[1]);
    const b = Number(ipv4Match[2]);
    if (
      a === 127 ||
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a === 0 ||
      a >= 224
    ) {
      return { safe: false, error: 'Accès aux adresses IP privées / réservées interdit' };
    }
  }

  // Bloquer les adresses IPv6 (entre crochets ou avec deux-points)
  if (hostname.startsWith('[') || hostname.includes(':')) {
    return { safe: false, error: 'Adresses IPv6 directes non autorisées' };
  }

  return { safe: true, url: parsed.toString() };
}

// ----------------------------------------------------------------------------
// RÈGLE 8 : JOURNALISATION & SURVEILLANCE DES ACTIVITÉS SUSPECTES (SANS SECRETS)
// ----------------------------------------------------------------------------
export type SecurityEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'ADMIN_AUTH_FAILED'
  | 'ADMIN_ACTION'
  | 'BRUTE_FORCE_LOCKOUT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'CSRF_REJECTED'
  | 'CORS_REJECTED'
  | 'UNAUTHORIZED_ACCESS'
  | 'UPLOAD_REJECTED'
  | 'WEBHOOK_INVALID_SIGNATURE'
  | 'SSRF_ATTEMPT_BLOCKED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED';

export interface SecurityAuditEntry {
  timestamp: string;
  event: SecurityEventType;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  ip: string;
  details: Record<string, unknown>;
}

const SENSITIVE_LOG_KEYS = /pass|pin|secret|token|key|authorization|cookie/i;

function getAuditStore(): SecurityAuditEntry[] {
  const g = globalThis as unknown as { __fidelitydz_security_logs?: SecurityAuditEntry[] };
  if (!g.__fidelitydz_security_logs) {
    g.__fidelitydz_security_logs = [];
  }
  return g.__fidelitydz_security_logs;
}

export function maskIp(ip: string): string {
  const clean = (ip || '127.0.0.1').trim();
  if (clean.includes('.')) {
    const parts = clean.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  return clean.slice(0, 18);
}

export function logSecurityEvent(
  event: SecurityEventType,
  ip: string,
  details: Record<string, unknown> = {},
  severity: 'INFO' | 'WARN' | 'CRITICAL' = 'WARN'
): void {
  const safeDetails: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(details)) {
    if (SENSITIVE_LOG_KEYS.test(k)) {
      safeDetails[k] = '[REDACTED]';
    } else if (typeof v === 'string') {
      safeDetails[k] = v.slice(0, 160);
    } else {
      safeDetails[k] = v;
    }
  }

  const entry: SecurityAuditEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    ip: maskIp(ip),
    details: safeDetails,
  };

  const store = getAuditStore();
  store.unshift(entry);
  if (store.length > 250) {
    store.length = 250;
  }

  if (severity === 'CRITICAL') {
    console.error(`[SECURITY ALERT - CRITICAL] ${event}`, JSON.stringify(entry));
  } else if (severity === 'WARN') {
    console.warn(`[SECURITY AUDIT - WARN] ${event}`, JSON.stringify(entry));
  }
}

export function getRecentSecurityEvents(limit = 50): SecurityAuditEntry[] {
  return getAuditStore().slice(0, limit);
}

// ----------------------------------------------------------------------------
// RÈGLE 12 : TOKEN BUCKET RATE LIMITER + PROTECTION BRUTE-FORCE (429)
// ----------------------------------------------------------------------------
interface TokenBucketState {
  tokens: number;
  lastRefillMs: number;
  lockedUntilMs: number;
  consecutiveFailures: number;
}

function getBucketMap(): Map<string, TokenBucketState> {
  const g = globalThis as unknown as { __fidelitydz_token_buckets?: Map<string, TokenBucketState> };
  if (!g.__fidelitydz_token_buckets) {
    g.__fidelitydz_token_buckets = new Map<string, TokenBucketState>();
  }
  return g.__fidelitydz_token_buckets;
}

export function consumeTokenBucket(
  ip: string,
  bucketName: string,
  capacity = 10,
  refillTokensPerMinute = 5
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const map = getBucketMap();

  // Nettoyage périodique anti-fuite mémoire
  if (map.size > 5000) {
    for (const [k, v] of map.entries()) {
      if (now - v.lastRefillMs > 3600 * 1000 && now > v.lockedUntilMs) {
        map.delete(k);
      }
    }
  }

  const key = `${bucketName}:${(ip || '127.0.0.1').trim()}`;
  let state = map.get(key);

  if (!state) {
    state = {
      tokens: capacity,
      lastRefillMs: now,
      lockedUntilMs: 0,
      consecutiveFailures: 0,
    };
    map.set(key, state);
  }

  if (state.lockedUntilMs > now) {
    const retryAfterSeconds = Math.max(1, Math.ceil((state.lockedUntilMs - now) / 1000));
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  const elapsedMinutes = Math.max(0, (now - state.lastRefillMs) / 60000);
  if (elapsedMinutes > 0) {
    const refilled = elapsedMinutes * refillTokensPerMinute;
    state.tokens = Math.min(capacity, state.tokens + refilled);
    state.lastRefillMs = now;
  }

  if (state.tokens < 1) {
    const needed = 1 - state.tokens;
    const retryAfterSeconds = Math.max(1, Math.ceil((needed / refillTokensPerMinute) * 60));
    logSecurityEvent('RATE_LIMIT_EXCEEDED', ip, { bucket: bucketName, retryAfterSeconds }, 'WARN');
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  state.tokens -= 1;
  return {
    allowed: true,
    remaining: Math.floor(state.tokens),
    retryAfterSeconds: 0,
  };
}

export function recordAuthFailure(
  ip: string,
  targetScope: string,
  maxFailuresBeforeLockout = 5,
  lockoutDurationMs = 15 * 60 * 1000
): { locked: boolean; attempts: number; retryAfterSeconds: number } {
  const now = Date.now();
  const map = getBucketMap();
  const key = `auth_lock:${targetScope}:${(ip || '127.0.0.1').trim()}`;
  let state = map.get(key);
  if (!state) {
    state = { tokens: maxFailuresBeforeLockout, lastRefillMs: now, lockedUntilMs: 0, consecutiveFailures: 0 };
    map.set(key, state);
  }

  state.consecutiveFailures += 1;
  state.lastRefillMs = now;

  if (state.consecutiveFailures >= maxFailuresBeforeLockout) {
    state.lockedUntilMs = now + lockoutDurationMs;
    const retryAfterSeconds = Math.ceil(lockoutDurationMs / 1000);
    logSecurityEvent(
      'BRUTE_FORCE_LOCKOUT',
      ip,
      { scope: targetScope, failures: state.consecutiveFailures, lockoutSeconds: retryAfterSeconds },
      'CRITICAL'
    );
    return { locked: true, attempts: state.consecutiveFailures, retryAfterSeconds };
  }

  logSecurityEvent(
    targetScope === 'admin' ? 'ADMIN_AUTH_FAILED' : 'AUTH_LOGIN_FAILED',
    ip,
    { scope: targetScope, attempt: state.consecutiveFailures },
    'WARN'
  );
  return { locked: false, attempts: state.consecutiveFailures, retryAfterSeconds: 0 };
}

export function isAuthLocked(ip: string, targetScope: string): { locked: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const map = getBucketMap();
  const key = `auth_lock:${targetScope}:${(ip || '127.0.0.1').trim()}`;
  const state = map.get(key);
  if (state && state.lockedUntilMs > now) {
    return {
      locked: true,
      retryAfterSeconds: Math.max(1, Math.ceil((state.lockedUntilMs - now) / 1000)),
    };
  }
  return { locked: false, retryAfterSeconds: 0 };
}

export function clearAuthFailures(ip: string, targetScope: string): void {
  const map = getBucketMap();
  const key = `auth_lock:${targetScope}:${(ip || '127.0.0.1').trim()}`;
  map.delete(key);
}

export function checkRateLimit(
  ip: string,
  bucketName: string,
  maxRequestsPerHour = 10
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const refillPerMin = Math.max(0.2, maxRequestsPerHour / 60);
  return consumeTokenBucket(ip, bucketName, maxRequestsPerHour, refillPerMin);
}
