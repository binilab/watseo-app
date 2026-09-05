import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { CheckCircle2 } from "lucide-react-native";

import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import { confirmTripArrival } from "@/src/features/arrival/api";
import { logFriendlyError, showFriendlyAlert } from "@/src/lib/friendlyAlert";
import { colors, spacing, typography } from "@/src/theme/tokens";

function getConfirmFailureCopy(reason: string) {
  if (reason === "token_mismatch") {
    return {
      title: "장소가 달라요",
      message: "선택한 도착 장소의 QR 코드가 아니에요. 장소를 다시 확인해 주세요.",
    };
  }

  if (reason === "already_arrived") {
    return { title: "확인해 주세요", message: "이미 도착 확인이 끝났어요." };
  }

  if (reason === "trip_cancelled") {
    return { title: "확인해 주세요", message: "이미 종료된 귀가예요." };
  }

  return {
    title: "확인해 주세요",
    message: "도착 확인을 완료하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
  };
}

export default function PartialVerificationScreen() {
  const { tripId, qrToken, destinationName } = useLocalSearchParams<{
    tripId?: string;
    qrToken?: string;
    destinationName?: string;
  }>();
  const { user } = useAuthSession();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleConfirmArrival() {
    if (!user || !tripId || !qrToken) {
      setMessage("도착 확인 정보를 찾을 수 없어요. 다시 시도해 주세요.");
      return;
    }

    setConfirming(true);
    setMessage(null);

    try {
      const result = await confirmTripArrival({
        tripId,
        userId: user.id,
        qrToken,
      });

      if (!result.ok) {
        const copy = getConfirmFailureCopy(result.reason);
        setMessage(copy.message);
        showFriendlyAlert({ title: copy.title, message: copy.message });
        return;
      }

      router.replace("/home/arrived");
    } catch (error) {
      logFriendlyError("도착 확인 완료", error, { tripId });
      const copy = getConfirmFailureCopy("unknown");
      setMessage(copy.message);
      showFriendlyAlert({ title: copy.title, message: copy.message });
    } finally {
      setConfirming(false);
    }
  }

  return (
    <Screen
      footer={
        <AppButton
          icon={CheckCircle2}
          loading={confirming}
          onPress={handleConfirmArrival}
          title="도착 확인 완료"
        />
      }
    >
      <StatusChip label="QR 확인됨" tone="active" />
      <Text style={styles.title}>장소 QR이 확인됐어요</Text>

      <Card tone="blue">
        <Text style={styles.cardTitle}>마지막 단계예요</Text>
        <Text style={styles.copy}>마지막으로 도착 확인을 완료해 주세요.</Text>
        {destinationName ? (
          <Text style={styles.copy}>도착 장소 · {destinationName}</Text>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>알림 안내</Text>
        <Text style={styles.copy}>
          도착 확인을 완료하면 연결된 사람에게 도착 소식을 전할 준비를 해요.
        </Text>
        <Text style={styles.copy}>상세 위치는 공유되지 않아요.</Text>
      </Card>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.text,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
  },
  message: {
    ...typography.caption,
    color: colors.danger,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
