-- Frevio — Phase 3: Agency White-Labeling & Custom Domains (CNAME)
-- Run in Supabase SQL Editor

-- 1. Add white-labeling & custom domain columns to organizations
alter table public.organizations add column if not exists custom_domain text unique;
alter table public.organizations add column if not exists white_label boolean default false;
alter table public.organizations add column if not exists favicon_url text;

-- 2. Index for fast custom domain lookups in proxy / middleware
create index if not exists organizations_custom_domain_idx on public.organizations(custom_domain) where custom_domain is not null;

-- 3. Update public view policy so clients accessing via custom domain can view the branding
-- (The existing "Public can view organizations" policy from Phase 1/2 already allows select: using (true))
