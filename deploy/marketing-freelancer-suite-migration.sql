-- Frevio — Digital Marketing Freelancer Suite Migration (Idempotent)
-- Run in Supabase SQL Editor

-- 1. Projects: KPI Snapshot Metrics & Embedded Reports
alter table public.projects add column if not exists kpis jsonb default '[]'::jsonb;
alter table public.projects add column if not exists report_embed_url text;
alter table public.projects add column if not exists report_embed_title text default 'Live Performance Report';

-- 2. Updates: Video Walkthrough URL (Loom, YouTube, Vimeo)
alter table public.updates add column if not exists video_url text;

-- 3. Approvals: Marketing Deliverable Types
-- Drop existing check constraint if present and re-add with marketing preview types
alter table public.approvals drop constraint if exists approvals_preview_type_check;
alter table public.approvals add constraint approvals_preview_type_check check (
  preview_type in (
    'staging',
    'figma',
    'code_pr',
    'document',
    'asset_zip',
    'ad_creative',
    'copy_deck',
    'analytics_report',
    'landing_page'
  )
);
