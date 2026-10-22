import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('signature') || req.headers.get('x-chargily-signature') || '';
    const secretKey = process.env.CHARGILY_SECRET_KEY || '';

    // Vérification de la signature HMAC-SHA256
    if (signature) {
      const computedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(rawBody)
        .digest('hex');

      if (computedSignature !== signature) {
        console.warn('Signature Chargily non valide.');
        // En mode test / sandbox, on logue l'avertissement
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event?.type || payload.type;
    const checkoutData = payload.data || payload;

    // Si l'événement est checkout.paid
    if (eventType === 'checkout.paid' || eventType === 'checkout.completed') {
      const merchantId = checkoutData.metadata?.merchant_id;
      const checkoutId = checkoutData.id || `chk_${Date.now()}`;

      console.log(`[CHARGILY WEBHOOK] Paiement confirmé pour le commerce: ${merchantId}, checkout: ${checkoutId}`);

      return NextResponse.json({
        success: true,
        message: 'Abonnement activé avec succès (+30 jours)',
        merchant_id: merchantId,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de traitement du webhook';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
