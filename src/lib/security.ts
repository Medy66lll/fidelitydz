// ====================================================================
// FidelityDZ — Module de Sécurité & Validation Zod (Règles 1, 2, 6, 11)
// ====================================================================

import { z } from 'zod';

// Règle 1 : Validation des inputs utilisateur avec Zod

// Regex officielles Algérie
export const REGEX_DZ_PHONE = /^(05|06|07)[0-9]{8}$/;
export const REGEX_SLUG = /^[a-z0-9-]{2,60}$/;
export const REGEX_HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

// Schéma Téléphone Algérien (05/06/07 suivi de 8 chiffres)
export const algerianPhoneSchema = z
  .string()
  .transform((val) => {
    const digits = val.replace(/\D/g, '');
    if (digits.startsWith('213') && digits.length === 12) {
      return '0' + digits.slice(3);
    }
    return digits;
  })
  .refine((val) => REGEX_DZ_PHONE.test(val), {
    message: 'Numéro de téléphone algérien invalide (format requis : 05, 06 ou 07 suivi de 8 chiffres).',
  });

// Schéma Inscription / Édition Commerçant
export const merchantSchema = z.object({
  business_name: z
    .string()
    .min(2, 'Le nom du commerce doit contenir au moins 2 caractères.')
    .max(80, 'Le nom du commerce ne peut pas dépasser 80 caractères.'),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(REGEX_SLUG, 'Identifiant URL invalide (lettres minuscules, chiffres et tirets uniquement).'),
  category: z.string().min(2).max(60),
  wilaya: z.string().min(2).max(60),
  phone: algerianPhoneSchema,
  email: z.string().email('Email invalide.').or(z.literal('')).optional(),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.').optional(),
});

// Schéma Client (05/06/07 + Prénom)
export const customerCardSchema = z.object({
  merchant_id: z.string().min(1, 'Identifiant commerçant manquant.'),
  customer_phone: algerianPhoneSchema,
  customer_name: z.string().min(1).max(60).default('Client Fidèle'),
});

// Schéma Programme de Fidélité
export const loyaltyProgramSchema = z.object({
  merchant_id: z.string().min(1),
  program_type: z.enum(['STAMPS', 'POINTS']).default('STAMPS'),
  stamps_required: z.number().int().min(4).max(50).default(10),
  points_per_100dzd: z.number().int().min(1).max(100).default(1),
  reward_title_fr: z.string().min(2).max(120),
  reward_title_ar: z.string().max(120).optional(),
  welcome_bonus: z.number().int().min(0).max(10).default(1),
  primary_color: z.string().regex(REGEX_HEX_COLOR).default('#10B981'),
  background_color: z.string().regex(REGEX_HEX_COLOR).default('#0F172A'),
});

// Schéma Offre Promotionnelle Ciblée
export const personalizedOfferSchema = z.object({
  title_fr: z.string().min(3).max(120),
  title_ar: z.string().max(120).optional(),
  description_fr: z.string().max(300).optional(),
  description_ar: z.string().max(300).optional(),
  target_segment: z.enum(['ALL', 'VIP', 'INACTIVE_30D']).default('ALL'),
});

// Schéma Déclaration Paiement BaridiMob / CCP
export const subscriptionPaymentSchema = z.object({
  transaction_reference: z.string().min(3).max(120),
  amount_dzd: z.number().int().min(100).max(1000000).default(3900),
  payment_method: z.enum(['BARIDIMOB', 'CCP_RECEIPT', 'CHARGILY_PAY']).default('BARIDIMOB'),
});

// Règle 2 : Protection XSS (Échappement de toute chaîne utilisateur)
export function sanitizeText(input: unknown, maxLength = 250): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

// Règle 6 : Rate Limiter (Max 5 requêtes par heure par IP sur les formulaires publics)
interface RateBucket {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateBucket>();

export function checkRateLimit(
  ip: string,
  action: string,
  maxPerHour = 5
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const key = `${action}:${ip || '127.0.0.1'}`;
  const bucket = rateLimitStore.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxPerHour - 1 };
  }

  if (bucket.count >= maxPerHour) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  rateLimitStore.set(key, bucket);
  return { allowed: true, remaining: maxPerHour - bucket.count };
}

// Règle 11 : Validation des fichiers uploadés (MIME + Extension + 5 Mo)
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export function validateReceiptFile(file: { name: string; type: string; size: number }): {
  valid: boolean;
  error?: string;
} {
  if (!file) return { valid: false, error: 'Aucun fichier sélectionné.' };
  if (file.size > MAX_UPLOAD_SIZE) {
    return { valid: false, error: 'Le fichier dépasse la taille maximale de 5 Mo.' };
  }
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_EXT.has(ext) || !ALLOWED_MIME.has(file.type)) {
    return { valid: false, error: 'Format non supporté. Utilisez uniquement JPG, PNG ou WEBP.' };
  }
  return { valid: true };
}

export { z };
