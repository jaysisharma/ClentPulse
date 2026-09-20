-- =============================================================================
-- Frevio — Integrations System Migration
-- Run idempotently in Supabase SQL Editor
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. integration_connections — stores OAuth tokens for each provider
-- ---------------------------------------------------------------------------

create table if not exists public.integration_connections (
  id                     uuid default uuid_generate_v4() primary key,
  user_id                uuid references auth.users(id) on delete cascade not null,
  org_id                 uuid references public.organizations(id) on delete set null,
  provider               text not null check (provider in ('google', 'github', 'figma')),
  provider_account_id    text not null,
  provider_account_email text,
  -- Tokens stored AES-256-GCM encrypted (ciphertext:iv:tag base64 strings)
  access_token_enc       text,
  refresh_token_enc      text,
  token_expires_at       timestamptz,
  scopes                 text[] default '{}',
  metadata               jsonb default '{}',
  status                 text not null default 'active'
                           check (status in ('active', 'expired', 'revoked')),
  created_at             timestamptz default now(),
  updated_at             timestamptz default now(),
  -- One OAuth connection per provider per user
  unique (user_id, provider)
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists integration_connections_updated_at on public.integration_connections;
create trigger integration_connections_updated_at
  before update on public.integration_connections
  for each row execute function public.set_updated_at();

-- RLS
alter table public.integration_connections enable row level security;

drop policy if exists "Users can view their own integration connections" on public.integration_connections;
create policy "Users can view their own integration connections"
  on public.integration_connections for select
  using (
    user_id = auth.uid()
    or (
      org_id is not null and exists (
        select 1 from public.organization_members om
        where om.org_id = integration_connections.org_id
          and om.user_id = auth.uid()
          and om.role in ('owner', 'admin')
      )
    )
  );

drop policy if exists "Users can insert their own integration connections" on public.integration_connections;
create policy "Users can insert their own integration connections"
  on public.integration_connections for insert
  with check (user_id = auth.uid());

drop policy if exists "Users can update their own integration connections" on public.integration_connections;
create policy "Users can update their own integration connections"
  on public.integration_connections for update
  using (user_id = auth.uid());

drop policy if exists "Users can delete their own integration connections" on public.integration_connections;
create policy "Users can delete their own integration connections"
  on public.integration_connections for delete
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2. project_resources — references to external resources attached to projects
-- ---------------------------------------------------------------------------

create table if not exists public.project_resources (
  id                        uuid default uuid_generate_v4() primary key,
  project_id                uuid references public.projects(id) on delete cascade not null,
  integration_connection_id uuid references public.integration_connections(id) on delete set null,
  provider                  text not null check (provider in ('google_drive', 'google_calendar', 'github', 'figma')),
  resource_type             text not null check (resource_type in ('file', 'folder', 'event', 'repo', 'figma_file', 'pull_request')),
  external_id               text not null,
  external_url              text,
  name                      text not null,
  thumbnail_url             text,
  show_in_portal            boolean not null default true,
  metadata                  jsonb default '{}',
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

drop trigger if exists project_resources_updated_at on public.project_resources;
create trigger project_resources_updated_at
  before update on public.project_resources
  for each row execute function public.set_updated_at();

create index if not exists project_resources_project_idx on public.project_resources (project_id);
create index if not exists project_resources_provider_idx on public.project_resources (project_id, provider);

-- RLS
alter table public.project_resources enable row level security;

-- Project owner and org admins can manage resources
drop policy if exists "Project owner can manage project resources" on public.project_resources;
create policy "Project owner can manage project resources"
  on public.project_resources for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_resources.project_id
        and (
          p.user_id = auth.uid()
          or (
            p.org_id is not null and exists (
              select 1 from public.organization_members om
              where om.org_id = p.org_id
                and om.user_id = auth.uid()
                and om.role in ('owner', 'admin', 'member')
            )
          )
        )
    )
  );

-- Clients can read resources marked show_in_portal = true
-- (no auth.uid() check — portal is public by slug, access controlled at page level)
drop policy if exists "Public read of portal resources" on public.project_resources;
create policy "Public read of portal resources"
  on public.project_resources for select
  using (show_in_portal = true);
