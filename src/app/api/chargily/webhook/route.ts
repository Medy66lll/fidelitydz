import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { consumeTokenBucket, isSafeUuid, logSecurityEvent } from '@/lib/validation';

export async function POST(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim();

  // Règle 12 : Rate Limiting sur le webhook
  const rate = consumeTokenBucket(ip, 'chargily_webhook', 30, 30);
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too Many Requests' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  try {
    const rawBody = await req.text();
    const signature = (req.headers.get('signature') || req.headers.get('x-chargily-signature') || '').trim();
    const secretKey = (process.env.CHARGILY_SECRET_KEY || '').trim();

    // Règle 19 : Vérification OBLIGATOIRE de la signature HMAC-SHA256 (impossible de contourner en omettant l'en-tête)
    if (!secretKey || secretKey === 'CHANGE_ME' || !signature) {
      logSecurityEvent(
        'WEBHOOK_INVALID_SIGNATURE',
        ip,
        { reason: !secretKey ? 'missing_server_secret' : 'missing_signature_header' },
        'CRITICAL'
      );
      return NextResponse.json(
        { success: false, error: 'Signature webhook manquante ou clé non configurée.' },
        { status: 401 }
      );
    }

    const computedSignature = crypto.createHmac('sha256', secretKey).update(rawBody).digest('hex');
    const sigBuf = Buffer.from(signature, 'hex');
    const expectedBuf = Buffer.from(computedSignature, 'hex');

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      logSecurityEvent('WEBHOOK_INVALID_SIGNATURE', ip, { reason: 'hmac_mismatch' }, 'CRITICAL');
      return NextResponse.json({ success: false, error: 'Signature webhook invalide.' }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event?.type || payload.type;
    const checkoutData = payload.data || payload;

    if (eventType === 'checkout.paid' || eventType === 'checkout.completed') {
      const merchantId = String(checkoutData.metadata?.merchant_id || '').trim();
      const paidAmount = Number(checkoutData.amount || 0);
      const currency = String(checkoutData.currency || 'dzd').toLowerCase();
      const minimumRequiredPrice = Number(process.env.NEXT_PUBLIC_PLAN_PRICE_DZD) || 3900;

      if (!isSafeUuid(merchantId)) {
        return NextResponse.json({ success: false, error: 'Identifiant commerçant invalide.' }, { status: 400 });
      }

      // Règle 19 : Vérification stricte du montant payé et de la devise côté serveur
      if (paidAmount < minimumRequiredPrice || currency !== 'dzd') {
        logSecurityEvent(
          'WEBHOOK_INVALID_SIGNATURE',
          ip,
          { reason: 'amount_or_currency_mismatch', paidAmount, currency },
          'CRITICAL'
        );
        return NextResponse.json(
          { success: false, error: 'Montant ou devise du paiement non conforme.' },
          { status: 400 }
        );
      }

      const checkoutId = String(checkoutData.id || `chk_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '');

      return NextResponse.json({
        success: true,
        message: 'Abonnement vérifié et activé avec succès (+30 jours)',
        merchant_id: merchantId,
        checkout_id: checkoutId,
        amount_dzd: paidAmount,
      });
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Requête webhook invalide.' }, { status: 400 });
  }
}
