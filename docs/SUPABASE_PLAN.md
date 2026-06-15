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
