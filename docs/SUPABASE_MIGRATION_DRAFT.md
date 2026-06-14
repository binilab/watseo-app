# Supabase Migration Draft

## Target Project

- project ref: `zknuyyknmxgrjuipdysf`
- project name: `watseo-app`
- status: `ACTIVE_HEALTHY`
- public schema existing tables: none
- old project ref `ampgpgsciwkfkjpumtrb` is not a target

This is a local draft only. Do not run `apply_migration` until the user explicitly says `적용 승인`.

## v1 Scope

- QR verification first
- Location verification is deferred to v1.5+
- No full route or movement path storage
- No manual arrival completion in v1
- Link-based invites first
- Recipients are selected per return-home session
- `arrived_partial` means QR verification succeeded and location verification is not complete
- Notification events are recorded in DB first; real push delivery comes later
- Notification payloads must not store detailed address, coordinates, or route data

## Enum List

- `app_state`
- `relationship_type`
- `relationship_status`
- `invite_status`
- `verification_method`
- `verification_status`
- `request_status`
- `help_request_status`
- `notification_type`
- `notification_delivery_status`

## Table List

- `profiles`
- `relationships`
- `connection_invites`
- `destinations`
- `trips`
- `trip_recipients`
- `arrival_verifications`
- `time_extension_requests`
- `help_requests`
- `notification_events`

## Migration SQL

```sql
-- Watseo v1 schema draft
-- Target project ref: zknuyyknmxgrjuipdysf
-- Target project name: watseo-app
-- Do not apply until the user explicitly says: 적용 승인

begin;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'app_state'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.app_state as enum (
      'not_started',
      'on_the_way',
      'arrived_verified',
      'arrived_partial',
      'late',
      'extension_requested',
      'emergency_requested',
      'cancelled'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'relationship_type'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.relationship_type as enum (
      'friend',
      'partner',
      'family',
      'sibling',
      'other'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'relationship_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.relationship_status as enum (
      'pending',
      'accepted',
      'declined',
      'cancelled',
      'blocked'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'invite_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.invite_status as enum (
      'pending',
      'accepted',
      'expired',
      'cancelled'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'verification_method'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.verification_method as enum (
      'qr_code',
      'location'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'verification_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.verification_status as enum (
      'pending',
      'succeeded',
      'failed'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'request_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.request_status as enum (
      'pending',
      'accepted',
      'declined',
      'cancelled',
      'expired'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'help_request_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.help_request_status as enum (
      'requested',
      'acknowledged',
      'resolved',
      'cancelled'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'notification_type'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.notification_type as enum (
      'trip_started',
      'trip_late',
      'arrived_partial',
      'arrived_verified',
      'time_extension_requested',
      'time_extension_accepted',
      'time_extension_declined',
      'help_requested',
      'trip_cancelled'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'notification_delivery_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.notification_delivery_status as enum (
      'recorded',
      'queued',
      'sent',
      'failed',
      'skipped'
    );
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id),
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (
    char_length(display_name) between 1 and 40
  )
);

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id),
  recipient_id uuid not null references public.profiles(id),
  relationship_type public.relationship_type not null default 'other',
  status public.relationship_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint relationships_not_self check (requester_id <> recipient_id),
  constraint relationships_unique_pair unique (requester_id, recipient_id)
);

create table if not exists public.connection_invites (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.profiles(id),
  invite_token uuid not null default gen_random_uuid(),
  relationship_type public.relationship_type not null default 'other',
  status public.invite_status not null default 'pending',
  accepted_by uuid references public.profiles(id),
  accepted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint connection_invites_token_unique unique (invite_token),
  constraint connection_invites_not_self check (
    accepted_by is null or accepted_by <> inviter_id
  )
);

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  name text not null,
  qr_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint destinations_name_length check (
    char_length(name) between 1 and 60
  ),
  constraint destinations_qr_token_unique unique (qr_token)
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  destination_id uuid not null references public.destinations(id),
  state public.app_state not null default 'not_started',
  expected_arrival_at timestamptz not null,
  started_at timestamptz,
  arrived_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_time_order check (
    started_at is null or expected_arrival_at >= started_at
  ),
  constraint trips_arrived_time_requires_arrival_state check (
    arrived_at is null or state in ('arrived_partial', 'arrived_verified')
  ),
  constraint trips_cancelled_time_requires_cancelled_state check (
    cancelled_at is null or state = 'cancelled'
  )
);

create table if not exists public.trip_recipients (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id),
  recipient_id uuid not null references public.profiles(id),
  added_by uuid not null references public.profiles(id),
  notification_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  constraint trip_recipients_unique unique (trip_id, recipient_id)
);

create table if not exists public.arrival_verifications (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id),
  destination_id uuid not null references public.destinations(id),
  verified_by uuid not null references public.profiles(id),
  method public.verification_method not null,
  status public.verification_status not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  constraint arrival_verifications_no_manual check (method in ('qr_code', 'location')),
  constraint arrival_verifications_verified_at_requires_success check (
    verified_at is null or status = 'succeeded'
  )
);

create table if not exists public.time_extension_requests (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id),
  requested_by uuid not null references public.profiles(id),
  previous_expected_arrival_at timestamptz not null,
  requested_expected_arrival_at timestamptz not null,
  status public.request_status not null default 'pending',
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint time_extension_requests_later_time check (
    requested_expected_arrival_at > previous_expected_arrival_at
  )
);

create table if not exists public.help_requests (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id),
  requested_by uuid not null references public.profiles(id),
  status public.help_request_status not null default 'requested',
  acknowledged_by uuid references public.profiles(id),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id),
  recipient_id uuid not null references public.profiles(id),
  actor_id uuid references public.profiles(id),
  type public.notification_type not null,
  delivery_status public.notification_delivery_status not null default 'recorded',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  constraint notification_events_payload_object check (
    jsonb_typeof(payload) = 'object'
  ),
  constraint notification_events_payload_no_sensitive_location check (
    not (
      payload ?| array[
        'address',
        'destination_address',
        'latitude',
        'longitude',
        'coordinates',
        'route',
        'path',
        'movement_path',
        'location_history'
      ]
    )
  )
);

create index if not exists relationships_requester_id_idx
  on public.relationships(requester_id);
create index if not exists relationships_recipient_id_idx
  on public.relationships(recipient_id);
create index if not exists relationships_status_idx
  on public.relationships(status);

create index if not exists connection_invites_inviter_id_idx
  on public.connection_invites(inviter_id);
create index if not exists connection_invites_token_idx
  on public.connection_invites(invite_token);
create index if not exists connection_invites_status_idx
  on public.connection_invites(status);

create index if not exists destinations_owner_id_idx
  on public.destinations(owner_id);

create index if not exists trips_owner_id_idx
  on public.trips(owner_id);
create index if not exists trips_destination_id_idx
  on public.trips(destination_id);
create index if not exists trips_state_idx
  on public.trips(state);
create index if not exists trips_expected_arrival_at_idx
  on public.trips(expected_arrival_at);

create index if not exists trip_recipients_trip_id_idx
  on public.trip_recipients(trip_id);
create index if not exists trip_recipients_recipient_id_idx
  on public.trip_recipients(recipient_id);

create index if not exists arrival_verifications_trip_id_idx
  on public.arrival_verifications(trip_id);
create index if not exists arrival_verifications_destination_id_idx
  on public.arrival_verifications(destination_id);
create index if not exists arrival_verifications_verified_by_idx
  on public.arrival_verifications(verified_by);

create index if not exists time_extension_requests_trip_id_idx
  on public.time_extension_requests(trip_id);
create index if not exists time_extension_requests_status_idx
  on public.time_extension_requests(status);

create index if not exists help_requests_trip_id_idx
  on public.help_requests(trip_id);
create index if not exists help_requests_status_idx
  on public.help_requests(status);

create index if not exists notification_events_trip_id_idx
  on public.notification_events(trip_id);
create index if not exists notification_events_recipient_id_idx
  on public.notification_events(recipient_id);
create index if not exists notification_events_type_idx
  on public.notification_events(type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), '새 사용자'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.is_trip_participant(input_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trips t
    where t.id = input_trip_id
      and t.owner_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.trip_recipients tr
    where tr.trip_id = input_trip_id
      and tr.recipient_id = (select auth.uid())
  );
$$;

create or replace function public.is_trip_owner(input_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trips t
    where t.id = input_trip_id
      and t.owner_id = (select auth.uid())
  );
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_profiles_updated_at'
  ) then
    create trigger set_profiles_updated_at
      before update on public.profiles
      for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_relationships_updated_at'
  ) then
    create trigger set_relationships_updated_at
      before update on public.relationships
      for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_connection_invites_updated_at'
  ) then
    create trigger set_connection_invites_updated_at
      before update on public.connection_invites
      for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_destinations_updated_at'
  ) then
    create trigger set_destinations_updated_at
      before update on public.destinations
      for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_trips_updated_at'
  ) then
    create trigger set_trips_updated_at
      before update on public.trips
      for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_time_extension_requests_updated_at'
  ) then
    create trigger set_time_extension_requests_updated_at
      before update on public.time_extension_requests
      for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_help_requests_updated_at'
  ) then
    create trigger set_help_requests_updated_at
      before update on public.help_requests
      for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user_profile();
  end if;
end $$;

alter table public.profiles enable row level security;
alter table public.relationships enable row level security;
alter table public.connection_invites enable row level security;
alter table public.destinations enable row level security;
alter table public.trips enable row level security;
alter table public.trip_recipients enable row level security;
alter table public.arrival_verifications enable row level security;
alter table public.time_extension_requests enable row level security;
alter table public.help_requests enable row level security;
alter table public.notification_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_select_connected_or_self'
  ) then
    create policy profiles_select_connected_or_self
      on public.profiles
      for select
      using (
        id = (select auth.uid())
        or exists (
          select 1
          from public.relationships r
          where r.status = 'accepted'
            and (
              (r.requester_id = (select auth.uid()) and r.recipient_id = profiles.id)
              or (r.recipient_id = (select auth.uid()) and r.requester_id = profiles.id)
            )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_insert_own'
  ) then
    create policy profiles_insert_own
      on public.profiles
      for insert
      with check (id = (select auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_update_own'
  ) then
    create policy profiles_update_own
      on public.profiles
      for update
      using (id = (select auth.uid()))
      with check (id = (select auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'relationships'
      and policyname = 'relationships_select_participant'
  ) then
    create policy relationships_select_participant
      on public.relationships
      for select
      using (
        requester_id = (select auth.uid())
        or recipient_id = (select auth.uid())
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'relationships'
      and policyname = 'relationships_insert_requester'
  ) then
    create policy relationships_insert_requester
      on public.relationships
      for insert
      with check (requester_id = (select auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'relationships'
      and policyname = 'relationships_update_participant'
  ) then
    create policy relationships_update_participant
      on public.relationships
      for update
      using (
        requester_id = (select auth.uid())
        or recipient_id = (select auth.uid())
      )
      with check (
        requester_id = (select auth.uid())
        or recipient_id = (select auth.uid())
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'connection_invites'
      and policyname = 'connection_invites_select_involved'
  ) then
    create policy connection_invites_select_involved
      on public.connection_invites
      for select
      using (
        inviter_id = (select auth.uid())
        or accepted_by = (select auth.uid())
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'connection_invites'
      and policyname = 'connection_invites_insert_inviter'
  ) then
    create policy connection_invites_insert_inviter
      on public.connection_invites
      for insert
      with check (inviter_id = (select auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'connection_invites'
      and policyname = 'connection_invites_update_involved'
  ) then
    create policy connection_invites_update_involved
      on public.connection_invites
      for update
      using (
        inviter_id = (select auth.uid())
        or accepted_by = (select auth.uid())
      )
      with check (
        inviter_id = (select auth.uid())
        or accepted_by = (select auth.uid())
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'destinations'
      and policyname = 'destinations_select_owner'
  ) then
    create policy destinations_select_owner
      on public.destinations
      for select
      using (owner_id = (select auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'destinations'
      and policyname = 'destinations_insert_owner'
  ) then
    create policy destinations_insert_owner
      on public.destinations
      for insert
      with check (owner_id = (select auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'destinations'
      and policyname = 'destinations_update_owner'
  ) then
    create policy destinations_update_owner
      on public.destinations
      for update
      using (owner_id = (select auth.uid()))
      with check (owner_id = (select auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'trips'
      and policyname = 'trips_select_participant'
  ) then
    create policy trips_select_participant
      on public.trips
      for select
      using (
        owner_id = (select auth.uid())
        or public.is_trip_participant(id)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'trips'
      and policyname = 'trips_insert_owner'
  ) then
    create policy trips_insert_owner
      on public.trips
      for insert
      with check (owner_id = (select auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'trips'
      and policyname = 'trips_update_owner'
  ) then
    create policy trips_update_owner
      on public.trips
      for update
      using (owner_id = (select auth.uid()))
      with check (owner_id = (select auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'trip_recipients'
      and policyname = 'trip_recipients_select_participant'
  ) then
    create policy trip_recipients_select_participant
      on public.trip_recipients
      for select
      using (
        recipient_id = (select auth.uid())
        or public.is_trip_owner(trip_id)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'trip_recipients'
      and policyname = 'trip_recipients_insert_trip_owner'
  ) then
    create policy trip_recipients_insert_trip_owner
      on public.trip_recipients
      for insert
      with check (
        added_by = (select auth.uid())
        and public.is_trip_owner(trip_id)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'trip_recipients'
      and policyname = 'trip_recipients_update_trip_owner'
  ) then
    create policy trip_recipients_update_trip_owner
      on public.trip_recipients
      for update
      using (public.is_trip_owner(trip_id))
      with check (public.is_trip_owner(trip_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'arrival_verifications'
      and policyname = 'arrival_verifications_select_participant'
  ) then
    create policy arrival_verifications_select_participant
      on public.arrival_verifications
      for select
      using (public.is_trip_participant(trip_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'arrival_verifications'
      and policyname = 'arrival_verifications_insert_trip_owner'
  ) then
    create policy arrival_verifications_insert_trip_owner
      on public.arrival_verifications
      for insert
      with check (
        verified_by = (select auth.uid())
        and public.is_trip_owner(trip_id)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'time_extension_requests'
      and policyname = 'time_extension_requests_select_participant'
  ) then
    create policy time_extension_requests_select_participant
      on public.time_extension_requests
      for select
      using (public.is_trip_participant(trip_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'time_extension_requests'
      and policyname = 'time_extension_requests_insert_trip_owner'
  ) then
    create policy time_extension_requests_insert_trip_owner
      on public.time_extension_requests
      for insert
      with check (
        requested_by = (select auth.uid())
        and public.is_trip_owner(trip_id)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'time_extension_requests'
      and policyname = 'time_extension_requests_update_participant'
  ) then
    create policy time_extension_requests_update_participant
      on public.time_extension_requests
      for update
      using (public.is_trip_participant(trip_id))
      with check (public.is_trip_participant(trip_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'help_requests'
      and policyname = 'help_requests_select_participant'
  ) then
    create policy help_requests_select_participant
      on public.help_requests
      for select
      using (public.is_trip_participant(trip_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'help_requests'
      and policyname = 'help_requests_insert_trip_owner'
  ) then
    create policy help_requests_insert_trip_owner
      on public.help_requests
      for insert
      with check (
        requested_by = (select auth.uid())
        and public.is_trip_owner(trip_id)
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'help_requests'
      and policyname = 'help_requests_update_participant'
  ) then
    create policy help_requests_update_participant
      on public.help_requests
      for update
      using (public.is_trip_participant(trip_id))
      with check (public.is_trip_participant(trip_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notification_events'
      and policyname = 'notification_events_select_recipient_or_actor'
  ) then
    create policy notification_events_select_recipient_or_actor
      on public.notification_events
      for select
      using (
        recipient_id = (select auth.uid())
        or actor_id = (select auth.uid())
        or (trip_id is not null and public.is_trip_participant(trip_id))
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notification_events'
      and policyname = 'notification_events_insert_trip_owner'
  ) then
    create policy notification_events_insert_trip_owner
      on public.notification_events
      for insert
      with check (
        actor_id = (select auth.uid())
        and (
          trip_id is null
          or public.is_trip_owner(trip_id)
        )
      );
  end if;
end $$;

commit;
```

## RLS Policy Summary

- `profiles`: users can insert/update their own profile; self and accepted connected people can read limited profile rows.
- `relationships`: only requester/recipient can read or update relationship rows; requester can create.
- `connection_invites`: inviter can create and read; inviter or accepted user can update. Public token lookup is not opened in this draft.
- `destinations`: only the owner can read, create, or update.
- `trips`: owner can create/update; owner and selected recipients can read.
- `trip_recipients`: trip owner can add/update recipients; owner and selected recipient can read.
- `arrival_verifications`: trip owner can create QR/location verification records; trip participants can read.
- `time_extension_requests`: trip owner can request; trip participants can read/update request status.
- `help_requests`: trip owner can create; trip participants can read/update acknowledgement/status.
- `notification_events`: recipient, actor, and trip participants can read; trip owner/actor can insert records.

## Risks Before Applying

- Link invite acceptance may need an RPC later because public token lookup is not exposed directly through table RLS.
- `notification_events.payload` blocks sensitive top-level keys, but nested JSON keys are not fully blocked by this draft constraint.
- `arrival_verifications` includes `location` as a future enum value, but v1 app logic should only create `qr_code` records.
- `arrived_verified` exists in `app_state` for the shared state model, but v1 should normally use `arrived_partial` after QR success.
- The profile trigger writes a default Korean display name when auth metadata is missing; confirm this is acceptable.
- The `relationships_unique_pair` constraint treats A-to-B and B-to-A as different pairs. If symmetric uniqueness is required, this needs a generated normalized pair or a unique expression index.
- No row removal policies are defined for user tables. Cancellation/status transitions should be used instead.

## Questions To Confirm

1. Should `connection_invites` support unauthenticated invite preview by token, or only authenticated acceptance through an RPC later?
2. Should `relationships` enforce symmetric uniqueness so the same two users cannot create both A-to-B and B-to-A rows?
3. Is storing only `destinations.name` enough for v1, or do we need a non-sensitive label such as building nickname/floor-free place label?
4. Should recipients be allowed to acknowledge `help_requests`, or should acknowledgement be restricted to selected recipients only through stricter policy?
5. Should `notification_events.payload` be restricted to a fixed shape such as only `destination_name` and `state`?
6. Should v1 hide `arrived_verified` from writable app flows until location verification is added in v1.5?
