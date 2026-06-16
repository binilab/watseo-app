import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Clock3, QrCode } from "lucide-react-native";

import { AppButton, Card, ListItem, Screen, StatusChip } from "@/src/components";
import { activeTimeline } from "@/src/data/mock";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import {
  fetchLatestActiveTrip,
  fetchTripById,
  type Trip,
} from "@/src/features/trips/api";
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
  const { recipientStatus, tripId } = useLocalSearchParams<{
    recipientStatus?: string;
    tripId?: string;
  }>();
  const { loading: authLoading, user } = useAuthSession();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
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
              ? "귀가 세션 정보를 불러오지 못했어요."
              : "진행 중인 귀가 정보를 찾을 수 없어요.",
          );
        } else {
          setTrip(data);
          setErrorMessage(null);
        }
      } catch {
        if (!mounted) return;
        setTrip(null);
        setErrorMessage("귀가 세션 정보를 불러오지 못했어요.");
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
                {remainingMinutes === null ? "-" : `${remainingMinutes}분`}
              </Text>
              <Text style={styles.etaLabel}>예상 남은 시간</Text>
            </>
          )}
        </View>
        <Text style={styles.description}>
          상세 위치는 계속 공유되지 않고, 도착 인증 상태와 필요한 알림만 전달돼요.
        </Text>
      </Card>

      {missingTrip ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>진행 중인 귀가 정보를 찾을 수 없어요</Text>
          <Text style={styles.description}>
            귀가 설정 화면에서 새 귀가 세션을 시작해주세요.
          </Text>
          <AppButton
            icon={Clock3}
            onPress={() => router.replace("/home/return-setup")}
            title="귀가 설정으로 이동"
            variant="secondary"
          />
        </Card>
      ) : null}

      {trip ? (
        <Card tone="blue">
          <Text style={styles.cardTitle}>생성된 귀가 세션</Text>
          <Text style={styles.description}>예상 도착 {formatTime(trip.expected_arrival_at)}</Text>
          <Text style={styles.tripId}>trip id: {trip.id}</Text>
        </Card>
      ) : null}

      {errorMessage ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>다시 확인이 필요해요</Text>
          <Text style={styles.description}>{errorMessage}</Text>
        </Card>
      ) : null}

      {recipientStatus === "failed" ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>알림 받을 사람 저장 확인 필요</Text>
          <Text style={styles.description}>
            귀가 세션은 시작됐지만, 선택한 알림 받을 사람 저장은 완료되지 않았어요.
          </Text>
        </Card>
      ) : null}

      {trip ? (
        <>
          <Card>
            {activeTimeline.map((item) => (
              <ListItem
                detail={item.detail}
                icon={item.icon}
                key={item.title}
                title={item.title}
              />
            ))}
          </Card>

          <View style={styles.actions}>
            <AppButton
              icon={QrCode}
              onPress={() =>
                router.push({
                  pathname: "/home/qr-arrival",
                  params: { tripId: trip.id },
                })
              }
              title="QR로 도착 인증"
            />
            <AppButton
              icon={Clock3}
              onPress={() => router.push("/home/time-extension")}
              title="시간 연장 요청"
              variant="secondary"
            />
            <AppButton
              onPress={() => router.push("/home/help-request")}
              title="도움 요청 화면 보기"
              variant="ghost"
            />
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  ring: {
    width: 204,
    height: 204,
    borderRadius: 102,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 13,
    borderColor: colors.primarySoft,
  },
  eta: {
    ...typography.title,
    color: colors.primaryDark,
  },
  etaLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  tripId: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  actions: {
    gap: spacing.md,
  },
});
