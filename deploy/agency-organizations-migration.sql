-- Frevio — Phase 1: Organizations, Multi-Seat Workspaces & Team Invites (Idempotent)
-- Run in Supabase SQL Editor

-- 1. Organizations table
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  logo_url text,
  accent_color text default '#6366F1',
  billing_plan text default 'free' check (billing_plan in ('free', 'starter', 'agency_pro', 'enterprise')),
  stripe_customer_id text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now()
);

-- 2. Organization members table (multi-tenant team seats)
create table if not exists public.organization_members (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz default now(),
  unique(org_id, user_id)
);

-- 3. Organization invites table
create table if not exists public.organization_invites (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  token text unique not null,
  invited_by uuid references public.users(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

-- 4. Link projects to organizations (nullable for backward compatibility with solo freelancers)
alter table public.projects add column if not exists org_id uuid references public.organizations(id) on delete cascade;

-- 5. Indexes for fast lookup
create index if not exists org_members_user_id_idx on public.organization_members(user_id);
create index if not exists org_members_org_id_idx on public.organization_members(org_id);
create index if not exists org_invites_token_idx on public.organization_invites(token);
create index if not exists org_invites_email_idx on public.organization_invites(email);
create index if not exists projects_org_id_idx on public.projects(org_id);

-- 6. Enable RLS
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_invites enable row level security;

-- Organizations policies: public can view organization names/branding; members can view their organizations
create policy "Public can view organizations"
  on public.organizations for select
  using (true);

-- Authenticated users can create new organizations
create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check (auth.uid() is not null);

-- Owners and admins can update their organization
create policy "Owners and admins can update their organizations"
  on public.organizations for update
  using (
    id in (
      select org_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Organization members policies:
create policy "Members can view co-members in their organizations"
  on public.organization_members for select
  using (
    org_id in (
      select org_id from public.organization_members
      where user_id = auth.uid()
    )
  );

-- Authenticated users can insert their own initial ownership membership
create policy "Users can insert membership"
  on public.organization_members for insert
  with check (auth.uid() is not null);

-- Owners and admins can delete members (or members can leave)
create policy "Owners and admins can delete members or members leave"
  on public.organization_members for delete
  using (
    user_id = auth.uid() or
    org_id in (
      select org_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Organization invites policies:
create policy "Members can view invites for their organization"
  on public.organization_invites for select
  using (
    org_id in (
      select org_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "Admins and owners can manage invites"
  on public.organization_invites for all
  using (
    org_id in (
      select org_id from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );
