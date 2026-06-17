-- Watseo onboarding state

begin;

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists permissions_seen boolean not null default false,
  add column if not exists permissions_seen_at timestamptz;

commit;
