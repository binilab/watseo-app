# Release Checklist (MVP)

왔어 MVP 배포 전 점검 목록. 푸시 알림은 이번 범위에서 제외(아래 TODO 참고).

## 1. 환경(env) 확인
- [ ] `.env`에 `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` 설정.
- [ ] 키는 저장소에 커밋하지 않음(`.env`는 무시, `.env.example`만 공유).
- [ ] `isSupabaseConfigured`가 true가 되는지 앱 로그인 화면에서 확인.

## 2. Supabase project ref 확인
- [ ] project ref: `<YOUR_SUPABASE_PROJECT_REF>` (Supabase 대시보드에서 확인).
- [ ] 적용된 마이그레이션: `watseo_v1_schema`, `add_onboarding_state_to_profiles`, `fix_accept_invite_digest_schema`.
- [ ] `device_push_tokens` 등 푸시 관련 마이그레이션/코드는 MVP 범위에서 제외됨(실제 푸시 알림은 MVP 이후 TODO).
- [ ] RLS 활성 상태 확인.

## 3. 타입체크
- [ ] `npm run typecheck` 통과.

## 4. iOS development build 테스트
- [ ] `npm install` 로 node_modules를 package.json과 동기화(과거 `expo-notifications` 잔재 제거).
- [ ] **중요:** `ios/`는 `expo-notifications`가 있던 시점에 prebuild되어 `ExpoNotifications` Pod가 남아 있음.
      릴리스 빌드 전 다음 중 하나로 정리:
  - `npx expo prebuild --clean` (CNG로 네이티브 재생성, app.json 설정 반영) 또는
  - `cd ios && pod install` (autolink 갱신).
- [ ] iPhone 실기기에서 핵심 흐름 1회 통과(아래 6번 + 안정화 목록).

## 5. Android 테스트 여부
- [ ] (선택) Android 기기/에뮬레이터에서 핵심 흐름 확인.
- [ ] `android.package = com.binilab.watseo` 확인(app.json).

## 6. QR 카메라 권한 확인
- [ ] `/home/qr-arrival`에서 카메라 권한 요청 → 허용 시 스캔, 거부 시 수동 입력 fallback 동작.
- [ ] iOS `NSCameraUsageDescription` = "도착 장소의 QR 코드를 확인하기 위해 카메라를 사용해요." (Info.plist / app.json `expo-camera` 플러그인 일치).
- [ ] 위치/알림 권한은 요청하지 않음(MVP).

## 7. 개인정보 문구 확인
- [ ] "상세 위치는 공유되지 않아요. 도착 상태와 필요한 알림만 전달돼요." 류 문구 유지.
- [ ] 상세 위치/좌표/이동 경로/실시간 위치 공유를 암시하는 문구 없음.

## 8. 금지 표현 검색
- [ ] `grep -rnE "보호자|감시|추적|위험" app src` 결과 없음.

## 9. 민감정보 검색
- [ ] `grep -rnE "service_role|access_token|SUPABASE_ACCESS_TOKEN|ExpoPushToken|sk_live" app src` 결과 없음.
- [ ] 실제 anon key / URL 하드코딩 없음(코드에서 `process.env`로만 사용).

## 10. EAS Build 준비
- [ ] `eas.json`이 없으면 `eas build:configure`로 생성.
- [ ] `extra.eas.projectId`가 없으면 `eas init`으로 연결(임의 값 하드코딩 금지).
- [ ] `ios.bundleIdentifier` / `android.package` = `com.binilab.watseo` 확인(필요 시 실제 소유 계정에 맞게 변경).
- [ ] 앱 이름 "왔어", slug `watseo-app`, scheme `watseo`, version `1.0.0`, splash/icon 경로 확인.

## 11. TestFlight / 내부 테스트 준비
- [ ] iOS: `eas build -p ios --profile preview/production` → TestFlight 업로드.
- [ ] Android: (선택) `eas build -p android` → 내부 테스트 트랙.
- [ ] 테스터 계정으로 회원가입→귀가→QR 도착→기록 1회 통과.

## 12. 남은 TODO: 실제 푸시 알림
- [ ] `expo-notifications` 재도입(설치 후 dev build 재빌드 필요).
- [ ] `device_push_tokens` 마이그레이션 적용 + 토큰 등록/해제 UI.
- [ ] Edge Function으로 `notification_events` → Expo Push 발송.
- [ ] 시간 연장 수락/거절 알림(현재 RPC 처리라 별도 설계 필요).
- 설계 메모는 git 히스토리(이전 push 작업 커밋) 참고. MVP 범위에서는 제외.

---

## 핵심 흐름 안정화(코드 기준 확인됨)
1. 회원가입/로그인/로그아웃 — `app/(onboarding)/login.tsx`, `useAuthSession`
2. 닉네임 설정/수정 — `/my`, `profiles.display_name`
3. 온보딩 — `/`, `/role`, `/permissions`
4. 마이 탭 — 프로필/안내/계정(알림 메뉴 없음)
5. 장소 등록/수정 — `/places`, `destinations`
6. 장소 QR 이미지 표시 — `/places/qr-code`, `react-native-qrcode-svg`
7. QR 코드 복사 — `expo-clipboard`
8. 연결 초대 생성/수락 — `/connections/connect`, `/connections/invite`, `accept_connection_invite` RPC
9. 귀가 시작 — `/home/return-setup`, `trips`/`trip_recipients`
10. active trip 1개 정책 — `fetchLatestActiveTrip` + 중복 방지
11. 시간 연장 요청 — `/home/time-extension`
12. 시간 연장 수락/거절 — `respond_time_extension_request` RPC
13. 도움 요청 — `/home/help-request`, `help_requests`
14. QR 카메라 스캔 도착 확인 — `/home/qr-arrival`, `expo-camera`
15. 수동 QR 입력 fallback — `/home/qr-arrival`
16. 귀가 취소 — `/home/active`, `cancelTrip`
17. 기록 표시 — `/history`
18. friendly error handling — `showFriendlyAlert` / `logFriendlyError`

> `notification_events`는 내부 기록용으로 유지(귀가 시작/시간 연장/도움 요청/도착 확인 시 row 생성). 실제 푸시 발송은 하지 않음.
