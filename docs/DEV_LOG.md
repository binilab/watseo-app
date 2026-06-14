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

## Current Issue

Supabase migration은 아직 적용하지 않았다.

- 옛 project ref: `ampgpgsciwkfkjpumtrb`
- 이 프로젝트는 적용 대상이 아니다.
- 새 project ref: `zknuyyknmxgrjuipdysf`
- 새 project name: `watseo-app`
- 새 프로젝트는 확인되었지만, 사용자 승인 전까지 migration 적용 금지.

## Next Step

Supabase migration SQL 초안을 검토하고, 사용자가 명시적으로 `적용 승인`이라고 말한 뒤에만 적용한다.

그 전까지는 다음 작업만 진행한다.

1. SQL 초안 로컬 검토
2. 테이블/enum 설계 리뷰
3. UI skeleton 정리
4. mock data와 실제 data 경계 유지
