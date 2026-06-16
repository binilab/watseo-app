import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { CalendarCheck2, RotateCw } from "lucide-react-native";

import { AppButton, Card, ListItem, Screen, SectionHeader, StatusChip } from "@/src/components";
import { useTripHistory } from "@/src/features/history/useTripHistory";
import type { TripHistoryItem } from "@/src/features/history/api";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";
import { getStatusDisplay } from "@/src/types";
import type { Database } from "@/src/types/supabase";

type TripState = Database["public"]["Enums"]["app_state"];

const ACTIVE_STATES = new Set<TripState>([
  "on_the_way",
  "late",
  "extension_requested",
  "emergency_requested",
]);

const HISTORY_STATE_LABELS: Record<TripState, string> = {
  not_started: "기록 없음",
  on_the_way: "진행 중",
  late: "진행 중",
  arrived_verified: "도착 인증 완료",
  arrived_partial: "QR 인증 완료",
  extension_requested: "시간 연장 요청",
  emergency_requested: "도움 요청",
  cancelled: "취소됨",
};

function getResolvedState(item: TripHistoryItem): TripState {
  if (item.trip.state === "cancelled" || item.trip.cancelled_at) {
    return "cancelled";
  }

  return item.trip.state;
}

function getHistoryStateLabel(item: TripHistoryItem) {
  const state = getResolvedState(item);

  if (state === "late") return "확인 필요";
  if (state === "extension_requested") return "시간 연장";

  return HISTORY_STATE_LABELS[state];
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getHistoryDetail(item: TripHistoryItem) {
  const parts = [
    `예상 ${formatDateTime(item.trip.expected_arrival_at)}`,
    `시작 ${formatDateTime(item.trip.started_at)}`,
  ];

  if (item.trip.arrived_at) {
    parts.push(`도착 ${formatDateTime(item.trip.arrived_at)}`);
  }

  if (item.trip.cancelled_at) {
    parts.push(`취소 ${formatDateTime(item.trip.cancelled_at)}`);
  }

  if (item.latestVerificationAt) {
    parts.push(`인증 ${formatDateTime(item.latestVerificationAt)}`);
  }

  return parts.join(" · ");
}

function getMeta(item: TripHistoryItem) {
  const state = getResolvedState(item);

  if (state === "cancelled") {
    return "취소됨";
  }

  const flags = [];

  if (item.hasQrVerification) flags.push("QR 인증");
  if (item.hasTimeExtensionRequest) flags.push("시간 연장");
  if (item.hasHelpRequest) flags.push("도움 요청");

  return flags.length > 0 ? flags.join(" · ") : getHistoryStateLabel(item);
}

export default function HistoryScreen() {
  const { errorMessage, history, loading, refreshHistory, refreshing } = useTripHistory();
  const completedCount = history.filter((item) =>
    item.trip.state === "arrived_partial" || item.trip.state === "arrived_verified",
  ).length;
  const completedStatus = getStatusDisplay("arrived_verified");

  return (
    <Screen>
      <SectionHeader
        title="귀가 기록"
        description="내 귀가 세션과 도착 인증 상태를 확인합니다."
      />

      <Card tone="mint">
        <View style={styles.summary}>
          <View style={styles.iconWrap}>
            <CalendarCheck2 color={colors.primaryDark} size={30} strokeWidth={2.4} />
          </View>
          <View style={styles.summaryCopy}>
            <StatusChip
              label={loading ? "기록 확인 중" : `${history.length}개 기록`}
              tone={completedStatus.tone}
            />
            <Text style={styles.big}>
              {completedCount > 0
                ? `${completedCount}개의 도착 인증 기록이 있어요`
                : "귀가 기록을 실제 DB에서 불러와요"}
            </Text>
          </View>
        </View>
      </Card>

      {errorMessage ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>다시 확인이 필요해요</Text>
          <Text style={styles.copy}>{errorMessage}</Text>
          <AppButton
            icon={RotateCw}
            loading={refreshing}
            onPress={() => void refreshHistory()}
            title="다시 불러오기"
            variant="secondary"
          />
        </Card>
      ) : null}

      <Card>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.copy}>귀가 기록을 불러오고 있어요.</Text>
          </View>
        ) : null}

        {!loading && history.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.cardTitle}>아직 귀가 기록이 없어요</Text>
            <Text style={styles.copy}>귀가를 시작하면 이곳에 기록이 쌓입니다.</Text>
          </View>
        ) : null}

        {!loading
          ? history.map((item) => {
              const state = getResolvedState(item);
              const stateLabel = getHistoryStateLabel(item);
              const isActive = ACTIVE_STATES.has(state);

              return (
                <ListItem
                  detail={getHistoryDetail(item)}
                  key={item.trip.id}
                  meta={getMeta(item)}
                  onPress={
                    isActive
                      ? () =>
                          router.push({
                            pathname: "/home/active",
                            params: { tripId: item.trip.id },
                          })
                      : undefined
                  }
                  title={`${item.destinationName} · ${stateLabel}`}
                />
              );
            })
          : null}
      </Card>

      <Card tone="blue">
        <Text style={styles.cardTitle}>개인정보 안내</Text>
        <Text style={styles.copy}>
          기록에는 도착 장소 이름과 도착 인증 상태만 표시합니다. 상세 위치, 좌표, 이동 경로는 표시하지 않아요.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  summaryCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  big: {
    ...typography.subheading,
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
  centered: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
});
