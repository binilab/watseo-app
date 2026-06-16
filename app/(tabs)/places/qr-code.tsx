import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Copy, MapPin, RotateCw } from "lucide-react-native";

import { AppButton, Card, Screen, SectionHeader, StatusChip } from "@/src/components";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import {
  fetchDestinationById,
  type Destination,
} from "@/src/features/destinations/api";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

export default function PlaceQrCodeScreen() {
  const { destinationId } = useLocalSearchParams<{ destinationId?: string }>();
  const { user } = useAuthSession();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(Boolean(destinationId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDestination() {
      if (!destinationId) {
        setDestination(null);
        setLoading(false);
        setErrorMessage(null);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await fetchDestinationById(destinationId, user?.id);

        if (!mounted) return;

        if (error || !data) {
          setDestination(null);
          setErrorMessage("선택한 도착 장소를 불러오지 못했어요.");
        } else {
          setDestination(data);
          setErrorMessage(null);
        }
      } catch {
        if (!mounted) return;
        setDestination(null);
        setErrorMessage("선택한 도착 장소를 불러오지 못했어요.");
      }
      setLoading(false);
    }

    void loadDestination();

    return () => {
      mounted = false;
    };
  }, [destinationId, user?.id]);

  const handleCopyQrToken = async () => {
    if (!destination) return;

    try {
      await Clipboard.setStringAsync(destination.qr_token);
      setCopyMessage("QR 코드 값을 복사했어요.");
    } catch {
      setCopyMessage("복사하지 못했어요. QR 코드 값을 직접 전달해주세요.");
    }
  };

  return (
    <Screen>
      <SectionHeader
        title="장소 QR 코드 값"
        description="선택한 도착 장소의 QR token을 확인하고 복사합니다."
      />

      {!destinationId ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>먼저 장소를 선택해주세요</Text>
          <Text style={styles.copy}>
            먼저 장소 목록에서 QR을 볼 장소를 선택해주세요.
          </Text>
          <AppButton
            icon={MapPin}
            onPress={() => router.replace("/places")}
            title="장소 목록으로 이동"
            variant="secondary"
          />
        </Card>
      ) : null}

      {destinationId ? (
        <Card tone="mint" style={styles.qrCard}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primaryDark} />
              <Text style={styles.copy}>도착 장소를 확인하고 있어요.</Text>
            </View>
          ) : (
            <>
              <StatusChip
                label={destination ? `${destination.name} · 도착 인증용` : "장소 확인 필요"}
                tone={destination ? "active" : "neutral"}
              />
              <Text style={styles.copy}>
                {destination
                  ? "아래 QR 코드 값을 복사해 도착 인증 테스트에 사용할 수 있어요."
                  : "선택한 장소 정보를 확인하지 못했어요."}
              </Text>
            </>
          )}
        </Card>
      ) : null}

      {errorMessage ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>다시 확인이 필요해요</Text>
          <Text style={styles.copy}>{errorMessage}</Text>
          <AppButton
            icon={RotateCw}
            onPress={() => router.replace("/places")}
            title="장소 목록으로 이동"
            variant="secondary"
          />
        </Card>
      ) : null}

      {destination ? (
        <Card>
          <Text style={styles.cardTitle}>{destination.name}</Text>
          <Text style={styles.copy}>이 장소의 QR 코드 값입니다.</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tokenScroller}
          >
            <Text selectable style={styles.token}>{destination.qr_token}</Text>
          </ScrollView>
          <AppButton
            icon={Copy}
            onPress={handleCopyQrToken}
            title="QR 코드 값 복사"
            variant="secondary"
          />
          {copyMessage ? <Text style={styles.message}>{copyMessage}</Text> : null}
        </Card>
      ) : null}

      {destination ? (
        <Card>
        <Text style={styles.cardTitle}>설치 안내</Text>
        <Text style={styles.copy}>
          실제 QR 이미지는 아직 생성하지 않습니다. 테스트 중에는 이 값을 복사해 QR 도착 인증 화면에 붙여넣어주세요.
        </Text>
        </Card>
      ) : null}

      <AppButton
        onPress={() => router.replace("/places")}
        title="장소 목록으로 이동"
        variant="secondary"
        style={styles.backButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  qrCard: {
    alignItems: "center",
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  loadingBox: {
    minHeight: 210,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  token: {
    ...typography.caption,
    color: colors.primaryDark,
    fontFamily: "monospace",
    paddingVertical: spacing.sm,
  },
  tokenScroller: {
    maxWidth: "100%",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },
  message: {
    ...typography.caption,
    color: colors.primaryDark,
    textAlign: "center",
  },
  backButton: {
    marginTop: spacing.sm,
  },
});
