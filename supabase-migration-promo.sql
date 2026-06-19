-- ============================================================================
-- Launch promo: the first N freelancer signups get Frevio Pro free.
--
-- Promo Pro grants every Pro feature EXCEPT AI drafting (AI stays gated to
-- genuinely-paid Pro so we don't pay Anthropic for free-promo users). When a
-- promo user later subscribes, the Stripe webhook clears `promo_pro`, which
-- unlocks AI automatically.
--
-- Run this once in the Supabase SQL editor.
-- ============================================================================

-- 1. Per-user flag: this Pro came from the free launch promo (no AI).
alter table public.users
  add column if not exists promo_pro boolean not null default false;

-- 2. Single-row atomic counter for the promo. `cap` is the number of free
--    spots; `claimed` is incremented transactionally so the limit is exact
--    even under concurrent signups.
create table if not exists public.launch_promo (
  id      int  primary key default 1,
  claimed int  not null default 0,
  cap     int  not null default 50,
  constraint launch_promo_single_row check (id = 1)
);

insert into public.launch_promo (id, claimed, cap)
values (1, 0, 50)
on conflict (id) do nothing;

-- 3. Anyone (incl. logged-out visitors) may read the counter so the landing /
--    signup pages can show "N spots left". It exposes only aggregate counts.
alter table public.launch_promo enable row level security;
drop policy if exists "Anyone can read launch promo" on public.launch_promo;
create policy "Anyone can read launch promo"
  on public.launch_promo for select using (true);

-- 4. Grant the promo at signup. Replaces handle_new_user() to:
--    - skip client accounts (role = 'client') — promo is for freelancers,
--    - atomically claim a spot only if any remain (race-safe via row lock),
--    - set plan='pro' + promo_pro=true for the lucky first N.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_is_client boolean := coalesce(new.raw_user_meta_data->>'role', '') = 'client';
  v_granted   boolean := false;
  v_claimed   int;
begin
  if not v_is_client then
    -- The WHERE clause + RETURNING locks the single counter row, so two
    -- simultaneous signups can never both claim the last spot.
    update public.launch_promo
      set claimed = claimed + 1
      where id = 1 and claimed < cap
      returning claimed into v_claimed;
    v_granted := found;
  end if;

  insert into public.users (id, email, name, plan, promo_pro)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    case when v_granted then 'pro' else 'free' end,
    v_granted
  );
  return new;
end;
$$ language plpgsql security definer;

-- (Trigger on_auth_user_created already points at handle_new_user — no change.)
