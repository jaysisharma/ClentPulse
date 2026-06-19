-- ClientPulse — Freelancer feature suite migration
-- Run in the Supabase Dashboard SQL Editor.
-- Safe to re-run (idempotent).

-- ─────────────────────────────────────────────────────────────────────────────
-- Expenses (net profit / take-home tracking)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  description text not null,
  amount numeric(10,2) not null,
  category text,
  date date not null default current_date,
  created_at timestamptz default now()
);

alter table public.expenses enable row level security;

drop policy if exists "Owner can manage expenses" on public.expenses;
create policy "Owner can manage expenses" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists expenses_user_date_idx on public.expenses (user_id, date desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Invoice paid_at — attribute revenue to when it was PAID, not when created.
-- Without this, "earnings this month" is keyed on created_at, which misattributes
-- revenue across month boundaries on the dashboard and earnings chart.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.invoices add column if not exists paid_at timestamptz;

-- Backfill: best-effort attribute existing paid invoices to their creation date.
update public.invoices set paid_at = created_at where status = 'paid' and paid_at is null;

create index if not exists invoices_user_paid_at_idx on public.invoices (user_id, paid_at);
