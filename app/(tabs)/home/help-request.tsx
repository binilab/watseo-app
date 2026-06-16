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
import { colors, spacing, typography } from "@/src/theme/tokens";
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
          setMessage("내 귀가 정보를 찾을 수 없어요.");
          return;
        }

        setTrip(tripResult.data);
      } catch (error) {
        if (!mounted) return;
        console.error("load trip for help request failed", error);
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

    setSubmitting(true);
    setMessage(null);

    try {
      const { data, error, notificationError } = await requestHelp({
        requestedBy: user.id,
        trip,
      });

      if (error || !data) {
        setMessage("도움 요청을 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
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
      console.error("request help failed", error, {
        tripId: trip.id,
      });
      setMessage("도움 요청을 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <AppButton
            disabled={!trip}
            icon={MessageCircleWarning}
            loading={submitting}
            onPress={handleRequestHelp}
            title="도움 요청 보내기"
            variant="danger"
          />
          <AppButton
            onPress={() => router.back()}
            title="취소"
            variant="secondary"
          />
        </View>
      }
    >
      <StatusChip label={status.label} tone={status.tone} />
      <Text style={styles.title}>연결된 사람에게 지금 상황을 알릴까요?</Text>
      <Text style={styles.copy}>
        상세 위치는 계속 공유되지 않고, 도착 인증 상태와 필요한 알림만 전달돼요.
      </Text>

      <Card tone="warm">
        <Phone color={colors.danger} size={34} strokeWidth={2.4} />
        <Text style={styles.cardTitle}>도움 요청</Text>
        {loading ? <ActivityIndicator color={colors.primaryDark} /> : null}
        <Text style={styles.copy}>
          {trip
            ? `현재 귀가 상태를 확인 필요 상태로 바꾸고, 알림 받을 사람에게 기록을 남깁니다. 예상 도착 ${formatTime(trip.expected_arrival_at)}`
            : "진행 중인 귀가가 있어야 도움 요청을 보낼 수 있어요."}
        </Text>
      </Card>

      {!loading && !trip ? (
        <Card>
          <Text style={styles.cardTitle}>진행 중인 귀가가 없어요</Text>
          <Text style={styles.copy}>
            홈에서 현재 귀가 상황을 다시 확인하거나 새 귀가를 시작해주세요.
          </Text>
          <AppButton
            icon={RotateCw}
            onPress={() => router.replace("/home")}
            title="홈으로 돌아가기"
            variant="secondary"
          />
        </Card>
      ) : null}

      <Card>
        <Text style={styles.cardTitle}>전달되는 내용</Text>
        <Text style={styles.copy}>
          도움 요청 상태와 필요한 알림만 기록합니다. 상세 주소, 좌표, 이동 경로는 포함하지 않아요.
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
  message: {
    ...typography.caption,
    color: colors.danger,
    textAlign: "center",
  },
});
