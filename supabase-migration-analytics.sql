-- ============================================================================
-- ClientPulse Analytics & Admin Migration
-- 
-- Run this once in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard)
-- to add visitor tracking and enable admin credentials.
-- ============================================================================

-- 1. Add admin flag to the users table
alter table public.users
  add column if not exists is_admin boolean not null default false;

-- 2. Create the page_visits table to track engagement
create table if not exists public.page_visits (
  id            uuid default uuid_generate_v4() primary key,
  ip_address    text,
  user_agent    text,
  path          text not null,
  referrer      text,
  user_id       uuid references public.users(id) on delete set null,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  country       text,
  city          text,
  created_at    timestamptz default now()
);

-- 3. Create indexes for analytical query performance
create index if not exists page_visits_created_at_idx on public.page_visits (created_at desc);
create index if not exists page_visits_path_idx on public.page_visits (path);

-- 4. Enable Row Level Security (RLS) on page_visits
alter table public.page_visits enable row level security;

-- 5. Establish RLS policies:
--    - Allow anyone (anonymous/public) to insert new visit logs.
--    - Restrict select query access to only users flagged as is_admin = true.
drop policy if exists "Allow public insert for page_visits" on public.page_visits;
create policy "Allow public insert for page_visits"
  on public.page_visits for insert with check (true);

drop policy if exists "Allow admin select for page_visits" on public.page_visits;
create policy "Allow admin select for page_visits"
  on public.page_visits for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );

-- 6. Add UTM campaign columns if table was created in a previous step
alter table public.page_visits add column if not exists utm_source text;
alter table public.page_visits add column if not exists utm_medium text;
alter table public.page_visits add column if not exists utm_campaign text;
alter table public.page_visits add column if not exists country text;
alter table public.page_visits add column if not exists city text;

-- ============================================================================
-- HOW TO ENABLE ADMIN PERMISSIONS FOR YOUR ACCOUNT:
-- 
-- Log in to ClientPulse on the frontend first (to create your user row).
-- Then, run the following SQL query to grant yourself admin status:
-- 
-- update public.users
-- set is_admin = true
-- where email = 'your-email@example.com';
-- ============================================================================

-- 7. Create product_events table to track feature adoption
create table if not exists public.product_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  event_type text not null, -- 'project_created', 'invoice_created', 'task_completed', etc.
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists product_events_user_id_idx on public.product_events(user_id);
create index if not exists product_events_event_type_idx on public.product_events(event_type);
create index if not exists product_events_created_at_idx on public.product_events(created_at desc);

alter table public.product_events enable row level security;

-- Allow authenticated users to view/insert their own events
drop policy if exists "Users can manage own product events" on public.product_events;
create policy "Users can manage own product events" on public.product_events
  for all using (auth.uid() = user_id);

-- Allow admins to see all events
drop policy if exists "Admins can view all product events" on public.product_events;
create policy "Admins can view all product events" on public.product_events
  for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );

-- 8. Create freelancer_feedback table for feedback center feature requests/support
create table if not exists public.freelancer_feedback (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  category text not null check (category in ('feature_request', 'bug_report', 'support_message', 'nps_score')),
  subject text,
  comment text not null,
  rating int check (rating >= 1 and rating <= 10), -- For NPS score or general stars
  votes int default 1,
  status text default 'pending' check (status in ('pending', 'planned', 'in_progress', 'completed', 'declined')),
  created_at timestamptz default now()
);

create index if not exists freelancer_feedback_created_at_idx on public.freelancer_feedback(created_at desc);

alter table public.freelancer_feedback enable row level security;

-- Allow authenticated users to view/insert/update their own feedback
drop policy if exists "Users can manage own feedback" on public.freelancer_feedback;
create policy "Users can manage own feedback" on public.freelancer_feedback
  for all using (auth.uid() = user_id);

-- Allow anyone to see feature requests (to support voting)
drop policy if exists "Anyone can read feature requests" on public.freelancer_feedback;
create policy "Anyone can read feature requests" on public.freelancer_feedback
  for select using (category = 'feature_request');

-- Allow admins to see/manage all feedback
drop policy if exists "Admins can manage all feedback" on public.freelancer_feedback;
create policy "Admins can manage all feedback" on public.freelancer_feedback
  for all using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );

-- 9. Automatic Database Triggers to Log Feature Adoption Events
-- We create a function to log events
create or replace function public.log_product_event()
returns trigger as $$
declare
  target_user_id uuid;
begin
  if TG_TABLE_NAME = 'projects' then
    target_user_id := new.user_id;
    insert into public.product_events (user_id, event_type, metadata)
    values (target_user_id, 'project_created', jsonb_build_object('project_name', new.project_name, 'client_name', new.client_name));
  elsif TG_TABLE_NAME = 'invoices' then
    -- Retrieve project owner
    select user_id into target_user_id from public.projects where id = new.project_id;
    if target_user_id is not null then
      insert into public.product_events (user_id, event_type, metadata)
      values (target_user_id, 'invoice_created', jsonb_build_object('invoice_id', new.id));
    end if;
  elsif TG_TABLE_NAME = 'checklist_items' then
    if new.done = true and (old.done is null or old.done = false) then
      insert into public.product_events (user_id, event_type, metadata)
      values (new.user_id, 'task_completed', jsonb_build_object('task_title', new.title));
    end if;
  elsif TG_TABLE_NAME = 'testimonials' then
    insert into public.product_events (user_id, event_type, metadata)
    values (new.user_id, 'testimonial_created', jsonb_build_object('testimonial_id', new.id));
  elsif TG_TABLE_NAME = 'documents' then
    insert into public.product_events (user_id, event_type, metadata)
    values (new.user_id, 'document_created', jsonb_build_object('doc_title', new.title));
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for Projects
drop trigger if exists on_project_created_log on public.projects;
create trigger on_project_created_log
  after insert on public.projects
  for each row execute procedure public.log_product_event();

-- Trigger for Invoices
drop trigger if exists on_invoice_created_log on public.invoices;
create trigger on_invoice_created_log
  after insert on public.invoices
  for each row execute procedure public.log_product_event();

-- Trigger for Checklist Items (Task completion)
drop trigger if exists on_task_completed_log on public.checklist_items;
create trigger on_task_completed_log
  after update on public.checklist_items
  for each row execute procedure public.log_product_event();

-- Trigger for Testimonials
drop trigger if exists on_testimonial_created_log on public.testimonials;
create trigger on_testimonial_created_log
  after insert on public.testimonials
  for each row execute procedure public.log_product_event();

-- Trigger for Documents
drop trigger if exists on_document_created_log on public.documents;
create trigger on_document_created_log
  after insert on public.documents
  for each row execute procedure public.log_product_event();


-- 10. Upgrade project limit trigger to dynamically expire 1-month promo_pro accounts
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
  select plan, promo_pro, created_at into user_plan, is_promo_pro, user_created from public.users where id = new.user_id;
  
  -- If they have expired promo_pro (1-month duration), demote them to free dynamically
  if user_plan = 'pro' and is_promo_pro = true and user_created < now() - interval '1 month' then
    update public.users set plan = 'free', promo_pro = false where id = new.user_id;
    user_plan := 'free';
  end if;

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


