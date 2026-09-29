-- ============================================================================
-- Frevio — Portfolio Feature Migration (Idempotent)
-- Creates public.portfolio_items and sets up storage bucket for screenshots.
-- Run this once in the Supabase SQL editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================================================

-- 1. Enable uuid generation if not already enabled
create extension if not exists "uuid-ossp";

-- 2. Create portfolio_items table
create table if not exists public.portfolio_items (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.users(id) on delete cascade not null,
  project_id    uuid references public.projects(id) on delete set null,
  title         text not null,
  description   text,
  live_url      text,
  github_url    text,
  video_url     text,
  screenshots   text[] not null default '{}',
  tags          text[] not null default '{}',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 3. Indexes for fast retrieval
create index if not exists portfolio_items_user_id_idx on public.portfolio_items (user_id);
create index if not exists portfolio_items_project_id_idx on public.portfolio_items (project_id);
create index if not exists portfolio_items_created_at_idx on public.portfolio_items (created_at desc);

-- 4. Enable Row Level Security (RLS)
alter table public.portfolio_items enable row level security;

-- 5. RLS Policies
-- Owners can do anything with their own portfolio items
drop policy if exists "Users manage own portfolio items" on public.portfolio_items;
create policy "Users manage own portfolio items" on public.portfolio_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Public can view portfolio items for public portfolios (/portfolio/[id])
drop policy if exists "Public can view portfolio items" on public.portfolio_items;
create policy "Public can view portfolio items" on public.portfolio_items
  for select
  using (true);

-- 6. Storage Bucket for Portfolio Screenshots
insert into storage.buckets (id, name, public)
values ('portfolio-screenshots', 'portfolio-screenshots', true)
on conflict (id) do update set public = true;

-- 7. Storage Policies for portfolio-screenshots bucket
drop policy if exists "Public can view portfolio screenshots" on storage.objects;
create policy "Public can view portfolio screenshots" on storage.objects
  for select
  using (bucket_id = 'portfolio-screenshots');

drop policy if exists "Authenticated users can upload portfolio screenshots" on storage.objects;
create policy "Authenticated users can upload portfolio screenshots" on storage.objects
  for insert
  with check (
    bucket_id = 'portfolio-screenshots' 
    and auth.role() = 'authenticated'
  );

drop policy if exists "Authenticated users can update their screenshots" on storage.objects;
create policy "Authenticated users can update their screenshots" on storage.objects
  for update
  using (
    bucket_id = 'portfolio-screenshots' 
    and auth.role() = 'authenticated'
  );

drop policy if exists "Authenticated users can delete their screenshots" on storage.objects;
create policy "Authenticated users can delete their screenshots" on storage.objects
  for delete
  using (
    bucket_id = 'portfolio-screenshots' 
    and auth.role() = 'authenticated'
  );

-- 8. Add portfolio_bio to public.users if not present
alter table public.users add column if not exists portfolio_bio text;

-- 9. Add live_url (website or app link) to public.projects if not present
alter table public.projects add column if not exists live_url text;

-- 10. Add priority column (p0, p1, p2, p3) to public.projects for priority canvas
alter table public.projects add column if not exists priority text default 'p1';
