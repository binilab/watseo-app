import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Clock3, MapPin, Navigation, UsersRound } from "lucide-react-native";
import { ActiveTripCard, AppButton, Card, ListItem, Screen } from "@/src/components";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import { fetchProfile } from "@/src/features/profile/api";
import { fetchLatestActiveTrip, type Trip } from "@/src/features/trips/api";
import { logFriendlyError } from "@/src/lib/friendlyAlert";
import { colors, spacing, typography } from "@/src/theme/tokens";
import { getStatusDisplay } from "@/src/types";

function formatTime(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HomeScreen() {
  const { user } = useAuthSession();
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [activeTripLoading, setActiveTripLoading] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function loadHome() {
        if (!user) {
          setActiveTrip(null);
          setDisplayName(null);
          setActiveTripLoading(false);
          return;
        }

        setActiveTripLoading(true);

        const [activeTripResult, profileResult] = await Promise.all([
          fetchLatestActiveTrip(user.id),
          fetchProfile(user.id),
        ]);

        if (!mounted) return;

        if (activeTripResult.error) {
          logFriendlyError("진행 중인 귀가 확인", activeTripResult.error);
          setActiveTrip(null);
        } else {
          setActiveTrip(activeTripResult.data ?? null);
        }

        if (profileResult.error) {
          logFriendlyError("프로필 확인", profileResult.error);
          setDisplayName(null);
        } else {
          setDisplayName(profileResult.data?.display_name ?? null);
        }

        setActiveTripLoading(false);
      }

      void loadHome();

      return () => {
        mounted = false;
      };
    }, [user]),
  );

  const activeStatus = activeTrip ? getStatusDisplay(activeTrip.state) : null;
  const greeting = activeTrip
    ? "지금 귀가 중이에요"
    : displayName
    ? `${displayName}님, 오늘도 조심히 다녀와요`
    : "오늘도 조심히 다녀와요";

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.brand}>왔어</Text>
        <Text style={styles.greeting}>{greeting}</Text>
      </View>

      {activeTrip && activeStatus ? (
        <ActiveTripCard
          actionIcon={Navigation}
          actionLabel="내 귀가 보기"
          detail={`${activeStatus.label} · 도착 예정 ${formatTime(activeTrip.expected_arrival_at)}`}
          icon={Clock3}
          onPress={() =>
            router.push({
              pathname: "/home/active",
              params: { tripId: activeTrip.id },
            })
          }
          statusLabel={activeStatus.label}
          statusTone={activeStatus.tone}
          title="도착하면 바로 알려드릴게요"
          tone="blue"
        />
      ) : activeTripLoading ? (
        <Card>
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.muted}>잠깐만요, 확인하고 있어요.</Text>
          </View>
        </Card>
      ) : (
        <ActiveTripCard
          actionIcon={Navigation}
          actionLabel="귀가 시작"
          detail="어디로 갈지, 누구에게 알릴지 골라주세요."
          icon={Navigation}
          onPress={() => router.push("/home/return-setup")}
          statusLabel="귀가 전"
          statusTone="neutral"
          title="이제 출발하시나요?"
          tone="blue"
        />
      )}

      <Card>
        <ListItem
          detail="자주 가는 곳을 등록해요"
          icon={MapPin}
          onPress={() => router.push("/places")}
          title="도착 장소"
        />
        <View style={styles.divider} />
        <ListItem
          detail="도착을 함께 확인할 사람"
          icon={UsersRound}
          onPress={() => router.push("/connections")}
          title="연결"
        />
        <View style={styles.divider} />
        <ListItem
          detail="지난 귀가를 다시 봐요"
          icon={Clock3}
          onPress={() => router.push("/history")}
          title="귀가 기록"
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  brand: {
    ...typography.label,
    color: colors.primary,
  },
  greeting: {
    ...typography.title,
    color: colors.text,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
  loadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
