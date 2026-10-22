-- ==============================================================================
-- FREVIO: CLIENT FILE UPLOADS MIGRATION (IDEMPOTENT)
-- Run this in Supabase SQL Editor.
--
-- Lets clients upload assets (logos, copy, credentials docs) from their portal.
-- Files live in a PRIVATE storage bucket with no storage policies: clients and
-- studios only reach them through server routes that check portal access /
-- project membership and hand out short-lived signed URLs.
-- ==============================================================================

-- 1. Private bucket (50 MB per file)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('client-files', 'client-files', false, 52428800)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 52428800;

-- 2. File metadata
CREATE TABLE IF NOT EXISTS public.client_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  size_bytes bigint,
  content_type text,
  uploaded_by text NOT NULL DEFAULT 'client' CHECK (uploaded_by IN ('client', 'studio')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_files_project_idx ON public.client_files(project_id, created_at DESC);

ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;

-- 3. Project owners and agency team members can read and delete files.
--    Inserts happen server-side with the service role after portal access checks.
DROP POLICY IF EXISTS "Owners and team can view client files" ON public.client_files;
CREATE POLICY "Owners and team can view client files" ON public.client_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = client_files.project_id
        AND (
          p.user_id = auth.uid()
          OR (
            p.org_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM public.organization_members om
              WHERE om.org_id = p.org_id
                AND om.user_id = auth.uid()
            )
          )
        )
    )
  );

DROP POLICY IF EXISTS "Owners and admins can delete client files" ON public.client_files;
CREATE POLICY "Owners and admins can delete client files" ON public.client_files
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = client_files.project_id
        AND (
          p.user_id = auth.uid()
          OR (
            p.org_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM public.organization_members om
              WHERE om.org_id = p.org_id
                AND om.user_id = auth.uid()
                AND om.role IN ('owner', 'admin')
            )
          )
        )
    )
  );

-- ==============================================================================
-- SECURITY: lock down get_project_by_slug
-- It returns full project rows (including the plaintext portal passcode, client
-- email and budget). The app now calls it only with the service role, so revoke
-- it from browser-reachable roles.
-- ==============================================================================
REVOKE EXECUTE ON FUNCTION public.get_project_by_slug(text) FROM PUBLIC, anon, authenticated;
