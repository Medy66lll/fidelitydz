// ====================================================================
// FidelityDZ - Security & Input Validation Module (Rules 1, 2, 6, 10)
// ====================================================================

import { z } from 'zod';

// Rule 1: Input Validation with Zod (Strict Algerian phone & text rules)
export const algerianPhoneSchema = z
  .string()
  .trim()
  .transform((val) => val.replace(/\s+/g, ''))
  .refine((val) => /^(0)(5|6|7)[0-9]{8}$/.test(val), {
    message: 'Numéro de mobile algérien invalide (doit commencer par 05, 06 ou 07 et comporter 10 chiffres).',
  });

export const customerJoinSchema = z.object({
  merchant_slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/, {
    message: 'Slug de commerce invalide',
  }),
  customer_phone: algerianPhoneSchema,
  customer_name: z
    .string()
    .trim()
    .min(2, { message: 'Le prénom doit comporter au moins 2 caractères.' })
    .max(60, { message: 'Le prénom ne doit pas dépasser 60 caractères.' })
    .regex(/^[a-zA-Z\u0600-\u06FF\s'-]+$/, {
      message: 'Le nom contient des caractères non autorisés.',
    }),
});

export const checkoutRequestSchema = z.object({
  merchant_id: z.string().trim().min(2).max(100),
  merchant_name: z.string().trim().min(2).max(150).optional(),
});

export const manualPaymentSchema = z.object({
  merchant_id: z.string().trim().min(2).max(100),
  transaction_reference: z.string().trim().min(3).max(100),
  payment_method: z.enum(['BARIDIMOB', 'CCP_RECEIPT', 'CHARGILY_PAY']),
  amount_dzd: z.number().int().positive().default(3900),
});

// Rule 6: In-Memory IP Rate Limiter for public form submissions (Max 5 / hour)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

// Rule 10: Safe Error Handling (No stack trace exposure)
export function sanitizeErrorMessage(err: unknown, fallback: string = 'Une erreur est survenue, veuillez réessayer.'): string {
  if (err instanceof z.ZodError) {
    return err.issues.map((e) => e.message).join(' • ');
  }
  if (err instanceof Error && !err.stack?.includes('node_modules')) {
    // Only return safe user-facing errors
    return err.message;
  }
  return fallback;
}
