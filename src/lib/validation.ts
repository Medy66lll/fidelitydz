// ============================================================================
// FidelityDZ — Module de Sécurité & Validation Stricte (Règles 1, 2, 6, 10, 11)
// Validation type Zod (Client & Serveur), Protection XSS, Rate Limiting IP, Upload
// ============================================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------------------------------
// RÈGLE 2 : PROTECTION XSS (Échappement & nettoyage de tout input utilisateur)
// ----------------------------------------------------------------------------
export function sanitizeString(input: unknown, maxLength = 250): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

// ----------------------------------------------------------------------------
// RÈGLE 1 : SCHÉMAS DE VALIDATION STRICTS (Format, Taille, Regex Algérie)
// ----------------------------------------------------------------------------
export const REGEX_DZ_PHONE = /^(05|06|07)[0-9]{8}$/;
export const REGEX_SLUG = /^[a-z0-9-]{2,60}$/;
export const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const REGEX_HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export function normalizeDzPhone(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('213') && digits.length === 12) {
    return '0' + digits.slice(3);
  }
  return digits;
}

export const Schemas = {
  // Validation inscription / mise à jour commerçant
  merchantInput(raw: any): ValidationResult<{
    business_name: string;
    slug: string;
    category: string;
    wilaya: string;
    phone: string;
    email: string;
    password?: string;
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
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Une adresse email valide est obligatoire pour votre compte commerce.' };
    }
    const password = typeof raw.password === 'string' ? raw.password.trim().slice(0, 100) : undefined;

    if (password !== undefined && password.length > 0 && password.length < 4) {
      return { success: false, error: 'Le mot de passe doit contenir au moins 4 caractères.' };
    }

    return {
      success: true,
      data: { business_name, slug, category, wilaya, phone, email, password, address, logo_url: raw.logo_url },
    };
  },

  // Validation inscription / accès carte client (05/06/07)
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

  // Validation offre personnalisée
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
    const allowedSegments = ['ALL', 'VIP', 'INACTIVE_30D'];
    const target_segment = allowedSegments.includes(raw.target_segment) ? raw.target_segment : 'ALL';

    return {
      success: true,
      data: { title_fr, title_ar, description_fr, description_ar, target_segment },
    };
  },

  // Validation preuve de paiement (BaridiMob / CCP)
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
    const amount_dzd = Math.max(100, Math.min(1000000, Number(raw.amount_dzd) || 3900));
    const allowedMethods = ['BARIDIMOB', 'CCP_RECEIPT', 'CHARGILY_PAY'];
    const payment_method = allowedMethods.includes(raw.payment_method) ? raw.payment_method : 'BARIDIMOB';

    return {
      success: true,
      data: { transaction_reference, amount_dzd, payment_method },
    };
  },
};

// ----------------------------------------------------------------------------
// RÈGLE 11 : VALIDATION STRICTE DES FICHIERS UPLOADÉS (MIME + Extension + 5MB)
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
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
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

// ----------------------------------------------------------------------------
// RÈGLE 6 : RATE LIMITING PAR IP (Max 5 soumissions / heure sur formulaires publics)
// ----------------------------------------------------------------------------
interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

export function checkRateLimit(
  ip: string,
  bucketName: string,
  maxRequestsPerHour = 5
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 heure
  const key = `${bucketName}:${ip || 'unknown'}`;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequestsPerHour - 1 };
  }

  if (current.count >= maxRequestsPerHour) {
    return { allowed: false, remaining: 0 };
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return { allowed: true, remaining: maxRequestsPerHour - current.count };
}
