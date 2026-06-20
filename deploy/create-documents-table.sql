-- ============================================================================
-- Documents feature: proposals, service agreements, and requirements docs.
-- The app reads/writes public.documents but the table was never created.
-- Run this once in the Supabase SQL editor.
-- ============================================================================

create table if not exists public.documents (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.users(id) on delete cascade not null,
  project_id    uuid references public.projects(id) on delete set null,
  type          text not null check (type in ('proposal', 'agreement', 'requirements')),
  title         text not null,
  client_name   text,
  client_email  text,
  amount        numeric(10,2),
  content       text not null default '',
  status        text not null default 'draft',
  signed_at     timestamptz,
  signed_name   text,
  response_note text,
  created_at    timestamptz default now()
);

create index if not exists documents_user_id_idx on public.documents(user_id);

alter table public.documents enable row level security;

-- Owner: full control over their own documents.
drop policy if exists "Users manage own documents" on public.documents;
create policy "Users manage own documents" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public signing link: the client opens /doc/<uuid> to view and respond
-- (sign / approve / decline). The UUID is the unguessable secret — same trust
-- model the rest of the public client flows use. Anyone with a valid id may
-- read and update it, so treat document ids as private links.
drop policy if exists "Public can view documents" on public.documents;
create policy "Public can view documents" on public.documents
  for select using (true);

drop policy if exists "Public can respond to documents" on public.documents;
create policy "Public can respond to documents" on public.documents
  for update using (true) with check (true);
