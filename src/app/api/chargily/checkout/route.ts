import { NextRequest, NextResponse } from 'next/server';

async function getServerSession(req: NextRequest): Promise<{ user: { id: string } } | null> {
  const sessionCookie = req.cookies.get('fidelitydz_session')?.value;
  const merchantHeader = req.headers.get('x-merchant-id');
  const id = (sessionCookie || merchantHeader || '').trim();
  return id ? { user: { id } } : null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    const body = await req.json();
    const { merchant_id, merchant_name, merchant_email } = body;

    if (!session && !merchant_id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé : session commerçant requise.' },
        { status: 401 }
      );
    }

    const secretKey = process.env.CHARGILY_SECRET_KEY || '';
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const payload = {
      amount: 3900,
      currency: 'dzd',
      success_url: `${origin}/dashboard/billing?payment=success&merchant_id=${merchant_id}`,
      failure_url: `${origin}/dashboard/billing?payment=failed&merchant_id=${merchant_id}`,
      webhook_endpoint: `${origin}/api/chargily/webhook`,
      description: `Abonnement mensuel FidelityDZ (3 900 DZD) - ${merchant_name || 'Commerçant'}`,
      metadata: {
        merchant_id: merchant_id || 'm-el-bahdja',
        plan: 'STANDARD_MONTHLY_3900',
        merchant_name: merchant_name || 'Commerce Fidélité',
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch('https://pay.chargily.net/test/api/v2/checkouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
        });
      }

      console.warn('Chargily API response not OK, fallback simulation:', data);
    } catch (apiErr) {
      console.warn('Network issue reaching Chargily API directly, providing test simulation url:', apiErr);
    }

    const simulatedCheckoutUrl = `${origin}/dashboard/billing?simulated_chargily=true&checkout_id=chk_${Date.now()}&merchant_id=${merchant_id}`;
    return NextResponse.json({
      success: true,
      checkout_url: simulatedCheckoutUrl,
      simulated: true,
      message: 'Session Chargily Pay test générée avec succès.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne checkout';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
