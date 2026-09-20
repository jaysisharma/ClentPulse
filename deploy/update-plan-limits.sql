-- Frevio — Database Trigger Update: 2 Active Projects Free Limit
-- Run in Supabase SQL Editor

-- Upgrade project limit trigger to enforce 2 active projects for free tier
create or replace function public.enforce_project_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_plan text;
  is_promo_pro boolean;
  user_created timestamptz;
  project_count int;
begin
  select plan, promo_pro, created_at into user_plan, is_promo_pro, user_created
  from public.users
  where id = new.user_id;

  -- If user has expired promo_pro (1-month duration), demote dynamically
  if user_plan = 'pro' and is_promo_pro = true and user_created < now() - interval '1 month' then
    update public.users set plan = 'free', promo_pro = false where id = new.user_id;
    user_plan := 'free';
  end if;

  -- Free users are limited to 2 active projects; paid plans have unlimited projects
  if user_plan is null or user_plan not in ('pro', 'agency', 'agency_starter', 'agency_scale', 'enterprise') then
    select count(*) into project_count
    from public.projects
    where user_id = new.user_id;

    if project_count >= 2 then
      raise exception 'FREE_PROJECT_LIMIT'
        using errcode = 'check_violation',
              hint = 'Upgrade to Pro for unlimited active projects.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_project_limit_trigger on public.projects;
create trigger enforce_project_limit_trigger
  before insert on public.projects
  for each row execute function public.enforce_project_limit();
