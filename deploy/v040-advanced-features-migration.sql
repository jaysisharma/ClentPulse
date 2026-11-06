-- Frevio v0.4.0 — Telemetry Read Receipts, Secrets Vault, Project Webhooks, and Deliverable Locks
-- Run in Supabase SQL Editor

-- 1. Client activity views (read receipts)
create table if not exists public.client_activity_views (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  entity_type text not null check (entity_type in ('portal', 'invoice', 'contract', 'doc')),
  entity_id text,
  viewer_source text default 'client',
  user_agent text,
  ip_hash text,
  viewed_at timestamptz default now() not null
);

create index if not exists client_activity_views_project_idx on public.client_activity_views (project_id, viewed_at desc);
create index if not exists client_activity_views_entity_idx on public.client_activity_views (entity_type, entity_id);

-- 2. Read receipts columns on projects, invoices, contracts, documents
alter table public.projects add column if not exists client_last_viewed_at timestamptz;
alter table public.invoices add column if not exists last_viewed_at timestamptz;
alter table public.invoices add column if not exists view_count integer default 0;
alter table public.contracts add column if not exists last_viewed_at timestamptz;
alter table public.contracts add column if not exists view_count integer default 0;
alter table public.documents add column if not exists last_viewed_at timestamptz;
alter table public.documents add column if not exists view_count integer default 0;

-- 3. Project Webhooks and Overdue Lock
alter table public.projects add column if not exists webhook_url text;
alter table public.projects add column if not exists webhook_enabled boolean default true;
alter table public.projects add column if not exists overdue_lock_enabled boolean default true;

-- 4. Encrypted project secrets vault
create table if not exists public.project_secrets (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  category text not null default 'api_key' check (category in ('api_key', 'credentials', 'tokens', 'database', 'other')),
  encrypted_value text not null,
  notes text,
  created_by text default 'freelancer',
  last_revealed_at timestamptz,
  reveal_count integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists project_secrets_project_idx on public.project_secrets (project_id, created_at desc);

-- 5. Row Level Security enablement
alter table public.client_activity_views enable row level security;
alter table public.project_secrets enable row level security;


