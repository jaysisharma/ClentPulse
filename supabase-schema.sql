-- Enable RLS
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text,
  username text unique,
  logo_url text,
  accent_color text default '#6366F1',
  stripe_customer_id text,
  plan text default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz default now()
);

-- Migration: add username if upgrading an existing database
-- alter table public.users add column if not exists username text unique;

-- Projects table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  client_name text not null,
  project_name text not null,
  slug text unique not null,
  color text default '#6366F1',
  status text default 'active' check (status in ('active', 'paused', 'completed')),
  hourly_rate numeric(10,2),
  created_at timestamptz default now()
);

-- Migration: add hourly_rate if upgrading an existing database
-- alter table public.projects add column if not exists hourly_rate numeric(10,2);

-- Updates table
create table public.updates (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  bullets text[] not null default '{}',
  note text,
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- Migration for existing databases (bullet_1/2/3 → bullets array):
-- alter table public.updates add column if not exists bullets text[] not null default '{}';
-- update public.updates set bullets = array[bullet_1, bullet_2, bullet_3] where array_length(bullets, 1) is null;
-- alter table public.updates drop column if exists bullet_1;
-- alter table public.updates drop column if exists bullet_2;
-- alter table public.updates drop column if exists bullet_3;

-- RLS policies
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.updates enable row level security;

-- Users: only see own row
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

-- Projects: own projects only
create policy "Users can view own projects" on public.projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on public.projects for delete using (auth.uid() = user_id);

-- NOTE: intentionally no public SELECT policy on projects.
-- Public status pages use get_project_by_slug() RPC (security definer) instead,
-- which only exposes the single slug-matched row and prevents table scanning.

-- Updates: users can manage own, public can view
create policy "Users can manage own updates" on public.updates for all using (
  exists (select 1 from public.projects where id = project_id and user_id = auth.uid())
);
create policy "Public can view updates" on public.updates for select using (true);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- Project kickoff checklist (Feature #15)
-- Run this migration to enable the kickoff checklist
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.checklist_items (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  assigned_to text not null default 'freelancer' check (assigned_to in ('freelancer', 'client')),
  done boolean default false,
  done_at timestamptz,
  position int default 0,
  created_at timestamptz default now()
);

alter table public.checklist_items enable row level security;

-- Freelancer can fully manage their project's checklist items
create policy "Owner can manage checklist items" on public.checklist_items
  for all using (auth.uid() = user_id);

-- Anyone (clients) can read checklist items — needed for public status page
create policy "Public can read checklist items" on public.checklist_items
  for select using (true);

-- Clients can toggle their own items done without auth (upsert by id)
create policy "Public can update client checklist items" on public.checklist_items
  for update using (assigned_to = 'client');

-- ─────────────────────────────────────────────────────────────────────────────
-- Project milestones (Feature #13)
-- Run this migration to enable milestones
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.milestones (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  due_date date,
  done boolean default false,
  created_at timestamptz default now()
);

alter table public.milestones enable row level security;

create policy "Owner can manage milestones" on public.milestones
  for all using (auth.uid() = user_id);

create policy "Public can read milestones" on public.milestones
  for select using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Update comments (client-facing comments on individual update cards)
-- Run this migration to enable Feature #4
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.update_comments (
  id uuid default uuid_generate_v4() primary key,
  update_id uuid references public.updates(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  author_name text not null,
  body text not null,
  created_at timestamptz default now()
);

alter table public.update_comments enable row level security;

-- Anyone can insert a comment (clients don't have auth)
create policy "Public can insert update comments" on public.update_comments
  for insert with check (true);

-- Freelancer can read comments on their own projects
create policy "Owner can read update comments" on public.update_comments
  for select using (
    exists (select 1 from public.projects where id = project_id and user_id = auth.uid())
  );

-- Public can read comments (for the status page to display them)
create policy "Public can read update comments" on public.update_comments
  for select using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Security: slug-scoped RPC for public status pages
-- Replaces the former "Public can view projects by slug" using (true) policy,
-- which exposed all project rows to unauthenticated users.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.get_project_by_slug(p_slug text)
returns setof public.projects
language sql
security definer
stable
as $$
  select * from public.projects where slug = p_slug limit 1;
$$;

grant execute on function public.get_project_by_slug(text) to anon;
grant execute on function public.get_project_by_slug(text) to authenticated;

-- Migration for existing databases (drop the overly broad policy):
-- drop policy if exists "Public can view projects by slug" on public.projects;
