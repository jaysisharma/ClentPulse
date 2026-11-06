-- Frevio — v0.5.0 Retainer Subscriptions & Marketing Performance Migration
-- Idempotent script for Supabase

-- 1. Invoices: Recurring retainer indicators
alter table public.invoices add column if not exists is_retainer boolean default false;
alter table public.invoices add column if not exists retainer_period text default 'monthly';

-- 2. Projects: Retainer flag & recurring monthly amount
alter table public.projects add column if not exists is_retainer boolean default false;
alter table public.projects add column if not exists retainer_amount numeric;
alter table public.projects add column if not exists retainer_interval text default 'month';

