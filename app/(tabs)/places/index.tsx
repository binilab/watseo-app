import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Check, MapPin, Plus, QrCode, RotateCw } from "lucide-react-native";

import {
  AppButton,
  Card,
  EmptyState,
  PlaceCard,
  Screen,
  SectionHeader,
} from "@/src/components";
import { type Destination } from "@/src/features/destinations/api";
import { useDestinations } from "@/src/features/destinations/useDestinations";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

export default function PlacesScreen() {
  const {
    addDestination,
    creating,
    destinations,
    errorMessage,
    loading,
    refreshDestinations,
    renameDestination,
    refreshing,
    updatingId,
  } = useDestinations();
  const [newPlaceName, setNewPlaceName] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [editingName, setEditingName] = useState("");
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const trimmedNewPlaceName = newPlaceName.trim();
  const trimmedEditingName = editingName.trim();
  const primaryDestination = destinations[0] ?? null;
  const summaryCopy = useMemo(() => {
    if (loading) return "불러오는 중이에요.";
    if (destinations.length === 0) return "자주 가는 곳을 먼저 추가해 보세요.";
    return "상세 위치는 공유되지 않아요. 도착 상태와 알림만 전달돼요.";
  }, [destinations.length, loading]);

  const handleAddDestination = async () => {
    if (!trimmedNewPlaceName) {
      setFormMessage("장소 이름을 입력해 주세요");
      return;
    }

    const { data, error } = await addDestination(trimmedNewPlaceName);

    if (error) {
      setFormMessage("장소를 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
      return;
    }

    setNewPlaceName("");
    setSelectedDestination(data);
    setEditingName(data?.name ?? "");
    setFormMessage("장소를 추가했어요");
  };

  const handleSelectDestination = (destination: Destination) => {
    setSelectedDestination(destination);
    setEditingName(destination.name);
    setFormMessage(null);
  };

  const handleRenameDestination = async () => {
    if (!selectedDestination) return;

    if (!trimmedEditingName) {
      setFormMessage("이름을 입력해 주세요");
      return;
    }

    if (trimmedEditingName === selectedDestination.name) {
      setFormMessage("바뀐 이름이 없어요");
      return;
    }

    const { data, error } = await renameDestination(selectedDestination.id, trimmedEditingName);

    if (error) {
      setFormMessage("장소를 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
      return;
    }

    setSelectedDestination(data);
    setEditingName(data?.name ?? "");
    setFormMessage("이름을 바꿨어요");
  };

  const openQrCode = (destination: Destination | null) => {
    if (!destination) return;

    router.push({
      pathname: "/places/qr-code",
      params: { destinationId: destination.id },
    });
  };

  return (
    <Screen>
      <SectionHeader
        title="도착 장소"
        description="자주 도착하는 곳을 등록해요."
      />

      <Card tone="mint">
        <Text style={styles.summaryCount}>
          {loading ? "장소 확인 중" : `${destinations.length}개 장소`}
        </Text>
        <Text style={styles.summaryCopy}>{summaryCopy}</Text>
        <AppButton
          icon={QrCode}
          disabled={!primaryDestination}
          onPress={() => openQrCode(primaryDestination)}
          size="md"
          title="대표 장소 QR 보기"
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
            onPress={() => void refreshDestinations()}
            size="md"
            title="다시 시도"
            variant="secondary"
          />
        </Card>
      ) : null}

      <Card>
        <View style={styles.row}>
          <Text style={styles.cardTitle}>등록된 장소</Text>
          {refreshing ? <ActivityIndicator color={colors.primaryDark} /> : null}
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.copy}>불러오고 있어요.</Text>
          </View>
        ) : null}

        {!loading && destinations.length === 0 ? (
          <EmptyState
            description="장소 이름만 간단히 저장해요."
            icon={MapPin}
            title="아직 등록된 장소가 없어요"
          />
        ) : null}

        {!loading
          ? destinations.map((destination, index) => (
              <View key={destination.id}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <PlaceCard
                  name={destination.name}
                  onRename={() => handleSelectDestination(destination)}
                  onViewQr={() => openQrCode(destination)}
                  selected={selectedDestination?.id === destination.id}
                />
              </View>
            ))
          : null}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>새 도착 장소</Text>
        <TextInput
          autoCapitalize="none"
          onChangeText={setNewPlaceName}
          placeholder="예: 집, 회사, 학교"
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
          value={newPlaceName}
        />
        <AppButton
          disabled={!trimmedNewPlaceName}
          icon={Plus}
          loading={creating}
          onPress={handleAddDestination}
          title="장소 추가"
        />
        {formMessage ? <Text style={styles.message}>{formMessage}</Text> : null}
      </Card>

      {selectedDestination ? (
        <Card>
          <Text style={styles.cardTitle}>장소 이름 수정</Text>
          <Text style={styles.copy}>이름만 바꿀 수 있어요.</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setEditingName}
            placeholder="장소 이름"
            placeholderTextColor={colors.textSubtle}
            style={styles.input}
            value={editingName}
          />
          <AppButton
            disabled={!trimmedEditingName}
            icon={Check}
            loading={updatingId === selectedDestination.id}
            onPress={handleRenameDestination}
            title="이름 바꾸기"
          />
          <AppButton
            icon={QrCode}
            onPress={() => openQrCode(selectedDestination)}
            size="md"
            title="이 장소 QR 보기"
            variant="secondary"
          />
        </Card>
      ) : null}
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
  message: {
    ...typography.caption,
    color: colors.primaryDark,
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
});
