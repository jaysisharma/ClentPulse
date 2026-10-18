-- ==============================================================================
-- FREVIO: MOBILE APP BUILDS & APK DISTRIBUTION HUB MIGRATION (100% IDEMPOTENT)
-- Run this in Supabase SQL Editor.
-- Adds public.app_builds table, storage bucket, RLS policies, and download tracker.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.app_builds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  version_name text NOT NULL,
  build_number text,
  platform text NOT NULL DEFAULT 'android' CHECK (platform IN ('android', 'ios', 'universal')),
  environment text NOT NULL DEFAULT 'staging' CHECK (environment IN ('staging', 'internal_beta', 'client_review', 'production')),
  file_url text NOT NULL,
  file_size_bytes bigint,
  min_os_version text DEFAULT 'Android 8.0+',
  changelog text,
  is_active boolean NOT NULL DEFAULT true,
  download_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure all columns exist in case table was created with an earlier schema
ALTER TABLE public.app_builds ADD COLUMN IF NOT EXISTS version_name text NOT NULL DEFAULT 'v1.0.0';
ALTER TABLE public.app_builds ADD COLUMN IF NOT EXISTS build_number text;
ALTER TABLE public.app_builds ADD COLUMN IF NOT EXISTS platform text NOT NULL DEFAULT 'android';
ALTER TABLE public.app_builds ADD COLUMN IF NOT EXISTS environment text NOT NULL DEFAULT 'staging';
ALTER TABLE public.app_builds ADD COLUMN IF NOT EXISTS file_url text NOT NULL DEFAULT '';
ALTER TABLE public.app_builds ADD COLUMN IF NOT EXISTS file_size_bytes bigint;
ALTER TABLE public.app_builds ADD COLUMN IF NOT EXISTS min_os_version text DEFAULT 'Android 8.0+';
ALTER TABLE public.app_builds ADD COLUMN IF NOT EXISTS changelog text;
ALTER TABLE public.app_builds ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.app_builds ADD COLUMN IF NOT EXISTS download_count int NOT NULL DEFAULT 0;
ALTER TABLE public.app_builds ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.app_builds ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Project settings option to hide or show app builds section in portal
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS hide_app_builds boolean DEFAULT false;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS app_builds_project_idx ON public.app_builds(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS app_builds_user_idx ON public.app_builds(user_id);
CREATE INDEX IF NOT EXISTS app_builds_active_idx ON public.app_builds(project_id, is_active);

-- Enable RLS
ALTER TABLE public.app_builds ENABLE ROW LEVEL SECURITY;

-- 1. Project owners and agency team members can manage app builds
DROP POLICY IF EXISTS "Owners and team can manage app builds" ON public.app_builds;
CREATE POLICY "Owners and team can manage app builds" ON public.app_builds
  FOR ALL USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = app_builds.project_id
        AND (
          p.user_id = auth.uid()
          OR (
            p.org_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM public.organization_members om
              WHERE om.org_id = p.org_id
                AND om.user_id = auth.uid()
                AND om.role IN ('owner', 'admin', 'member')
            )
          )
        )
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = app_builds.project_id
        AND (
          p.user_id = auth.uid()
          OR (
            p.org_id IS NOT NULL AND EXISTS (
              SELECT 1 FROM public.organization_members om
              WHERE om.org_id = p.org_id
                AND om.user_id = auth.uid()
                AND om.role IN ('owner', 'admin', 'member')
            )
          )
        )
    )
  );

-- 2. Public read for active builds in portal (client portal access is controlled at slug level)
DROP POLICY IF EXISTS "Public can view active app builds" ON public.app_builds;
CREATE POLICY "Public can view active app builds" ON public.app_builds
  FOR SELECT USING (is_active = true);

-- Helper RPC function to atomically increment download count
CREATE OR REPLACE FUNCTION public.increment_app_build_download(p_build_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count int;
BEGIN
  UPDATE public.app_builds
  SET download_count = download_count + 1
  WHERE id = p_build_id
  RETURNING download_count INTO v_count;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- Setup Supabase Storage bucket for APK files
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-builds', 'app-builds', true)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies for app-builds bucket
DROP POLICY IF EXISTS "Public can download app builds" ON storage.objects;
CREATE POLICY "Public can download app builds" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-builds');

DROP POLICY IF EXISTS "Authenticated users can upload app builds" ON storage.objects;
CREATE POLICY "Authenticated users can upload app builds" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'app-builds' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update app builds" ON storage.objects;
CREATE POLICY "Authenticated users can update app builds" ON storage.objects
  FOR UPDATE USING (bucket_id = 'app-builds' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete app builds" ON storage.objects;
CREATE POLICY "Authenticated users can delete app builds" ON storage.objects
  FOR DELETE USING (bucket_id = 'app-builds' AND auth.role() = 'authenticated');
