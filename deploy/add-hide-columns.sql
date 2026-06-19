-- Migration: add layout visibility columns to projects
alter table public.projects add column if not exists hide_milestones boolean default false not null;
alter table public.projects add column if not exists hide_client_access boolean default false not null;
alter table public.projects add column if not exists hide_kickoff boolean default false not null;
alter table public.projects add column if not exists hide_approvals boolean default false not null;
