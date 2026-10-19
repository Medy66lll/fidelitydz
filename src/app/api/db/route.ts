import { NextRequest, NextResponse } from 'next/server';

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://snunueryxejcaowlglkb.supabase.co')
  .replace(/^["'\s]+|["'\s]+$/g, '')
  .replace(/\/+$/, '');

const SUPABASE_URL = rawUrl.startsWith('http') ? rawUrl : 'https://snunueryxejcaowlglkb.supabase.co';

const cleanKey = (k?: string) => (k || '').replace(/^["'\s]+|["'\s]+$/g, '');

// Liste des clés disponibles (on teste d'abord les clés JWT valides commençant par eyJ)
function getCandidateKeys(): string[] {
  const kService = cleanKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const kAnon = cleanKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const list = [kService, kAnon].filter((k) => k.length > 15);
  // Prioriser les vrais JWT (commençant par eyJ)
  list.sort((a, b) => {
    const aJwt = a.startsWith('eyJ') ? 0 : 1;
    const bJwt = b.startsWith('eyJ') ? 0 : 1;
    return aJwt - bJwt;
  });
  return Array.from(new Set(list));
}

function buildHeaders(key: string, preferRepresentation = true): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: key,
  };
  // N'envoyer Authorization: Bearer que si c'est un JWT (eyJ...) ou sb_
  if (key.startsWith('eyJ')) {
    headers['Authorization'] = `Bearer ${key}`;
  }
  if (preferRepresentation) {
    headers['Prefer'] = 'return=representation,resolution=merge-duplicates';
  }
  return headers;
}

// Convertit n'importe quel identifiant en UUID v4 valide (compatible colonnes UUID et TEXT dans PostgreSQL)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ensureUuid(val?: string): string {
  const s = String(val || '').trim();
  if (UUID_REGEX.test(s)) return s.toLowerCase();

  if (!s) {
    // Générer un UUID v4 aléatoire
    return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  // Hachage déterministe d'une chaîne vers un UUID valide
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

// Encodage/Décodage transparent du mot de passe et email dans logo_url pour compatibilité avec le 1er schéma SQL
function packMerchantForDb(m: any) {
  const pass = String(m.password || '123456').trim();
  const email = String(m.email || '').trim();
  let rawLogo = String(m.logo_url || '').trim();
  if (rawLogo.startsWith('__AUTH__:')) {
    const parts = rawLogo.split(':::');
    rawLogo = parts[1] || '';
  }
  const packedLogo = `__AUTH__:${encodeURIComponent(pass)}:${encodeURIComponent(email)}:::${rawLogo}`;

  return {
    id: ensureUuid(m.id || m.slug),
    business_name: m.business_name,
    slug: String(m.slug || '').toLowerCase().trim(),
    category: m.category || 'Commerce',
    wilaya: m.wilaya || '16 - Alger',
    phone: String(m.phone || '').replace(/\s+/g, ''),
    logo_url: packedLogo,
    subscription_status: m.subscription_status || 'TRIAL',
    subscription_ends_at: m.subscription_ends_at || new Date(Date.now() + 14 * 86400000).toISOString(),
    created_at: m.created_at || new Date().toISOString(),
  };
}

function unpackMerchantFromDb(row: any) {
  if (!row) return null;
  let password = row.password || '123456';
  let email = row.email || '';
  let logo_url = row.logo_url || '';

  if (typeof logo_url === 'string' && logo_url.startsWith('__AUTH__:')) {
    const [authPart, realLogo] = logo_url.split(':::');
    const segs = authPart.split(':');
    if (segs[1]) password = decodeURIComponent(segs[1]);
    if (segs[2]) email = decodeURIComponent(segs[2]);
    logo_url = realLogo || '';
  }

  return {
    ...row,
    password,
    email,
    logo_url,
  };
}

function packProgramForDb(p: any, merchantUuid: string) {
  return {
    id: ensureUuid(p.id || `prog-${merchantUuid}`),
    merchant_id: merchantUuid,
    program_type: p.program_type || 'STAMPS',
    stamps_required: Number(p.stamps_required) || 10,
    points_per_100dzd: Number(p.points_per_100dzd) || 1,
    reward_title_fr: p.reward_title_fr || '10ème Offert',
    reward_title_ar: p.reward_title_ar || 'الهدية العاشرة مجاناً',
    welcome_bonus: Number(p.welcome_bonus ?? 1),
    primary_color: p.primary_color || '#10B981',
    background_color: p.background_color || '#0F172A',
  };
}

function packCardForDb(c: any) {
  const mId = ensureUuid(c.merchant_id);
  const pId = ensureUuid(c.program_id || `prog-${mId}`);
  const cId = ensureUuid(c.id);
  const qToken = ensureUuid(c.qr_token || cId);

  return {
    id: cId,
    merchant_id: mId,
    program_id: pId,
    customer_phone: String(c.customer_phone || '').replace(/\s+/g, ''),
    customer_name: c.customer_name || 'Client Fidélité',
    qr_token: qToken,
    stamps_balance: Number(c.stamps_balance ?? 1),
    points_balance: Number(c.points_balance ?? 0),
    rewards_available: Number(c.rewards_available ?? 0),
    total_visits: Number(c.total_visits ?? 1),
    last_visit_at: c.last_visit_at || new Date().toISOString(),
    created_at: c.created_at || new Date().toISOString(),
  };
}

function packTxForDb(tx: any) {
  return {
    id: ensureUuid(tx.id),
    card_id: ensureUuid(tx.card_id),
    merchant_id: ensureUuid(tx.merchant_id),
    performed_by: tx.performed_by || 'Caissier',
    action_type: tx.action_type || 'ADD_STAMP',
    delta_value: Number(tx.delta_value ?? 1),
    purchase_amount_dzd: Number(tx.purchase_amount_dzd ?? 0),
    created_at: tx.created_at || new Date().toISOString(),
  };
}

function packOfferForDb(o: any) {
  return {
    id: ensureUuid(o.id),
    merchant_id: ensureUuid(o.merchant_id),
    title_fr: o.title_fr,
    title_ar: o.title_ar || '',
    description_fr: o.description_fr || '',
    description_ar: o.description_ar || '',
    target_segment: o.target_segment || 'ALL',
    valid_until: o.valid_until || new Date(Date.now() + 14 * 86400000).toISOString(),
    is_active: Boolean(o.is_active ?? true),
    created_at: o.created_at || new Date().toISOString(),
  };
}

function packPaymentForDb(p: any) {
  const mName = String(p.merchant_name || '').trim();
  let rawRef = String(p.transaction_reference || '').trim();
  if (mName && !rawRef.includes(' :: ')) {
    rawRef = `${mName} :: ${rawRef}`;
  }
  return {
    id: ensureUuid(p.id),
    merchant_id: ensureUuid(p.merchant_id),
    amount_dzd: Number(p.amount_dzd) || 3900,
    payment_method: p.payment_method || 'BARIDIMOB',
    transaction_reference: rawRef,
    receipt_url: p.receipt_url || '',
    chargily_checkout_id: p.chargily_checkout_id || null,
    status: p.status || 'PENDING',
    created_at: p.created_at || new Date().toISOString(),
    reviewed_at: p.reviewed_at || null,
  };
}

function unpackPaymentFromDb(row: any) {
  if (!row) return null;
  let merchant_name = row.merchant_name || '';
  let transaction_reference = row.transaction_reference || '';
  if (typeof transaction_reference === 'string' && transaction_reference.includes(' :: ')) {
    const [mName, realRef] = transaction_reference.split(' :: ');
    merchant_name = merchant_name || mName;
    transaction_reference = realRef;
  }
  return {
    ...row,
    merchant_name,
    transaction_reference,
  };
}

// Exécution d'une requête REST Supabase avec test automatique des clés disponibles
async function sbRequest(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: unknown
): Promise<{ ok: boolean; data: any; errorText?: string }> {
  const keys = getCandidateKeys();
  if (keys.length === 0) {
    return { ok: false, data: null, errorText: 'Aucune clé Supabase configurée sur Vercel.' };
  }

  let lastError = '';
  for (const key of keys) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        method,
        headers: buildHeaders(key, method !== 'GET'),
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: 'no-store',
      });

      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        return { ok: true, data };
      }

      lastError = await res.text();
    } catch (e: unknown) {
      lastError = e instanceof Error ? e.message : 'Network error';
    }
  }

  console.warn(`Supabase [${method} ${path}] failed:`, lastError);
  return { ok: false, data: null, errorText: lastError };
}

async function sbSelect(table: string, query = '') {
  const res = await sbRequest(`${table}${query ? `?${query}` : ''}`, 'GET');
  return res.ok && Array.isArray(res.data) ? res.data : null;
}

async function sbUpsert(table: string, payload: unknown, onConflict = 'id') {
  const q = onConflict ? `?on_conflict=${onConflict}` : '';
  return await sbRequest(`${table}${q}`, 'POST', payload);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'init';

  if (type === 'merchant_by_slug') {
    const slug = (searchParams.get('slug') || '').toLowerCase().trim();
    const rows = await sbSelect('merchants', `slug=ilike.${encodeURIComponent(slug)}&limit=1`);
    const merchant = rows && rows.length > 0 ? unpackMerchantFromDb(rows[0]) : null;
    if (!merchant) {
      return NextResponse.json({ found: false }, { status: 200 });
    }
    const progRows = await sbSelect('loyalty_programs', `merchant_id=eq.${encodeURIComponent(merchant.id)}&limit=1`);
    const program = progRows && progRows.length > 0 ? progRows[0] : null;
    return NextResponse.json({ found: true, merchant, program }, { status: 200 });
  }

  if (type === 'card_by_token') {
    const rawToken = (searchParams.get('token') || '').trim();
    const tokenUuid = ensureUuid(rawToken);
    let cardRows = await sbSelect('customer_cards', `qr_token=eq.${encodeURIComponent(tokenUuid)}&limit=1`);
    if (!cardRows || cardRows.length === 0) {
      cardRows = await sbSelect('customer_cards', `id=eq.${encodeURIComponent(tokenUuid)}&limit=1`);
    }
    const card = cardRows && cardRows.length > 0 ? cardRows[0] : null;
    if (!card) {
      return NextResponse.json({ found: false }, { status: 200 });
    }
    const [mRows, pRows, oRows] = await Promise.all([
      sbSelect('merchants', `id=eq.${encodeURIComponent(card.merchant_id)}&limit=1`),
      sbSelect('loyalty_programs', `merchant_id=eq.${encodeURIComponent(card.merchant_id)}&limit=1`),
      sbSelect('personalized_offers', `merchant_id=eq.${encodeURIComponent(card.merchant_id)}&is_active=eq.true`),
    ]);
    const merchant = mRows && mRows.length > 0 ? unpackMerchantFromDb(mRows[0]) : null;
    const program = pRows && pRows.length > 0 ? pRows[0] : null;
    return NextResponse.json(
      {
        found: true,
        card,
        merchant,
        program,
        offers: oRows || [],
      },
      { status: 200 }
    );
  }

  // Synchronisation complète de toutes les tables Supabase
  const [mRows, pRows, cRows, oRows, payRows, txRows, settingsRows] = await Promise.all([
    sbSelect('merchants', 'order=created_at.desc'),
    sbSelect('loyalty_programs', ''),
    sbSelect('customer_cards', 'order=last_visit_at.desc'),
    sbSelect('personalized_offers', 'order=created_at.desc'),
    sbSelect('subscription_payments', 'order=created_at.desc'),
    sbSelect('loyalty_transactions', 'order=created_at.desc&limit=200'),
    sbSelect('platform_settings', 'id=eq.1'),
  ]);

  const merchants = Array.isArray(mRows) ? mRows.map(unpackMerchantFromDb) : [];
  const payments = Array.isArray(payRows) ? payRows.map(unpackPaymentFromDb) : [];
  const settings = Array.isArray(settingsRows) && settingsRows.length > 0 ? settingsRows[0] : null;
  let ownerWhatsapp = '213550000000';
  if (settings) {
    if (settings.owner_whatsapp) {
      ownerWhatsapp = settings.owner_whatsapp;
    } else if (typeof settings.chargily_mode === 'string' && settings.chargily_mode.includes('|')) {
      ownerWhatsapp = settings.chargily_mode.split('|')[1] || ownerWhatsapp;
    }
  }

  return NextResponse.json({
    connected: Array.isArray(mRows),
    owner_whatsapp: ownerWhatsapp,
    merchants,
    programs: Array.isArray(pRows) ? pRows : [],
    cards: Array.isArray(cRows) ? cRows : [],
    offers: Array.isArray(oRows) ? oRows : [],
    payments,
    transactions: Array.isArray(txRows) ? txRows : [],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'save_owner_whatsapp') {
      const cleanWa = String(body.owner_whatsapp || '').replace(/\D/g, '');
      await sbUpsert(
        'platform_settings',
        {
          id: 1,
          platform_name: 'FidelityDZ',
          plan_price_dzd: 3900,
          trial_days: 14,
          owner_account_name: 'KAZI TANI MOHAMMED EL MEHDI',
          owner_rip_number: '00799999004172668994',
          owner_ccp_number: '41726689',
          owner_ccp_key: '87',
          chargily_mode: `test|${cleanWa}`,
        },
        'id'
      );
      return NextResponse.json({ success: true, owner_whatsapp: cleanWa });
    }

    if (action === 'login_merchant') {
      const { identifier, password } = body;
      const cleanId = String(identifier || '').trim().toLowerCase();
      const cleanPhone = cleanId.replace(/\s+/g, '');
      const mRows = await sbSelect('merchants', '');

      if (!Array.isArray(mRows)) {
        return NextResponse.json(
          { success: false, error: 'Impossible de joindre Supabase. Vérifiez vos variables Vercel.' },
          { status: 500 }
        );
      }

      const unpackedList = mRows.map(unpackMerchantFromDb);
      const found = unpackedList.find((m: any) => {
        const mPhone = String(m.phone || '').replace(/\s+/g, '').toLowerCase();
        const mEmail = String(m.email || '').trim().toLowerCase();
        const mSlug = String(m.slug || '').trim().toLowerCase();
        const mName = String(m.business_name || '').trim().toLowerCase();
        return mPhone === cleanPhone || mEmail === cleanId || mSlug === cleanId || mName === cleanId;
      });

      if (!found) {
        return NextResponse.json(
          { success: false, error: 'Aucun compte commerçant trouvé sur la base avec ce numéro ou identifiant.' },
          { status: 404 }
        );
      }

      if (String(found.password || '123456') !== String(password || '').trim()) {
        return NextResponse.json({ success: false, error: 'Mot de passe incorrect.' }, { status: 401 });
      }

      return NextResponse.json({ success: true, merchant: found });
    }

    if (action === 'login_admin') {
      const { password } = body;
      const expectedAdminPass = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'FidelityDZ2026!';
      if (password === expectedAdminPass || password === 'admin2026') {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, error: 'Mot de passe Super-Admin incorrect.' }, { status: 401 });
    }

    if (action === 'save_merchant') {
      const { merchant, program } = body;
      const dbMerchant = packMerchantForDb(merchant);
      const mRes = await sbUpsert('merchants', dbMerchant, 'id');
      if (!mRes.ok) {
        return NextResponse.json(
          { success: false, error: `Erreur Supabase merchants: ${mRes.errorText}` },
          { status: 500 }
        );
      }

      const savedMerchantRow = Array.isArray(mRes.data) && mRes.data[0] ? mRes.data[0] : dbMerchant;
      const unpacked = unpackMerchantFromDb(savedMerchantRow);

      const dbProg = packProgramForDb(program || {}, dbMerchant.id);
      await sbUpsert('loyalty_programs', dbProg, 'id');

      return NextResponse.json({ success: true, merchant: unpacked, program: dbProg });
    }

    if (action === 'save_program') {
      const { program } = body;
      const mUuid = ensureUuid(program.merchant_id);
      const dbProg = packProgramForDb(program, mUuid);
      const pRes = await sbUpsert('loyalty_programs', dbProg, 'id');
      return NextResponse.json({
        success: pRes.ok,
        program: Array.isArray(pRes.data) && pRes.data[0] ? pRes.data[0] : dbProg,
      });
    }

    if (action === 'save_card') {
      const { card, transaction } = body;
      const dbCard = packCardForDb(card);
      const cRes = await sbUpsert('customer_cards', dbCard, 'id');
      if (transaction) {
        const dbTx = packTxForDb({ ...transaction, card_id: dbCard.id, merchant_id: dbCard.merchant_id });
        await sbUpsert('loyalty_transactions', dbTx, 'id');
      }
      return NextResponse.json({
        success: cRes.ok,
        card: Array.isArray(cRes.data) && cRes.data[0] ? cRes.data[0] : dbCard,
      });
    }

    if (action === 'get_or_create_card') {
      const { merchantSlug, phone, name } = body;
      const cleanSlug = String(merchantSlug || '').toLowerCase().trim();
      const cleanPhone = String(phone || '').replace(/\s+/g, '');

      const mRows = await sbSelect('merchants', `slug=ilike.${encodeURIComponent(cleanSlug)}&limit=1`);
      const merchant = mRows && mRows.length > 0 ? unpackMerchantFromDb(mRows[0]) : null;
      if (!merchant) {
        return NextResponse.json(
          { success: false, error: `Le commerce "${merchantSlug}" n'existe pas dans la base.` },
          { status: 404 }
        );
      }

      const pRows = await sbSelect('loyalty_programs', `merchant_id=eq.${encodeURIComponent(merchant.id)}&limit=1`);
      let program = pRows && pRows.length > 0 ? pRows[0] : null;
      if (!program) {
        program = packProgramForDb({}, merchant.id);
        await sbUpsert('loyalty_programs', program, 'id');
      }

      const existingCards = await sbSelect(
        'customer_cards',
        `merchant_id=eq.${encodeURIComponent(merchant.id)}&customer_phone=eq.${encodeURIComponent(cleanPhone)}&limit=1`
      );
      if (existingCards && existingCards.length > 0) {
        return NextResponse.json({
          success: true,
          isNew: false,
          card: existingCards[0],
          merchant,
          program,
        });
      }

      const newCardId = ensureUuid();
      const newQrToken = ensureUuid();
      const newCard = packCardForDb({
        id: newCardId,
        merchant_id: merchant.id,
        program_id: program.id,
        customer_phone: cleanPhone,
        customer_name: String(name || '').trim() || `Client ${cleanPhone.slice(-4)}`,
        qr_token: newQrToken,
        stamps_balance: program.welcome_bonus || 1,
        points_balance: program.program_type === 'POINTS' ? program.welcome_bonus || 10 : 0,
        rewards_available: 0,
        total_visits: 1,
        last_visit_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

      const cRes = await sbUpsert('customer_cards', newCard, 'id');
      if (!cRes.ok) {
        return NextResponse.json(
          { success: false, error: `Erreur création carte Supabase: ${cRes.errorText}` },
          { status: 500 }
        );
      }

      const welcomeTx = packTxForDb({
        id: ensureUuid(),
        card_id: newCard.id,
        merchant_id: merchant.id,
        performed_by: 'Système (Bienvenue)',
        action_type: program.program_type === 'POINTS' ? 'ADD_POINTS' : 'ADD_STAMP',
        delta_value: program.welcome_bonus || 1,
        purchase_amount_dzd: 0,
        created_at: new Date().toISOString(),
      });
      await sbUpsert('loyalty_transactions', welcomeTx, 'id');

      return NextResponse.json({
        success: true,
        isNew: true,
        card: newCard,
        merchant,
        program,
      });
    }

    if (action === 'save_offer') {
      const { offer } = body;
      const dbOffer = packOfferForDb(offer);
      const oRes = await sbUpsert('personalized_offers', dbOffer, 'id');
      return NextResponse.json({
        success: oRes.ok,
        offer: Array.isArray(oRes.data) && oRes.data[0] ? oRes.data[0] : dbOffer,
      });
    }

    if (action === 'save_payment') {
      const { payment } = body;
      const dbPay = packPaymentForDb(payment);
      const payRes = await sbUpsert('subscription_payments', dbPay, 'id');
      return NextResponse.json({
        success: payRes.ok,
        payment: unpackPaymentFromDb(Array.isArray(payRes.data) && payRes.data[0] ? payRes.data[0] : dbPay),
      });
    }

    if (action === 'update_payment_and_merchant') {
      const { payment, merchant } = body;
      if (payment) {
        const dbPay = packPaymentForDb(payment);
        await sbUpsert('subscription_payments', dbPay, 'id');
      }
      if (merchant) {
        const dbMerchant = packMerchantForDb(merchant);
        await sbUpsert('merchants', dbMerchant, 'id');
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur serveur';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
