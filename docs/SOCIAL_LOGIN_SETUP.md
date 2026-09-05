# Google / Kakao 소셜 로그인 설정 가이드

> 코드(버튼 + OAuth 흐름)는 준비되어 있습니다. 아래 콘솔 설정을 완료해야 실제로 동작합니다.
> 실제 키/시크릿은 이 문서나 코드에 넣지 마세요. Supabase 대시보드에만 입력합니다.

## 동작 구조 요약

- 앱은 `supabase.auth.signInWithOAuth()` → 외부 브라우저 → redirect → `exchangeCodeForSession()` 흐름을 씁니다.
- 코드 위치: `src/features/auth/socialAuth.ts`, 버튼은 `app/(onboarding)/login.tsx`.
- 앱 redirect (deep link): **`watseo://auth/callback`** (`app.json` 의 `scheme: "watseo"` 와 일치).
- Supabase OAuth callback (외부 provider 에 등록): **`https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`**
  - `<YOUR_SUPABASE_PROJECT_REF>` 는 Supabase 대시보드 → Project Settings 에서 확인.

---

## 1. Google 로그인

### 🙋 사용자가 콘솔에서 직접 해야 하는 것 (Google Cloud Console)

1. **OAuth consent screen(동의 화면)** 구성
   - User type: External
   - 앱 이름, 지원 이메일, 개발자 연락처 입력
   - (게시 상태가 "테스트"면 테스트 사용자에 본인 계정 추가)
2. **Web OAuth Client ID** 생성 (Supabase 가 사용)
   - Application type: Web application
   - Authorized redirect URI 에 Supabase callback 추가:
     `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
   - 발급된 **Client ID / Client Secret** 확보
3. **Android OAuth Client ID** 생성
   - Application type: Android
   - Package name: `com.binilab.watseo`
   - **SHA-1 인증서 지문** 입력 (아래 방법으로 추출)
4. **Supabase 대시보드 → Authentication → Providers → Google**
   - Enable 켜기
   - 위 Web Client ID / Secret 입력
   - 저장

### SHA-1 지문 추출 방법

EAS 빌드(권장, 릴리스 keystore 를 EAS 가 관리):
```bash
eas credentials -p android
# Keystore → SHA-1 fingerprint 확인
```

로컬 디버그 keystore (개발용):
```bash
keytool -list -v \
  -keystore ~/.android/debug.keystore \
  -alias androiddebugkey -storepass android -keypass android
```
> 릴리스용/디버그용 SHA-1 이 다릅니다. Play 앱 서명(Play App Signing)을 쓰면
> Play Console → 앱 서명 페이지의 SHA-1 도 함께 등록해야 합니다.

### 🤖 코드로 이미 되어 있는 것
- 로그인 화면 "Google로 계속하기" 버튼
- `signInWithProvider("google")` OAuth 흐름
- redirect/scheme 설정

---

## 2. Kakao 로그인

### 🙋 사용자가 콘솔에서 직접 해야 하는 것 (Kakao Developers)

1. <https://developers.kakao.com> 에서 **애플리케이션 생성**
2. **앱 키 확인**
   - REST API 키 (Supabase 가 사용)
   - Native App Key (필요 시 참고)
3. **카카오 로그인 활성화**
   - 제품 설정 → 카카오 로그인 → 활성화 ON
   - **Redirect URI** 등록:
     `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
4. **동의항목 설정**
   - 카카오 로그인 → 동의항목에서 필요한 항목(예: 닉네임, 이메일) 설정
   - 이메일은 비즈 앱 전환/검수가 필요할 수 있음 (없으면 닉네임 기준으로만)
5. **보안 → Client Secret** 발급(권장) 후 값 확보
6. **Supabase 대시보드 → Authentication → Providers → Kakao**
   - Enable 켜기
   - REST API 키 / Client Secret 입력
   - 저장

### 🤖 코드로 이미 되어 있는 것
- 로그인 화면 "카카오로 계속하기" 버튼
- `signInWithProvider("kakao")` OAuth 흐름

---

## 3. 공통 체크리스트

- [ ] Supabase → Authentication → URL Configuration → **Redirect URLs** 에 `watseo://auth/callback` 추가
- [ ] Google provider 활성화 + Web Client ID/Secret 입력
- [ ] Google Android Client (package + SHA-1) 등록
- [ ] Kakao provider 활성화 + REST API 키 입력 + Redirect URI 등록
- [ ] dev build 로 실기기에서 각 버튼 동작 확인 (소셜 로그인은 네이티브 빌드 필요, Expo Go 불가)

## 작업 분담 한눈에 보기

| 작업 | 담당 |
|---|---|
| Google Cloud / Kakao Developers 콘솔 설정 | 🙋 사용자 |
| Supabase 대시보드 provider on + 키 입력 | 🙋 사용자 |
| SHA-1 지문 추출 | 🙋 사용자 (명령은 위 참고) |
| 로그인 버튼 / OAuth 코드 / redirect 흐름 | 🤖 코드 (완료) |
| 콘솔 설정 후 실기기 동작 확인 | 🙋 + 🤖 |

---

> 본 문서는 앱 제출 준비용 가이드 초안입니다. 실제 운영 전 각 콘솔의 최신 화면/정책을 확인하세요.
