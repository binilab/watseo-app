import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { HeartHandshake, ShieldCheck } from "lucide-react-native";
import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import { colors, spacing, typography } from "@/src/theme/tokens";

export default function OnboardingScreen() {
  return (
    <Screen
      hasBottomTabs={false}
      footer={
        <AppButton
          icon={HeartHandshake}
          onPress={() => router.push("/login")}
          title="왔어 시작하기"
        />
      }
    >
      <View style={styles.hero}>
        <View style={styles.mark}>
          <ShieldCheck color={colors.primaryDark} size={42} strokeWidth={2.5} />
        </View>
        <StatusChip label="부드러운 도착 확인" tone="active" />
        <Text style={styles.title}>도착했다는 말이 가장 편하게 닿도록</Text>
        <Text style={styles.description}>
          왔어는 귀가 시작부터 도착 확인까지 연결된 사람과 부드럽게 상태를 나누는 앱입니다.
        </Text>
      </View>

      <Card tone="mint">
        <Text style={styles.cardTitle}>오늘 밤의 흐름</Text>
        <View style={styles.steps}>
          <Text style={styles.step}>1. 도착지를 고르고 귀가를 시작해요.</Text>
          <Text style={styles.step}>2. 확인 상대가 진행 상태를 볼 수 있어요.</Text>
          <Text style={styles.step}>3. 도착하면 버튼이나 QR로 완료해요.</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.lg,
    paddingTop: 56,
  },
  mark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMint,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  steps: {
    gap: spacing.sm,
  },
  step: {
    ...typography.body,
    color: colors.textMuted,
  },
});
