import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Option désactivée : Les règlements d'abonnement s'effectuent par BaridiMob (RIP) ou mandat CCP officiel
  return NextResponse.json(
    {
      success: false,
      error: 'Le paiement en ligne par carte est actuellement désactivé. Veuillez utiliser BaridiMob ou le mandat CCP pour votre abonnement.',
    },
    { status: 503 }
  );
}
