-- ============================================================================
-- SECURITY: lock down public access to public.documents
--
-- The original "Public can view documents" / "Public can respond to documents"
-- policies used `using (true)`. RLS does not filter by id, so anyone holding the
-- anon key could `select *` every tenant's proposals and agreements and rewrite
-- any row (content, amount, signed_at, user_id).
--
-- The public /doc/<id> page now goes through two security-definer functions:
--   get_public_document(id)          — read one document by id, safe columns only
--   respond_to_document(id, ...)     — one-time sign / accept / decline
-- Owners keep full access through "Users manage own documents".
--
-- Run this once in the Supabase SQL editor.
-- ============================================================================

drop policy if exists "Public can view documents" on public.documents;
drop policy if exists "Public can respond to documents" on public.documents;

-- Read one document by id, plus the owner's public branding.
create or replace function public.get_public_document(p_id uuid)
returns json
language sql
security definer
stable
set search_path = public
as $$
  select json_build_object(
    'id',          d.id,
    'type',        d.type,
    'title',       d.title,
    'content',     d.content,
    'client_name', d.client_name,
    'amount',      d.amount,
    'status',      d.status,
    'signed_name', d.signed_name,
    'signed_at',   d.signed_at,
    'users', json_build_object(
      'id',           u.id,
      'name',         u.name,
      'username',     u.username,
      'plan',         u.plan,
      'accent_color', u.accent_color,
      'logo_url',     u.logo_url
    )
  )
  from public.documents d
  left join public.users u on u.id = d.user_id
  where d.id = p_id;
$$;

-- Record the client's response. Only one response per document; agreements can
-- only be signed, proposals/requirements only accepted or declined.
create or replace function public.respond_to_document(
  p_id          uuid,
  p_action      text,
  p_signed_name text default null,
  p_note        text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type   text;
  v_status text;
  v_name   text := nullif(trim(coalesce(p_signed_name, '')), '');
  v_note   text := nullif(trim(coalesce(p_note, '')), '');
begin
  select type, status into v_type, v_status
  from public.documents
  where id = p_id
  for update;

  if not found then
    raise exception 'document_not_found';
  end if;

  if v_status in ('signed', 'accepted', 'declined') then
    raise exception 'already_responded';
  end if;

  if v_type = 'agreement' then
    if p_action <> 'signed' then
      raise exception 'invalid_action';
    end if;
    if v_name is null or length(v_name) > 200 then
      raise exception 'invalid_signed_name';
    end if;

    update public.documents
    set status = 'signed', signed_name = v_name, signed_at = now()
    where id = p_id;
  else
    if p_action not in ('accepted', 'declined') then
      raise exception 'invalid_action';
    end if;
    if v_note is not null and length(v_note) > 5000 then
      raise exception 'note_too_long';
    end if;

    update public.documents
    set status = p_action, response_note = v_note
    where id = p_id;
  end if;

  return p_action;
end;
$$;

revoke execute on function public.get_public_document(uuid) from public;
revoke execute on function public.respond_to_document(uuid, text, text, text) from public;
grant execute on function public.get_public_document(uuid) to anon, authenticated;
grant execute on function public.respond_to_document(uuid, text, text, text) to anon, authenticated;
