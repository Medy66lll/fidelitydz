-- ============================================================================
-- FidelityDZ v45 - Architecture Base de Données Réorganisée avec Quotas & Addons
-- Compatible 100% avec les données existantes
-- ============================================================================

-- 1. PARAMÈTRES GLOBAUX DE LA PLATEFORME
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

-- 2. TABLE DES COMMERÇANTS (AVEC QUOTAS EXACTS DEMANDÉS : 150 Cartes / 150 Push)
CREATE TABLE IF NOT EXISTS merchants (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  address TEXT DEFAULT '',
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  password TEXT NOT NULL DEFAULT '123456',
  logo_url TEXT DEFAULT '',
  social_instagram TEXT DEFAULT '',
  social_facebook TEXT DEFAULT '',
  social_tiktok TEXT DEFAULT '',
  social_maps TEXT DEFAULT '',
  google_review_reward_enabled BOOLEAN DEFAULT FALSE,
  google_review_reward_bonus INT DEFAULT 1,
  plan_tier TEXT DEFAULT 'STARTER', -- Géré par l'admin
  max_cards INT DEFAULT 150,        -- Limite de base modifiée
  max_locations INT DEFAULT 1,
  max_users INT DEFAULT 2,
  max_active_offers INT DEFAULT 3,
  max_push_per_week INT DEFAULT 150,-- Limite de base modifiée
  push_sent_this_week INT DEFAULT 0,
  push_week_reset_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  subscription_status TEXT DEFAULT 'TRIAL',
  subscription_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commandes de migration (si table existante)
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS social_instagram TEXT DEFAULT '';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS social_facebook TEXT DEFAULT '';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS social_tiktok TEXT DEFAULT '';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS social_maps TEXT DEFAULT '';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS google_review_reward_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS google_review_reward_bonus INT DEFAULT 1;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'STARTER';
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS max_cards INT DEFAULT 150;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS max_locations INT DEFAULT 1;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS max_users INT DEFAULT 2;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS max_active_offers INT DEFAULT 3;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS max_push_per_week INT DEFAULT 150;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS push_sent_this_week INT DEFAULT 0;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS push_week_reset_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');

-- 3. PROGRAMMES
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

-- 4. CARTES CLIENTS
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
  google_review_claimed BOOLEAN DEFAULT FALSE,
  last_visit_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_id, customer_phone)
);

ALTER TABLE customer_cards ADD COLUMN IF NOT EXISTS google_review_claimed BOOLEAN DEFAULT FALSE;

-- 5. TRANSACTIONS
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

-- 6. OFFRES
CREATE TABLE IF NOT EXISTS personalized_offers (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  title_fr TEXT NOT NULL,
  title_ar TEXT DEFAULT '',
  description_fr TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  target_segment TEXT DEFAULT 'ALL',
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE personalized_offers ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE personalized_offers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 7. PAIEMENTS
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

-- 8. RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_platform" ON platform_settings;
CREATE POLICY "allow_all_platform" ON platform_settings FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "allow_all_merchants" ON merchants;
CREATE POLICY "allow_all_merchants" ON merchants FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "allow_all_programs" ON loyalty_programs;
CREATE POLICY "allow_all_programs" ON loyalty_programs FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "allow_all_cards" ON customer_cards;
CREATE POLICY "allow_all_cards" ON customer_cards FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "allow_all_tx" ON loyalty_transactions;
CREATE POLICY "allow_all_tx" ON loyalty_transactions FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "allow_all_offers" ON personalized_offers;
CREATE POLICY "allow_all_offers" ON personalized_offers FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "allow_all_payments" ON subscription_payments;
CREATE POLICY "allow_all_payments" ON subscription_payments FOR ALL USING (true) WITH CHECK (true);

-- 9. TRIGGERS ANTI-SATURATION
CREATE OR REPLACE FUNCTION enforce_merchant_card_quota()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
  allowed_max INT;
BEGIN
  SELECT COUNT(*) INTO current_count FROM customer_cards WHERE merchant_id = NEW.merchant_id;
  SELECT COALESCE(max_cards, 150) INTO allowed_max FROM merchants WHERE id = NEW.merchant_id;
  IF current_count >= allowed_max THEN
    RAISE EXCEPTION 'QUOTA_CARDS_EXCEEDED: Ce commerce a atteint sa limite de % cartes.', allowed_max;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_card_quota ON customer_cards;
CREATE TRIGGER trg_enforce_card_quota
BEFORE INSERT ON customer_cards
FOR EACH ROW EXECUTE FUNCTION enforce_merchant_card_quota();

CREATE OR REPLACE FUNCTION enforce_merchant_offer_quota()
RETURNS TRIGGER AS $$
DECLARE
  active_count INT;
  allowed_max INT;
BEGIN
  IF NEW.is_active = TRUE THEN
    SELECT COUNT(*) INTO active_count FROM personalized_offers
    WHERE merchant_id = NEW.merchant_id AND is_active = TRUE AND id <> NEW.id;
    SELECT COALESCE(max_active_offers, 3) INTO allowed_max FROM merchants WHERE id = NEW.merchant_id;
    IF active_count >= allowed_max THEN
      RAISE EXCEPTION 'QUOTA_OFFERS_EXCEEDED: Limite de % offres actives simultanées atteinte.', allowed_max;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_offer_quota ON personalized_offers;
CREATE TRIGGER trg_enforce_offer_quota
BEFORE INSERT OR UPDATE ON personalized_offers
FOR EACH ROW EXECUTE FUNCTION enforce_merchant_offer_quota();

NOTIFY pgrst, 'reload schema';
