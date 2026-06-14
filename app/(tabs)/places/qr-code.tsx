import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Copy, QrCode } from "lucide-react-native";
import { AppButton, Card, Screen, SectionHeader, StatusChip } from "@/src/components";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

export default function PlaceQrCodeScreen() {
  return (
    <Screen>
      <SectionHeader
        title="QR 코드 생성 및 안내"
        description="실제 QR 생성 없이, 도착 장소에 붙일 안내 화면만 구성했습니다."
      />

      <Card tone="mint" style={styles.qrCard}>
        <View style={styles.qrBox}>
          <QrCode color={colors.primaryDark} size={118} strokeWidth={1.7} />
        </View>
        <StatusChip label="집 · 도착 인증용" tone="active" />
        <Text style={styles.copy}>이 QR은 목업입니다. 실제 토큰 생성은 나중에 연결합니다.</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>설치 안내</Text>
        <Text style={styles.copy}>현관 안쪽이나 자주 보는 위치에 붙여두면 도착 확인 흐름을 빠르게 마칠 수 있어요.</Text>
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
  backButton: {
    marginTop: spacing.sm,
  },
});
