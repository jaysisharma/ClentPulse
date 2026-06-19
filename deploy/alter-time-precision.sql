-- Migration: increase hours column decimal precision to arbitrary scale
alter table public.time_entries alter column hours type numeric;
