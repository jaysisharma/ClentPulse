-- ClientPulse Schema Fixes and Enhancements
-- Safe to run in Supabase SQL editor.

-- 1. Update public.time_entries to support invoicing
ALTER TABLE public.time_entries 
  ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invoiced boolean NOT NULL DEFAULT false;

-- Add index to speed up lookup by invoice_id and invoiced status
CREATE INDEX IF NOT EXISTS time_entries_invoice_id_idx ON public.time_entries (invoice_id);
CREATE INDEX IF NOT EXISTS time_entries_project_invoiced_idx ON public.time_entries (project_id, invoiced);

-- 2. Add passcode protection to public.projects for client pages
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS passcode text;

-- 3. Create processed_stripe_events table for webhook idempotency
CREATE TABLE IF NOT EXISTS public.processed_stripe_events (
  event_id text PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for security, but allow service role (webhook handler) full access by default.
ALTER TABLE public.processed_stripe_events ENABLE ROW LEVEL SECURITY;
