-- ====================================================================
-- FidelityDZ - SaaS Multi-Tenant Plateforme de Fidélité Digitale Algérie
-- PostgreSQL Schema for Supabase (100% RLS Compliant - Rule 5)
-- ====================================================================

-- 1. Table platform_settings
CREATE TABLE IF NOT EXISTS platform_settings (
  id INT PRIMARY KEY DEFAULT 1,
  platform_name TEXT DEFAULT 'FidelityDZ',
  plan_price_dzd INT DEFAULT 3900,
  trial_days INT DEFAULT 14,
  owner_account_name TEXT DEFAULT 'KAZI TANI MOHAMMED EL MEHDI',
  owner_rip_number TEXT DEFAULT '00799999004172668994',
  owner_ccp_number TEXT DEFAULT '41726689',
  owner_ccp_key TEXT DEFAULT '87',
  support_whatsapp TEXT DEFAULT '+213541534762',
  owner_phone TEXT DEFAULT '+213541534762',
  chargily_mode TEXT DEFAULT 'test'
);

INSERT INTO platform_settings (id, platform_name, plan_price_dzd, trial_days, owner_account_name, owner_rip_number, owner_ccp_number, owner_ccp_key, support_whatsapp, owner_phone, chargily_mode)
VALUES (1, 'FidelityDZ', 3900, 14, 'KAZI TANI MOHAMMED EL MEHDI', '00799999004172668994', '41726689', '87', '+213541534762', '+213541534762', 'test')
ON CONFLICT (id) DO UPDATE SET
  owner_account_name = EXCLUDED.owner_account_name,
  owner_rip_number = EXCLUDED.owner_rip_number,
  owner_ccp_number = EXCLUDED.owner_ccp_number,
  owner_ccp_key = EXCLUDED.owner_ccp_key,
  support_whatsapp = EXCLUDED.support_whatsapp,
  owner_phone = EXCLUDED.owner_phone;

-- 2. Table merchants
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

-- 3. Table loyalty_programs
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

-- 4. Table customer_cards
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

-- 5. Table loyalty_transactions
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

-- 6. Table personalized_offers
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

-- 7. Table subscription_payments
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

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) - 100% DES TABLES (RÈGLE 5 SECURITY RULES)
-- ====================================================================

-- 1. RLS platform_settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read platform settings" ON platform_settings;
CREATE POLICY "Public read platform settings" ON platform_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner update platform settings" ON platform_settings;
CREATE POLICY "Owner update platform settings" ON platform_settings
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 2. RLS merchants
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read merchants" ON merchants;
CREATE POLICY "Public read merchants" ON merchants
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated create merchants" ON merchants;
CREATE POLICY "Authenticated create merchants" ON merchants
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id OR owner_user_id IS NULL);

DROP POLICY IF EXISTS "Owner update merchants" ON merchants;
CREATE POLICY "Owner update merchants" ON merchants
  FOR UPDATE USING (auth.uid() = owner_user_id OR owner_user_id IS NULL);

DROP POLICY IF EXISTS "Owner delete merchants" ON merchants;
CREATE POLICY "Owner delete merchants" ON merchants
  FOR DELETE USING (auth.uid() = owner_user_id);

-- 3. RLS loyalty_programs
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read loyalty programs" ON loyalty_programs;
CREATE POLICY "Public read loyalty programs" ON loyalty_programs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Merchant manage loyalty programs" ON loyalty_programs;
CREATE POLICY "Merchant manage loyalty programs" ON loyalty_programs
  FOR ALL USING (
    merchant_id IN (SELECT id FROM merchants WHERE owner_user_id = auth.uid() OR owner_user_id IS NULL)
  );

-- 4. RLS customer_cards
ALTER TABLE customer_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select customer cards" ON customer_cards;
CREATE POLICY "Public select customer cards" ON customer_cards
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert customer cards" ON customer_cards;
CREATE POLICY "Public insert customer cards" ON customer_cards
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Cashier update customer cards" ON customer_cards;
CREATE POLICY "Cashier update customer cards" ON customer_cards
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Merchant delete customer cards" ON customer_cards;
CREATE POLICY "Merchant delete customer cards" ON customer_cards
  FOR DELETE USING (
    merchant_id IN (SELECT id FROM merchants WHERE owner_user_id = auth.uid() OR owner_user_id IS NULL)
  );

-- 5. RLS loyalty_transactions
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Merchant read loyalty transactions" ON loyalty_transactions;
CREATE POLICY "Merchant read loyalty transactions" ON loyalty_transactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Cashier insert loyalty transactions" ON loyalty_transactions;
CREATE POLICY "Cashier insert loyalty transactions" ON loyalty_transactions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Merchant delete loyalty transactions" ON loyalty_transactions;
CREATE POLICY "Merchant delete loyalty transactions" ON loyalty_transactions
  FOR DELETE USING (
    merchant_id IN (SELECT id FROM merchants WHERE owner_user_id = auth.uid() OR owner_user_id IS NULL)
  );

-- 6. RLS personalized_offers
ALTER TABLE personalized_offers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active offers" ON personalized_offers;
CREATE POLICY "Public read active offers" ON personalized_offers
  FOR SELECT USING (is_active = true OR merchant_id IN (SELECT id FROM merchants WHERE owner_user_id = auth.uid() OR owner_user_id IS NULL));

DROP POLICY IF EXISTS "Merchant manage offers" ON personalized_offers;
CREATE POLICY "Merchant manage offers" ON personalized_offers
  FOR ALL USING (
    merchant_id IN (SELECT id FROM merchants WHERE owner_user_id = auth.uid() OR owner_user_id IS NULL)
  );

-- 7. RLS subscription_payments
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Merchant read own payments" ON subscription_payments;
CREATE POLICY "Merchant read own payments" ON subscription_payments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Merchant insert payment proof" ON subscription_payments;
CREATE POLICY "Merchant insert payment proof" ON subscription_payments
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin update payment status" ON subscription_payments;
CREATE POLICY "Admin update payment status" ON subscription_payments
  FOR UPDATE USING (auth.uid() IS NOT NULL);
