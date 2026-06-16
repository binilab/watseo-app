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
        setMessage("도착한 귀가를 찾을 수 없어요.");
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await fetchTripById(tripId);

        if (!mounted) return;

        if (error || !data) {
          setTrip(null);
          setMessage("정보를 불러오지 못했어요.");
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
          title="홈으로"
        />
      }
    >
      <StatusChip label={status.label} tone={status.tone} />
      <Text style={styles.title}>도착을 확인했어요</Text>

      <Card tone="success">
        <Text style={styles.cardTitle}>확인한 내용</Text>
        {loading ? <ActivityIndicator color={colors.primaryDark} /> : null}
        <Text style={styles.copy}>QR로 도착을 확인했어요.</Text>
        <Text style={styles.copy}>확인 시간 {formatTime(trip?.arrived_at)}</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>알림 안내</Text>
        <Text style={styles.copy}>
          연결된 사람에게 도착 소식을 전할 준비를 하고 있어요.
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
  message: {
    ...typography.caption,
    color: colors.danger,
    textAlign: "center",
  },
});
