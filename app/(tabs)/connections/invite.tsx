import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Check, Link2 } from "lucide-react-native";
import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

export default function InviteAcceptScreen() {
  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <AppButton
            icon={Check}
            onPress={() => router.replace("/connections")}
            title="연결 대시보드로 이동"
          />
          <AppButton
            onPress={() => router.push("/home")}
            title="홈으로 가기"
            variant="secondary"
          />
        </View>
      }
    >
      <Card tone="mint" style={styles.card}>
        <View style={styles.iconWrap}>
          <Link2 color={colors.primaryDark} size={46} strokeWidth={2.4} />
        </View>
        <StatusChip label="연결 초대 수락" tone="active" />
        <Text style={styles.title}>초대가 준비됐어요</Text>
        <Text style={styles.copy}>
          실제 딥링크와 수락 처리는 아직 연결하지 않았고, 초대 수락 완료 화면만 제공합니다.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  card: {
    alignItems: "center",
    marginTop: spacing.xxxl,
  },
  iconWrap: {
    width: 110,
    height: 110,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  title: {
    ...typography.title,
    color: colors.primaryDark,
    textAlign: "center",
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
});
