# Supabase Plan

## Current Position

Supabase 작업은 MCP로 진행할 예정이다.

기존에 Codex가 확인한 `ampgpgsciwkfkjpumtrb` 프로젝트는 옛 프로젝트이며 적용 대상이 아니다.

`ampgpgsciwkfkjpumtrb`에는 절대 migration을 적용하지 않는다.

새 Supabase 프로젝트가 확인되었다.

- project ref: `zknuyyknmxgrjuipdysf`
- project name: `watseo-app`
- status: `ACTIVE_HEALTHY`
- public schema 기존 테이블: 없음

확인된 새 프로젝트 외에는 migration을 적용하지 않는다.
사용자 `적용 승인` 후 Supabase v1 schema migration 적용을 완료했다.

- migration name: `watseo_v1_schema`
- local migration file: `supabase/migrations/20260615_watseo_v1_schema.sql`
- TypeScript types: `src/types/supabase.ts`
- RLS: public table 10개 모두 활성화 완료
- Auth client: `src/lib/supabase.ts`
- Auth session hook: `src/features/auth/useAuthSession.ts`

## Required Checks Before Migration

1. 현재 연결된 project ref: `zknuyyknmxgrjuipdysf`
2. project name: `watseo-app`
3. status: `ACTIVE_HEALTHY`
4. public schema 기존 테이블 목록: 없음
5. 기존 테이블 충돌 여부: 충돌 없음

## Applied v1 Schema

Supabase v1 schema migration 적용 완료.

### Tables

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

### Enums

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

## v1 Design Decisions

- QR 인증 우선
- 위치 확인은 v1.5 이후
- manual 도착 완료는 v1에서 비허용
- 초대는 링크 기반 우선
- 귀가 세션마다 알림 받을 사람 선택
- 알림은 DB 기록 먼저, 실제 push는 이후
- 상세 위치/전체 이동 경로 저장 금지

## Planned Tables

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

## Planned Enums

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

## Migration Rule

The initial v1 schema migration has been applied to `zknuyyknmxgrjuipdysf`.

Future migrations still require explicit user approval before running `apply_migration`.

## Auth Integration

기본 Supabase Auth 연결을 앱 코드에 추가했다.

- 앱에는 Supabase URL과 anon key만 사용한다.
- `.env.example`에는 placeholder만 둔다.
- 실제 `.env`는 Git 추적 대상에서 제외한다.
- React Native session 저장은 AsyncStorage를 사용한다.
- 회원가입 후 `profiles` row는 DB trigger `handle_new_user_profile`이 자동 생성한다.
- 앱에서 `profiles`를 직접 insert하지 않는다.

## Applied Onboarding State Migration

온보딩 완료 상태는 로컬 AsyncStorage가 아니라 `profiles` 테이블에 저장한다.

이유:

- 계정 기반 상태이므로 앱 삭제, 기기 변경, 재로그인 후에도 유지되어야 한다.
- 사용자는 귀가하는 사람과 확인 상대 역할을 모두 가질 수 있으므로 v1에서는 고정 role 컬럼을 만들지 않는다.
- 역할 선택값은 v1에서 DB에 저장하지 않는다.

Applied migration:

- `supabase/migrations/20260615_add_onboarding_state_to_profiles.sql`

Applied columns:

- `profiles.onboarding_completed boolean not null default false`
- `profiles.onboarding_completed_at timestamptz`
- `profiles.permissions_seen boolean not null default false`
- `profiles.permissions_seen_at timestamptz`

RLS review:

- 기존 `profiles_update_own` 정책으로 본인 row update가 가능하다.
- 새 정책은 필요하지 않다.
- `src/types/supabase.ts`에 온보딩 컬럼 타입을 반영했다.

Route design after migration:

- 회원가입 성공: `/role`
- `/role` 선택 후: `/permissions`
- `/permissions` 완료 시 `profiles` 온보딩 상태 update 후 `/home`
- 로그인 성공: `profiles.onboarding_completed` 조회
  - `true`: `/home`
  - `false`: `/role`
- 전체 route guard는 별도 단계에서 설계한다.
