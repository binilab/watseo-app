# Development Log

## 2026-06-14

1. Stitch MCP에서 Safe Arrive MVP 프로젝트와 화면 목록을 확인했다.
2. Expo SDK 56 기준으로 Expo Router 구조를 적용했다.
3. Stitch 기반 18개 화면 UI 스켈레톤을 구현했다.
4. Soft Mint Minimal + Warm Pastel Friendly 톤에 맞춰 공통 디자인 토큰을 만들었다.
5. 공통 UI 컴포넌트를 구성했다.
   - `Screen`
   - `AppButton`
   - `Card`
   - `StatusChip`
   - `SectionHeader`
   - `ListItem`
6. AGENTS.md가 추가되었고, 프로젝트 언어 규칙과 상태 모델을 반영했다.
7. `AppState`, `VerificationMethod`, `Person`, `Place`, `Trip`, `QuickAction`, `StatusDisplay` 타입을 추가했다.
8. `getStatusDisplay(state)` 상태 표시 매핑을 추가했다.
9. mock data를 타입화하고 표시 문자열 기반 라우팅을 route 기반으로 정리했다.
10. Expo 템플릿 잔재인 `App.tsx`, `index.ts`를 삭제했다.
11. 하단 플로팅 탭바가 콘텐츠와 겹치는 문제를 수정했다.
12. 탭 재진입 시 ScrollView가 이전 위치에 머무르는 문제를 공통 `Screen`에서 초기화하도록 수정했다.
13. `/places/qr-code` 화면 CTA 위치를 카드 흐름 아래로 정리했다.
14. Supabase DB 설계안을 작성했다.
15. Supabase migration SQL 초안을 작성했지만 적용하지 않았다.
16. 새 Supabase 프로젝트를 확인했다.
    - project ref: `zknuyyknmxgrjuipdysf`
    - project name: `watseo-app`
    - status: `ACTIVE_HEALTHY`
    - public schema 기존 테이블: 없음
17. 사용자 승인 후 Supabase v1 schema migration을 적용했다.
    - migration name: `watseo_v1_schema`
    - local migration file: `supabase/migrations/20260615_watseo_v1_schema.sql`
    - 생성된 public table: 10개
    - 생성된 enum: 10개
    - RLS 활성화 완료
18. Supabase TypeScript 타입을 저장했다.
    - `src/types/supabase.ts`
19. Supabase Auth 기본 연결을 추가했다.
    - `src/lib/supabase.ts`
    - `src/features/auth/useAuthSession.ts`
    - `.env.example`
    - 이메일/비밀번호 로그인 및 회원가입 연결
    - AsyncStorage 기반 session 저장
    - 기본 로그아웃 동작 추가
20. Auth 수동 테스트를 완료했다.
    - 회원가입 성공
    - 로그인 성공
    - 로그아웃 성공
    - `profiles` row 자동 생성 확인
21. 회원가입 후 온보딩 흐름을 정리했다.
    - 회원가입 성공 후 `/role`로 이동
    - 로그인 성공 후 `/home`으로 이동 유지
    - `/role` -> `/permissions` -> `/home` 흐름 확인
22. 온보딩 완료 상태 저장 설계를 정리했다.
    - 상태 저장 위치: `profiles`
    - 역할 선택값은 v1에서 저장하지 않음
    - fixed role 컬럼은 만들지 않음
    - draft migration: `supabase/migrations/20260615_add_onboarding_state_to_profiles.sql`
23. `/permissions` 완료 버튼에서 `profiles` 온보딩 상태를 update하도록 앱 코드를 연결했다.
    - `profiles` insert는 하지 않음
24. 사용자 승인 후 온보딩 상태 migration을 적용했다.
    - `profiles.onboarding_completed`
    - `profiles.onboarding_completed_at`
    - `profiles.permissions_seen`
    - `profiles.permissions_seen_at`
    - 기존 `profiles_update_own` 정책으로 본인 update 가능 확인
    - `src/types/supabase.ts` 업데이트
25. 최소 Auth route guard를 추가했다.
    - `(tabs)` 그룹은 session loading 중 로딩 화면 표시
    - 로그인하지 않은 사용자가 `(tabs)` 내부 화면에 접근하면 `/login`으로 이동
    - 로그인된 사용자는 `(tabs)` 내부 화면 접근 가능
    - 로그인 성공 후 `profiles.onboarding_completed`를 조회해 `/home` 또는 `/role`로 분기
26. `/places` 도착 장소 관리를 Supabase `destinations` 테이블에 연결했다.
    - 현재 로그인 사용자의 RLS 범위 안에서 `destinations` 목록 조회
    - 장소 이름 입력 후 `owner_id`, `name`만 insert
    - `qr_token`은 DB default `gen_random_uuid()`에 맡김
    - 장소 이름 update만 지원
    - 삭제는 v1에서 제외
27. `/places/qr-code`가 선택된 destination id를 받아 해당 row의 `qr_token`을 참조할 준비를 했다.
    - 실제 QR 이미지 생성, QR 스캔, 도착 검증은 아직 구현하지 않음
28. `/connections` 연결 목록을 Supabase `relationships`, `profiles` 데이터에 연결했다.
    - 현재 로그인 사용자가 requester 또는 recipient인 `accepted` 관계만 조회
    - 상대방 `profiles.display_name`, `profiles.avatar_url`을 목록에 표시
    - loading / empty / error 상태 추가
29. `/connections/connect` 연결 초대 생성을 실제 DB에 연결했다.
    - 앱에서 raw invite token 생성
    - `expo-crypto`로 SHA-256 hash 생성
    - DB에는 `connection_invites.token_hash`만 저장
    - `relationship_type`은 기본 `other`, 화면에서 선택 가능
    - raw token은 생성 직후 화면 표시와 복사용으로만 사용
30. `/connections/invite` 초대 수락을 `accept_connection_invite(invite_token text)` RPC에 연결했다.
    - 앱에서 relationships를 직접 accepted로 update하지 않음
    - 실패 시 사용자용 오류 문구 표시
31. 연결 초대 수락 실패 디버깅을 위해 초대 코드 UX와 개발 로그를 보강했다.
    - RPC 호출은 `accept_connection_invite`에 `{ invite_token }` raw token 전달 유지
    - 수락 전 앱에서 raw token을 hash하지 않음
    - 입력값의 공백/줄바꿈 제거 후 raw token으로 RPC 호출
    - 생성 화면은 raw token을 한 줄 가로 스크롤로 표시하고 복사 버튼을 유지
    - `console.error("accept invite failed", error, { tokenLength })` 개발 로그 추가
    - raw token 전체는 console에 출력하지 않음
32. 연결 초대 수락 RPC 실패 원인을 확인하고 수정 migration 초안을 작성했다.
    - 에러: `function digest(text, unknown) does not exist`
    - 원인: `accept_connection_invite` 함수의 `search_path = public` 상태에서 pgcrypto `digest`를 찾지 못함
    - 수정 계획: `extensions.digest(invite_token, 'sha256'::text)`로 명시하고 function `search_path`를 `public, extensions`로 재정의
    - migration file: `supabase/migrations/20260616_fix_accept_invite_digest_schema.sql`
    - 사용자 승인 전까지 apply_migration은 실행하지 않음
33. 사용자 승인 후 `fix_accept_invite_digest_schema` migration을 Supabase MCP `apply_migration`으로 적용했다.
    - target project ref: `zknuyyknmxgrjuipdysf`
    - target project name: `watseo-app`
    - `public.accept_connection_invite(text)` 함수가 `extensions.digest(invite_token, 'sha256'::text)`를 사용하도록 교체됨
    - `authenticated` role execute 권한 확인 완료
    - 기존 유효 pending invite 2건 유지 확인
    - `relationships` 상태 분포 조회 결과 row 없음 확인
34. `/home/return-setup` 귀가 세션 생성을 Supabase `trips`, `trip_recipients`에 연결했다.
    - 현재 로그인 사용자의 `destinations` 조회
    - 현재 로그인 사용자의 accepted `relationships`와 상대 `profiles` 조회
    - 도착 장소, 알림 받을 사람, 예상 도착 시간 선택 UI 추가
    - `trips` insert 값: `owner_id`, `destination_id`, `state = on_the_way`, `expected_arrival_at`, `started_at`
    - `arrived_at`, `cancelled_at`은 앱에서 insert하지 않음
    - 선택한 알림 받을 사람은 `trip_recipients`에 `trip_id`, `recipient_id`, `relationship_id`, `added_by`, `notification_enabled = true`로 insert
    - `notification_events`는 이번 단계에서 생성하지 않음
35. `/home/active`가 생성된 `tripId` route param을 받아 trip 정보를 표시할 준비를 했다.
    - 생성 성공 시 `/home/active?tripId=...`로 이동
    - active 화면은 아직 실시간 데이터 완성 전 단계로, trip id와 예상 도착 시간을 표시
36. 귀가 세션 생성 테스트 중 active 화면이 실제 trip 없이도 mock처럼 보일 수 있는 문제를 수정했다.
    - `trips` insert 성공 전에는 `/home/active`로 이동하지 않는 흐름을 재확인
    - trips insert 실패 로그를 `console.error("create trip failed", error)`로 정리
    - trip_recipients insert 실패 로그를 `console.error("create trip recipients failed", error)`로 정리
    - `/home/active`는 `tripId`가 없으면 “진행 중인 귀가 정보를 찾을 수 없어요” 안내를 표시
    - `/home/active`는 trip 조회 성공 시에만 mock timeline/actions를 표시
37. QR 도착 인증을 Supabase `destinations`, `trips`, `arrival_verifications`에 연결했다.
    - 실제 카메라 스캔은 아직 구현하지 않고 QR token 입력 방식으로 구현
    - `/places/qr-code`는 destination `qr_token` 텍스트와 복사 버튼 제공
    - `/home/active`에서 `/home/qr-arrival?tripId=...`로 이동
    - `/home/qr-arrival`은 trip destination의 `qr_token`과 입력값을 비교
    - QR 성공 시 `arrival_verifications`에 `method = qr_code`, `status = succeeded`, `verified_at` insert
    - QR 성공 후 `trips.state = arrived_partial`, `trips.arrived_at = now` update
    - 성공 후 `/home/partial-verification?tripId=...`로 이동
    - v1에서는 QR 실패 기록을 남기지 않고 사용자용 오류만 표시
    - `notification_events`는 아직 생성하지 않음
38. `notification_events` DB 기록을 추가했다.
    - 귀가 시작 후 trip recipients 저장 성공 시 `trip_started` 기록
    - QR 인증 성공 후 trip state update 성공 시 `arrived_partial` 기록
    - 실제 push notification은 아직 구현하지 않음
    - payload는 whitelist key인 `destination_name`, `state`, `notification_type`, `trip_id`만 사용
    - 상세 주소, 좌표, 이동 경로는 payload에 넣지 않음
    - notification 기록 실패는 핵심 동작을 막지 않고 `console.error`만 남김
39. `/connections` 대시보드에 내가 recipient로 포함된 진행 중 귀가 상태 표시를 추가했다.
    - `trip_recipients.recipient_id = current user` 기준으로 trip ids 조회
    - `trips.state in (on_the_way, late, arrived_partial, extension_requested, emergency_requested)` 상태만 표시
    - 상대 `profiles.display_name`, 상태, 예상 도착 시간 표시
    - 연결된 사람 화면에서는 `destinations` 직접 조회에 의존하지 않고 장소는 일반 문구로 표시
40. `/home/active`가 route param이 없을 때 현재 사용자의 최신 `on_the_way`/`late` trip을 fallback 조회하도록 개선했다.
41. `/home/help-request` 도움 요청 기능을 Supabase 실제 DB에 연결했다.
    - `tripId` route param 우선, 없으면 현재 사용자의 active trip fallback 조회
    - active trip fallback 상태는 `on_the_way`, `late`, `extension_requested`, `emergency_requested`
    - 도움 요청 시 `help_requests`에 `trip_id`, `requested_by`, `status = requested` insert
    - insert 성공 후 `trips.state = emergency_requested` update
    - trip recipients에게 `notification_events.type = help_requested`, `delivery_status = recorded` 기록
    - payload는 `notification_type`, `state`, `previous_state`, `trip_id`, `message`만 사용
    - 상세 주소, 좌표, 이동 경로는 저장하지 않음
    - `/home/active` 도움 요청 버튼은 `tripId`를 유지해 `/home/help-request?tripId=...`로 이동
    - `/connections`에서 `emergency_requested` 상태를 “도움 요청”, “확인이 필요해요” 문구로 강조
    - 연결된 사람이 도움 요청을 확인 처리하는 기능은 다음 단계 TODO로 남김
42. v1 active trip 1개 정책과 귀가 취소 기능을 앱 코드에 반영했다.
    - active 상태 기준은 `on_the_way`, `late`, `extension_requested`, `emergency_requested`
    - `arrived_partial`, `cancelled`는 active 조회에서 제외
    - `/home`은 현재 사용자의 최신 active trip이 있으면 `내 귀가 상황 보기` 카드를 표시
    - `/home/return-setup` 진입 및 귀가 시작 직전에 기존 active trip을 확인하고, 있으면 새 `trips` row를 만들지 않고 `/home/active?tripId=...`로 이동
    - `createTripSession` helper도 active trip을 방어적으로 확인해 중복 insert를 막음
    - `/home/active`에 `귀가 취소` 버튼을 추가하고 `trips.state = cancelled`, `cancelled_at = now`로 update
    - `/connections`는 recipient 기준 active trip 중 owner별 최신 1개만 표시하고, `emergency_requested`는 우선 표시
43. `/history` 귀가 기록 화면을 Supabase 실제 DB 조회에 연결했다.
    - 현재 로그인 사용자의 `trips.owner_id = current user` 기록만 최신순으로 조회
    - `destinations`는 owner가 읽을 수 있는 `id`, `name`만 조회해 장소 이름 표시
    - `arrival_verifications`, `help_requests`, `time_extension_requests`는 trip id 기준으로 batch 조회해 각 기록 카드에 표시
    - 상태 라벨은 `arrived_partial = QR 인증 완료`, `arrived_verified = 도착 인증 완료`, `cancelled = 취소됨`, `emergency_requested = 도움 요청`, `extension_requested = 시간 연장 요청`, `on_the_way/late = 진행 중`으로 표시
    - active 상태 기록은 `/home/active?tripId=...`로 이동 가능하게 처리
    - 상세 주소, 좌표, 이동 경로는 조회하거나 표시하지 않음
    - 기록 상세 화면은 아직 추가하지 않고 목록 카드 중심으로 구현
44. `/history` cancelled 상태 표시 버그를 수정했다.
    - 원인: 화면이 mount 시점 조회만 수행해 stale local state가 남을 수 있었고, 오른쪽 뱃지가 QR/도움/연장 플래그를 우선해 `cancelled`를 덮어쓸 수 있었음
    - `useFocusEffect`로 `/history` focus 시마다 Supabase에서 다시 조회
    - 상태 우선순위를 `cancelled 또는 cancelled_at 있음`, `arrived_partial`, `arrived_verified`, `emergency_requested`, `extension_requested`, `late`, `on_the_way` 순서로 정리
    - `cancelled` 또는 `cancelled_at`이 있으면 제목과 오른쪽 뱃지를 모두 `취소됨`으로 통일
    - active 판정은 `on_the_way`, `late`, `extension_requested`, `emergency_requested`만 사용
    - 개발 확인용으로 trip id prefix, state, cancelled_at만 `console.log("history trips", ...)`에 기록

## Current Issue

Supabase v1 schema migration, 기본 Auth 연결, 최소 route guard, 도착 장소 DB 연결, 연결 초대 DB 연결은 완료했다.

- 옛 project ref: `ampgpgsciwkfkjpumtrb`
- 이 프로젝트는 적용 대상이 아니다.
- 새 project ref: `zknuyyknmxgrjuipdysf`
- 새 project name: `watseo-app`
- 이후 추가 migration은 사용자 승인 전까지 적용 금지.

## Next Step

다음 단계는 세부 route guard 정책과 남은 실제 데이터 흐름 연결이다.

진행 전 확인할 작업은 다음과 같다.

1. 로그인된 사용자의 `/login`, `/role`, `/permissions` 재진입 처리 기준 설계
2. 온보딩 미완료 사용자의 탭 접근 처리 기준 설계
3. trips 실제 DB 연결 전 mock data 경계 정리

## Onboarding State Route Plan

- 회원가입 성공 시 `/role`로 이동한다.
- `/role`에서 선택 후 `/permissions`로 이동한다.
- `/permissions` 완료 시 `profiles.permissions_seen`, `profiles.permissions_seen_at`, `profiles.onboarding_completed`, `profiles.onboarding_completed_at`을 update하고 `/home`으로 이동한다.
- 로그인 성공 시에는 `profiles.onboarding_completed`를 조회한다.
  - `true`: `/home`
  - `false`: `/role`
- `(tabs)` 내부 화면은 로그인된 사용자만 접근 가능하다.
- 전체 세부 route guard 정책은 별도 단계에서 설계한다.

## Auth Manual Test Checklist

- `/login`은 로그인 전 접근 가능해야 한다.
- 이메일/비밀번호 회원가입 성공 시 `/role`로 이동해야 한다.
- 이메일/비밀번호 로그인 성공 시 `/home`으로 이동해야 한다.
- `/role`에서 선택 후 `/permissions`로 이동해야 한다.
- `/permissions`에서 완료 후 `/home`으로 이동해야 한다.
- `/home`에서 로그아웃 성공 시 `/login`으로 이동해야 한다.
- 로그인하지 않은 상태에서 `/home`, `/places`, `/connections`, `/history` 접근 시 `/login`으로 이동해야 한다.
- session loading 중에는 `/login`으로 튕기지 않고 로딩 화면이 보여야 한다.
- Auth 에러는 Supabase 원문 대신 사용자에게 자연스러운 문구로 보여야 한다.
- 회원가입 후 `profiles` row는 DB trigger `handle_new_user_profile`이 생성한다.
- 앱 코드에서 `profiles` row를 직접 insert하지 않는다.
- 전체 route guard는 아직 과하게 구현하지 않고 다음 단계에서 설계한다.
