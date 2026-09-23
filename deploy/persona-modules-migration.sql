-- Frevio — Persona Onboarding & Workspace Modules Migration (Idempotent)
-- Run in Supabase SQL Editor

-- 1. Add craft and enabled_modules to users table
alter table public.users add column if not exists craft text default 'general';
alter table public.users add column if not exists enabled_modules jsonb default '{"marketing":true,"developer":true,"design":true,"time_tracking":true,"contracts_billing":true}'::jsonb;

-- Index for craft if filtering by user discipline
create index if not exists idx_users_craft on public.users(craft);
