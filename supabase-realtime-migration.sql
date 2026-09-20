-- ==============================================================================
-- Frevio: Enable Supabase Realtime for Client Portal & Messaging
-- ==============================================================================
-- Run this script in the Supabase Dashboard -> SQL Editor to enable Realtime
-- listeners for projects, milestones, approvals, updates, and checklist items.
-- ==============================================================================

do $$
declare
  t text;
  tables_to_publish text[] := array[
    'projects',
    'updates',
    'approvals',
    'milestones',
    'checklist_items',
    'update_comments',
    'comments'
  ];
begin
  foreach t in array tables_to_publish
  loop
    if exists (
      select 1 from information_schema.tables 
      where table_schema = 'public' and table_name = t
    ) and not exists (
      select 1 from pg_publication_tables 
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I;', t);
    end if;
  end loop;
end $$;
