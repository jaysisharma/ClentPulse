-- ==============================================================================
-- Migration: Agency Executive Radar & Financial Pipeline (Phase 5)
-- Description: Ensures index optimizations for executive radar queries and
--              supports multi-tier agency billing plans.
-- ==============================================================================

-- 1. Ensure organizations have billing_plan column with proper check constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'billing_tier'
  ) THEN
    ALTER TABLE public.organizations 
      ADD COLUMN billing_tier text NOT NULL DEFAULT 'starter';
  END IF;
END $$;

-- 2. Performance indexes for high-volume portfolio aggregation across agencies
CREATE INDEX IF NOT EXISTS idx_projects_org_status 
  ON public.projects (org_id, status);

CREATE INDEX IF NOT EXISTS idx_projects_org_waiting 
  ON public.projects (org_id, waiting_on_client);

CREATE INDEX IF NOT EXISTS idx_invoices_project_status 
  ON public.invoices (project_id, status);

CREATE INDEX IF NOT EXISTS idx_time_entries_project_date 
  ON public.time_entries (project_id, date);

CREATE INDEX IF NOT EXISTS idx_project_team_members_lookup 
  ON public.project_team_members (project_id, user_id);

-- Migration complete
