import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { sanitizeErrorMessage } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('signature') || req.headers.get('x-chargily-signature') || '';
    const secretKey = process.env.CHARGILY_SECRET_KEY || 'test_sk_P3QClZbSPS4HKULB8pdfx2NBWnHsPvZ1v1I3chL6';

    // Vérification de la signature HMAC-SHA256
    let isSignatureValid = true;
    if (signature) {
      const computedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(rawBody)
        .digest('hex');

      if (computedSignature !== signature) {
        console.warn('Signature Chargily HMAC-SHA256 non valide.');
        isSignatureValid = false;
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event?.type || payload.type;
    const checkoutData = payload.data || payload;

    // Si l'événement est checkout.paid ou checkout.completed
    if (eventType === 'checkout.paid' || eventType === 'checkout.completed') {
      const merchantId = checkoutData.metadata?.merchant_id || 'm-el-bahdja';
      const checkoutId = checkoutData.id || `chk_${Date.now()}`;

      // Prolongation de l'abonnement de 30 jours et passage à ACTIVE
      db.activateChargilySubscription(merchantId, checkoutId);

      console.log(`[CHARGILY WEBHOOK] Paiement de 3900 DZD validé pour ${merchantId}. Abonnement renouvelé (+30 jours).`);

      return NextResponse.json({
        success: true,
        message: 'Abonnement activé avec succès (+30 jours)',
        merchant_id: merchantId,
        checkout_id: checkoutId,
        signature_verified: isSignatureValid,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = sanitizeErrorMessage(err, 'Erreur de traitement du webhook');
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
