import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { qrToken: string } }): Promise<Metadata> {
  const token = params.qrToken;
  let logoUrl = 'https://cdn-icons-png.flaticon.com/512/1041/1041888.png';
  let title = 'FidelityDZ';

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      let cardRes = await fetch(`${supabaseUrl}/rest/v1/customer_cards?qr_token=eq.${token}&select=merchant_id`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        cache: 'no-store'
      });
      let cards = await cardRes.json();
      
      if (!cards || cards.length === 0) {
        cardRes = await fetch(`${supabaseUrl}/rest/v1/customer_cards?id=eq.${token}&select=merchant_id`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
          cache: 'no-store'
        });
        cards = await cardRes.json();
      }

      if (cards && cards.length > 0) {
        const mRes = await fetch(`${supabaseUrl}/rest/v1/merchants?id=eq.${cards[0].merchant_id}&select=business_name,logo_url`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
          cache: 'no-store'
        });
        const merchants = await mRes.json();
        
        if (merchants && merchants.length > 0) {
          if (merchants[0].logo_url) logoUrl = merchants[0].logo_url;
          if (merchants[0].business_name) title = merchants[0].business_name;
        }
      }
    }
  } catch (e) {}

  return {
    title: `${title}`,
    icons: {
      icon: logoUrl,
      shortcut: logoUrl,
      apple: logoUrl,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: title, // FORCE APPLE PWA TITLE
    },
    manifest: `/api/manifest?token=${token}&name=${encodeURIComponent(title)}&logo=${encodeURIComponent(logoUrl)}`,
  };
}

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
