-- ============================================================================
-- Frevio Extension & Real-Time Presence Migration
-- 
-- Run this in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Create API Tokens table for extension authentication
create table if not exists public.api_tokens (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  token_hash text not null unique,
  token_preview text not null,
  name text not null default 'VS Code Extension',
  last_used_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists api_tokens_user_id_idx on public.api_tokens(user_id);
create index if not exists api_tokens_hash_idx on public.api_tokens(token_hash);

alter table public.api_tokens enable row level security;

drop policy if exists "Users can manage own api tokens" on public.api_tokens;
create policy "Users can manage own api tokens"
  on public.api_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Add presence & focus fields to projects table
alter table public.projects
  add column if not exists show_live_presence boolean not null default true,
  add column if not exists show_time_logged boolean not null default false,
  add column if not exists last_heartbeat_at timestamptz,
  add column if not exists active_focus_area text;

-- 3. Add source and session tracking to time_entries table
alter table public.time_entries
  add column if not exists source text default 'manual',
  add column if not exists session_id uuid;

create index if not exists time_entries_project_source_idx on public.time_entries(project_id, source, date);
