const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ensureUuidServer(val?: string): string {
  const s = String(val || '').trim();
  if (UUID_REGEX.test(s)) return s.toLowerCase();
  if (!s) return '00000000-0000-4000-8000-000000000000';
  let h1 = 0xdeadbeef ^ s.length;
  let h2 = 0x41c6ce57 ^ s.length;
  let h3 = 0x12345678 ^ s.length;
  let h4 = 0x87654321 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822507);
    h4 = Math.imul(h4 ^ ch, 3266489909);
  }
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  const full = hex(h1) + hex(h2) + hex(h3) + hex(h4);
  return `${full.slice(0, 8)}-${full.slice(8, 12)}-4${full.slice(13, 16)}-8${full.slice(17, 20)}-${full.slice(20, 32)}`;
}

const cleanKey = (k?: string) => (k || '').replace(/^["'\s]+|["'\s]+$/g, '');

function getCandidateKeys(): string[] {
  const list = [
    cleanKey(process.env.SUPABASE_SERVICE_ROLE_KEY),
    cleanKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    cleanKey(process.env.SUPABASE_ANON_KEY),
    cleanKey(process.env.SUPABASE_KEY),
    cleanKey(process.env.NEXT_PUBLIC_SUPABASE_KEY),
  ].filter((k) => k.length > 15);
  return Array.from(new Set(list));
}

function getEffectiveSupabaseUrl(): string {
  for (const k of getCandidateKeys()) {
    if (k.startsWith('eyJ')) {
      try {
        const parts = k.split('.');
        let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        const decoded = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
        if (decoded?.ref) return `https://${decoded.ref.trim().toLowerCase()}.supabase.co`;
      } catch {}
    }
  }
  const raw = cleanKey(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://aiaobpbouxzlfrfhludn.supabase.co').replace(/\/+$/, '');
  return raw.startsWith('http') ? raw : 'https://aiaobpbouxzlfrfhludn.supabase.co';
}

async function sbGet(path: string): Promise<any[]> {
  const baseUrl = getEffectiveSupabaseUrl();
  for (const key of getCandidateKeys()) {
    try {
      const headers: Record<string, string> = { apikey: key };
      if (key.startsWith('eyJ')) headers['Authorization'] = `Bearer ${key}`;
      const res = await fetch(`${baseUrl}/rest/v1/${path}`, { headers, cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
  }
  return [];
}

export function unpackLogoAndName(row: any): { businessName: string; logoUrl: string } {
  if (!row) return { businessName: 'Carte Fidélité', logoUrl: '' };
  let logoUrl = String(row.logo_url || '');
  if (logoUrl.startsWith('__AUTH__:')) {
    const parts = logoUrl.split(':::');
    logoUrl = parts[1] || '';
  }
  return {
    businessName: String(row.business_name || 'Carte Fidélité').trim(),
    logoUrl: logoUrl.trim(),
  };
}

export async function getMerchantPwaMetaByToken(rawToken: string): Promise<{ businessName: string; logoUrl: string }> {
  const token = decodeURIComponent(rawToken || '').trim();
  const tokenUuid = ensureUuidServer(token);
  let cards = await sbGet(`customer_cards?qr_token=eq.${encodeURIComponent(tokenUuid)}&limit=1`);
  if (!cards.length) {
    cards = await sbGet(`customer_cards?id=eq.${encodeURIComponent(tokenUuid)}&limit=1`);
  }
  if (cards.length && cards[0].merchant_id) {
    const merchants = await sbGet(`merchants?id=eq.${encodeURIComponent(cards[0].merchant_id)}&limit=1`);
    if (merchants.length) {
      return unpackLogoAndName(merchants[0]);
    }
  }
  return { businessName: 'Carte Fidélité', logoUrl: '' };
}
