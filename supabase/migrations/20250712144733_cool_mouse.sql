/*
  # Add affiliate permissions

  1. Security
    - Add permissions for affiliate collections
    - Ensure proper access to affiliate data
*/

-- Create affiliate_referrals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code TEXT NOT NULL,
  referrer_id UUID NOT NULL,
  referred_user_id UUID,
  referred_user_email TEXT,
  referred_user_name TEXT,
  order_id UUID,
  order_total INTEGER,
  commission_amount INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  clicked_at TIMESTAMP WITH TIME ZONE,
  registered_at TIMESTAMP WITH TIME ZONE,
  ordered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create affiliate_commissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL,
  referral_id UUID,
  order_id UUID NOT NULL,
  order_total INTEGER NOT NULL,
  commission_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create affiliate_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.affiliate_settings (
  id TEXT PRIMARY KEY,
  default_commission_rate NUMERIC NOT NULL DEFAULT 5,
  min_payout_amount INTEGER NOT NULL DEFAULT 5000,
  payout_methods JSONB NOT NULL DEFAULT '["Bank Transfer"]',
  terms_and_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create affiliate_payouts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  bank_info JSONB,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create affiliates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  total_commission INTEGER NOT NULL DEFAULT 0,
  pending_commission INTEGER NOT NULL DEFAULT 0,
  paid_commission INTEGER NOT NULL DEFAULT 0,
  bank_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE IF EXISTS public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.affiliate_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.affiliates ENABLE ROW LEVEL SECURITY;

-- Create policies for affiliate_referrals
CREATE POLICY "Anyone can read affiliate_referrals"
ON public.affiliate_referrals FOR SELECT
USING (true);

CREATE POLICY "Anyone can create affiliate_referrals"
ON public.affiliate_referrals FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update affiliate_referrals"
ON public.affiliate_referrals FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Create policies for affiliate_commissions
CREATE POLICY "Anyone can read affiliate_commissions"
ON public.affiliate_commissions FOR SELECT
USING (true);

CREATE POLICY "Anyone can create affiliate_commissions"
ON public.affiliate_commissions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update affiliate_commissions"
ON public.affiliate_commissions FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Create policies for affiliate_settings
CREATE POLICY "Anyone can read affiliate_settings"
ON public.affiliate_settings FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage affiliate_settings"
ON public.affiliate_settings FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create policies for affiliate_payouts
CREATE POLICY "Anyone can read affiliate_payouts"
ON public.affiliate_payouts FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create affiliate_payouts"
ON public.affiliate_payouts FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update affiliate_payouts"
ON public.affiliate_payouts FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Create policies for affiliates
CREATE POLICY "Anyone can read affiliates"
ON public.affiliates FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create affiliates"
ON public.affiliates FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own affiliate or admins can update any"
ON public.affiliates FOR UPDATE
USING (auth.uid() IS NOT NULL AND (auth.uid() = id OR public.is_admin()));

-- Insert default affiliate settings if not exists
INSERT INTO public.affiliate_settings (id, default_commission_rate, min_payout_amount, terms_and_conditions)
VALUES ('default', 5, 5000, 'Default terms and conditions for the affiliate program.')
ON CONFLICT (id) DO NOTHING;