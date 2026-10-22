-- Stripe Connect Migration for Studio Direct Payouts
-- Adds Connect account columns to users and organizations

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_charges_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_connect_onboarded boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS users_stripe_account_id_idx ON public.users (stripe_account_id);

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_charges_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled boolean DEFAULT false;
