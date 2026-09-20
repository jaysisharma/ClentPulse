-- ==============================================================================
-- FREVIO: COMPLETE ALL-IN-ONE SYSTEM MIGRATION (100% IDEMPOTENT & SAFE)
-- Run this script in your Supabase Project -> SQL Editor -> New Query -> Run
-- Handles all missing columns, organizations, team pods, white-labeling,
-- review workflow, and executive radar indexes in proper order.
-- ==============================================================================

-- ==============================================================================
-- 0. BASE TABLE COLUMN PREREQUISITES
-- ==============================================================================
-- Projects: Client blocker status and kickoff deposit requirements
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS waiting_on_client boolean DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS waiting_reason text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS deposit_required numeric(10,2);
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS deposit_paid boolean DEFAULT false;

-- Invoices: Multi-currency, tax/VAT compliance, upfront deposit tags
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax_rate numeric(5,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax_id text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS is_deposit boolean DEFAULT false;

-- Approvals: Rich preview deliverable types (staging, figma, code_pr, document, asset_zip)
ALTER TABLE public.approvals ADD COLUMN IF NOT EXISTS preview_type text DEFAULT 'staging';

-- ==============================================================================
-- 1. ORGANIZATIONS (MULTI-TENANT WORKSPACES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  favicon_url text,
  accent_color text DEFAULT '#6366F1',
  white_label boolean DEFAULT false,
  custom_domain text UNIQUE,
  billing_plan text DEFAULT 'free' CHECK (billing_plan IN ('free', 'starter', 'agency_pro', 'enterprise')),
  billing_tier text DEFAULT 'starter',
  stripe_customer_id text,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Ensure columns exist if table was created previously
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS favicon_url text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#6366F1';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS white_label boolean DEFAULT false;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS custom_domain text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS billing_tier text DEFAULT 'starter';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Add unique constraint on custom_domain if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'organizations_custom_domain_key'
  ) THEN
    ALTER TABLE public.organizations ADD CONSTRAINT organizations_custom_domain_key UNIQUE (custom_domain);
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- ==============================================================================
-- 2. ORGANIZATION MEMBERS (TEAM SEATS & ROLES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- ==============================================================================
-- 3. ORGANIZATION INVITES (EMAIL INVITATION TOKENS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.organization_invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  token text UNIQUE NOT NULL,
  invited_by uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

-- ==============================================================================
-- 4. LINK PROJECTS TO ORGANIZATIONS
-- ==============================================================================
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- ==============================================================================
-- 5. PROJECT TEAM MEMBERS (STAFFED PROJECT PODS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.project_team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role_title text NOT NULL DEFAULT 'Team Specialist',
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- ==============================================================================
-- 6. UPDATES REVIEW WORKFLOW & STAGING
-- ==============================================================================
ALTER TABLE public.updates ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.updates ADD COLUMN IF NOT EXISTS review_status text DEFAULT 'published';
ALTER TABLE public.updates ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.updates ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Add check constraint for review_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'updates_review_status_check'
  ) THEN
    ALTER TABLE public.updates ADD CONSTRAINT updates_review_status_check 
      CHECK (review_status IN ('draft', 'review_ready', 'approved', 'published'));
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- ==============================================================================
-- 7. UPDATE COMMENTS INTERNAL NOTES (CLIENT CONCEALMENT)
-- ==============================================================================
ALTER TABLE public.update_comments ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false;
ALTER TABLE public.update_comments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.users(id) ON DELETE SET NULL;

-- ==============================================================================
-- 8. ACTIVITY AUDIT LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ==============================================================================
-- 9. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS org_members_user_id_idx ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS org_members_org_id_idx ON public.organization_members(org_id);
CREATE INDEX IF NOT EXISTS org_invites_token_idx ON public.organization_invites(token);
CREATE INDEX IF NOT EXISTS org_invites_email_idx ON public.organization_invites(email);
CREATE INDEX IF NOT EXISTS projects_org_id_idx ON public.projects(org_id);
CREATE INDEX IF NOT EXISTS project_team_members_project_id_idx ON public.project_team_members(project_id);
CREATE INDEX IF NOT EXISTS project_team_members_user_id_idx ON public.project_team_members(user_id);
CREATE INDEX IF NOT EXISTS organizations_custom_domain_idx ON public.organizations(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS activity_logs_org_id_idx ON public.activity_logs(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_project_id_idx ON public.activity_logs(project_id);
CREATE INDEX IF NOT EXISTS update_comments_internal_idx ON public.update_comments(project_id, is_internal);
CREATE INDEX IF NOT EXISTS updates_review_status_idx ON public.updates(project_id, review_status);
CREATE INDEX IF NOT EXISTS invoices_currency_idx ON public.invoices(currency);

-- Executive Radar composite indexes
CREATE INDEX IF NOT EXISTS idx_projects_org_status ON public.projects(org_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_org_waiting ON public.projects(org_id, waiting_on_client);
CREATE INDEX IF NOT EXISTS idx_invoices_project_status ON public.invoices(project_id, status);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_date ON public.time_entries(project_id, date);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES & HELPER FUNCTIONS
-- ==============================================================================
-- Helper functions with SECURITY DEFINER to prevent infinite recursion in RLS
CREATE OR REPLACE FUNCTION public.get_user_org_ids(lookup_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT org_id FROM public.organization_members WHERE user_id = lookup_user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_user_admin_org_ids(lookup_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT org_id FROM public.organization_members WHERE user_id = lookup_user_id AND role IN ('owner', 'admin');
$$;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 10.1 Organizations Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view organizations" ON public.organizations;
  DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
  DROP POLICY IF EXISTS "Owners and admins can update their organizations" ON public.organizations;
END $$;

CREATE POLICY "Public can view organizations"
  ON public.organizations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners and admins can update their organizations"
  ON public.organizations FOR UPDATE
  USING (
    id IN (SELECT public.get_user_admin_org_ids(auth.uid()))
  );

-- 10.2 Organization Members Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Members can view co-members in their organizations" ON public.organization_members;
  DROP POLICY IF EXISTS "Users can insert membership" ON public.organization_members;
  DROP POLICY IF EXISTS "Owners and admins can delete members or members leave" ON public.organization_members;
END $$;

CREATE POLICY "Members can view co-members in their organizations"
  ON public.organization_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
  );

CREATE POLICY "Users can insert membership"
  ON public.organization_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners and admins can delete members or members leave"
  ON public.organization_members FOR DELETE
  USING (
    user_id = auth.uid() OR
    org_id IN (SELECT public.get_user_admin_org_ids(auth.uid()))
  );

-- 10.3 Organization Invites Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Members can view invites for their organization" ON public.organization_invites;
  DROP POLICY IF EXISTS "Admins and owners can manage invites" ON public.organization_invites;
END $$;

CREATE POLICY "Members can view invites for their organization"
  ON public.organization_invites FOR SELECT
  USING (
    org_id IN (SELECT public.get_user_admin_org_ids(auth.uid()))
  );

CREATE POLICY "Admins and owners can manage invites"
  ON public.organization_invites FOR ALL
  USING (
    org_id IN (SELECT public.get_user_admin_org_ids(auth.uid()))
  );

-- 10.4 Project Team Members Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view project team members" ON public.project_team_members;
  DROP POLICY IF EXISTS "Owners and admins can manage project team members" ON public.project_team_members;
END $$;

CREATE POLICY "Public can view project team members"
  ON public.project_team_members FOR SELECT
  USING (true);

CREATE POLICY "Owners and admins can manage project team members"
  ON public.project_team_members FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.projects WHERE id = project_team_members.project_id
    )
    OR
    auth.uid() IN (
      SELECT om.user_id
      FROM public.organization_members om
      JOIN public.projects p ON p.org_id = om.org_id
      WHERE p.id = project_team_members.project_id
        AND om.role IN ('owner', 'admin')
    )
  );

-- 10.5 Activity Logs Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Members can view agency activity logs" ON public.activity_logs;
  DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON public.activity_logs;
END $$;

CREATE POLICY "Members can view agency activity logs"
  ON public.activity_logs FOR SELECT
  USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
  );

CREATE POLICY "Authenticated users can insert activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Migration completed successfully!
