# MVP QA Checklist

## Account A

- [ ] 회원가입 후 `/role`로 이동한다.
- [ ] 온보딩 완료 후 `/home`으로 이동한다.
- [ ] `/home`에서 현재 이메일과 닉네임을 확인한다.
- [ ] 닉네임을 수정하면 `profiles.display_name`이 update된다.
- [ ] `/places`에서 도착 장소를 등록한다.
- [ ] `/connections/connect`에서 초대 코드를 생성하고 복사한다.

## Account B

- [ ] 회원가입 후 닉네임을 설정한다.
- [ ] `/connections/invite`에서 A의 초대 코드를 입력한다.
- [ ] `/connections`에서 A가 연결된 사람으로 보인다.
- [ ] `/connections` 상단에서 현재 테스트 계정 이메일을 확인할 수 있다.

## Return Session

- [ ] A가 `/home/return-setup`에 진입한다.
- [ ] active trip이 이미 있으면 새 귀가를 만들지 않고 기존 귀가로 이동한다.
- [ ] 도착 장소가 없으면 `/places` 이동 안내가 보인다.
- [ ] 연결된 사람이 없으면 `/connections` 이동 안내가 보인다.
- [ ] 도착 장소, 알림 받을 사람 1명 이상, 예상 도착 시간을 모두 선택해야 시작 버튼이 활성화된다.
- [ ] 귀가 시작 후 `trips`, `trip_recipients` 테이블에 기록된다.
- [ ] 성공 후 `/home/active?tripId=...`로 이동한다.
- [ ] `/home/active`에 tripId가 없으면 최신 active trip을 fallback 조회한다.
- [ ] active trip이 없으면 안내 문구가 보인다.

## Connected Dashboard

- [ ] B의 `/connections`에서 A의 active 상태가 보인다.
- [ ] 같은 사람이 active trip을 여러 개 가져도 최신 1개만 보인다.
- [ ] `emergency_requested`는 강하게 표시된다.
- [ ] 상세 위치, 좌표, 이동 경로는 표시되지 않는다.

## Time Extension

- [ ] A가 `/home/active`에서 시간 연장 요청으로 이동한다.
- [ ] 연장 요청 생성 시 `time_extension_requests.status = pending`으로 기록된다.
- [ ] 요청 생성 시 `trips.state = extension_requested`가 된다.
- [ ] 수락 전에는 `trips.expected_arrival_at`이 기존 값으로 유지된다.
- [ ] B의 `/connections` 확인 중인 귀가 카드에 `연장 수락`, `거절` 버튼이 보인다.
- [ ] 수락 시 `respond_time_extension_request` RPC가 `accepted`로 호출된다.
- [ ] 거절 시 `respond_time_extension_request` RPC가 `declined`로 호출된다.
- [ ] 응답 후 B의 목록이 갱신되고 버튼이 사라진다.
- [ ] A의 `/home/active` 재진입 시 상태와 예상 시간이 갱신된다.

## Help Request

- [ ] A가 `/home/active`에서 도움 요청으로 이동한다.
- [ ] 도움 요청 시 `help_requests.status = requested`로 기록된다.
- [ ] `trips.state = emergency_requested`로 update된다.
- [ ] B의 `/connections`에서 도움 요청 상태가 보인다.
- [ ] 상세 위치, 좌표, 이동 경로는 표시되지 않는다.

## QR Arrival

- [ ] `/places`에서 특정 장소의 `QR 보기`를 누르면 `/places/qr-code?destinationId=...`로 이동한다.
- [ ] `/places/qr-code`에서 장소 이름, 실제 QR 이미지, QR 코드 값, 복사 버튼이 보인다.
- [ ] `/home/active`에서 QR 도착 인증으로 이동하면 tripId가 유지된다.
- [ ] 카메라 권한 요청이 보이고, 허용 시 QR 스캔 영역이 보인다.
- [ ] 카메라 권한을 거부해도 수동 입력이 가능하다.
- [ ] QR 스캔 성공 시 기존 도착 확인 흐름과 동일하게 처리된다.
- [ ] QR 스캔 실패 후 `다시 스캔하기`로 재시도할 수 있다.
- [ ] 올바른 QR 코드 값 입력 시 `arrival_verifications.status = succeeded`로 기록된다.
- [ ] 성공 후 `trips.state = arrived_partial`, `arrived_at = now`로 update된다.
- [ ] 성공 후 `/home/partial-verification?tripId=...`로 이동한다.
- [ ] 잘못된 QR 코드 값은 사용자용 오류만 표시하고 코드 전체를 로그에 남기지 않는다.
- [ ] 시뮬레이터에서 카메라가 제한되면 수동 입력으로 흐름을 검증한다.

## Cancel And History

- [ ] A가 `/home/active`에서 귀가 취소를 누르면 `trips.state = cancelled`, `cancelled_at = now`가 된다.
- [ ] `/history`는 화면 focus 시마다 DB를 다시 조회한다.
- [ ] `cancelled` 또는 `cancelled_at`이 있으면 제목과 뱃지가 모두 `취소됨`이다.
- [ ] `cancelled`가 도움 요청/시간 연장 표시보다 우선한다.
- [ ] 진행 중 기록 클릭 시 `/home/active?tripId=...`로 이동한다.

## Routing

- [ ] 로그인하지 않은 상태에서 탭 화면 접근 시 `/login`으로 이동한다.
- [ ] 로그인 후 `onboarding_completed = false`이면 탭 접근 시 `/role`로 이동한다.
- [ ] 로그인 후 `onboarding_completed = true`이면 `/home` 접근이 가능하다.
- [ ] session loading 중에는 즉시 `/login`으로 튕기지 않고 로딩 화면이 보인다.

## Privacy And Copy

- [ ] 앱 화면에 `보호자`, `감시`, `추적`, `위험` 표현이 없다.
- [ ] notification payload에는 상세 주소, 좌표, 이동 경로가 없다.
- [ ] 연결된 사람 화면은 destination 상세 정보를 직접 조회하지 않는다.
- [ ] “상세 위치는 계속 공유되지 않고, 도착 인증 상태와 필요한 알림만 전달돼요.” 문구가 유지된다.
