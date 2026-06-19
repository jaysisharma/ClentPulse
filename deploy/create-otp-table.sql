-- Create custom table for manually rate-limited OTP auth codes
create table if not exists public.otp_codes (
  email text primary key,
  code text not null,
  created_at timestamptz default now() not null,
  expires_at timestamptz not null
);

-- Enable Row Level Security (RLS)
alter table public.otp_codes enable row level security;

-- NOTE: We intentionally define NO public policies (SELECT, INSERT, UPDATE, DELETE).
-- Since our API route handles this server-side using the `service_role` client,
-- it bypasses RLS automatically. This prevents any external client from reading or writing OTP codes.
