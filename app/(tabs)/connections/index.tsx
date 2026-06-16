import { router } from "expo-router";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { CalendarClock, HeartHandshake, Link2, RotateCw, UserPlus } from "lucide-react-native";

import { AppButton, Card, ListItem, Screen, SectionHeader } from "@/src/components";
import {
  type ConnectedPerson,
  type RecipientActiveTrip,
  type RelationshipType,
} from "@/src/features/connections/api";
import { useConnections } from "@/src/features/connections/useConnections";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  friend: "친구",
  partner: "연인",
  family: "가족",
  sibling: "형제자매",
  other: "연결된 사람",
};

const TRIP_STATE_LABELS: Record<string, string> = {
  on_the_way: "귀가 중",
  late: "확인 필요",
  arrived_partial: "QR 인증 완료",
  extension_requested: "시간 연장 요청",
  emergency_requested: "도움 요청",
  cancelled: "취소됨",
};

function formatExpectedArrival(value?: string) {
  if (!value) return "-";

  return new Date(value).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getConnectedProfileId(connection: ConnectedPerson) {
  return connection.profile?.id;
}

function ConnectionRow({
  activeTrip,
  connection,
}: {
  activeTrip?: RecipientActiveTrip;
  connection: ConnectedPerson;
}) {
  const displayName = connection.profile?.display_name ?? "연결된 사람";
  const avatarUrl = connection.profile?.avatar_url;
  const tripDetail = activeTrip
    ? `${TRIP_STATE_LABELS[activeTrip.state] ?? activeTrip.state} · 예상 ${formatExpectedArrival(activeTrip.expectedArrivalAt)}`
    : "도착 인증 알림을 함께 확인할 수 있어요.";
  const needsHelp = activeTrip?.state === "emergency_requested";

  return (
    <View style={styles.connectionRow}>
      <View style={styles.avatar}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{displayName.slice(0, 1)}</Text>
        )}
      </View>
      <View style={styles.connectionCopy}>
        <Text style={styles.connectionName}>{displayName}</Text>
        <Text style={needsHelp ? styles.connectionAlert : styles.connectionDetail}>
          {needsHelp ? `${tripDetail} · 확인이 필요해요` : tripDetail}
        </Text>
        {activeTrip ? <Text style={styles.connectionSubtle}>도착 예정 장소</Text> : null}
      </View>
      <Text style={styles.meta}>
        {RELATIONSHIP_TYPE_LABELS[connection.relationship.relationship_type]}
      </Text>
    </View>
  );
}

export default function ConnectionsDashboardScreen() {
  const {
    activeTrips,
    connections,
    errorMessage,
    loading,
    refreshConnections,
    refreshing,
  } = useConnections();
  const activeTripsByOwnerId = new Map(
    activeTrips.map((activeTrip) => [activeTrip.ownerId, activeTrip]),
  );

  return (
    <Screen>
      <SectionHeader
        title="연결 대시보드"
        description="도착 알림을 함께 확인할 사람과 초대 상태를 관리합니다."
      />

      <Card tone="mint">
        <Text style={styles.big}>{loading ? "연결 확인 중" : `${connections.length}명 연결됨`}</Text>
        <Text style={styles.copy}>
          {activeTrips.length > 0
            ? `${activeTrips.length}개의 귀가 상태를 확인할 수 있어요.`
            : connections.length > 0
            ? "상세 위치는 계속 공유되지 않고, 도착 인증 상태와 필요한 알림만 전달돼요."
            : "초대 코드를 만들거나 받은 초대 코드를 입력해 연결을 시작하세요."}
        </Text>
        <View style={styles.actions}>
          <AppButton
            icon={UserPlus}
            onPress={() => router.push("/connections/connect")}
            title="확인 상대 추가"
            variant="secondary"
          />
          <AppButton
            icon={Link2}
            onPress={() => router.push("/connections/invite")}
            title="초대 코드 입력"
            variant="secondary"
          />
        </View>
      </Card>

      {errorMessage ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>다시 확인이 필요해요</Text>
          <Text style={styles.copy}>{errorMessage}</Text>
          <AppButton
            icon={RotateCw}
            loading={refreshing}
            onPress={() => void refreshConnections()}
            title="다시 불러오기"
            variant="secondary"
          />
        </Card>
      ) : null}

      <Card>
        <View style={styles.row}>
          <Text style={styles.cardTitle}>연결된 사람</Text>
          {refreshing ? <ActivityIndicator color={colors.primaryDark} /> : null}
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.copy}>연결 목록을 불러오고 있어요.</Text>
          </View>
        ) : null}

        {!loading && connections.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>아직 연결된 사람이 없어요</Text>
            <Text style={styles.copy}>accepted 상태의 연결만 이 목록에 표시됩니다.</Text>
          </View>
        ) : null}

        {!loading
          ? connections.map((connection) => {
              const profileId = getConnectedProfileId(connection);
              const activeTrip = profileId
                ? activeTripsByOwnerId.get(profileId)
                : undefined;

              return (
                <ConnectionRow
                  activeTrip={activeTrip}
                  connection={connection}
                  key={connection.relationship.id}
                />
              );
            })
          : null}
      </Card>

      {!loading && activeTrips.length > 0 ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>확인 중인 귀가</Text>
          {activeTrips.map((activeTrip) => (
            <ListItem
              detail={
                activeTrip.state === "emergency_requested"
                  ? `확인이 필요해요 · 예상 ${formatExpectedArrival(activeTrip.expectedArrivalAt)}`
                  : `${TRIP_STATE_LABELS[activeTrip.state] ?? activeTrip.state} · 예상 ${formatExpectedArrival(activeTrip.expectedArrivalAt)}`
              }
              key={activeTrip.tripId}
              title={
                activeTrip.state === "emergency_requested"
                  ? `${activeTrip.ownerProfile?.display_name ?? "연결된 사람"} · 도움 요청`
                  : activeTrip.ownerProfile?.display_name ?? "연결된 사람"
              }
            />
          ))}
        </Card>
      ) : null}

      <Card tone="blue">
        <ListItem
          detail="새 확인 상대를 초대할 수 있어요."
          icon={HeartHandshake}
          onPress={() => router.push("/connections/connect")}
          title="초대 만들기"
        />
        <ListItem
          detail="받은 초대 코드를 입력해 연결할 수 있어요."
          icon={CalendarClock}
          onPress={() => router.push("/connections/invite")}
          title="초대 수락"
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  big: {
    ...typography.heading,
    color: colors.primaryDark,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  actions: {
    gap: spacing.md,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  centered: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.label,
    color: colors.text,
  },
  connectionRow: {
    minHeight: 72,
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.surfaceMint,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    ...typography.label,
    color: colors.primaryDark,
  },
  connectionCopy: {
    flex: 1,
    gap: 2,
  },
  connectionName: {
    ...typography.label,
    color: colors.text,
  },
  connectionDetail: {
    ...typography.caption,
    color: colors.textMuted,
  },
  connectionAlert: {
    ...typography.caption,
    color: colors.danger,
  },
  connectionSubtle: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  meta: {
    ...typography.caption,
    color: colors.primary,
  },
});
