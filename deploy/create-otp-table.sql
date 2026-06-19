-- Create custom table for manually rate-limited OTP auth codes
-- Run this in the Supabase SQL editor: https://supabase.com/dashboard/project/ffdwirtwyprkittwlchn/sql/new

-- 1. Create or update public.otp_codes
create table if not exists public.otp_codes (
  email text primary key,
  code text not null,
  created_at timestamptz default now() not null,
  expires_at timestamptz not null,
  attempts_count integer default 1 not null,
  window_start timestamptz default now() not null,
  failed_verifications integer default 0 not null,
  temp_password text,
  temp_name text
);

-- Enable RLS on public.otp_codes
alter table public.otp_codes enable row level security;

-- Alter table if it already exists to ensure all columns are present:
alter table public.otp_codes add column if not exists temp_password text;
alter table public.otp_codes add column if not exists temp_name text;

-- 2. Create public.login_attempts table for password login rate limiting
create table if not exists public.login_attempts (
  email text primary key,
  attempts_count integer default 1 not null,
  window_start timestamptz default now() not null
);

-- Enable RLS on public.login_attempts
alter table public.login_attempts enable row level security;

-- NOTE: We intentionally define NO public policies (SELECT, INSERT, UPDATE, DELETE).
-- Since our API routes handle this server-side using the `service_role` client,
-- they bypass RLS automatically. This prevents any external client from reading or writing auth/rate limits.
