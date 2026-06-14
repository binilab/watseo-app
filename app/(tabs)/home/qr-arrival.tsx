import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { CheckCircle2, ScanLine } from "lucide-react-native";
import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

export default function QrArrivalScreen() {
  return (
    <Screen
      footer={
        <AppButton
          icon={CheckCircle2}
          onPress={() => router.push("/home/partial-verification")}
          title="스캔된 것처럼 다음으로"
        />
      }
    >
      <StatusChip label="카메라는 아직 연결하지 않음" tone="pending" />
      <View style={styles.header}>
        <Text style={styles.title}>QR 도착 인증</Text>
        <Text style={styles.description}>
          실제 스캔 대신, 등록된 장소의 QR을 인식하는 화면 형태만 구성했습니다.
        </Text>
      </View>

      <Card tone="blue" style={styles.scannerCard}>
        <View style={styles.scanBox}>
          <ScanLine color={colors.primaryDark} size={72} strokeWidth={1.8} />
        </View>
        <Text style={styles.scanText}>집 QR 코드를 화면 중앙에 맞춰주세요</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
  },
  scannerCard: {
    alignItems: "center",
    gap: spacing.xl,
  },
  scanBox: {
    width: 230,
    height: 230,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: colors.primarySoft,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  scanText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
});
