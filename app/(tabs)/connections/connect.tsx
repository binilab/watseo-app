import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Link2, Send } from "lucide-react-native";
import { AppButton, Card, Screen, SectionHeader, StatusChip } from "@/src/components";
import { colors, spacing, typography } from "@/src/theme/tokens";

export default function ConnectPersonScreen() {
  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <AppButton
            icon={Send}
            onPress={() => router.push("/connections/invite")}
            title="초대 링크 만들기"
          />
          <AppButton
            onPress={() => router.back()}
            title="돌아가기"
            variant="secondary"
          />
        </View>
      }
    >
      <SectionHeader
        title="관계 연결"
        description="확인 상대나 알림 받을 사람을 초대하는 화면입니다."
      />

      <Card tone="mint">
        <Link2 color={colors.primaryDark} size={34} strokeWidth={2.3} />
        <Text style={styles.cardTitle}>초대 방식</Text>
        <Text style={styles.copy}>
          연락처 접근 없이 링크를 만들어 공유하는 형태의 UI만 구성했습니다.
        </Text>
      </Card>

      <Card>
        <StatusChip label="추천" tone="active" />
        <Text style={styles.cardTitle}>확인 상대로 연결</Text>
        <Text style={styles.copy}>귀가 상태와 도착 완료 알림을 받을 수 있습니다.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
  },
});
