// Types TypeScript correspondant au schéma SQL Supabase FidelityDZ v3 + v11

export const ALGERIAN_WILAYAS_69 = [
  '01 - Adrar (أدرار)',
  '02 - Chlef (الشلف)',
  '03 - Laghouat (الأغواط)',
  '04 - Oum El Bouaghi (أم البواقي)',
  '05 - Batna (باتنة)',
  '06 - Béjaïa (بجاية)',
  '07 - Biskra (بسكرة)',
  '08 - Béchar (بشار)',
  '09 - Blida (البليدة)',
  '10 - Bouira (البويرة)',
  '11 - Tamanrasset (تمنراست)',
  '12 - Tébessa (تبسة)',
  '13 - Tlemcen (تلمسان)',
  '14 - Tiaret (تيارت)',
  '15 - Tizi Ouzou (تيزي وزو)',
  '16 - Alger (الجزائر العاصمة)',
  '17 - Djelfa (الجلفة)',
  '18 - Jijel (جيجل)',
  '19 - Sétif (سطيف)',
  '20 - Saïda (سعيدة)',
  '21 - Skikda (سكيكدة)',
  '22 - Sidi Bel Abbès (سيدي بلعباس)',
  '23 - Annaba (عنابة)',
  '24 - Guelma (قالمة)',
  '25 - Constantine (قسنطينة)',
  '26 - Médéa (المدية)',
  '27 - Mostaganem (مستغانم)',
  '28 - M\'Sila (المسيلة)',
  '29 - Mascara (معسكر)',
  '30 - Ouargla (ورقلة)',
  '31 - Oran (وهران)',
  '32 - El Bayadh (البيض)',
  '33 - Illizi (إليزي)',
  '34 - Bordj Bou Arréridj (برج بوعريريج)',
  '35 - Boumerdès (بومرداس)',
  '36 - El Tarf (الطارف)',
  '37 - Tindouf (تندوف)',
  '38 - Tissemsilt (تيسمسيلت)',
  '39 - El Oued (الوادي)',
  '40 - Khenchela (خنشلة)',
  '41 - Souk Ahras (سوق أهراس)',
  '42 - Tipaza (تيبازة)',
  '43 - Mila (ميلة)',
  '44 - Aïn Defla (عين الدفلى)',
  '45 - Naâma (النعامة - المشرية)',
  '46 - Aïn Témouchent (عين تموشنت)',
  '47 - Ghardaïa (غرداية)',
  '48 - Relizane (غليزان)',
  '49 - Timimoun (تيميمون)',
  '50 - Bordj Badji Mokhtar (برج باجي مختار)',
  '51 - Ouled Djellal (أولاد جلال)',
  '52 - Béni Abbès (بني عباس)',
  '53 - In Salah (عين صالح)',
  '54 - In Guezzam (عين قزام)',
  '55 - Touggourt (تقرت)',
  '56 - Djanet (جانت)',
  '57 - El M\'Ghair (المغير)',
  '58 - El Meniaa (المنيعة)',
  '59 - Aflou (آفلو)',
  '60 - Barika (بريكة)',
  '61 - Ksar Chellala (قصر الشلالة)',
  '62 - Messaâd (مسعد)',
  '63 - Aïn Oussera (عين وسارة)',
  '64 - Boussaâda (بوسعادة)',
  '65 - El Eulma (العلمة)',
  '66 - Djamaâ (جامعة)',
  '67 - El Abiodh Sidi Cheikh (الأبيض سيدي الشيخ)',
  '68 - Debdeb (الدبداب)',
  '69 - Bougtob (بوقطب)',
] as const;

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
  address?: string; // Localisation / adresse ou lien Google Maps
  phone: string;
  email?: string;
  password?: string;
  logo_url?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_tiktok?: string;
  social_maps?: string;
  google_review_reward_enabled?: boolean;
  google_review_reward_bonus?: number; // Ex: 1 tampon ou 10 points
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
  social_instagram?: string;
  social_facebook?: string;
  social_tiktok?: string;
  social_maps?: string;
  google_review_reward_enabled?: boolean;
  google_review_reward_bonus?: number;
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
  google_review_claimed?: boolean;
  created_at: string;
}

export type ActionType = 'ADD_STAMP' | 'ADD_POINTS' | 'REDEEM_REWARD' | 'GOOGLE_REVIEW_BONUS';

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
  image_url?: string;
  updated_at?: string;
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
