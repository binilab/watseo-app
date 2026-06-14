import {
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Home,
  MapPin,
  MessageCircle,
  Navigation,
  QrCode,
  ShieldCheck,
  UserRound,
} from "lucide-react-native";

export const connectedPeople = [
  { name: "지민", role: "확인 상대", status: "알림 받을 준비 완료" },
  { name: "민수", role: "연결된 사람", status: "오늘 20:40 확인" },
  { name: "서연", role: "알림 받을 사람", status: "초대 수락 대기" },
];

export const arrivalPlaces = [
  { title: "집", address: "서울시 마포구 와우산로 12", tag: "기본 도착지" },
  { title: "작업실", address: "서울시 성동구 왕십리로 20", tag: "QR 인증" },
  { title: "친구 집", address: "서울시 용산구 한강대로 8", tag: "최근 사용" },
];

export const returnHistory = [
  { title: "집 도착", time: "오늘 22:18", detail: "QR 인증 + 확인 상대 알림 완료" },
  { title: "작업실 도착", time: "어제 21:04", detail: "도착 버튼으로 완료" },
  { title: "집 도착", time: "6월 12일 23:11", detail: "시간 연장 후 완료" },
];

export const permissionItems = [
  { icon: MapPin, title: "위치 접근", detail: "귀가 중 상태를 화면에 표시하기 위한 준비 항목" },
  { icon: Bell, title: "알림", detail: "도착 확인과 연장 요청을 알려주기 위한 준비 항목" },
  { icon: QrCode, title: "카메라", detail: "나중에 QR 도착 인증을 연결할 때 사용" },
];

export const homeMetrics = [
  { label: "예상 도착", value: "22:30" },
  { label: "확인 상대", value: "2명" },
  { label: "도착지", value: "집" },
];

export const quickActions = [
  { icon: Navigation, title: "귀가 시작", detail: "도착지와 확인 상대를 선택합니다." },
  { icon: QrCode, title: "QR 인증", detail: "등록된 장소에서 도착을 확인합니다." },
  { icon: MessageCircle, title: "도움 요청", detail: "연결된 사람에게 상황을 공유합니다." },
];

export const dashboardCards = [
  { icon: ShieldCheck, title: "연결 상태", detail: "2명이 알림을 받을 수 있어요." },
  { icon: HeartHandshake, title: "초대", detail: "새 확인 상대를 초대할 수 있어요." },
  { icon: CalendarClock, title: "기록", detail: "최근 귀가 완료 내역을 확인해요." },
];

export const roleOptions = [
  { icon: UserRound, title: "도착을 공유할래요", detail: "내 귀가 상태를 연결된 사람에게 알려요." },
  { icon: Home, title: "알림을 받을래요", detail: "소중한 사람의 도착 확인을 받아요." },
];

export const activeTimeline = [
  { icon: CheckCircle2, title: "귀가 시작", detail: "22:02에 집으로 출발" },
  { icon: Clock3, title: "이동 중", detail: "예상 도착까지 약 18분" },
  { icon: Bell, title: "도착 확인 예정", detail: "22:30에 확인 알림 준비" },
];
