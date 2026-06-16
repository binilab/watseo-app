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

import { AppButton, Card, ListItem, Screen, SectionHeader } from "@/src/components";
import {
  type ConnectedPerson,
} from "@/src/features/connections/api";
import {
  createTripSession,
  fetchLatestActiveTrip,
  type Trip,
} from "@/src/features/trips/api";
import { useReturnSetupData } from "@/src/features/trips/useReturnSetupData";
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
        console.error("check active trip before return setup failed", error);
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
      setFormMessage("도착 장소를 먼저 선택해주세요.");
      return;
    }

    if (resolvedMinutes <= 0) {
      setFormMessage("예상 도착 시간을 확인해주세요.");
      return;
    }

    if (existingActiveTrip) {
      setFormMessage("진행 중인 귀가가 있어요. 기존 귀가 상황으로 이동합니다.");
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
        console.error("check active trip before create failed", activeTripResult.error);
        setFormMessage("진행 중인 귀가 확인에 실패했어요. 잠시 후 다시 시도해주세요.");
        return;
      }

      if (activeTripResult.data) {
        setExistingActiveTrip(activeTripResult.data);
        setFormMessage("진행 중인 귀가가 있어요. 기존 귀가 상황으로 이동합니다.");
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
        console.error("create trip failed", error, {
          destinationId: selectedDestination.id,
          recipientCount: selectedRecipients.length,
        });
        setFormMessage("귀가 세션을 시작하지 못했어요. 잠시 후 다시 시도해주세요.");
        return;
      }

      if (blockedTrip) {
        setExistingActiveTrip(blockedTrip);
        setFormMessage("진행 중인 귀가가 있어요. 기존 귀가 상황으로 이동합니다.");
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
      console.error("create trip failed", error, {
        destinationId: selectedDestination.id,
        recipientCount: selectedRecipients.length,
      });
      setFormMessage("귀가 세션을 시작하지 못했어요. 잠시 후 다시 시도해주세요.");
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
        description="도착 장소와 알림 받을 사람, 예상 도착 시간을 선택합니다."
      />

      {existingActiveTrip ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>진행 중인 귀가가 있어요</Text>
          <Text style={styles.copy}>
            v1에서는 한 번에 하나의 귀가만 진행할 수 있어요. 기존 귀가 상황으로 이동해주세요.
          </Text>
          <AppButton
            icon={Navigation}
            onPress={() =>
              router.replace({
                pathname: "/home/active",
                params: { tripId: existingActiveTrip.id },
              })
            }
            title="내 귀가 상황 보기"
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
            title="다시 불러오기"
            variant="secondary"
          />
        </Card>
      ) : null}

      <Card tone="mint">
        <View style={styles.row}>
          <Text style={styles.label}>도착 장소</Text>
          {loading ? <ActivityIndicator color={colors.primaryDark} /> : null}
        </View>

        {loading ? (
          <Text style={styles.copy}>도착 장소를 불러오고 있어요.</Text>
        ) : null}

        {!loading && destinations.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>먼저 도착 장소를 등록해주세요</Text>
            <Text style={styles.copy}>귀가 세션은 도착 인증에 사용할 장소가 필요해요.</Text>
            <AppButton
              icon={MapPin}
              onPress={() => router.push("/places")}
              title="도착 장소 등록"
              variant="secondary"
            />
          </View>
        ) : null}

        {!loading
          ? destinations.map((destination) => (
              <ListItem
                detail="도착 인증에 사용할 장소"
                icon={MapPin}
                key={destination.id}
                meta={selectedDestinationId === destination.id ? "선택됨" : "선택"}
                onPress={() => {
                  setSelectedDestinationId(destination.id);
                  setFormMessage(null);
                }}
                title={destination.name}
              />
            ))
          : null}
      </Card>

      <Card>
        <Text style={styles.label}>알림 받을 사람</Text>

        {!loading && connections.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>알림 받을 사람을 연결해주세요</Text>
            <Text style={styles.copy}>
              v1에서는 1명 이상 선택을 권장하지만, 테스트 편의를 위해 선택 없이도 시작할 수 있어요.
            </Text>
            <AppButton
              icon={UserRound}
              onPress={() => router.push("/connections")}
              title="연결 관리로 이동"
              variant="secondary"
            />
          </View>
        ) : null}

        {!loading
          ? connections.map((connection) => {
              const selected = selectedConnectionIds.includes(connection.relationship.id);

              return (
                <ListItem
                  detail="도착 인증 상태와 필요한 알림을 받을 수 있어요"
                  icon={UserRound}
                  key={connection.relationship.id}
                  meta={selected ? "선택됨" : "선택"}
                  onPress={() => toggleConnection(connection.relationship.id)}
                  title={getConnectionName(connection)}
                />
              );
            })
          : null}

        {!loading && connections.length > 0 && selectedConnectionIds.length === 0 ? (
          <Text style={styles.notice}>
            알림 받을 사람 선택을 권장하지만, 지금은 선택 없이 시작할 수 있어요.
          </Text>
        ) : null}
      </Card>

      <Card tone="warm">
        <Text style={styles.label}>예상 도착 시간</Text>
        <View style={styles.optionRow}>
          {ETA_OPTIONS.map((minutes) => (
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
                !customMinutes && selectedMinutes === minutes ? styles.timeOptionSelected : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text
                style={[
                  styles.timeOptionText,
                  !customMinutes && selectedMinutes === minutes
                    ? styles.timeOptionTextSelected
                    : null,
                ]}
              >
                {minutes}분
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          keyboardType="number-pad"
          onChangeText={(value) => {
            setCustomMinutes(value.replace(/[^0-9]/g, ""));
            setFormMessage(null);
          }}
          placeholder="직접 입력: 분"
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
          value={customMinutes}
        />
        <Text style={styles.time}>{formatExpectedArrival(resolvedMinutes)}</Text>
        <Text style={styles.copy}>
          상세 위치는 계속 공유되지 않고, 도착 인증 상태와 필요한 알림만 전달돼요.
        </Text>
      </Card>

      {formMessage ? <Text style={styles.message}>{formMessage}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.text,
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
  emptyBlock: {
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.label,
    color: colors.text,
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
    backgroundColor: colors.white,
  },
  timeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMint,
  },
  timeOptionText: {
    ...typography.caption,
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
    minHeight: 54,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    color: colors.text,
    paddingHorizontal: spacing.lg,
  },
  time: {
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
