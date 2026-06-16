-- Fix accept_connection_invite digest lookup.
-- pgcrypto is available in the extensions schema on Supabase, so reference it explicitly.

begin;

create or replace function public.accept_connection_invite(invite_token text)
returns table (
  invite_id uuid,
  relationship_id uuid
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  current_user_id uuid := (select auth.uid());
  hashed_token text;
  invite_record public.connection_invites%rowtype;
  existing_relationship record;
  created_relationship_id uuid;
begin
  if current_user_id is null then
    raise exception 'authenticated user is required';
  end if;

  if invite_token is null or btrim(invite_token) = '' then
    raise exception 'invite token is required';
  end if;

  hashed_token := encode(extensions.digest(invite_token, 'sha256'::text), 'hex');

  select ci.*
  into invite_record
  from public.connection_invites ci
  where ci.token_hash = hashed_token
    and ci.status = 'pending'
    and ci.accepted_by is null
    and ci.expires_at > now()
  for update;

  if not found then
    raise exception 'invite is not available';
  end if;

  if invite_record.inviter_id = current_user_id then
    raise exception 'inviter cannot accept their own invite';
  end if;

  select r.id, r.status, r.requester_id, r.recipient_id
  into existing_relationship
  from public.relationships r
  where least(r.requester_id, r.recipient_id)
    = least(invite_record.inviter_id, current_user_id)
    and greatest(r.requester_id, r.recipient_id)
    = greatest(invite_record.inviter_id, current_user_id)
  limit 1
  for update;

  if found then
    if existing_relationship.status = 'accepted' then
      created_relationship_id := existing_relationship.id;
    elsif existing_relationship.status = 'pending'
      and existing_relationship.requester_id = invite_record.inviter_id
      and existing_relationship.recipient_id = current_user_id
    then
      update public.relationships r
      set status = 'accepted'
      where r.id = existing_relationship.id
      returning r.id into created_relationship_id;
    else
      raise exception 'relationship already exists and cannot be accepted by this invite';
    end if;
  else
    insert into public.relationships (
      requester_id,
      recipient_id,
      relationship_type,
      status
    )
    values (
      invite_record.inviter_id,
      current_user_id,
      invite_record.relationship_type,
      'accepted'
    )
    returning id into created_relationship_id;
  end if;

  update public.connection_invites ci
  set status = 'accepted',
      accepted_by = current_user_id,
      accepted_at = now()
  where ci.id = invite_record.id;

  return query
  select invite_record.id, created_relationship_id;
end;
$$;

grant execute on function public.accept_connection_invite(text) to authenticated;

commit;
