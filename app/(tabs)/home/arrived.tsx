import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { CheckCircle2, Clock3 } from "lucide-react-native";
import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";
import { getStatusDisplay } from "@/src/types";

export default function ArrivedScreen() {
  const status = getStatusDisplay("arrived_verified");

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <AppButton
            icon={Clock3}
            onPress={() => router.push("/history")}
            title="귀가 기록 보기"
          />
          <AppButton
            onPress={() => router.replace("/home")}
            title="홈으로"
            variant="secondary"
          />
        </View>
      }
    >
      <Card tone="success" style={styles.completeCard}>
        <View style={styles.check}>
          <CheckCircle2 color={colors.success} size={62} strokeWidth={2.2} />
        </View>
        <StatusChip label={status.label} tone={status.tone} />
        <Text style={styles.title}>왔어요</Text>
        <Text style={styles.copy}>
          도착을 확인했어요. 연결된 사람에게도 알려드릴게요.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  completeCard: {
    alignItems: "center",
    marginTop: spacing.xxxl,
    gap: spacing.lg,
  },
  check: {
    width: 118,
    height: 118,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  title: {
    ...typography.title,
    color: colors.success,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
});
