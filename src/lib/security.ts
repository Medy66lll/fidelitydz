// ====================================================================
// FidelityDZ — Module de Sécurité & Validation Zod (27-Point Hardened)
// ====================================================================

import { z } from 'zod';
import {
  REGEX_DZ_PHONE,
  REGEX_SLUG,
  REGEX_HEX_COLOR,
  MAX_UPLOAD_SIZE_BYTES,
  sanitizeString,
  sanitizeSafeUrl,
  validateUploadedFile,
  validateBase64ImageServer,
  consumeTokenBucket,
  checkRateLimit,
  recordAuthFailure,
  clearAuthFailures,
  isAuthLocked,
  logSecurityEvent,
  getRecentSecurityEvents,
} from './validation';

export {
  REGEX_DZ_PHONE,
  REGEX_SLUG,
  REGEX_HEX_COLOR,
  sanitizeSafeUrl,
  validateBase64ImageServer,
  consumeTokenBucket,
  checkRateLimit,
  recordAuthFailure,
  clearAuthFailures,
  isAuthLocked,
  logSecurityEvent,
  getRecentSecurityEvents,
};

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
  wilaya: z.string().min(2).max(80),
  address: z.string().max(200).optional(),
  phone: algerianPhoneSchema,
  email: z.string().min(5, "L'adresse email est obligatoire.").email("Format d'email invalide."),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.').optional(),
  logo_url: z.string().optional(),
  social_instagram: z.string().optional(),
  social_facebook: z.string().optional(),
  social_tiktok: z.string().optional(),
  social_maps: z.string().optional(),
  google_review_reward_enabled: z.boolean().optional(),
  google_review_reward_bonus: z.number().optional(),
});

export const customerCardSchema = z.object({
  merchant_id: z.string().min(1, 'Identifiant commerçant manquant.'),
  customer_phone: algerianPhoneSchema,
  customer_name: z
    .string()
    .min(2, 'Le prénom est obligatoire (au moins 2 caractères).')
    .max(60, 'Le prénom ne peut pas dépasser 60 caractères.'),
});

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
  social_instagram: z.string().optional(),
  social_facebook: z.string().optional(),
  social_tiktok: z.string().optional(),
  social_maps: z.string().optional(),
  google_review_reward_enabled: z.boolean().optional(),
  google_review_reward_bonus: z.number().optional(),
});

export const personalizedOfferSchema = z.object({
  title_fr: z.string().min(3).max(120),
  title_ar: z.string().max(120).optional(),
  description_fr: z.string().max(300).optional(),
  description_ar: z.string().max(300).optional(),
  target_segment: z.enum(['ALL', 'VIP', 'INACTIVE_30D']).default('ALL'),
});

export const subscriptionPaymentSchema = z.object({
  transaction_reference: z.string().min(3).max(120),
  amount_dzd: z.number().int().min(400).max(100000).default(3900),
  payment_method: z.enum(['BARIDIMOB', 'CCP_RECEIPT', 'CHARGILY_PAY']).default('BARIDIMOB'),
  receipt_url: z.string().min(5, "La capture d'écran du reçu est obligatoire."),
});

export function sanitizeText(input: unknown, maxLength = 250): string {
  return sanitizeString(input, maxLength);
}

export const MAX_UPLOAD_SIZE = MAX_UPLOAD_SIZE_BYTES;

export function validateReceiptFile(file: { name: string; type: string; size: number }): {
  valid: boolean;
  error?: string;
} {
  const res = validateUploadedFile(file);
  return { valid: res.success, error: res.error };
}

export { z };
