-- ==============================================================================
-- FREVIO: SCOPE CREEP SHIELD & CHANGE ORDERS MIGRATION (100% IDEMPOTENT)
-- Run this in Supabase SQL Editor.
-- Adds public.change_orders table, RLS policies, Realtime, and indexes.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.change_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  source_feedback_id uuid REFERENCES public.feedback(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  estimated_hours numeric(6,1),
  timeline_days int DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'declined', 'paid')),
  requires_payment boolean DEFAULT true,
  client_notes text,
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Ensure columns exist in case table existed previously
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS source_feedback_id uuid;
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS estimated_hours numeric(6,1);
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS timeline_days int DEFAULT 0;
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS requires_payment boolean DEFAULT true;
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS client_notes text;
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Enable RLS
ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS change_orders_project_id_idx ON public.change_orders(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS change_orders_user_id_idx ON public.change_orders(user_id);
CREATE INDEX IF NOT EXISTS change_orders_status_idx ON public.change_orders(status);

-- RLS Policies:
-- 1. Freelancers/Owners can manage their own change orders
DROP POLICY IF EXISTS "Owners can manage own change orders" ON public.change_orders;
CREATE POLICY "Owners can manage own change orders" ON public.change_orders
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Clients or anyone with project access can view change orders for the project
DROP POLICY IF EXISTS "Public and clients can view change orders for project" ON public.change_orders;
CREATE POLICY "Public and clients can view change orders for project" ON public.change_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = change_orders.project_id
        AND (
          p.user_id = auth.uid()
          OR p.client_user_id = auth.uid()
          OR p.client_email = auth.email()
          OR true -- Allow public read on portal project
        )
    )
  );

-- 3. Clients can update status of change orders (approve/decline)
DROP POLICY IF EXISTS "Clients can update change orders" ON public.change_orders;
CREATE POLICY "Clients can update change orders" ON public.change_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = change_orders.project_id
        AND (
          p.user_id = auth.uid()
          OR p.client_user_id = auth.uid()
          OR p.client_email = auth.email()
          OR true
        )
    )
  );

-- Add to Supabase Realtime publication if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'change_orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.change_orders;
  END IF;
END $$;
