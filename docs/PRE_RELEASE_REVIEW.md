# 배포 전 전체 점검 (Pre-Release Review)

> 작성일: 2026-06-21
> 목적: 출시 직전 단계에서 "무엇이 더 필요한가"를 코드 기준으로 점검한 결과 정리. 나중에 이 문서를 기준으로 작업 진행.

## 현재 상태 요약

탄탄하게 구현된 MVP. 핵심 흐름이 모두 실제 Supabase 연동으로 동작.

- 핵심 흐름: 온보딩 → 연결 → 장소/QR → 귀가 → 도착확인 → 기록 (전부 실데이터 연동)
- `npm run typecheck` 통과
- friendly error 처리(`showFriendlyAlert` / `logFriendlyError`)
- RLS 기반 프라이버시 설계
- mock 데이터는 온보딩 정적 문구(`roleOptions` / `permissionItems`)만 남음, 실데이터는 전부 연결됨

→ "기능을 새로 많이 짜야 한다"기보다 **배포를 막는 구멍 + 스토어 심사 필수 항목 + 마무리**가 핵심.

---

## 🚨 배포 차단급 (없으면 출시/심사 불가)

| 항목 | 상태 | 비고 |
|---|---|---|
| **푸시 알림** | ❌ 없음 | 앱 본질이 "연결된 사람에게 알린다"인데 `notification_events`는 DB 기록만 하고 실제 발송 안 함. 지금은 상대가 앱을 직접 켜서 새로고침해야 상태를 봄. **가장 큰 구멍** |
| **계정 삭제(회원탈퇴)** | ❌ 없음 | Apple App Store **필수 요구사항**(없으면 리젝). Google도 사실상 필수 |
| **eas.json** | ❌ 없음 | EAS 빌드 자체가 안 됨. `eas build:configure` 필요 |
| **개인정보처리방침/이용약관 URL** | ❓ 확인 필요 | 두 스토어 모두 등록 시 필수 |
| **iOS Pods 정리** | ⚠️ | `ExpoNotifications` Pod 잔재 → `expo prebuild --clean` 필요 (릴리스 체크리스트에도 명시됨) |

## ⚠️ 흐름상 미완성 (코드에서 발견)

- **도착 인증이 "부분(arrived_partial)"에서 끝남.**
  `arrived_verified`(완전 확인) 상태와 `app/(tabs)/home/arrived.tsx` 화면이 만들어져 있는데
  **어디서도 이 화면으로 라우팅하지 않음.** QR 스캔 → `partial-verification`까지만 가고 끝.
  → 의도된 2단계 인증인지, 미완성인지 결정 필요. (현재 `arrived.tsx`는 죽은 코드)
- **실시간 갱신 없음.**
  연결된 사람 대시보드가 화면 focus 시 재조회에만 의존. 푸시가 없으니 상대 상태 변화를 늦게 봄.
  → Supabase Realtime 도입 후보.

## 💡 추가하면 좋은 기능 (우선순위순)

1. **비밀번호 재설정** — 없음. 이메일 로그인인데 비번 분실 대응이 없으면 사용자 이탈.
2. **예상 시간 초과 자동 처리(`late` 상태)** — enum엔 `late`가 있는데 실제로 시간이 지나도 자동 전환 안 됨. 푸시와 묶어서 "도착 예정 시간 지남" 알림이 이 앱의 핵심 가치.
3. **로딩/빈 상태/네트워크 끊김 폴리시** — `EmptyState` 컴포넌트는 있으나 오프라인 처리 점검.
4. 연결 끊기/차단, 알림 수신 동의 토글, 다크모드(`userInterfaceStyle: light` 고정).

---

## 확정 진행 순서 (2026-06-21 결정)

**① 푸시 알림 → ② 카카오/구글 소셜 가입 → ③ 스토어 심사 필수 항목 → ④ 도착 2단계 인증 흐름**

### 🎯 핵심 결정 (2026-06-21)
- **Android 우선 출시.** iOS는 나중. → Apple Developer 계정 / APNs / Sign in with Apple / App Store Connect **전부 지금 불필요**.
- **소셜 로그인만 유지.** 기존 이메일/비밀번호 로그인 UI 제거. → **비밀번호 재설정 작업 불필요**.
- iOS 재개 시 다시 봐야 할 것: APNs 푸시 키, Sign in with Apple 병행, App Store Connect 등록.

### Phase 1. 푸시 알림
- `expo-notifications` 재도입 (dev build 재빌드 필요)
- `device_push_tokens` 마이그레이션 적용 + 토큰 등록/해제
- Edge Function: `notification_events` → Expo Push 발송
- 시간 연장 수락/거절, 도움 요청, 도착 확인, 예상시간 초과(`late`) 알림 연결
- 발판: `notification_events` 테이블 + 설계 메모가 git 히스토리에 존재 (릴리스 체크리스트 12번)

### Phase 2. 카카오 / 구글 소셜 가입
- Supabase Auth providers (Google, Kakao 둘 다 Supabase 기본 지원)
- 앱 OAuth 흐름(딥링크/redirect) 연결
- **기존 이메일/비밀번호 로그인 UI 제거** (소셜만 유지)
- (iOS는 추후 — 그때 Sign in with Apple 병행 추가 필요)

### Phase 3. 스토어 심사 필수 항목 (Android / Play Console)
- 계정 삭제(회원탈퇴) — 코드
- ~~비밀번호 재설정~~ — 소셜만이라 불필요
- `eas.json` 생성 + `eas init` projectId 연결
- iOS Pods 정리는 iOS 재개 시로 미룸 (`expo prebuild --clean`)
- 개인정보처리방침 / 이용약관 URL
- Play Console 데이터 보안(Data safety) 신고, 스크린샷/설명/연령등급

### Phase 4. 도착 2단계 인증 흐름
- 지금 죽어있는 `app/(tabs)/home/arrived.tsx`(`arrived_verified`) 결정
- `arrived_partial` → `arrived_verified` 전환 트리거 설계

---

## 참고: 관련 기존 문서
- `docs/RELEASE_CHECKLIST.md` — 환경/마이그레이션/빌드 체크리스트 (푸시 TODO 포함)
- `docs/QA_CHECKLIST.md` — 흐름별 수동 QA 항목
