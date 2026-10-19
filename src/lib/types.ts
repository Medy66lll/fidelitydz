// Types TypeScript correspondant au schéma SQL Supabase FidelityDZ v3

export interface PlatformSettings {
  id: number;
  platform_name: string;
  plan_price_dzd: number;
  trial_days: number;
  owner_account_name: string;
  owner_rip_number: string;
  owner_ccp_number: string;
  owner_ccp_key: string;
  owner_whatsapp?: string;
  chargily_mode: 'test' | 'live';
}

export type SubscriptionStatus = 'TRIAL' | 'PENDING_PAYMENT' | 'ACTIVE' | 'EXPIRED';

export interface Merchant {
  id: string;
  owner_user_id?: string;
  business_name: string;
  slug: string;
  category: string;
  wilaya: string;
  phone: string;
  email?: string;
  password?: string;
  logo_url?: string;
  subscription_status: SubscriptionStatus;
  subscription_ends_at: string;
  created_at: string;
}

export type ProgramType = 'STAMPS' | 'POINTS';

export interface LoyaltyProgram {
  id: string;
  merchant_id: string;
  program_type: ProgramType;
  stamps_required: number;
  points_per_100dzd: number;
  reward_title_fr: string;
  reward_title_ar: string;
  welcome_bonus: number;
  primary_color: string;
  background_color: string;
}

export interface CustomerCard {
  id: string;
  merchant_id: string;
  program_id: string;
  customer_phone: string;
  customer_name: string;
  qr_token: string;
  stamps_balance: number;
  points_balance: number;
  rewards_available: number;
  total_visits: number;
  last_visit_at: string;
  created_at: string;
}

export type ActionType = 'ADD_STAMP' | 'ADD_POINTS' | 'REDEEM_REWARD';

export interface LoyaltyTransaction {
  id: string;
  card_id: string;
  merchant_id: string;
  performed_by: string;
  action_type: ActionType;
  delta_value: number;
  purchase_amount_dzd: number;
  created_at: string;
}

export type TargetSegment = 'ALL' | 'VIP' | 'INACTIVE_30D';

export interface PersonalizedOffer {
  id: string;
  merchant_id: string;
  title_fr: string;
  title_ar?: string;
  description_fr: string;
  description_ar?: string;
  target_segment: TargetSegment;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
}

export type PaymentMethod = 'BARIDIMOB' | 'CCP_RECEIPT' | 'CHARGILY_PAY';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SubscriptionPayment {
  id: string;
  merchant_id: string;
  merchant_name?: string;
  amount_dzd: number;
  payment_method: PaymentMethod;
  transaction_reference?: string;
  receipt_url?: string;
  chargily_checkout_id?: string;
  status: PaymentStatus;
  created_at: string;
  reviewed_at?: string;
}
