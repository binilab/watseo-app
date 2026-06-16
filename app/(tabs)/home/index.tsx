import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Clock3, LogOut, MapPin, Navigation, QrCode, Save, UserRound } from "lucide-react-native";
import {
  AppButton,
  Card,
  ListItem,
  Screen,
  SectionHeader,
  StatusChip,
} from "@/src/components";
import { homeMetrics, quickActions } from "@/src/data/mock";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import {
  fetchProfile,
  updateProfileDisplayName,
  type Profile,
} from "@/src/features/profile/api";
import { fetchLatestActiveTrip, type Trip } from "@/src/features/trips/api";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";
import { getStatusDisplay } from "@/src/types";

function formatTime(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HomeScreen() {
  const { signOut, user } = useAuthSession();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutMessage, setSignOutMessage] = useState<string | null>(null);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [activeTripLoading, setActiveTripLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nickname, setNickname] = useState("");
  const [savingNickname, setSavingNickname] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const status = getStatusDisplay(activeTrip?.state ?? "not_started");

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function loadActiveTrip() {
        if (!user) {
          setActiveTrip(null);
          setProfile(null);
          setNickname("");
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
          console.error("fetch latest active trip failed", activeTripResult.error);
          setActiveTrip(null);
        } else {
          setActiveTrip(activeTripResult.data ?? null);
        }

        if (profileResult.error) {
          console.error("fetch profile failed", profileResult.error);
          setProfile(null);
        } else {
          setProfile(profileResult.data ?? null);
          setNickname(profileResult.data?.display_name ?? "");
        }

        setActiveTripLoading(false);
      }

      void loadActiveTrip();

      return () => {
        mounted = false;
      };
    }, [user]),
  );

  async function handleSaveNickname() {
    if (!user) return;

    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      setProfileMessage("닉네임을 입력해주세요.");
      return;
    }

    setSavingNickname(true);
    setProfileMessage(null);

    const { data, error } = await updateProfileDisplayName(user.id, trimmedNickname);

    setSavingNickname(false);

    if (error || !data) {
      console.error("update profile display name failed", error);
      setProfileMessage("닉네임을 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
      return;
    }

    setProfile(data);
    setNickname(data.display_name);
    setProfileMessage("닉네임을 저장했어요.");
  }

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutMessage(null);

    const { error } = await signOut();

    setSigningOut(false);

    if (error) {
      setSignOutMessage("로그아웃하지 못했어요. 잠시 후 다시 시도해주세요.");
      return;
    }

    router.replace("/login");
  }

  return (
    <Screen>
      <View style={styles.header}>
        <StatusChip label={status.label} tone={status.tone} />
        <Text style={styles.title}>오늘도 편하게 도착을 알려요</Text>
        <Text style={styles.description}>
          도착지와 확인 상대를 고른 뒤 귀가를 시작할 수 있어요.
        </Text>
      </View>

      {user ? (
        <Card>
          <View style={styles.accountHeader}>
            <View style={styles.accountIcon}>
              <UserRound color={colors.primaryDark} size={22} strokeWidth={2.4} />
            </View>
            <View style={styles.destinationCopy}>
              <Text style={styles.cardTitle}>{profile?.display_name ?? "새 사용자"}</Text>
              <Text style={styles.muted}>{user.email ?? "이메일 정보 없음"}</Text>
            </View>
          </View>
          <TextInput
            onChangeText={(value) => {
              setNickname(value);
              setProfileMessage(null);
            }}
            placeholder="닉네임"
            placeholderTextColor={colors.textSubtle}
            style={styles.input}
            value={nickname}
          />
          <AppButton
            disabled={savingNickname}
            icon={Save}
            loading={savingNickname}
            onPress={handleSaveNickname}
            title="닉네임 저장"
            variant="secondary"
          />
          {profileMessage ? <Text style={styles.profileMessage}>{profileMessage}</Text> : null}
        </Card>
      ) : null}

      {activeTrip ? (
        <Card tone="warm" style={styles.primaryCard}>
          <View style={styles.destinationRow}>
            <View style={styles.destinationIcon}>
              <Clock3 color={colors.amber} size={28} strokeWidth={2.5} />
            </View>
            <View style={styles.destinationCopy}>
              <Text style={styles.cardTitle}>진행 중인 귀가가 있어요</Text>
              <Text style={styles.muted}>
                {getStatusDisplay(activeTrip.state).label} · 예상 도착{" "}
                {formatTime(activeTrip.expected_arrival_at)}
              </Text>
            </View>
          </View>
          <AppButton
            icon={Navigation}
            onPress={() =>
              router.push({
                pathname: "/home/active",
                params: { tripId: activeTrip.id },
              })
            }
            title="내 귀가 상황 보기"
          />
        </Card>
      ) : activeTripLoading ? (
        <Card>
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.muted}>진행 중인 귀가를 확인하고 있어요.</Text>
          </View>
        </Card>
      ) : (
        <Card tone="mint" style={styles.primaryCard}>
          <View style={styles.destinationRow}>
            <View style={styles.destinationIcon}>
              <MapPin color={colors.primaryDark} size={28} strokeWidth={2.5} />
            </View>
            <View style={styles.destinationCopy}>
              <Text style={styles.cardTitle}>기본 도착지</Text>
              <Text style={styles.muted}>
                도착 장소 관리에서 사용할 장소를 설정하세요.
              </Text>
            </View>
          </View>
          <AppButton
            icon={Navigation}
            onPress={() => router.push("/home/return-setup")}
            title="귀가 설정하기"
          />
        </Card>
      )}

      <View style={styles.metrics}>
        {homeMetrics.map((item) => (
          <Card key={item.label} style={styles.metricCard}>
            <Text style={styles.metricValue}>{item.value}</Text>
            <Text style={styles.metricLabel}>{item.label}</Text>
          </Card>
        ))}
      </View>

      <SectionHeader title="빠른 이동" />
      <Card>
        {quickActions.map((item) => (
          <ListItem
            detail={item.detail}
            icon={item.icon}
            key={item.title}
            onPress={() => {
              if (item.route) router.push(item.route);
            }}
            title={item.title}
          />
        ))}
      </Card>

      <AppButton
        icon={QrCode}
        onPress={() => router.push("/places")}
        title="장소 QR 보기"
        variant="secondary"
      />

      {user ? (
        <View style={styles.accountActions}>
          {signOutMessage ? <Text style={styles.signOutMessage}>{signOutMessage}</Text> : null}
          <AppButton
            icon={LogOut}
            loading={signingOut}
            onPress={handleSignOut}
            title="로그아웃"
            variant="ghost"
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
  },
  destinationRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  destinationIcon: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  destinationCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  accountHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  accountIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMint,
  },
  input: {
    ...typography.body,
    minHeight: 54,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    color: colors.text,
    paddingHorizontal: spacing.lg,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  primaryCard: {
    gap: spacing.lg,
  },
  loadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    padding: spacing.md,
  },
  metricValue: {
    ...typography.subheading,
    color: colors.primaryDark,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  accountActions: {
    gap: spacing.sm,
  },
  signOutMessage: {
    ...typography.caption,
    color: colors.danger,
    textAlign: "center",
  },
  profileMessage: {
    ...typography.caption,
    color: colors.primaryDark,
    textAlign: "center",
  },
});
