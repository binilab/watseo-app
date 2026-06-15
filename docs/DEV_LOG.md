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

## Current Issue

Supabase v1 schema migration과 기본 Auth 연결은 완료했다.

- 옛 project ref: `ampgpgsciwkfkjpumtrb`
- 이 프로젝트는 적용 대상이 아니다.
- 새 project ref: `zknuyyknmxgrjuipdysf`
- 새 project name: `watseo-app`
- 이후 추가 migration은 사용자 승인 전까지 적용 금지.

## Next Step

다음 단계는 Auth route guard와 실제 데이터 흐름 연결이다.

진행 전 확인할 작업은 다음과 같다.

1. 로그인 상태에 따른 route guard 설계
2. 온보딩 완료 상태 저장 방식 설계
3. invite token 생성/해시 저장 흐름 설계
4. relationships/trips 실제 DB 연결 전 mock data 경계 정리

## Auth Manual Test Checklist

- `/login`은 로그인 전 접근 가능해야 한다.
- 이메일/비밀번호 회원가입 성공 시 `/role`로 이동해야 한다.
- 이메일/비밀번호 로그인 성공 시 `/home`으로 이동해야 한다.
- `/role`에서 선택 후 `/permissions`로 이동해야 한다.
- `/permissions`에서 완료 후 `/home`으로 이동해야 한다.
- `/home`에서 로그아웃 성공 시 `/login`으로 이동해야 한다.
- Auth 에러는 Supabase 원문 대신 사용자에게 자연스러운 문구로 보여야 한다.
- 회원가입 후 `profiles` row는 DB trigger `handle_new_user_profile`이 생성한다.
- 앱 코드에서 `profiles` row를 직접 insert하지 않는다.
- 전체 route guard는 아직 과하게 구현하지 않고 다음 단계에서 설계한다.
