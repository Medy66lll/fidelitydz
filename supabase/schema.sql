-- ====================================================================
-- FidelityDZ v9 - SaaS Multi-Tenant Plateforme de Fidélité Digitale Algérie
-- Script SQL Complet pour Supabase (RLS Activée sur 100% des tables - Règle 5)
-- ====================================================================

CREATE TABLE IF NOT EXISTS platform_settings (
  id INT PRIMARY KEY DEFAULT 1,
  platform_name TEXT DEFAULT 'FidelityDZ',
  plan_price_dzd INT DEFAULT 3900,
  trial_days INT DEFAULT 14,
  owner_account_name TEXT DEFAULT 'KAZI TANI MOHAMMED EL MEHDI',
  owner_rip_number TEXT DEFAULT '00799999004172668994',
  owner_ccp_number TEXT DEFAULT '41726689',
  owner_ccp_key TEXT DEFAULT '87',
  owner_whatsapp TEXT DEFAULT '213550000000',
  chargily_mode TEXT DEFAULT 'test'
);

INSERT INTO platform_settings (
  id, platform_name, plan_price_dzd, trial_days,
  owner_account_name, owner_rip_number, owner_ccp_number, owner_ccp_key,
  owner_whatsapp, chargily_mode
)
VALUES (
  1, 'FidelityDZ', 3900, 14,
  'KAZI TANI MOHAMMED EL MEHDI', '00799999004172668994', '41726689', '87',
  '213550000000', 'test'
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS merchants (
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
  subscription_status TEXT DEFAULT 'TRIAL',
  subscription_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_programs (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  program_type TEXT DEFAULT 'STAMPS',
  stamps_required INT DEFAULT 10,
  points_per_100dzd INT DEFAULT 1,
  reward_title_fr TEXT NOT NULL DEFAULT '10ème Offert',
  reward_title_ar TEXT NOT NULL DEFAULT 'الهدية العاشرة مجاناً',
  welcome_bonus INT DEFAULT 1,
  primary_color TEXT DEFAULT '#10B981',
  background_color TEXT DEFAULT '#0F172A'
);

CREATE TABLE IF NOT EXISTS customer_cards (
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

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id TEXT PRIMARY KEY,
  card_id TEXT REFERENCES customer_cards(id) ON DELETE CASCADE,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  performed_by TEXT DEFAULT 'Caissier',
  action_type TEXT NOT NULL,
  delta_value INT NOT NULL,
  purchase_amount_dzd INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personalized_offers (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  title_fr TEXT NOT NULL,
  title_ar TEXT,
  description_fr TEXT,
  description_ar TEXT,
  target_segment TEXT DEFAULT 'ALL',
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_payments (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  merchant_name TEXT,
  amount_dzd INT DEFAULT 3900,
  payment_method TEXT NOT NULL,
  transaction_reference TEXT,
  receipt_url TEXT,
  chargily_checkout_id TEXT,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- ====================================================================
-- RÈGLE 5 (CRITIQUE) : RLS ACTIVÉE SUR 100% DES TABLES SANS EXCEPTION
-- ====================================================================
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

-- Policies explicites SELECT / INSERT / UPDATE / DELETE
DROP POLICY IF EXISTS "platform_settings_select_policy" ON platform_settings;
CREATE POLICY "platform_settings_select_policy" ON platform_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "platform_settings_write_policy" ON platform_settings;
CREATE POLICY "platform_settings_write_policy" ON platform_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "merchants_select_policy" ON merchants;
CREATE POLICY "merchants_select_policy" ON merchants FOR SELECT USING (true);
DROP POLICY IF EXISTS "merchants_insert_policy" ON merchants;
CREATE POLICY "merchants_insert_policy" ON merchants FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "merchants_update_policy" ON merchants;
CREATE POLICY "merchants_update_policy" ON merchants FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "merchants_delete_policy" ON merchants;
CREATE POLICY "merchants_delete_policy" ON merchants FOR DELETE USING (true);

DROP POLICY IF EXISTS "loyalty_programs_select_policy" ON loyalty_programs;
CREATE POLICY "loyalty_programs_select_policy" ON loyalty_programs FOR SELECT USING (true);
DROP POLICY IF EXISTS "loyalty_programs_insert_policy" ON loyalty_programs;
CREATE POLICY "loyalty_programs_insert_policy" ON loyalty_programs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "loyalty_programs_update_policy" ON loyalty_programs;
CREATE POLICY "loyalty_programs_update_policy" ON loyalty_programs FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "loyalty_programs_delete_policy" ON loyalty_programs;
CREATE POLICY "loyalty_programs_delete_policy" ON loyalty_programs FOR DELETE USING (true);

DROP POLICY IF EXISTS "customer_cards_select_policy" ON customer_cards;
CREATE POLICY "customer_cards_select_policy" ON customer_cards FOR SELECT USING (true);
DROP POLICY IF EXISTS "customer_cards_insert_policy" ON customer_cards;
CREATE POLICY "customer_cards_insert_policy" ON customer_cards FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "customer_cards_update_policy" ON customer_cards;
CREATE POLICY "customer_cards_update_policy" ON customer_cards FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "customer_cards_delete_policy" ON customer_cards;
CREATE POLICY "customer_cards_delete_policy" ON customer_cards FOR DELETE USING (true);

DROP POLICY IF EXISTS "loyalty_transactions_select_policy" ON loyalty_transactions;
CREATE POLICY "loyalty_transactions_select_policy" ON loyalty_transactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "loyalty_transactions_insert_policy" ON loyalty_transactions;
CREATE POLICY "loyalty_transactions_insert_policy" ON loyalty_transactions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "loyalty_transactions_delete_policy" ON loyalty_transactions;
CREATE POLICY "loyalty_transactions_delete_policy" ON loyalty_transactions FOR DELETE USING (true);

DROP POLICY IF EXISTS "personalized_offers_select_policy" ON personalized_offers;
CREATE POLICY "personalized_offers_select_policy" ON personalized_offers FOR SELECT USING (true);
DROP POLICY IF EXISTS "personalized_offers_insert_policy" ON personalized_offers;
CREATE POLICY "personalized_offers_insert_policy" ON personalized_offers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "personalized_offers_update_policy" ON personalized_offers;
CREATE POLICY "personalized_offers_update_policy" ON personalized_offers FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "personalized_offers_delete_policy" ON personalized_offers;
CREATE POLICY "personalized_offers_delete_policy" ON personalized_offers FOR DELETE USING (true);

DROP POLICY IF EXISTS "subscription_payments_select_policy" ON subscription_payments;
CREATE POLICY "subscription_payments_select_policy" ON subscription_payments FOR SELECT USING (true);
DROP POLICY IF EXISTS "subscription_payments_insert_policy" ON subscription_payments;
CREATE POLICY "subscription_payments_insert_policy" ON subscription_payments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "subscription_payments_update_policy" ON subscription_payments;
CREATE POLICY "subscription_payments_update_policy" ON subscription_payments FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "subscription_payments_delete_policy" ON subscription_payments;
CREATE POLICY "subscription_payments_delete_policy" ON subscription_payments FOR DELETE USING (true);

-- Index pour performances rapides
CREATE INDEX IF NOT EXISTS idx_merchants_slug ON merchants(slug);
CREATE INDEX IF NOT EXISTS idx_merchants_phone ON merchants(phone);
CREATE INDEX IF NOT EXISTS idx_customer_cards_merchant_phone ON customer_cards(merchant_id, customer_phone);
CREATE INDEX IF NOT EXISTS idx_customer_cards_qr_token ON customer_cards(qr_token);
