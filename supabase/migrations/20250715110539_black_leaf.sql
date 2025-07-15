/*
  # Add Paid Status to Affiliate Payouts

  1. New Fields
    - Add paid_at timestamp field to affiliate_payouts table
    - Add paid_by field to track admin who marked the payout as paid
    - Add notes field for payment details

  2. Security
    - Ensure proper access to affiliate payout data
*/

-- Add paid_at and paid_by fields to affiliate_payouts if they don't exist
ALTER TABLE public.affiliate_payouts 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS paid_by UUID,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Ensure the status field can accept 'paid' status
ALTER TABLE public.affiliate_payouts 
DROP CONSTRAINT IF EXISTS affiliate_payouts_status_check;

ALTER TABLE public.affiliate_payouts 
ADD CONSTRAINT affiliate_payouts_status_check 
CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'paid'));

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status 
ON public.affiliate_payouts(status);

-- Create index for better performance on affiliate_id queries
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id 
ON public.affiliate_payouts(affiliate_id);

-- Ensure RLS is enabled
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Recreate the permissive policy to ensure it's up to date
DROP POLICY IF EXISTS "Full access to affiliate_payouts" ON public.affiliate_payouts;

CREATE POLICY "Full access to affiliate_payouts"
ON public.affiliate_payouts FOR ALL
USING (true)
WITH CHECK (true);