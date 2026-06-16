import { Alert } from "react-native";

type FriendlyAlertAction = {
  onPress?: () => void;
  style?: "cancel" | "default" | "destructive";
  text: string;
};

type FriendlyAlertOptions = {
  actions?: FriendlyAlertAction[];
  message: string;
  title?: string;
};

export function showFriendlyAlert({
  actions,
  message,
  title = "확인해 주세요",
}: FriendlyAlertOptions) {
  Alert.alert(
    title,
    message,
    actions?.map((action) => ({
      onPress: action.onPress,
      style: action.style,
      text: action.text,
    })) ?? [{ text: "확인" }],
  );
}

export function logFriendlyError(
  feature: string,
  error: unknown,
  context?: Record<string, unknown>,
) {
  const summary =
    error instanceof Error
      ? { name: error.name }
      : { type: typeof error };

  console.warn(feature, {
    context,
    summary,
  });
}
