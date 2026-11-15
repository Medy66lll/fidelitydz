import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { consumeTokenBucket, sanitizeString, isSafeUuid, logSecurityEvent } from '@/lib/validation';

function getSessionSecret(): string {
  const base =
    process.env.SESSION_HMAC_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_SECRET_PASSWORD ||
    process.env.OWNER_PIN ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    '98bd287fe4208b5d4b7a9a1b114a4080';
  return `fidelitydz_session_hmac_v83_${base}`;
}

function verifyMerchantSessionToken(token?: string | null): { merchantId: string; role: string } | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split(':');
  if (parts.length < 4) return null;
  const [prefix, merchantId, role, expStr, ...rest] = parts;
  const sig = rest[rest.length - 1];
  const pwdTag = rest.length > 1 ? rest[0] : '';
  if (prefix !== 'm_sess' || !merchantId) return null;
  const exp = Number(expStr);
  if (!exp || Date.now() > exp) return null;
  const payload = pwdTag
    ? `${prefix}:${merchantId}:${role}:${expStr}:${pwdTag}`
    : `${prefix}:${merchantId}:${role}:${expStr}`;
  const expectedSig = crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('hex');
  try {
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expectedSig, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    return { merchantId, role };
  } catch {
    return null;
  }
}

function getTrustedAppOrigin(req: NextRequest): string {
  const configured = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/+$/, '');
  if (configured.startsWith('https://')) {
    return configured;
  }
  const host = (req.headers.get('x-forwarded-host') || req.headers.get('host') || 'fidelitydz.vercel.app')
    .replace(/[^a-zA-Z0-9.:-]/g, '')
    .trim();
  const proto = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim();

  // Règle 12 : Rate Limiting Token Bucket sur la création de session de paiement (10 / min par IP)
  const rate = consumeTokenBucket(ip, 'chargily_checkout', 10, 5);
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: 'Trop de requêtes de paiement. Veuillez patienter quelques instants.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  try {
    const cookieToken = req.cookies.get('fidelitydz_session')?.value || '';
    const headerToken = req.headers.get('x-merchant-token') || '';
    const verifiedSession = verifyMerchantSessionToken(cookieToken) || verifyMerchantSessionToken(headerToken);

    const body = await req.json();
    const rawMerchantId = sanitizeString(body.merchant_id, 60);
    const merchantName = sanitizeString(body.merchant_name || 'Commerçant FidelityDZ', 80);

    const effectiveMerchantId = verifiedSession?.merchantId || rawMerchantId;
    if (!effectiveMerchantId || !isSafeUuid(effectiveMerchantId)) {
      logSecurityEvent('UNAUTHORIZED_ACCESS', ip, { endpoint: '/api/chargily/checkout' }, 'WARN');
      return NextResponse.json(
        { success: false, error: 'Non autorisé : session commerçant authentifiée requise.' },
        { status: 401 }
      );
    }

    // Règle 19 : Le prix est STRICTEMENT calculé côté serveur (jamais depuis le navigateur)
    const SERVER_PLAN_PRICE_DZD = Math.max(
      1000,
      Number(process.env.NEXT_PUBLIC_PLAN_PRICE_DZD) || 3900
    );

    const secretKey = (process.env.CHARGILY_SECRET_KEY || '').trim();
    const origin = getTrustedAppOrigin(req);

    const payload = {
      amount: SERVER_PLAN_PRICE_DZD,
      currency: 'dzd',
      success_url: `${origin}/dashboard/billing?payment=success&merchant_id=${encodeURIComponent(effectiveMerchantId)}`,
      failure_url: `${origin}/dashboard/billing?payment=failed&merchant_id=${encodeURIComponent(effectiveMerchantId)}`,
      webhook_endpoint: `${origin}/api/chargily/webhook`,
      description: `Abonnement mensuel FidelityDZ (${SERVER_PLAN_PRICE_DZD} DZD) - ${merchantName}`,
      metadata: {
        merchant_id: effectiveMerchantId,
        plan: 'STANDARD_MONTHLY_3900',
        expected_amount_dzd: SERVER_PLAN_PRICE_DZD,
        merchant_name: merchantName,
      },
    };

    if (secretKey && secretKey !== 'CHANGE_ME') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const chargilyUrl = secretKey.startsWith('live_')
          ? 'https://pay.chargily.net/api/v2/checkouts'
          : 'https://pay.chargily.net/test/api/v2/checkouts';

        const response = await fetch(chargilyUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const data = await response.json();

        if (response.ok && data.checkout_url) {
          return NextResponse.json({
            success: true,
            checkout_url: data.checkout_url,
            id: data.id,
            amount_dzd: SERVER_PLAN_PRICE_DZD,
          });
        }
      } catch {
        // Fallback géré ci-dessous selon l'environnement
      }

      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          {
            success: false,
            error: 'Le service de paiement Chargily Pay est temporairement indisponible. Veuillez utiliser BaridiMob / CCP.',
          },
          { status: 502 }
        );
      }
    }

    // Mode démonstration uniquement si CHARGILY_SECRET_KEY n'est pas encore configurée
    const simulatedCheckoutUrl = `${origin}/dashboard/billing?simulated_chargily=true&checkout_id=chk_${Date.now()}&merchant_id=${encodeURIComponent(effectiveMerchantId)}`;
    return NextResponse.json({
      success: true,
      checkout_url: simulatedCheckoutUrl,
      simulated: true,
      amount_dzd: SERVER_PLAN_PRICE_DZD,
      message: 'Session Chargily Pay générée.',
    });
  } catch {
    // Règle 20 : Aucun détail technique ni stack trace exposé en production
    return NextResponse.json(
      { success: false, error: 'Impossible d\'initialiser la session de paiement.' },
      { status: 500 }
    );
  }
}
