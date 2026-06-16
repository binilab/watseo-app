import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { CalendarClock, HeartHandshake, RotateCw, UserPlus } from "lucide-react-native";

import {
  AppButton,
  Card,
  EmptyState,
  ListItem,
  PersonStatusCard,
  Screen,
  SectionHeader,
} from "@/src/components";
import {
  type ConnectedPerson,
  type RecipientActiveTrip,
  type RelationshipType,
  respondTimeExtensionRequest,
} from "@/src/features/connections/api";
import { useConnections } from "@/src/features/connections/useConnections";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import { logFriendlyError } from "@/src/lib/friendlyAlert";
import { colors, spacing, typography } from "@/src/theme/tokens";
import type { StatusTone } from "@/src/types";

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
  arrived_partial: "도착 확인",
  extension_requested: "늦어지는 중",
  emergency_requested: "도움 필요",
  cancelled: "취소됨",
};

const TRIP_STATE_TONES: Record<string, StatusTone> = {
  on_the_way: "active",
  late: "pending",
  arrived_partial: "success",
  extension_requested: "pending",
  emergency_requested: "danger",
  cancelled: "neutral",
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

function isAlreadyHandledRequestError(error: unknown) {
  const message =
    typeof (error as { message?: unknown })?.message === "string"
      ? (error as { message: string }).message
      : "";

  return message.toLowerCase().includes("pending");
}

function ConnectionRow({
  activeTrip,
  connection,
}: {
  activeTrip?: RecipientActiveTrip;
  connection: ConnectedPerson;
}) {
  const displayName = connection.profile?.display_name ?? "연결된 사람";
  const relationshipLabel =
    RELATIONSHIP_TYPE_LABELS[connection.relationship.relationship_type];

  if (!activeTrip) {
    return (
      <PersonStatusCard
        avatarUrl={connection.profile?.avatar_url}
        detail="도착 소식을 함께 확인해요."
        name={displayName}
        relationshipLabel={relationshipLabel}
      />
    );
  }

  const statusLabel = TRIP_STATE_LABELS[activeTrip.state] ?? activeTrip.state;
  const statusTone = TRIP_STATE_TONES[activeTrip.state] ?? "neutral";
  const detail =
    activeTrip.state === "emergency_requested"
      ? `확인이 필요해요 · 도착 예정 ${formatExpectedArrival(activeTrip.expectedArrivalAt)}`
      : `도착 예정 ${formatExpectedArrival(activeTrip.expectedArrivalAt)}`;

  return (
    <PersonStatusCard
      avatarUrl={connection.profile?.avatar_url}
      detail={detail}
      name={displayName}
      relationshipLabel={relationshipLabel}
      statusLabel={statusLabel}
      statusTone={statusTone}
    />
  );
}

export default function ConnectionsDashboardScreen() {
  const { user } = useAuthSession();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [respondingRequestId, setRespondingRequestId] = useState<string | null>(null);
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

  async function handleTimeExtensionResponse(
    requestId: string,
    responseStatus: "accepted" | "declined",
  ) {
    setRespondingRequestId(requestId);
    setActionMessage(null);

    const { error } = await respondTimeExtensionRequest(requestId, responseStatus);

    setRespondingRequestId(null);

    if (error) {
      logFriendlyError("시간 연장 응답 확인", error, {
        responseStatus,
      });
      setActionMessage(
        isAlreadyHandledRequestError(error)
          ? "이미 확인된 요청이에요."
          : "응답을 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
      );
      return;
    }

    await refreshConnections();
  }

  return (
    <Screen>
      <SectionHeader
        title="연결"
        description="서로의 도착을 확인해요."
      />

      <Card tone="mint">
        <Text style={styles.summaryCount}>
          {loading ? "연결 확인 중" : `${connections.length}명 연결됨`}
        </Text>
        <Text style={styles.summaryCopy}>
          {activeTrips.length > 0
            ? `지금 ${activeTrips.length}명의 도착을 확인할 수 있어요.`
            : connections.length > 0
            ? "상세 위치는 공유되지 않아요. 도착 상태와 알림만 전달돼요."
            : "초대 코드를 만들거나 받아서 연결을 시작해요."}
        </Text>
        <AppButton
          icon={UserPlus}
          onPress={() => router.push("/connections/connect")}
          size="md"
          title="확인 상대 추가"
          variant="secondary"
        />
      </Card>

      {errorMessage ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>다시 확인이 필요해요</Text>
          <Text style={styles.copy}>{errorMessage}</Text>
          <AppButton
            icon={RotateCw}
            loading={refreshing}
            onPress={() => void refreshConnections()}
            size="md"
            title="다시 시도"
            variant="secondary"
          />
        </Card>
      ) : null}

      {!loading && activeTrips.length > 0 ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>확인 중인 귀가</Text>
          {actionMessage ? <Text style={styles.actionMessage}>{actionMessage}</Text> : null}
          {activeTrips.map((activeTrip) => {
            const pendingRequest =
              activeTrip.state === "extension_requested"
                ? activeTrip.pendingTimeExtensionRequest
                : null;

            return (
              <View key={activeTrip.tripId} style={styles.activeTripBlock}>
                <ListItem
                  detail={
                    activeTrip.state === "emergency_requested"
                      ? `확인이 필요해요 · 도착 예정 ${formatExpectedArrival(activeTrip.expectedArrivalAt)}`
                      : `${TRIP_STATE_LABELS[activeTrip.state] ?? activeTrip.state} · 도착 예정 ${formatExpectedArrival(activeTrip.expectedArrivalAt)}`
                  }
                  title={
                    activeTrip.state === "emergency_requested"
                      ? `${activeTrip.ownerProfile?.display_name ?? "연결된 사람"} · 도움 필요`
                      : activeTrip.ownerProfile?.display_name ?? "연결된 사람"
                  }
                />
                {pendingRequest ? (
                  <View style={styles.responseActions}>
                    <AppButton
                      disabled={respondingRequestId === pendingRequest.id}
                      loading={respondingRequestId === pendingRequest.id}
                      onPress={() =>
                        void handleTimeExtensionResponse(pendingRequest.id, "accepted")
                      }
                      size="md"
                      style={styles.responseButton}
                      title="괜찮아요"
                      variant="secondary"
                    />
                    <AppButton
                      disabled={respondingRequestId === pendingRequest.id}
                      onPress={() =>
                        void handleTimeExtensionResponse(pendingRequest.id, "declined")
                      }
                      size="md"
                      style={styles.responseButton}
                      title="지금은 어려워요"
                      variant="ghost"
                    />
                  </View>
                ) : null}
              </View>
            );
          })}
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
            <Text style={styles.copy}>불러오고 있어요.</Text>
          </View>
        ) : null}

        {!loading && connections.length === 0 ? (
          <EmptyState
            description="초대 코드로 연결을 시작해요."
            icon={HeartHandshake}
            title="아직 연결된 사람이 없어요"
          />
        ) : null}

        {!loading
          ? connections.map((connection, index) => {
              const profileId = getConnectedProfileId(connection);
              const activeTrip = profileId
                ? activeTripsByOwnerId.get(profileId)
                : undefined;

              return (
                <View key={connection.relationship.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <ConnectionRow activeTrip={activeTrip} connection={connection} />
                </View>
              );
            })
          : null}
      </Card>

      <Card>
        <ListItem
          detail="새 확인 상대를 초대할 수 있어요."
          icon={HeartHandshake}
          onPress={() => router.push("/connections/connect")}
          title="초대 만들기"
        />
        <View style={styles.divider} />
        <ListItem
          detail="받은 초대 코드로 연결해요."
          icon={CalendarClock}
          onPress={() => router.push("/connections/invite")}
          title="초대 수락"
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCount: {
    ...typography.heading,
    color: colors.primaryDark,
  },
  summaryCopy: {
    ...typography.body,
    color: colors.textMuted,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
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
    paddingVertical: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  activeTripBlock: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  responseActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  responseButton: {
    flex: 1,
  },
  actionMessage: {
    ...typography.caption,
    color: colors.danger,
  },
});
