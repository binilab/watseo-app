import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Mail, MessageCircle } from "lucide-react-native";
import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import { colors, spacing, typography } from "@/src/theme/tokens";

export default function LoginScreen() {
  return (
    <Screen
      hasBottomTabs={false}
      footer={
        <View style={styles.footer}>
          <AppButton
            icon={MessageCircle}
            onPress={() => router.push("/role")}
            title="카카오로 계속하기"
          />
          <AppButton
            icon={Mail}
            onPress={() => router.push("/role")}
            title="이메일로 둘러보기"
            variant="secondary"
          />
        </View>
      }
    >
      <StatusChip label="계정 연결은 나중에 실제 기능으로 붙입니다" tone="neutral" />
      <View style={styles.header}>
        <Text style={styles.title}>왔어에 오신 걸 환영해요</Text>
        <Text style={styles.description}>
          지금은 UI 뼈대 단계라 로그인 버튼은 다음 화면으로 이동만 합니다.
        </Text>
      </View>

      <Card>
        <Text style={styles.cardTitle}>계정으로 준비될 기능</Text>
        <Text style={styles.item}>귀가 기록을 내 계정에 저장</Text>
        <Text style={styles.item}>연결된 사람과 알림 설정 동기화</Text>
        <Text style={styles.item}>등록한 도착 장소 관리</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.md,
    paddingTop: spacing.xxxl,
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
  item: {
    ...typography.body,
    color: colors.textMuted,
  },
});
