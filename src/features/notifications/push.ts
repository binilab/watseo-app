import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import { logFriendlyError } from "@/src/lib/friendlyAlert";

export type PushRegistrationResult =
  | { status: "granted"; token: string }
  | {
      status: "denied" | "unsupported" | "no_project_id" | "error";
      token: null;
    };

const ANDROID_CHANNEL_ID = "default";

/**
 * Android 기준으로 알림 권한을 요청하고 Expo Push Token을 발급한다.
 * iOS/APNs는 이번 단계 범위에서 제외한다.
 * 실제 발송은 하지 않고, 토큰 발급 "준비"까지만 담당한다.
 */
export async function registerForPushNotificationsAsync(): Promise<PushRegistrationResult> {
  // 에뮬레이터/시뮬레이터에서는 푸시 토큰을 발급할 수 없다.
  if (!Device.isDevice) {
    return { status: "unsupported", token: null };
  }

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: "기본 알림",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let finalStatus = existing.status;

    if (finalStatus !== "granted") {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }

    if (finalStatus !== "granted") {
      return { status: "denied", token: null };
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      return { status: "no_project_id", token: null };
    }

    const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });

    return { status: "granted", token: tokenResult.data };
  } catch (error) {
    logFriendlyError("알림 준비 확인", error);
    return { status: "error", token: null };
  }
}

export function describePushRegistration(
  status: PushRegistrationResult["status"],
): string {
  switch (status) {
    case "granted":
      return "알림 받을 준비가 됐어요.";
    case "denied":
      return "알림 권한이 꺼져 있어요. 설정에서 허용할 수 있어요.";
    case "unsupported":
      return "실제 기기에서 알림 준비를 진행할 수 있어요.";
    case "no_project_id":
      return "앱 설정을 확인한 뒤 다시 시도해 주세요.";
    default:
      return "알림 준비 중 문제가 생겼어요. 잠시 뒤 다시 해주세요.";
  }
}
