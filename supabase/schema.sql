-- ====================================================================
-- FidelityDZ - SaaS Multi-Tenant Plateforme de Fidélité Digitale Algérie
-- PostgreSQL Schema for Supabase
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
  chargily_mode TEXT DEFAULT 'test'
);

INSERT INTO platform_settings (id, platform_name, plan_price_dzd, trial_days, owner_account_name, owner_rip_number, owner_ccp_number, owner_ccp_key, chargily_mode)
VALUES (1, 'FidelityDZ', 3900, 14, 'KAZI TANI MOHAMMED EL MEHDI', '00799999004172668994', '41726689', '87', 'test')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  phone TEXT NOT NULL,
  logo_url TEXT,
  subscription_status TEXT DEFAULT 'TRIAL', -- 'TRIAL', 'PENDING_PAYMENT', 'ACTIVE', 'EXPIRED'
  subscription_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  program_type TEXT DEFAULT 'STAMPS', -- 'STAMPS' or 'POINTS'
  stamps_required INT DEFAULT 10,
  points_per_100dzd INT DEFAULT 1,
  reward_title_fr TEXT NOT NULL DEFAULT '10ème Offert',
  reward_title_ar TEXT NOT NULL DEFAULT 'الهدية العاشرة مجاناً',
  welcome_bonus INT DEFAULT 1,
  primary_color TEXT DEFAULT '#10B981',
  background_color TEXT DEFAULT '#0F172A'
);

CREATE TABLE IF NOT EXISTS customer_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  program_id UUID REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  qr_token UUID UNIQUE DEFAULT gen_random_uuid(),
  stamps_balance INT DEFAULT 1,
  points_balance INT DEFAULT 0,
  rewards_available INT DEFAULT 0,
  total_visits INT DEFAULT 1,
  last_visit_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_id, customer_phone)
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES customer_cards(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  performed_by TEXT DEFAULT 'Caissier',
  action_type TEXT NOT NULL, -- 'ADD_STAMP', 'ADD_POINTS', 'REDEEM_REWARD'
  delta_value INT NOT NULL,
  purchase_amount_dzd INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personalized_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  title_fr TEXT NOT NULL,
  title_ar TEXT,
  description_fr TEXT,
  description_ar TEXT,
  target_segment TEXT DEFAULT 'ALL', -- 'ALL', 'VIP', 'INACTIVE_30D'
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  amount_dzd INT DEFAULT 3900,
  payment_method TEXT NOT NULL, -- 'BARIDIMOB', 'CCP_RECEIPT', 'CHARGILY_PAY'
  transaction_reference TEXT,
  receipt_url TEXT,
  chargily_checkout_id TEXT,
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Indexes for ultra-fast multi-tenant & cashier lookups
CREATE INDEX IF NOT EXISTS idx_merchants_slug ON merchants(slug);
CREATE INDEX IF NOT EXISTS idx_customer_cards_merchant_phone ON customer_cards(merchant_id, customer_phone);
CREATE INDEX IF NOT EXISTS idx_customer_cards_qr_token ON customer_cards(qr_token);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_card ON loyalty_transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_personalized_offers_merchant ON personalized_offers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_merchant ON subscription_payments(merchant_id);
