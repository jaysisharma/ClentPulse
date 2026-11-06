-- ============================================================================
-- SECURITY: remove world-readable / world-writable RLS policies
--
-- Several policies used `using (true)` (or `... OR true`). RLS doesn't filter by
-- the id a page happens to ask for, so anyone holding the public anon key could
-- list and/or modify every tenant's rows:
--   change_orders           read + update (status, amount, user_id…)
--   updates                 read (including unsent drafts)
--   milestones              read
--   checklist_items         read + update of any client-assigned item
--   update_comments         read (including internal notes) + insert anywhere
--   project_team_members    read
--   organizations           read (Stripe ids, billing plan, …)
-- and users could edit their own plan / is_admin / Stripe columns.
--
-- The public portal (/p/<slug>) now reads these tables server-side with the
-- service role after its passcode gate, and portal writes go through API routes
-- that check access (src/lib/project-access.ts). The policies below only grant
-- access to the project's workspace (owner + org members) and its signed-in client.
--
-- Run this once in the Supabase SQL editor, AFTER all earlier migrations.
-- Requires public.get_user_org_ids() from agency-full-suite-migration.sql.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Project owner, or a member of the project's organization.
create or replace function public.is_project_workspace(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id
      and (
        p.user_id = auth.uid()
        or (p.org_id is not null and p.org_id in (select public.get_user_org_ids(auth.uid())))
      )
  );
$$;

-- The project's signed-in client (portal login).
create or replace function public.is_project_client(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id
      and auth.uid() is not null
      and (
        p.client_user_id = auth.uid()
        or (p.client_email is not null and lower(p.client_email) = lower(auth.email()))
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- change_orders
-- ---------------------------------------------------------------------------
drop policy if exists "Public and clients can view change orders for project" on public.change_orders;
drop policy if exists "Clients can update change orders" on public.change_orders;

drop policy if exists "Workspace and client can view change orders" on public.change_orders;
create policy "Workspace and client can view change orders" on public.change_orders
  for select using (
    public.is_project_workspace(project_id)
    or (status <> 'draft' and public.is_project_client(project_id))
  );

-- Org members could edit change orders before (via the `OR true` policy); keep
-- that, but scoped to the workspace. Clients approve/decline via the API.
drop policy if exists "Workspace can update change orders" on public.change_orders;
create policy "Workspace can update change orders" on public.change_orders
  for update using (public.is_project_workspace(project_id))
  with check (public.is_project_workspace(project_id));

-- ---------------------------------------------------------------------------
-- updates
-- ---------------------------------------------------------------------------
drop policy if exists "Public can view updates" on public.updates;

drop policy if exists "Workspace and client can view updates" on public.updates;
create policy "Workspace and client can view updates" on public.updates
  for select using (
    public.is_project_workspace(project_id)
    or (sent_at is not null and public.is_project_client(project_id))
  );

-- ---------------------------------------------------------------------------
-- milestones
-- ---------------------------------------------------------------------------
drop policy if exists "Public can read milestones" on public.milestones;

drop policy if exists "Workspace and client can read milestones" on public.milestones;
create policy "Workspace and client can read milestones" on public.milestones
  for select using (
    public.is_project_workspace(project_id) or public.is_project_client(project_id)
  );

-- ---------------------------------------------------------------------------
-- checklist_items
-- ---------------------------------------------------------------------------
drop policy if exists "Public can read checklist items" on public.checklist_items;
drop policy if exists "Public can update client checklist items" on public.checklist_items;

drop policy if exists "Workspace and client can read checklist items" on public.checklist_items;
create policy "Workspace and client can read checklist items" on public.checklist_items
  for select using (
    public.is_project_workspace(project_id) or public.is_project_client(project_id)
  );

-- ---------------------------------------------------------------------------
-- update_comments
-- ---------------------------------------------------------------------------
drop policy if exists "Public can insert update comments" on public.update_comments;
drop policy if exists "Public can read update comments" on public.update_comments;

drop policy if exists "Workspace can read update comments" on public.update_comments;
create policy "Workspace can read update comments" on public.update_comments
  for select using (public.is_project_workspace(project_id));

drop policy if exists "Client can read public update comments" on public.update_comments;
create policy "Client can read public update comments" on public.update_comments
  for select using (
    coalesce(is_internal, false) = false and public.is_project_client(project_id)
  );

-- ---------------------------------------------------------------------------
-- project_team_members
-- ---------------------------------------------------------------------------
drop policy if exists "Public can view project team members" on public.project_team_members;

drop policy if exists "Workspace and client can view project team members" on public.project_team_members;
create policy "Workspace and client can view project team members" on public.project_team_members
  for select using (
    public.is_project_workspace(project_id) or public.is_project_client(project_id)
  );

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
drop policy if exists "Public can view organizations" on public.organizations;

-- created_by lets the creator read the row back before their membership exists.
drop policy if exists "Members can view their organizations" on public.organizations;
create policy "Members can view their organizations" on public.organizations
  for select using (
    id in (select public.get_user_org_ids(auth.uid()))
    or created_by = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- users: privileged columns are written by the server (service role) only
-- ---------------------------------------------------------------------------
-- "Users can update own profile" has no column restriction, so without this a
-- user could set their own plan = 'pro' or is_admin = true from the browser.
-- Only requests made as the `authenticated` / `anon` roles are checked; the
-- service role, the SQL editor and security-definer functions are unaffected.
create or replace function public.protect_user_privileged_columns()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  col     text;
  new_row jsonb := to_jsonb(new);
  old_row jsonb;
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if coalesce(new_row->>'plan', 'free') <> 'free'
       or coalesce((new_row->>'is_admin')::boolean, false)
       or coalesce((new_row->>'promo_pro')::boolean, false)
       or new_row->>'stripe_customer_id' is not null
       or new_row->>'stripe_account_id' is not null then
      raise exception 'Cannot set protected profile columns' using errcode = '42501';
    end if;
    return new;
  end if;

  old_row := to_jsonb(old);
  foreach col in array array[
    'plan', 'promo_pro', 'is_admin',
    'stripe_customer_id', 'stripe_account_id',
    'stripe_charges_enabled', 'stripe_payouts_enabled', 'stripe_connect_onboarded',
    'stripe_event_created_at'
  ] loop
    if new_row->col is distinct from old_row->col then
      -- Downgrading yourself is allowed (promo expiry in checkAndSyncPromoPlan).
      continue when col = 'plan' and new_row->>'plan' = 'free';
      continue when col = 'promo_pro' and new_row->>'promo_pro' = 'false';
      raise exception 'Cannot modify protected profile column: %', col using errcode = '42501';
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists protect_user_privileged_columns on public.users;
create trigger protect_user_privileged_columns
  before insert or update on public.users
  for each row execute function public.protect_user_privileged_columns();
