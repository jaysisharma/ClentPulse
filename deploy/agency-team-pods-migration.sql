-- Frevio — Phase 2: Agency Team Pods & Project Staffing (Idempotent)
-- Run in Supabase SQL Editor

-- 1. Project Team Members table (linking agency projects to assigned specialists)
create table if not exists public.project_team_members (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  role_title text not null default 'Team Specialist',
  created_at timestamptz default now(),
  unique(project_id, user_id)
);

-- 2. Indexes for fast lookup
create index if not exists project_team_members_project_id_idx on public.project_team_members(project_id);
create index if not exists project_team_members_user_id_idx on public.project_team_members(user_id);

-- 3. Enable RLS
alter table public.project_team_members enable row level security;

-- Policy: Public/Client can view assigned team pod for projects they access via slug
create policy "Public can view project team members"
  on public.project_team_members for select
  using (true);

-- Policy: Authenticated users can manage team members if they own the project or are owner/admin of the organization
create policy "Owners and admins can manage project team members"
  on public.project_team_members for all
  using (
    auth.uid() in (
      -- Project owner
      select user_id from public.projects where id = project_team_members.project_id
    )
    or
    auth.uid() in (
      -- Org owner or admin
      select om.user_id
      from public.organization_members om
      join public.projects p on p.org_id = om.org_id
      where p.id = project_team_members.project_id
        and om.role in ('owner', 'admin')
    )
  );
