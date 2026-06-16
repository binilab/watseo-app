import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MapPin, Navigation, RotateCw, UserRound } from "lucide-react-native";

import {
  AppButton,
  Card,
  EmptyState,
  ListItem,
  Screen,
  SectionHeader,
} from "@/src/components";
import { type ConnectedPerson } from "@/src/features/connections/api";
import {
  createTripSession,
  fetchLatestActiveTrip,
  type Trip,
} from "@/src/features/trips/api";
import { useReturnSetupData } from "@/src/features/trips/useReturnSetupData";
import { logFriendlyError } from "@/src/lib/friendlyAlert";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

const ETA_OPTIONS = [20, 30, 45, 60];

function getConnectedProfileId(connection: ConnectedPerson, userId: string) {
  return connection.relationship.requester_id === userId
    ? connection.relationship.recipient_id
    : connection.relationship.requester_id;
}

function getConnectionName(connection: ConnectedPerson) {
  return connection.profile?.display_name ?? "연결된 사람";
}

function formatExpectedArrival(minutesFromNow: number) {
  const arrival = new Date(Date.now() + minutesFromNow * 60 * 1000);

  return arrival.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StepLabel({ step, title }: { step: number; title: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepNumber}>{step}</Text>
      </View>
      <Text style={styles.stepTitle}>{title}</Text>
    </View>
  );
}

export default function ReturnSetupScreen() {
  const {
    connections,
    destinations,
    errorMessage,
    loading,
    refreshSetupData,
    refreshing,
    userId,
  } = useReturnSetupData();
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<string[]>([]);
  const [selectedMinutes, setSelectedMinutes] = useState(30);
  const [customMinutes, setCustomMinutes] = useState("");
  const [starting, setStarting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [existingActiveTrip, setExistingActiveTrip] = useState<Trip | null>(null);

  useEffect(() => {
    if (!selectedDestinationId && destinations[0]) {
      setSelectedDestinationId(destinations[0].id);
    }
  }, [destinations, selectedDestinationId]);

  useEffect(() => {
    let mounted = true;

    async function loadExistingActiveTrip() {
      if (!userId) {
        setExistingActiveTrip(null);
        return;
      }

      const { data, error } = await fetchLatestActiveTrip(userId);

      if (!mounted) return;

      if (error) {
        logFriendlyError("진행 중인 귀가 확인", error);
        return;
      }

      setExistingActiveTrip(data ?? null);
    }

    void loadExistingActiveTrip();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const selectedDestination = destinations.find(
    (destination) => destination.id === selectedDestinationId,
  );
  const resolvedMinutes = useMemo(() => {
    const parsed = Number(customMinutes);

    if (customMinutes.trim() && Number.isFinite(parsed) && parsed > 0) {
      return Math.floor(parsed);
    }

    return selectedMinutes;
  }, [customMinutes, selectedMinutes]);
  const canStart = Boolean(
    userId
      && selectedDestination
      && resolvedMinutes > 0
      && selectedConnectionIds.length > 0
      && !starting
      && !existingActiveTrip,
  );

  const toggleConnection = (relationshipId: string) => {
    setSelectedConnectionIds((current) =>
      current.includes(relationshipId)
        ? current.filter((id) => id !== relationshipId)
        : [...current, relationshipId],
    );
    setFormMessage(null);
  };

  const handleStartTrip = async () => {
    if (!userId || !selectedDestination) {
      setFormMessage("어디로 가는지 선택해 주세요.");
      return;
    }

    if (resolvedMinutes <= 0) {
      setFormMessage("도착 예정 시간을 선택해 주세요.");
      return;
    }

    if (selectedConnectionIds.length === 0) {
      setFormMessage("누구에게 알려줄지 골라주세요.");
      return;
    }

    if (existingActiveTrip) {
      setFormMessage("이미 진행 중인 귀가가 있어요.");
      router.replace({
        pathname: "/home/active",
        params: { tripId: existingActiveTrip.id },
      });
      return;
    }

    const startedAt = new Date();
    const expectedArrivalAt = new Date(
      startedAt.getTime() + resolvedMinutes * 60 * 1000,
    );
    const selectedRecipients = connections
      .filter((connection) => selectedConnectionIds.includes(connection.relationship.id))
      .map((connection) => ({
        relationshipId: connection.relationship.id,
        recipientId: getConnectedProfileId(connection, userId),
      }));

    setStarting(true);
    setFormMessage(null);

    try {
      const activeTripResult = await fetchLatestActiveTrip(userId);

      if (activeTripResult.error) {
        logFriendlyError("귀가 시작 전 확인", activeTripResult.error);
        setFormMessage("귀가를 시작하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
        return;
      }

      if (activeTripResult.data) {
        setExistingActiveTrip(activeTripResult.data);
        setFormMessage("이미 진행 중인 귀가가 있어요.");
        router.replace({
          pathname: "/home/active",
          params: { tripId: activeTripResult.data.id },
        });
        return;
      }

      const { data, error, recipientError, existingActiveTrip: blockedTrip } = await createTripSession({
        destinationName: selectedDestination.name,
        ownerId: userId,
        destinationId: selectedDestination.id,
        expectedArrivalAt: expectedArrivalAt.toISOString(),
        startedAt: startedAt.toISOString(),
        recipients: selectedRecipients,
      });

      if (error || !data) {
        logFriendlyError("귀가 시작 확인", error, {
          destinationId: selectedDestination.id,
          selectedCount: selectedRecipients.length,
        });
        setFormMessage("귀가를 시작하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
        return;
      }

      if (blockedTrip) {
        setExistingActiveTrip(blockedTrip);
        setFormMessage("이미 진행 중인 귀가가 있어요.");
        router.replace({
          pathname: "/home/active",
          params: { tripId: blockedTrip.id },
        });
        return;
      }

      router.replace({
        pathname: "/home/active",
        params: {
          tripId: data.trip.id,
          recipientStatus: recipientError ? "failed" : "saved",
        },
      });
    } catch (error) {
      logFriendlyError("귀가 시작 확인", error, {
        destinationId: selectedDestination.id,
        selectedCount: selectedRecipients.length,
      });
      setFormMessage("귀가를 시작하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
    } finally {
      setStarting(false);
    }
  };

  return (
    <Screen
      footer={
        <AppButton
          disabled={!canStart}
          icon={Navigation}
          loading={starting}
          onPress={handleStartTrip}
          title="귀가 시작하기"
        />
      }
    >
      <SectionHeader
        title="귀가 설정"
        description="어디로, 누구에게, 언제쯤인지 골라주세요."
      />

      {existingActiveTrip ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>이미 귀가 중이에요</Text>
          <Text style={styles.copy}>
            한 번에 하나만 할 수 있어요.
          </Text>
          <AppButton
            icon={Navigation}
            onPress={() =>
              router.replace({
                pathname: "/home/active",
                params: { tripId: existingActiveTrip.id },
              })
            }
            size="md"
            title="내 귀가 보기"
            variant="secondary"
          />
        </Card>
      ) : null}

      {errorMessage ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>다시 확인이 필요해요</Text>
          <Text style={styles.copy}>{errorMessage}</Text>
          <AppButton
            icon={RotateCw}
            loading={refreshing}
            onPress={() => void refreshSetupData()}
            size="md"
            title="다시 시도"
            variant="secondary"
          />
        </Card>
      ) : null}

      <Card>
        <StepLabel step={1} title="어디로 가고 있나요?" />

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.copy}>도착 장소를 불러오고 있어요.</Text>
          </View>
        ) : null}

        {!loading && destinations.length === 0 ? (
          <EmptyState
            actionLabel="도착 장소 등록"
            description="도착을 확인할 장소가 필요해요."
            icon={MapPin}
            onActionPress={() => router.push("/places")}
            title="도착 장소를 먼저 등록해요"
          />
        ) : null}

        {!loading
          ? destinations.map((destination) => (
              <ListItem
                detail="도착을 확인할 장소"
                icon={MapPin}
                key={destination.id}
                onPress={() => {
                  setSelectedDestinationId(destination.id);
                  setFormMessage(null);
                }}
                selected={selectedDestinationId === destination.id}
                title={destination.name}
              />
            ))
          : null}
      </Card>

      <Card>
        <StepLabel step={2} title="누구에게 알려줄까요?" />

        {!loading && connections.length === 0 ? (
          <EmptyState
            actionLabel="연결하러 가기"
            description="알림 받을 사람이 한 명 이상 필요해요."
            icon={UserRound}
            onActionPress={() => router.push("/connections")}
            title="알림 받을 사람을 연결해요"
          />
        ) : null}

        {!loading
          ? connections.map((connection) => {
              const selected = selectedConnectionIds.includes(connection.relationship.id);

              return (
                <ListItem
                  detail="도착 상태와 알림을 받아요"
                  icon={UserRound}
                  key={connection.relationship.id}
                  onPress={() => toggleConnection(connection.relationship.id)}
                  selected={selected}
                  title={getConnectionName(connection)}
                />
              );
            })
          : null}

        {!loading && connections.length > 0 && selectedConnectionIds.length === 0 ? (
          <Text style={styles.notice}>
            한 명 이상 골라야 시작할 수 있어요.
          </Text>
        ) : null}
      </Card>

      <Card>
        <StepLabel step={3} title="언제쯤 도착하나요?" />
        <View style={styles.optionRow}>
          {ETA_OPTIONS.map((minutes) => {
            const selected = !customMinutes && selectedMinutes === minutes;

            return (
              <Pressable
                accessibilityRole="button"
                key={minutes}
                onPress={() => {
                  setSelectedMinutes(minutes);
                  setCustomMinutes("");
                  setFormMessage(null);
                }}
                style={({ pressed }) => [
                  styles.timeOption,
                  selected ? styles.timeOptionSelected : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    selected ? styles.timeOptionTextSelected : null,
                  ]}
                >
                  {minutes}분
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          keyboardType="number-pad"
          onChangeText={(value) => {
            setCustomMinutes(value.replace(/[^0-9]/g, ""));
            setFormMessage(null);
          }}
          placeholder="직접 입력 (분)"
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
          value={customMinutes}
        />
        <View style={styles.arrivalRow}>
          <Text style={styles.arrivalLabel}>도착 예정</Text>
          <Text style={styles.arrivalTime}>{formatExpectedArrival(resolvedMinutes)}</Text>
        </View>
        <Text style={styles.copy}>
          상세 위치는 공유되지 않아요. 도착 상태와 알림만 전달돼요.
        </Text>
      </Card>

      {formMessage ? <Text style={styles.message}>{formMessage}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  stepNumber: {
    ...typography.micro,
    color: colors.white,
  },
  stepTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  loadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeOption: {
    minHeight: 42,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  timeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMint,
  },
  timeOptionText: {
    ...typography.label,
    color: colors.textMuted,
  },
  timeOptionTextSelected: {
    color: colors.primaryDark,
  },
  pressed: {
    opacity: 0.68,
  },
  input: {
    ...typography.body,
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    color: colors.text,
    paddingHorizontal: spacing.lg,
  },
  arrivalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  arrivalLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  arrivalTime: {
    ...typography.title,
    color: colors.primaryDark,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
  },
  notice: {
    ...typography.caption,
    color: colors.amber,
  },
  message: {
    ...typography.caption,
    color: colors.danger,
    textAlign: "center",
  },
});
