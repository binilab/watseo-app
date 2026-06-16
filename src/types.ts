import type { ComponentType } from "react";

export type AppRoute =
  | "/"
  | "/login"
  | "/role"
  | "/permissions"
  | "/home"
  | "/home/return-setup"
  | "/home/active"
  | "/home/qr-arrival"
  | "/home/partial-verification"
  | "/home/arrived"
  | "/home/time-extension"
  | "/home/help-request"
  | "/places"
  | "/places/qr-code"
  | "/connections"
  | "/connections/connect"
  | "/connections/invite"
  | "/history";

export type AppState =
  | "not_started"
  | "on_the_way"
  | "arrived_verified"
  | "arrived_partial"
  | "late"
  | "extension_requested"
  | "emergency_requested"
  | "cancelled";

export type VerificationMethod = "none" | "qr" | "location" | "qr_location" | "manual";

export type StatusTone = "active" | "pending" | "neutral" | "danger";

export type StatusDisplay = {
  label: string;
  tone: StatusTone;
};

export type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

export type Person = {
  id: string;
  name: string;
  role: "연결된 사람" | "확인 상대" | "알림 받을 사람";
  status: string;
  receivesAlerts: boolean;
};

export type Place = {
  id: string;
  title: string;
  address: string;
  tag: string;
  isDefault?: boolean;
};

export type Trip = {
  id: string;
  title: string;
  placeId: Place["id"];
  state: AppState;
  verificationMethod: VerificationMethod;
  time: string;
  detail: string;
  expectedArrival?: string;
};

export type QuickAction = {
  icon: IconComponent;
  title: string;
  detail: string;
  route?: AppRoute;
};

export const STATUS_DISPLAY_BY_STATE: Record<AppState, StatusDisplay> = {
  not_started: { label: "귀가 전", tone: "neutral" },
  on_the_way: { label: "귀가 중", tone: "active" },
  arrived_verified: { label: "도착 인증 완료", tone: "active" },
  arrived_partial: { label: "QR 인증 완료", tone: "pending" },
  late: { label: "확인 필요", tone: "pending" },
  extension_requested: { label: "시간 연장 요청", tone: "pending" },
  emergency_requested: { label: "도움 요청", tone: "danger" },
  cancelled: { label: "취소됨", tone: "neutral" },
};

export function getStatusDisplay(state: AppState): StatusDisplay {
  return STATUS_DISPLAY_BY_STATE[state];
}
