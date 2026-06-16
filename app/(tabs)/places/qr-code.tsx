import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Copy, QrCode, RotateCw } from "lucide-react-native";

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

  return (
    <Screen>
      <SectionHeader
        title="QR 코드 생성 및 안내"
        description="선택한 도착 장소의 QR 토큰을 참조할 준비를 했습니다."
      />

      <Card tone="mint" style={styles.qrCard}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primaryDark} />
            <Text style={styles.copy}>도착 장소를 확인하고 있어요.</Text>
          </View>
        ) : (
          <>
            <View style={styles.qrBox}>
              <QrCode color={colors.primaryDark} size={118} strokeWidth={1.7} />
            </View>
            <StatusChip
              label={destination ? `${destination.name} · 도착 인증용` : "장소 선택 필요"}
              tone={destination ? "active" : "neutral"}
            />
            <Text style={styles.copy}>
              {destination
                ? "실제 QR 이미지는 다음 단계에서 이 장소의 토큰을 사용해 생성합니다."
                : "장소 목록에서 QR 코드를 볼 도착 장소를 선택해주세요."}
            </Text>
          </>
        )}
      </Card>

      {errorMessage ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>다시 확인이 필요해요</Text>
          <Text style={styles.copy}>{errorMessage}</Text>
          <AppButton
            icon={RotateCw}
            onPress={() => router.back()}
            title="장소 목록에서 다시 선택"
            variant="secondary"
          />
        </Card>
      ) : null}

      {destination ? (
        <Card>
          <Text style={styles.cardTitle}>연결된 QR 토큰</Text>
          <Text style={styles.token}>{destination.qr_token}</Text>
          <Text style={styles.copy}>앱에서 토큰을 직접 만들지 않고 DB 기본값을 사용합니다.</Text>
        </Card>
      ) : null}

      <Card>
        <Text style={styles.cardTitle}>설치 안내</Text>
        <Text style={styles.copy}>
          현관 안쪽이나 자주 보는 위치에 붙여두면 도착 확인 흐름을 빠르게 마칠 수 있어요.
        </Text>
        <AppButton
          icon={Copy}
          onPress={() => undefined}
          title="안내 문구 복사"
          variant="secondary"
        />
      </Card>

      <AppButton
        onPress={() => router.back()}
        title="장소 목록으로 돌아가기"
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
  qrBox: {
    width: 210,
    height: 210,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
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
  },
  backButton: {
    marginTop: spacing.sm,
  },
});
