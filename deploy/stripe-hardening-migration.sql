-- Stripe Billing Engine Hardening Migration
-- Run this in your Supabase SQL Editor.

-- 1. Table for webhook event idempotency deduplication
CREATE TABLE IF NOT EXISTS public.processed_stripe_events (
  event_id text PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for security, allowing service role full access
ALTER TABLE public.processed_stripe_events ENABLE ROW LEVEL SECURITY;

-- 2. Add event created timestamp to users to guard against out-of-order webhook delivery
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS stripe_event_created_at bigint;

-- 3. Add index on stripe_customer_id for fast webhook lookups
CREATE INDEX IF NOT EXISTS users_stripe_customer_id_idx ON public.users (stripe_customer_id);
