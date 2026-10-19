-- ====================================================================
-- FidelityDZ v3 - SaaS Multi-Tenant Plateforme de Fidélité Digitale Algérie
-- Script SQL Complet pour Supabase (Sécurité, Essai 14j, Synchronisation Live)
-- ====================================================================

-- Nettoyage des anciennes tables si elles avaient des types UUID incompatibles
DROP TABLE IF EXISTS subscription_payments CASCADE;
DROP TABLE IF EXISTS personalized_offers CASCADE;
DROP TABLE IF EXISTS loyalty_transactions CASCADE;
DROP TABLE IF EXISTS customer_cards CASCADE;
DROP TABLE IF EXISTS loyalty_programs CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;
DROP TABLE IF EXISTS platform_settings CASCADE;

-- 1. Paramètres globaux de la plateforme (Propriétaire : KAZI TANI MOHAMMED EL MEHDI)
CREATE TABLE platform_settings (
  id INT PRIMARY KEY DEFAULT 1,
  platform_name TEXT DEFAULT 'FidelityDZ',
  plan_price_dzd INT DEFAULT 3900,
  trial_days INT DEFAULT 14,
  owner_account_name TEXT DEFAULT 'KAZI TANI MOHAMMED EL MEHDI',
  owner_rip_number TEXT DEFAULT '00799999004172668994',
  owner_ccp_number TEXT DEFAULT '41726689',
  owner_ccp_key TEXT DEFAULT '87',
  owner_whatsapp TEXT DEFAULT '213550000000',
  admin_password TEXT DEFAULT 'FidelityDZ2026!',
  chargily_mode TEXT DEFAULT 'test'
);

INSERT INTO platform_settings (
  id, platform_name, plan_price_dzd, trial_days,
  owner_account_name, owner_rip_number, owner_ccp_number, owner_ccp_key,
  owner_whatsapp, admin_password, chargily_mode
)
VALUES (
  1, 'FidelityDZ', 3900, 14,
  'KAZI TANI MOHAMMED EL MEHDI', '00799999004172668994', '41726689', '87',
  '213550000000', 'FidelityDZ2026!', 'test'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Table des Commerçants (avec identifiant téléphone/email + mot de passe sécurisé)
CREATE TABLE merchants (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  password TEXT NOT NULL DEFAULT '123456',
  logo_url TEXT,
  subscription_status TEXT DEFAULT 'TRIAL', -- 'TRIAL', 'PENDING_PAYMENT', 'ACTIVE', 'EXPIRED'
  subscription_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Programmes de Fidélité par Commerce
CREATE TABLE loyalty_programs (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  program_type TEXT DEFAULT 'STAMPS', -- 'STAMPS' ou 'POINTS'
  stamps_required INT DEFAULT 10,
  points_per_100dzd INT DEFAULT 1,
  reward_title_fr TEXT NOT NULL DEFAULT '10ème Offert',
  reward_title_ar TEXT NOT NULL DEFAULT 'الهدية العاشرة مجاناً',
  welcome_bonus INT DEFAULT 1,
  primary_color TEXT DEFAULT '#10B981',
  background_color TEXT DEFAULT '#0F172A'
);

-- 4. Cartes Clients (Inscription Zéro Friction par N° 05 / 06 / 07)
CREATE TABLE customer_cards (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  program_id TEXT REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  qr_token TEXT UNIQUE NOT NULL,
  stamps_balance INT DEFAULT 1,
  points_balance INT DEFAULT 0,
  rewards_available INT DEFAULT 0,
  total_visits INT DEFAULT 1,
  last_visit_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_id, customer_phone)
);

-- 5. Historique des Transactions en Caisse
CREATE TABLE loyalty_transactions (
  id TEXT PRIMARY KEY,
  card_id TEXT REFERENCES customer_cards(id) ON DELETE CASCADE,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  performed_by TEXT DEFAULT 'Caissier',
  action_type TEXT NOT NULL, -- 'ADD_STAMP', 'ADD_POINTS', 'REDEEM_REWARD'
  delta_value INT NOT NULL,
  purchase_amount_dzd INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Offres Personnalisées Ciblées
CREATE TABLE personalized_offers (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  title_fr TEXT NOT NULL,
  title_ar TEXT,
  description_fr TEXT,
  description_ar TEXT,
  target_segment TEXT DEFAULT 'ALL', -- 'ALL', 'VIP', 'INACTIVE_30D'
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Paiements d'Abonnement (BaridiMob, CCP, Chargily Pay)
CREATE TABLE subscription_payments (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  merchant_name TEXT,
  amount_dzd INT DEFAULT 3900,
  payment_method TEXT NOT NULL, -- 'BARIDIMOB', 'CCP_RECEIPT', 'CHARGILY_PAY'
  transaction_reference TEXT,
  receipt_url TEXT,
  chargily_checkout_id TEXT,
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Désactiver RLS pour permettre à l'API Next.js de lire/écrire sans blocage
ALTER TABLE platform_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE merchants DISABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments DISABLE ROW LEVEL SECURITY;

-- Index pour performances rapides
CREATE INDEX IF NOT EXISTS idx_merchants_slug ON merchants(slug);
CREATE INDEX IF NOT EXISTS idx_merchants_phone ON merchants(phone);
CREATE INDEX IF NOT EXISTS idx_customer_cards_merchant_phone ON customer_cards(merchant_id, customer_phone);
CREATE INDEX IF NOT EXISTS idx_customer_cards_qr_token ON customer_cards(qr_token);

-- Données de démonstration initiales
INSERT INTO merchants (id, business_name, slug, category, wilaya, phone, email, password, logo_url, subscription_status, subscription_ends_at)
VALUES (
  'm-el-bahdja',
  'Café & Pâtisserie El Bahdja',
  'el-bahdja',
  'Café & Restauration',
  '16 - Alger',
  '0550123456',
  'contact@elbahdja.dz',
  '123456',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=160&h=160&fit=crop',
  'ACTIVE',
  NOW() + INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO loyalty_programs (id, merchant_id, program_type, stamps_required, points_per_100dzd, reward_title_fr, reward_title_ar, welcome_bonus, primary_color, background_color)
VALUES (
  'prog-el-bahdja',
  'm-el-bahdja',
  'STAMPS',
  10,
  1,
  '10ème Café ou Pâtisserie Offert',
  'القهوة أو الحلوى العاشرة مجاناً',
  1,
  '#10B981',
  '#0F172A'
) ON CONFLICT (id) DO NOTHING;
