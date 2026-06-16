import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Clock3, Send } from "lucide-react-native";

import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import {
  fetchLatestActiveTrip,
  fetchTripById,
  requestTimeExtension,
  type Trip,
} from "@/src/features/trips/api";
import { logFriendlyError } from "@/src/lib/friendlyAlert";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";
import { getStatusDisplay } from "@/src/types";

const EXTENSION_OPTIONS = [10, 20, 30];

function formatTime(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TimeExtensionScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { loading: authLoading, user } = useAuthSession();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(10);
  const [message, setMessage] = useState<string | null>(null);
  const status = getStatusDisplay("extension_requested");
  const requestedExpectedArrivalAt = useMemo(() => {
    if (!trip) return null;

    return new Date(
      new Date(trip.expected_arrival_at).getTime() + selectedMinutes * 60 * 1000,
    );
  }, [selectedMinutes, trip]);

  useEffect(() => {
    let mounted = true;

    async function loadTrip() {
      if (authLoading) return;

      if (!user) {
        setTrip(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setMessage(null);

      try {
        const { data, error } = tripId
          ? await fetchTripById(tripId)
          : await fetchLatestActiveTrip(user.id);

        if (!mounted) return;

        if (error || !data) {
          setTrip(null);
          setMessage("진행 중인 귀가가 없어요.");
        } else {
          setTrip(data);
        }
      } catch (error) {
        if (!mounted) return;
        logFriendlyError("시간 연장 귀가 확인", error);
        setTrip(null);
        setMessage("진행 중인 귀가가 없어요.");
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
  }, [authLoading, tripId, user]);

  async function handleSubmit() {
    if (!user || !trip || !requestedExpectedArrivalAt) {
      setMessage("진행 중인 귀가가 없어요.");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const { data, error, notificationError } = await requestTimeExtension({
      requestedBy: user.id,
      requestedExpectedArrivalAt: requestedExpectedArrivalAt.toISOString(),
      trip,
    });

    setSubmitting(false);

    if (error || !data) {
      setMessage("도착 시간 변경을 보내지 못했어요. 잠시 뒤 다시 시도해 주세요.");
      return;
    }

    router.replace({
      pathname: "/home/active",
      params: {
        notificationStatus: notificationError ? "failed" : "saved",
        tripId: data.trip.id,
      },
    });
  }

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <AppButton
            disabled={!trip || submitting}
            icon={Send}
            loading={submitting}
            onPress={handleSubmit}
            title="늦어진다고 알리기"
          />
          <AppButton
            onPress={() => router.back()}
            size="md"
            title="돌아가기"
            variant="ghost"
          />
        </View>
      }
    >
      <StatusChip label={status.label} tone={status.tone} />
      <Text style={styles.title}>도착 시간이 조금 늦어져요</Text>
      <Text style={styles.copy}>
        상대가 괜찮다고 하면 도착 시간이 바뀌어요.
      </Text>

      {loading ? (
        <Card>
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.copy}>잠깐만요, 확인하고 있어요.</Text>
          </View>
        </Card>
      ) : null}

      {!loading && !trip ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>진행 중인 귀가가 없어요</Text>
          <Text style={styles.copy}>귀가를 시작한 뒤에 알릴 수 있어요.</Text>
          <AppButton
            icon={Clock3}
            onPress={() => router.replace("/home")}
            size="md"
            title="홈으로"
            variant="secondary"
          />
        </Card>
      ) : null}

      {trip ? (
        <Card tone="warm">
          <Clock3 color={colors.amber} size={34} strokeWidth={2.4} />
          <Text style={styles.cardTitle}>새 도착 시간</Text>
          <Text style={styles.time}>{formatTime(requestedExpectedArrivalAt?.toISOString())}</Text>
          <Text style={styles.copy}>지금 도착 예정 {formatTime(trip.expected_arrival_at)}</Text>
          <View style={styles.optionRow}>
            {EXTENSION_OPTIONS.map((minutes) => (
              <Pressable
                accessibilityRole="button"
                key={minutes}
                onPress={() => {
                  setSelectedMinutes(minutes);
                  setMessage(null);
                }}
                style={({ pressed }) => [
                  styles.timeOption,
                  selectedMinutes === minutes ? styles.timeOptionSelected : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    selectedMinutes === minutes ? styles.timeOptionTextSelected : null,
                  ]}
                >
                  {minutes}분
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>
      ) : null}

      <Card>
        <Text style={styles.cardTitle}>이렇게 전달돼요</Text>
        <Text style={styles.copy}>
          늦어진다는 소식과 알림만 전달돼요. 상세 위치는 공유되지 않아요.
        </Text>
      </Card>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
  },
  loadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  time: {
    ...typography.title,
    color: colors.amber,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeOption: {
    minHeight: 42,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  timeOptionSelected: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  timeOptionText: {
    ...typography.label,
    color: colors.textMuted,
  },
  timeOptionTextSelected: {
    color: colors.amber,
  },
  pressed: {
    opacity: 0.68,
  },
  message: {
    ...typography.caption,
    color: colors.danger,
    textAlign: "center",
  },
});
