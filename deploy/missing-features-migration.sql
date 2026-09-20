-- Frevio — Missing Features Migration (Idempotent)
-- Run in Supabase SQL Editor

-- 1. Invoices: multi-currency, tax/VAT compliance, upfront deposits
alter table public.invoices add column if not exists currency text default 'USD';
alter table public.invoices add column if not exists tax_rate numeric(5,2) default 0;
alter table public.invoices add column if not exists tax_id text;
alter table public.invoices add column if not exists is_deposit boolean default false;

-- 2. Projects: "Waiting on client" blocker status and deposit requirements
alter table public.projects add column if not exists waiting_on_client boolean default false;
alter table public.projects add column if not exists waiting_reason text;
alter table public.projects add column if not exists deposit_required numeric(10,2);
alter table public.projects add column if not exists deposit_paid boolean default false;

-- 3. Approvals: rich preview deliverable types
alter table public.approvals add column if not exists preview_type text default 'staging' check (preview_type in ('staging', 'figma', 'code_pr', 'document', 'asset_zip'));

-- Index for invoice currency queries
create index if not exists invoices_currency_idx on public.invoices (currency);
