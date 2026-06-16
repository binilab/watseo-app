import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { CheckCircle2 } from "lucide-react-native";

import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import { fetchTripById, type Trip } from "@/src/features/trips/api";
import { colors, spacing, typography } from "@/src/theme/tokens";
import { getStatusDisplay } from "@/src/types";

function formatTime(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PartialVerificationScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(Boolean(tripId));
  const [message, setMessage] = useState<string | null>(null);
  const status = getStatusDisplay("arrived_partial");

  useEffect(() => {
    let mounted = true;

    async function loadTrip() {
      if (!tripId) {
        setTrip(null);
        setLoading(false);
        setMessage("도착 인증된 귀가 정보를 찾을 수 없어요.");
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await fetchTripById(tripId);

        if (!mounted) return;

        if (error || !data) {
          setTrip(null);
          setMessage("도착 인증된 귀가 정보를 불러오지 못했어요.");
        } else {
          setTrip(data);
          setMessage(null);
        }
      } catch {
        if (!mounted) return;
        setTrip(null);
        setMessage("도착 인증된 귀가 정보를 불러오지 못했어요.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadTrip();

    return () => {
      mounted = false;
    };
  }, [tripId]);

  return (
    <Screen
      footer={
        <AppButton
          icon={CheckCircle2}
          onPress={() => router.push("/home")}
          title="홈으로 이동"
        />
      }
    >
      <StatusChip label={status.label} tone={status.tone} />
      <Text style={styles.title}>QR 인증이 완료됐어요</Text>

      <Card tone="warm">
        <Text style={styles.cardTitle}>확인된 내용</Text>
        {loading ? <ActivityIndicator color={colors.primaryDark} /> : null}
        <Text style={styles.copy}>상태: QR 인증 완료 / 위치 확인은 아직 연결 전</Text>
        <Text style={styles.copy}>도착 인증 시간: {formatTime(trip?.arrived_at)}</Text>
        <Text style={styles.copy}>방식: QR 도착 인증</Text>
        {trip ? <Text style={styles.tripId}>trip id: {trip.id}</Text> : null}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>알림 예정</Text>
        <Text style={styles.copy}>
          연결된 사람에게 도착 인증 상태를 전달하는 알림 기록은 다음 단계에서 연결합니다.
        </Text>
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
  tripId: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  message: {
    ...typography.caption,
    color: colors.danger,
    textAlign: "center",
  },
});
