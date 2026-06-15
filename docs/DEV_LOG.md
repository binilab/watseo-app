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
2. Auth 이후 onboarding 흐름 정리
3. invite token 생성/해시 저장 흐름 설계
4. relationships/trips 실제 DB 연결 전 mock data 경계 정리
