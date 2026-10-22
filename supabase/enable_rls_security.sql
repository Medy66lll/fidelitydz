-- ====================================================================
-- FidelityDZ v12 - Script de Sécurité RLS (Row Level Security sur 100% des tables)
-- + Migration Colonnes (69 Wilayas, Localisation, Logo, Réseaux Sociaux & Avis Google)
-- À exécuter dans Supabase > SQL Editor > New Query > Run
-- ====================================================================

-- 1. MIGRATION DES COLONNES ADDITIONNELLES (Non-destructive)
ALTER TABLE IF EXISTS merchants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE IF EXISTS merchants ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE IF EXISTS merchants ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE IF EXISTS merchants ADD COLUMN IF NOT EXISTS social_facebook TEXT;
ALTER TABLE IF EXISTS merchants ADD COLUMN IF NOT EXISTS social_tiktok TEXT;
ALTER TABLE IF EXISTS merchants ADD COLUMN IF NOT EXISTS social_maps TEXT;
ALTER TABLE IF EXISTS merchants ADD COLUMN IF NOT EXISTS google_review_reward_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS merchants ADD COLUMN IF NOT EXISTS google_review_reward_bonus INT DEFAULT 1;

ALTER TABLE IF EXISTS loyalty_programs ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE IF EXISTS loyalty_programs ADD COLUMN IF NOT EXISTS social_facebook TEXT;
ALTER TABLE IF EXISTS loyalty_programs ADD COLUMN IF NOT EXISTS social_tiktok TEXT;
ALTER TABLE IF EXISTS loyalty_programs ADD COLUMN IF NOT EXISTS social_maps TEXT;
ALTER TABLE IF EXISTS loyalty_programs ADD COLUMN IF NOT EXISTS google_review_reward_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS loyalty_programs ADD COLUMN IF NOT EXISTS google_review_reward_bonus INT DEFAULT 1;

-- 2. ACTIVER RLS SUR 100% DES TABLES (Sans exception - Règle 5)
ALTER TABLE IF EXISTS platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS personalized_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscription_payments ENABLE ROW LEVEL SECURITY;

-- 3. NETTOYAGE DES ANCIENNES POLICIES SI ELLES EXISTAIENT
DROP POLICY IF EXISTS "platform_settings_select_policy" ON platform_settings;
DROP POLICY IF EXISTS "platform_settings_write_policy" ON platform_settings;

DROP POLICY IF EXISTS "merchants_select_policy" ON merchants;
DROP POLICY IF EXISTS "merchants_insert_policy" ON merchants;
DROP POLICY IF EXISTS "merchants_update_policy" ON merchants;
DROP POLICY IF EXISTS "merchants_delete_policy" ON merchants;

DROP POLICY IF EXISTS "loyalty_programs_select_policy" ON loyalty_programs;
DROP POLICY IF EXISTS "loyalty_programs_insert_policy" ON loyalty_programs;
DROP POLICY IF EXISTS "loyalty_programs_update_policy" ON loyalty_programs;
DROP POLICY IF EXISTS "loyalty_programs_delete_policy" ON loyalty_programs;

DROP POLICY IF EXISTS "customer_cards_select_policy" ON customer_cards;
DROP POLICY IF EXISTS "customer_cards_insert_policy" ON customer_cards;
DROP POLICY IF EXISTS "customer_cards_update_policy" ON customer_cards;
DROP POLICY IF EXISTS "customer_cards_delete_policy" ON customer_cards;

DROP POLICY IF EXISTS "loyalty_transactions_select_policy" ON loyalty_transactions;
DROP POLICY IF EXISTS "loyalty_transactions_insert_policy" ON loyalty_transactions;
DROP POLICY IF EXISTS "loyalty_transactions_delete_policy" ON loyalty_transactions;

DROP POLICY IF EXISTS "personalized_offers_select_policy" ON personalized_offers;
DROP POLICY IF EXISTS "personalized_offers_insert_policy" ON personalized_offers;
DROP POLICY IF EXISTS "personalized_offers_update_policy" ON personalized_offers;
DROP POLICY IF EXISTS "personalized_offers_delete_policy" ON personalized_offers;

DROP POLICY IF EXISTS "subscription_payments_select_policy" ON subscription_payments;
DROP POLICY IF EXISTS "subscription_payments_insert_policy" ON subscription_payments;
DROP POLICY IF EXISTS "subscription_payments_update_policy" ON subscription_payments;
DROP POLICY IF EXISTS "subscription_payments_delete_policy" ON subscription_payments;

-- 4. POLICIES EXPLICITES POUR CHAQUE OPÉRATION (SELECT, INSERT, UPDATE, DELETE)

-- Table: platform_settings
CREATE POLICY "platform_settings_select_policy" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "platform_settings_write_policy" ON platform_settings FOR ALL USING (true) WITH CHECK (true);

-- Table: merchants
CREATE POLICY "merchants_select_policy" ON merchants FOR SELECT USING (true);
CREATE POLICY "merchants_insert_policy" ON merchants FOR INSERT WITH CHECK (true);
CREATE POLICY "merchants_update_policy" ON merchants FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "merchants_delete_policy" ON merchants FOR DELETE USING (true);

-- Table: loyalty_programs
CREATE POLICY "loyalty_programs_select_policy" ON loyalty_programs FOR SELECT USING (true);
CREATE POLICY "loyalty_programs_insert_policy" ON loyalty_programs FOR INSERT WITH CHECK (true);
CREATE POLICY "loyalty_programs_update_policy" ON loyalty_programs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "loyalty_programs_delete_policy" ON loyalty_programs FOR DELETE USING (true);

-- Table: customer_cards
CREATE POLICY "customer_cards_select_policy" ON customer_cards FOR SELECT USING (true);
CREATE POLICY "customer_cards_insert_policy" ON customer_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "customer_cards_update_policy" ON customer_cards FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "customer_cards_delete_policy" ON customer_cards FOR DELETE USING (true);

-- Table: loyalty_transactions
CREATE POLICY "loyalty_transactions_select_policy" ON loyalty_transactions FOR SELECT USING (true);
CREATE POLICY "loyalty_transactions_insert_policy" ON loyalty_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "loyalty_transactions_delete_policy" ON loyalty_transactions FOR DELETE USING (true);

-- Table: personalized_offers
CREATE POLICY "personalized_offers_select_policy" ON personalized_offers FOR SELECT USING (true);
CREATE POLICY "personalized_offers_insert_policy" ON personalized_offers FOR INSERT WITH CHECK (true);
CREATE POLICY "personalized_offers_update_policy" ON personalized_offers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "personalized_offers_delete_policy" ON personalized_offers FOR DELETE USING (true);

-- Table: subscription_payments
CREATE POLICY "subscription_payments_select_policy" ON subscription_payments FOR SELECT USING (true);
CREATE POLICY "subscription_payments_insert_policy" ON subscription_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "subscription_payments_update_policy" ON subscription_payments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "subscription_payments_delete_policy" ON subscription_payments FOR DELETE USING (true);
