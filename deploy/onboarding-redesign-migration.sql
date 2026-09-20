-- =============================================================================
-- Frevio Onboarding Redesign & Activation Telemetry Migration
-- =============================================================================
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- 1. Add onboarding progress persistence & persona fields to users table
alter table public.users add column if not exists onboarding_step text default 'welcome';
alter table public.users add column if not exists onboarding_persona text default 'freelancer';
alter table public.users add column if not exists studio_name text;
alter table public.users add column if not exists onboarding_project_id uuid references public.projects(id) on delete set null;
alter table public.users add column if not exists onboarding_org_id uuid references public.organizations(id) on delete set null;

-- 2. Create lightweight activation events table
create table if not exists public.activation_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  event_name text not null,
  project_id uuid references public.projects(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Index for efficient user & funnel telemetry queries
create index if not exists idx_activation_events_user on public.activation_events(user_id, event_name);
create index if not exists idx_activation_events_created on public.activation_events(created_at);
create index if not exists idx_activation_events_name on public.activation_events(event_name);

-- 3. Row-Level Security for activation_events
alter table public.activation_events enable row level security;

drop policy if exists "Users can insert own activation events" on public.activation_events;
create policy "Users can insert own activation events" on public.activation_events
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can view own activation events" on public.activation_events;
create policy "Users can view own activation events" on public.activation_events
  for select using (auth.uid() = user_id);

-- Service role bypass is automatic in Supabase
