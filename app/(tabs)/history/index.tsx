import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { CalendarCheck2, RotateCw } from "lucide-react-native";

import {
  AppButton,
  Card,
  EmptyState,
  HistoryTripCard,
  Screen,
  SectionHeader,
} from "@/src/components";
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
  late: "확인 필요",
  arrived_verified: "도착 확인 완료",
  arrived_partial: "도착 확인",
  extension_requested: "늦어지는 중",
  emergency_requested: "도움 필요",
  cancelled: "취소됨",
};

function getResolvedState(item: TripHistoryItem): TripState {
  if (item.trip.state === "cancelled" || item.trip.cancelled_at) {
    return "cancelled";
  }

  return item.trip.state;
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
  const parts = [`시작 ${formatDateTime(item.trip.started_at)}`];

  if (item.trip.arrived_at) {
    parts.push(`도착 ${formatDateTime(item.trip.arrived_at)}`);
  } else if (item.trip.cancelled_at) {
    parts.push(`취소 ${formatDateTime(item.trip.cancelled_at)}`);
  } else {
    parts.push(`예상 ${formatDateTime(item.trip.expected_arrival_at)}`);
  }

  return parts.join(" · ");
}

function getFlagMeta(item: TripHistoryItem) {
  if (getResolvedState(item) === "cancelled") {
    return undefined;
  }

  const flags = [];

  if (item.hasQrVerification) flags.push("QR 인증");
  if (item.hasTimeExtensionRequest) flags.push("시간 연장");
  if (item.hasHelpRequest) flags.push("도움 요청");

  return flags.length > 0 ? flags.join(" · ") : undefined;
}

export default function HistoryScreen() {
  const { errorMessage, history, loading, refreshHistory, refreshing } = useTripHistory();
  const completedCount = history.filter((item) =>
    item.trip.state === "arrived_partial" || item.trip.state === "arrived_verified",
  ).length;

  return (
    <Screen>
      <SectionHeader
        title="귀가 기록"
        description="지난 귀가를 다시 봐요."
      />

      <Card tone="mint">
        <View style={styles.summary}>
          <View style={styles.iconWrap}>
            <CalendarCheck2 color={colors.primaryDark} size={26} strokeWidth={2.4} />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryCount}>
              {loading ? "기록 확인 중" : `${history.length}개 기록`}
            </Text>
            <Text style={styles.summaryDetail}>
              {completedCount > 0
                ? `도착을 확인한 기록이 ${completedCount}개 있어요`
                : "귀가를 시작하면 이곳에 기록이 쌓여요"}
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
            size="md"
            title="다시 시도"
            variant="secondary"
          />
        </Card>
      ) : null}

      <Card>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.copy}>불러오고 있어요.</Text>
          </View>
        ) : null}

        {!loading && history.length === 0 ? (
          <EmptyState
            description="귀가를 시작하면 이곳에 기록이 쌓여요."
            icon={CalendarCheck2}
            title="아직 귀가 기록이 없어요"
          />
        ) : null}

        {!loading
          ? history.map((item, index) => {
              const state = getResolvedState(item);
              const isActive = ACTIVE_STATES.has(state);
              const status = getStatusDisplay(state);

              return (
                <View key={item.trip.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <HistoryTripCard
                    detail={getHistoryDetail(item)}
                    meta={getFlagMeta(item)}
                    onPress={
                      isActive
                        ? () =>
                            router.push({
                              pathname: "/home/active",
                              params: { tripId: item.trip.id },
                            })
                        : undefined
                    }
                    statusLabel={
                      state === "cancelled" ? "취소됨" : HISTORY_STATE_LABELS[state]
                    }
                    statusTone={status.tone}
                    title={item.destinationName}
                  />
                </View>
              );
            })
          : null}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>개인정보 안내</Text>
        <Text style={styles.copy}>
          장소 이름과 도착 상태만 보여요. 상세 위치는 표시하지 않아요.
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
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  summaryCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  summaryCount: {
    ...typography.subheading,
    color: colors.text,
  },
  summaryDetail: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
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
    paddingVertical: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
