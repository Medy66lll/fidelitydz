-- FidelityDZ - Script de Sécurité RLS Stricte
-- 8. RLS (Politiques strictes : écriture réservée au serveur via service_role ou propriétaire authentifié)
ALTER TABLE IF EXISTS platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS personalized_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscription_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_platform" ON platform_settings;
DROP POLICY IF EXISTS "allow_all_merchants" ON merchants;
DROP POLICY IF EXISTS "allow_all_programs" ON loyalty_programs;
DROP POLICY IF EXISTS "allow_all_cards" ON customer_cards;
DROP POLICY IF EXISTS "allow_all_tx" ON loyalty_transactions;
DROP POLICY IF EXISTS "allow_all_offers" ON personalized_offers;
DROP POLICY IF EXISTS "allow_all_payments" ON subscription_payments;

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

CREATE POLICY "platform_settings_select_policy" ON platform_settings FOR SELECT USING (auth.role() = 'service_role' OR id = 1);
CREATE POLICY "platform_settings_write_policy" ON platform_settings FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "merchants_select_policy" ON merchants FOR SELECT USING (auth.role() = 'service_role' OR auth.uid()::text = owner_user_id OR auth.uid()::text = id);
CREATE POLICY "merchants_insert_policy" ON merchants FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid()::text = owner_user_id OR auth.uid()::text = id);
CREATE POLICY "merchants_update_policy" ON merchants FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid()::text = owner_user_id OR auth.uid()::text = id) WITH CHECK (auth.role() = 'service_role' OR auth.uid()::text = owner_user_id OR auth.uid()::text = id);
CREATE POLICY "merchants_delete_policy" ON merchants FOR DELETE USING (auth.role() = 'service_role' OR auth.uid()::text = owner_user_id);

CREATE POLICY "loyalty_programs_select_policy" ON loyalty_programs FOR SELECT USING (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);
CREATE POLICY "loyalty_programs_insert_policy" ON loyalty_programs FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);
CREATE POLICY "loyalty_programs_update_policy" ON loyalty_programs FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid()::text = merchant_id) WITH CHECK (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);
CREATE POLICY "loyalty_programs_delete_policy" ON loyalty_programs FOR DELETE USING (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);

CREATE POLICY "customer_cards_select_policy" ON customer_cards FOR SELECT USING (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);
CREATE POLICY "customer_cards_insert_policy" ON customer_cards FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);
CREATE POLICY "customer_cards_update_policy" ON customer_cards FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid()::text = merchant_id) WITH CHECK (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);
CREATE POLICY "customer_cards_delete_policy" ON customer_cards FOR DELETE USING (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);

CREATE POLICY "loyalty_transactions_select_policy" ON loyalty_transactions FOR SELECT USING (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);
CREATE POLICY "loyalty_transactions_insert_policy" ON loyalty_transactions FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);
CREATE POLICY "loyalty_transactions_delete_policy" ON loyalty_transactions FOR DELETE USING (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);

CREATE POLICY "personalized_offers_select_policy" ON personalized_offers FOR SELECT USING (auth.role() = 'service_role' OR is_active = true);
CREATE POLICY "personalized_offers_insert_policy" ON personalized_offers FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);
CREATE POLICY "personalized_offers_update_policy" ON personalized_offers FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid()::text = merchant_id) WITH CHECK (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);
CREATE POLICY "personalized_offers_delete_policy" ON personalized_offers FOR DELETE USING (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);

CREATE POLICY "subscription_payments_select_policy" ON subscription_payments FOR SELECT USING (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);
CREATE POLICY "subscription_payments_insert_policy" ON subscription_payments FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid()::text = merchant_id);
CREATE POLICY "subscription_payments_update_policy" ON subscription_payments FOR UPDATE USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "subscription_payments_delete_policy" ON subscription_payments FOR DELETE USING (auth.role() = 'service_role');
