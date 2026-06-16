import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Clock3, MessageCircleWarning, QrCode } from "lucide-react-native";

import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import {
  cancelTrip,
  fetchLatestActiveTrip,
  fetchTripById,
  type Trip,
} from "@/src/features/trips/api";
import { showFriendlyAlert } from "@/src/lib/friendlyAlert";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";
import { getStatusDisplay } from "@/src/types";

function getRemainingMinutes(expectedArrivalAt?: string) {
  if (!expectedArrivalAt) return null;

  const diffMs = new Date(expectedArrivalAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / 60000));
}

function formatTime(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActiveReturnScreen() {
  const { notificationStatus, recipientStatus, tripId } = useLocalSearchParams<{
    notificationStatus?: string;
    recipientStatus?: string;
    tripId?: string;
  }>();
  const { loading: authLoading, user } = useAuthSession();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const remainingMinutes = useMemo(
    () => getRemainingMinutes(trip?.expected_arrival_at),
    [trip?.expected_arrival_at],
  );
  const missingTrip = !loading && !trip;
  const displayStatus = trip
    ? getStatusDisplay(trip.state)
    : missingTrip
    ? { label: "정보 없음", tone: "neutral" as const }
    : getStatusDisplay("on_the_way");
  const helpRequested = trip?.state === "emergency_requested";
  const extensionRequested = trip?.state === "extension_requested";

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function loadTrip() {
        if (authLoading) {
          return;
        }

        if (!user) {
          setTrip(null);
          setLoading(false);
          return;
        }

        setLoading(true);
        try {
          const { data, error } = tripId
            ? await fetchTripById(tripId)
            : await fetchLatestActiveTrip(user.id);

          if (!mounted) return;

          if (error || !data) {
            setTrip(null);
            setErrorMessage(
              tripId
                ? "귀가 정보를 불러오지 못했어요."
                : "진행 중인 귀가가 없어요.",
            );
          } else {
            setTrip(data);
            setErrorMessage(null);
          }
        } catch {
          if (!mounted) return;
          setTrip(null);
          setErrorMessage("귀가 정보를 불러오지 못했어요.");
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
    }, [authLoading, tripId, user]),
  );

  async function performCancelTrip() {
    if (!user || !trip) {
      setErrorMessage("귀가 정보를 찾을 수 없어요.");
      return;
    }

    setCancelling(true);
    setErrorMessage(null);

    const { error } = await cancelTrip(trip.id, user.id);

    setCancelling(false);

    if (error) {
      setErrorMessage("귀가를 종료하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
      return;
    }

    router.replace("/home");
  }

  function handleCancelTrip() {
    showFriendlyAlert({
      actions: [
        { style: "cancel", text: "계속하기" },
        {
          onPress: () => {
            void performCancelTrip();
          },
          style: "destructive",
          text: "귀가 그만하기",
        },
      ],
      message: "기록에는 취소된 귀가로 남아요.",
      title: "귀가를 그만할까요?",
    });
  }

  return (
    <Screen>
      <Card tone="mint" style={styles.hero}>
        <StatusChip label={displayStatus.label} tone={displayStatus.tone} />
        <View style={styles.ring}>
          {loading ? (
            <ActivityIndicator color={colors.primaryDark} />
          ) : (
            <>
              <Text style={styles.eta}>
                {remainingMinutes === null ? "-" : remainingMinutes}
              </Text>
              <Text style={styles.etaUnit}>분 남음</Text>
            </>
          )}
        </View>
        {trip ? (
          <Text style={styles.etaCaption}>
            도착 예정 {formatTime(trip.expected_arrival_at)}
          </Text>
        ) : null}
        <Text style={styles.privacy}>
          상세 위치는 공유되지 않아요. 도착 상태와 알림만 전달돼요.
        </Text>
      </Card>

      {missingTrip ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>진행 중인 귀가가 없어요</Text>
          <Text style={styles.copy}>
            새로 귀가를 시작해 주세요.
          </Text>
          <AppButton
            icon={Clock3}
            onPress={() => router.replace("/home/return-setup")}
            size="md"
            title="귀가 시작하기"
            variant="secondary"
          />
        </Card>
      ) : null}

      {errorMessage ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>다시 확인이 필요해요</Text>
          <Text style={styles.copy}>{errorMessage}</Text>
        </Card>
      ) : null}

      {recipientStatus === "failed" ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>알림 받을 사람 확인이 필요해요</Text>
          <Text style={styles.copy}>
            귀가는 시작됐지만 알림 받을 사람 저장이 끝나지 않았어요.
          </Text>
        </Card>
      ) : null}

      {notificationStatus === "failed" ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>알림 확인이 필요해요</Text>
          <Text style={styles.copy}>
            귀가는 저장됐지만 알림 전달이 아직 끝나지 않았어요.
          </Text>
        </Card>
      ) : null}

      {helpRequested ? (
        <Card tone="danger">
          <Text style={styles.cardTitle}>도움이 필요하다고 알렸어요</Text>
          <Text style={styles.copy}>
            연결된 사람에게 확인이 필요한 상태로 보여요. 상세 위치는 공유되지 않아요.
          </Text>
        </Card>
      ) : null}

      {extensionRequested ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>도착이 늦어진다고 알렸어요</Text>
          <Text style={styles.copy}>
            상대가 괜찮다고 하면 도착 시간이 바뀌어요.
          </Text>
        </Card>
      ) : null}

      {trip ? (
        <View style={styles.actions}>
          <AppButton
            icon={QrCode}
            onPress={() =>
              router.push({
                pathname: "/home/qr-arrival",
                params: { tripId: trip.id },
              })
            }
            title="QR로 도착 확인"
          />
          <AppButton
            icon={Clock3}
            onPress={() =>
              router.push({
                pathname: "/home/time-extension",
                params: { tripId: trip.id },
              })
            }
            title="도착 시간이 늦어져요"
            variant="secondary"
          />
          <AppButton
            disabled={helpRequested}
            icon={MessageCircleWarning}
            onPress={() =>
              router.push({
                pathname: "/home/help-request",
                params: { tripId: trip.id },
              })
            }
            title={helpRequested ? "도움 요청함" : "도움이 필요해요"}
            variant="danger"
          />
          <View style={styles.cancelWrap}>
            <AppButton
              disabled={cancelling}
              loading={cancelling}
              onPress={handleCancelTrip}
              size="md"
              title="귀가 그만하기"
              variant="ghost"
            />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  ring: {
    width: 176,
    height: 176,
    borderRadius: 88,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 8,
    borderColor: colors.primarySoft,
  },
  eta: {
    ...typography.display,
    color: colors.primaryDark,
  },
  etaUnit: {
    ...typography.label,
    color: colors.textMuted,
  },
  etaCaption: {
    ...typography.bodyStrong,
    color: colors.primaryDark,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
  },
  privacy: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
    textAlign: "center",
  },
  actions: {
    gap: spacing.sm,
  },
  cancelWrap: {
    marginTop: spacing.xs,
  },
});
