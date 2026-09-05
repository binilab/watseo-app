-- =============================================================================
-- DRAFT — 아직 적용하지 마세요 (do not apply yet).
-- Android 푸시 알림을 위한 기기 push token 저장 테이블.
-- 검토 후 Supabase 대시보드 또는 CLI로 직접 적용하세요.
-- 적용 전까지 savePushToken()은 동작하지 않습니다.
-- =============================================================================

create table if not exists public.device_push_tokens (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  push_token text not null,
  platform text not null,
  device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint device_push_tokens_push_token_unique unique (push_token),
  constraint device_push_tokens_platform_check check (
    platform in ('android', 'ios', 'web')
  )
);

create index if not exists device_push_tokens_owner_id_idx
  on public.device_push_tokens (owner_id);

-- updated_at 자동 갱신 (기존 watseo_set_updated_at 트리거 함수 재사용)
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_device_push_tokens_updated_at'
  ) then
    create trigger set_device_push_tokens_updated_at
      before update on public.device_push_tokens
      for each row execute function public.watseo_set_updated_at();
  end if;
end $$;

alter table public.device_push_tokens enable row level security;

-- 본인 토큰만 조회/등록/수정/삭제 가능
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'device_push_tokens'
      and policyname = 'device_push_tokens_select_owner'
  ) then
    create policy device_push_tokens_select_owner
      on public.device_push_tokens
      for select
      using (owner_id = (select auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'device_push_tokens'
      and policyname = 'device_push_tokens_insert_owner'
  ) then
    create policy device_push_tokens_insert_owner
      on public.device_push_tokens
      for insert
      with check (owner_id = (select auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'device_push_tokens'
      and policyname = 'device_push_tokens_update_owner'
  ) then
    create policy device_push_tokens_update_owner
      on public.device_push_tokens
      for update
      using (owner_id = (select auth.uid()))
      with check (owner_id = (select auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'device_push_tokens'
      and policyname = 'device_push_tokens_delete_owner'
  ) then
    create policy device_push_tokens_delete_owner
      on public.device_push_tokens
      for delete
      using (owner_id = (select auth.uid()));
  end if;
end $$;
