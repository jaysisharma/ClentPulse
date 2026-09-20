-- Frevio — Phase 4: Internal Collaboration, Review Workflow & Activity Audit Log
-- Run in Supabase SQL Editor

-- 1. Updates table enhancements for staging & review workflow
alter table public.updates add column if not exists author_id uuid references public.users(id) on delete set null;
alter table public.updates add column if not exists review_status text default 'published' check (review_status in ('draft', 'review_ready', 'approved', 'published'));
alter table public.updates add column if not exists approved_by uuid references public.users(id) on delete set null;
alter table public.updates add column if not exists approved_at timestamptz;

-- 2. Update comments enhancements for internal team notes
alter table public.update_comments add column if not exists is_internal boolean default false;
alter table public.update_comments add column if not exists user_id uuid references public.users(id) on delete set null;

-- 3. Activity Audit Logs table
create table if not exists public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 4. Indexes for fast query performance
create index if not exists activity_logs_org_id_idx on public.activity_logs(org_id, created_at desc);
create index if not exists activity_logs_project_id_idx on public.activity_logs(project_id);
create index if not exists update_comments_internal_idx on public.update_comments(project_id, is_internal);
create index if not exists updates_review_status_idx on public.updates(project_id, review_status);

-- 5. Enable RLS on activity_logs
alter table public.activity_logs enable row level security;

-- Members can view activity logs for organizations they belong to
create policy "Members can view agency activity logs"
  on public.activity_logs for select
  using (
    org_id in (
      select org_id from public.organization_members
      where user_id = auth.uid()
    )
  );

-- Authenticated users can insert activity logs
create policy "Authenticated users can insert activity logs"
  on public.activity_logs for insert
  with check (auth.uid() is not null);
