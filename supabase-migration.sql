-- ClientPulse Database Schema Migration
-- Run this script in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/ffdwirtwyprkittwlchn/sql/new)
-- to bring the remote database schema in sync with the codebase.

-- 1. Add hourly_rate column to projects table
alter table public.projects add column if not exists hourly_rate numeric(10,2);

-- 2. Add username column to users table
alter table public.users add column if not exists username text unique;

-- 3. Migrate updates table from bullet_1/2/3 columns to bullets array
alter table public.updates add column if not exists bullets text[] not null default '{}';
-- Only backfill from the legacy columns if they still exist. On a database that
-- was already migrated (or created fresh with `bullets`), bullet_1/2/3 are gone,
-- so referencing them directly would error — guard with a dynamic statement that
-- is never planned unless the column is actually present.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'updates' and column_name = 'bullet_1'
  ) then
    execute 'update public.updates set bullets = array[bullet_1, bullet_2, bullet_3] where array_length(bullets, 1) is null';
  end if;
end $$;
alter table public.updates drop column if exists bullet_1;
alter table public.updates drop column if exists bullet_2;
alter table public.updates drop column if exists bullet_3;

-- 4. Create the get_project_by_slug RPC function
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

-- 5. Enforce the free-plan project limit at the database level.
-- The /project/new page hides the form past the limit, but that's only an
-- advisory UI gate — a stale tab or a direct insert could still exceed it.
-- This BEFORE INSERT trigger is the real wall: free accounts can hold at most
-- 3 projects; pro accounts are unlimited. The app surfaces the FREE_PROJECT_LIMIT
-- error string with an upgrade prompt. Keep the number in sync with
-- FREE_PROJECT_LIMIT in src/lib/plans.ts.
create or replace function public.enforce_project_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_plan text;
  project_count int;
begin
  select plan into user_plan from public.users where id = new.user_id;
  if user_plan is distinct from 'pro' then
    select count(*) into project_count from public.projects where user_id = new.user_id;
    if project_count >= 3 then
      raise exception 'FREE_PROJECT_LIMIT'
        using errcode = 'check_violation',
              hint = 'Upgrade to Pro for unlimited projects.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_project_limit_trigger on public.projects;
create trigger enforce_project_limit_trigger
  before insert on public.projects
  for each row execute function public.enforce_project_limit();

-- 6. Track onboarding completion explicitly.
-- The app used to infer "has this user onboarded?" from whether users.name was
-- set — but handle_new_user() pre-fills name (full_name/name from OAuth metadata,
-- otherwise the email local part), so name is never empty and every new user
-- skipped onboarding straight to the dashboard. Use a dedicated flag instead.
-- Backfill runs only when the column is first added, so existing users (who
-- predate the flag) are treated as already onboarded and re-running is safe.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'onboarded'
  ) then
    alter table public.users add column onboarded boolean not null default false;
    update public.users set onboarded = true;
  end if;
end $$;

-- 7. Link each project to its client's auth account.
-- Supabase Realtime only reliably authorizes postgres_changes via auth.uid(),
-- NOT auth.email() — so streaming messages to the *client* needs their auth id on
-- the project, not just their email (otherwise the owner gets live updates but the
-- client does not). client_email stays the human-facing field; client_user_id is
-- the resolved auth id, kept in sync by the two triggers below.
alter table public.projects add column if not exists client_user_id uuid references auth.users(id) on delete set null;

-- Backfill from any client accounts that already exist.
update public.projects p
  set client_user_id = u.id
  from public.users u
  where u.email = p.client_email and p.client_user_id is distinct from u.id;

-- When a project's client_email is set/changed, resolve the auth id if it exists.
create or replace function public.link_project_client()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.client_email is not null then
    select id into new.client_user_id from public.users where email = new.client_email limit 1;
  else
    new.client_user_id := null;
  end if;
  return new;
end;
$$;

drop trigger if exists link_project_client_trigger on public.projects;
create trigger link_project_client_trigger
  before insert or update of client_email on public.projects
  for each row execute function public.link_project_client();

-- When a client account is created later (e.g. after onboarding, via the
-- Portal access settings), backfill any projects already using that email.
create or replace function public.backfill_client_projects()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.projects set client_user_id = new.id where client_email = new.email;
  return new;
end;
$$;

drop trigger if exists backfill_client_projects_trigger on public.users;
create trigger backfill_client_projects_trigger
  after insert on public.users
  for each row execute function public.backfill_client_projects();

-- 8. Project messages — two-way comments between the freelancer (owner) and the
-- client on a project. Both participants are authenticated; RLS scopes access to
-- the project's owner (projects.user_id) and its client (projects.client_email),
-- so neither can read another project's thread.
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  author_role text not null check (author_role in ('owner', 'client')),
  body text not null,
  created_at timestamptz default now()
);

create index if not exists comments_project_idx on public.comments (project_id, created_at);

alter table public.comments enable row level security;

drop policy if exists "Participants can read project comments" on public.comments;
create policy "Participants can read project comments" on public.comments for select using (
  exists (
    select 1 from public.projects p
    where p.id = comments.project_id
      and (p.user_id = auth.uid() or p.client_user_id = auth.uid() or p.client_email = auth.email())
  )
);

drop policy if exists "Participants can post project comments" on public.comments;
create policy "Participants can post project comments" on public.comments for insert with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.projects p
    where p.id = comments.project_id
      and (p.user_id = auth.uid() or p.client_user_id = auth.uid() or p.client_email = auth.email())
  )
);

drop policy if exists "Authors can delete their comments" on public.comments;
create policy "Authors can delete their comments" on public.comments for delete using (user_id = auth.uid());

-- Enable Supabase Realtime on comments so new messages appear live for both
-- participants (the client subscribes to INSERTs; RLS still scopes what they
-- receive). Guarded so re-running doesn't error on an already-published table.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'comments'
  ) then
    alter publication supabase_realtime add table public.comments;
  end if;
end $$;
