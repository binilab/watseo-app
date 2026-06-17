import { Bell, Home, MapPin, QrCode, UserRound } from "lucide-react-native";
import type { AppRoute, QuickAction } from "@/src/types";

export const permissionItems = [
  { icon: MapPin, title: "위치 접근", detail: "귀가 중 상태를 화면에 표시하기 위한 준비 항목" },
  { icon: Bell, title: "알림", detail: "도착 확인과 연장 요청을 알려주기 위한 준비 항목" },
  { icon: QrCode, title: "카메라", detail: "나중에 QR 도착 인증을 연결할 때 사용" },
];

type RoleOption = QuickAction & {
  nextRoute: AppRoute;
};

export const roleOptions: RoleOption[] = [
  { icon: UserRound, title: "도착을 공유할래요", detail: "내 귀가 상태를 연결된 사람에게 알려요.", nextRoute: "/permissions" },
  { icon: Home, title: "알림을 받을래요", detail: "소중한 사람의 도착 확인을 받아요.", nextRoute: "/permissions" },
];
