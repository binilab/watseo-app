import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Copy, MapPin, RotateCw } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";

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
  const qrCodeValue = destination?.qr_token ?? "";

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
          setErrorMessage("장소를 불러오지 못했어요.");
        } else {
          setDestination(data);
          setErrorMessage(null);
        }
      } catch {
        if (!mounted) return;
        setDestination(null);
        setErrorMessage("장소를 불러오지 못했어요.");
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
      await Clipboard.setStringAsync(qrCodeValue);
      setCopyMessage("복사했어요");
    } catch {
      setCopyMessage("복사가 안 됐어요. 코드를 직접 전달해 주세요");
    }
  };

  return (
    <Screen>
      <SectionHeader
        title="장소 QR 코드"
        description="장소에 붙여둘 QR 코드예요."
      />

      {!destinationId ? (
        <Card tone="warm">
          <Text style={styles.cardTitle}>먼저 장소를 선택해주세요</Text>
          <Text style={styles.copy}>
            장소 목록에서 먼저 골라주세요.
          </Text>
          <AppButton
            icon={MapPin}
            onPress={() => router.replace("/places")}
            title="장소 목록으로"
            variant="secondary"
          />
        </Card>
      ) : null}

      {destinationId ? (
        <Card tone="mint" style={styles.qrCard}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primaryDark} />
              <Text style={styles.copy}>잠깐만요, 확인하고 있어요.</Text>
            </View>
          ) : (
            <>
              <StatusChip
                label={destination ? `${destination.name} · 도착 확인용` : "장소 확인 필요"}
                tone={destination ? "active" : "neutral"}
              />
              <Text style={styles.copy}>
                {destination
                  ? "아래 QR 코드를 복사해 도착 확인에 쓸 수 있어요."
                  : "장소를 확인하지 못했어요."}
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
            title="장소 목록으로"
            variant="secondary"
          />
        </Card>
      ) : null}

      {destination ? (
        <Card style={styles.qrImageCard}>
          <Text style={styles.cardTitle}>{destination.name}</Text>
          <Text style={styles.copy}>장소에 붙여둘 QR 코드예요.</Text>
          <View style={styles.qrImageWrap}>
            <QRCode
              backgroundColor={colors.white}
              color={colors.text}
              quietZone={18}
              size={210}
              value={qrCodeValue}
            />
          </View>
          <Text style={styles.copy}>
            이 QR 코드를 장소에 붙여두면 도착 확인에 사용할 수 있어요.
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.codeScroller}
          >
            <Text selectable style={styles.codeValue}>{qrCodeValue}</Text>
          </ScrollView>
          <AppButton
            icon={Copy}
            onPress={handleCopyQrToken}
            title="코드 복사"
          />
          {copyMessage ? <Text style={styles.message}>{copyMessage}</Text> : null}
        </Card>
      ) : null}

      <AppButton
        onPress={() => router.replace("/places")}
        size="md"
        title="장소 목록으로"
        variant="ghost"
        style={styles.backButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  qrCard: {
    alignItems: "center",
  },
  qrImageCard: {
    alignItems: "center",
    gap: spacing.md,
  },
  qrImageWrap: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
  codeValue: {
    ...typography.caption,
    color: colors.primaryDark,
    fontFamily: "monospace",
    paddingVertical: spacing.sm,
  },
  codeScroller: {
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
