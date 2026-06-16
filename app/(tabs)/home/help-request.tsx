import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { MessageCircleWarning, Phone, RotateCw } from "lucide-react-native";

import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import {
  fetchLatestActiveTrip,
  fetchTripById,
  requestHelp,
  type Trip,
} from "@/src/features/trips/api";
import { logFriendlyError } from "@/src/lib/friendlyAlert";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";
import { getStatusDisplay } from "@/src/types";

function formatTime(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HelpRequestScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { loading: authLoading, user } = useAuthSession();
  const status = getStatusDisplay("emergency_requested");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
        const tripResult = tripId
          ? await fetchTripById(tripId)
          : await fetchLatestActiveTrip(user.id);

        if (!mounted) return;

        if (tripResult.error || !tripResult.data) {
          setTrip(null);
          setMessage("진행 중인 귀가가 없어요.");
          return;
        }

        if (tripResult.data.owner_id !== user.id) {
          setTrip(null);
          setMessage("내 귀가를 찾을 수 없어요.");
          return;
        }

        setTrip(tripResult.data);
      } catch (error) {
        if (!mounted) return;
        logFriendlyError("도움 요청 귀가 확인", error);
        setTrip(null);
        setMessage("귀가 정보를 불러오지 못했어요.");
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

  async function handleRequestHelp() {
    if (!user || !trip) {
      setMessage("진행 중인 귀가가 없어요.");
      return;
    }

    if (trip.state === "emergency_requested") {
      setMessage("이미 도움 요청을 보냈어요.");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const { data, error, notificationError } = await requestHelp({
        requestedBy: user.id,
        trip,
      });

      if (error || !data) {
        setMessage("도움 요청을 보내지 못했어요. 잠시 뒤 다시 시도해 주세요.");
        return;
      }

      router.replace({
        pathname: "/home/active",
        params: {
          notificationStatus: notificationError ? "failed" : "recorded",
          tripId: data.trip.id,
        },
      });
    } catch (error) {
      logFriendlyError("도움 요청 확인", error, {
        tripId: trip.id,
      });
      setMessage("도움 요청을 보내지 못했어요. 잠시 뒤 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <AppButton
            disabled={!trip || trip.state === "emergency_requested"}
            icon={MessageCircleWarning}
            loading={submitting}
            onPress={handleRequestHelp}
            title={trip?.state === "emergency_requested" ? "이미 알렸어요" : "도움 요청하기"}
            variant="danger"
          />
          <AppButton
            onPress={() => router.back()}
            size="md"
            title="취소"
            variant="ghost"
          />
        </View>
      }
    >
      <StatusChip label={status.label} tone={status.tone} />
      <Text style={styles.title}>연결된 사람에게 지금 상황을 알릴까요?</Text>
      <Text style={styles.copy}>
        상세 위치는 공유되지 않아요. 도착 상태와 알림만 전달돼요.
      </Text>

      <Card tone="danger">
        <View style={styles.dangerIcon}>
          <Phone color={colors.white} size={26} strokeWidth={2.4} />
        </View>
        <Text style={styles.cardTitle}>도움이 필요해요</Text>
        {loading ? <ActivityIndicator color={colors.primaryDark} /> : null}
        <Text style={styles.copy}>
          {trip
            ? `귀가 상태를 '확인 필요'로 바꾸고 알림 받을 사람에게 알려요. 도착 예정 ${formatTime(trip.expected_arrival_at)}`
            : "귀가 중일 때 도움을 요청할 수 있어요."}
        </Text>
      </Card>

      {!loading && !trip ? (
        <Card>
          <Text style={styles.cardTitle}>진행 중인 귀가가 없어요</Text>
          <Text style={styles.copy}>
            홈에서 다시 확인하거나 새로 시작해 주세요.
          </Text>
          <AppButton
            icon={RotateCw}
            onPress={() => router.replace("/home")}
            size="md"
            title="홈으로"
            variant="secondary"
          />
        </Card>
      ) : null}

      <Card>
        <Text style={styles.cardTitle}>이렇게 전달돼요</Text>
        <Text style={styles.copy}>
          도움이 필요하다는 소식과 알림만 전달돼요. 상세 위치는 공유되지 않아요.
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
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  dangerIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.danger,
  },
  message: {
    ...typography.caption,
    color: colors.danger,
    textAlign: "center",
  },
});
