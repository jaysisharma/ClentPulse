-- Create custom table for manually rate-limited OTP auth codes
-- Run this in the Supabase SQL editor: https://supabase.com/dashboard/project/ffdwirtwyprkittwlchn/sql/new

-- Drop table if you need to recreate it fresh:
-- drop table if exists public.otp_codes;

create table if not exists public.otp_codes (
  email text primary key,
  code text not null,
  created_at timestamptz default now() not null,
  expires_at timestamptz not null,
  attempts_count integer default 1 not null,
  window_start timestamptz default now() not null,
  failed_verifications integer default 0 not null
);

-- Enable Row Level Security (RLS)
alter table public.otp_codes enable row level security;

-- NOTE: We intentionally define NO public policies (SELECT, INSERT, UPDATE, DELETE).
-- Since our API route handles this server-side using the `service_role` client,
-- it bypasses RLS automatically. This prevents any external client from reading or writing OTP codes.
