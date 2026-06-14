import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Clock3, Send } from "lucide-react-native";
import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import { colors, spacing, typography } from "@/src/theme/tokens";
import { getStatusDisplay } from "@/src/types";

export default function TimeExtensionScreen() {
  const status = getStatusDisplay("extension_requested");

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <AppButton
            icon={Send}
            onPress={() => router.push("/home/active")}
            title="연장 요청 보내기"
          />
          <AppButton
            onPress={() => router.back()}
            title="돌아가기"
            variant="secondary"
          />
        </View>
      }
    >
      <StatusChip label={status.label} tone={status.tone} />
      <Text style={styles.title}>조금 늦어질 것 같아요</Text>
      <Text style={styles.copy}>
        실제 알림 전송 없이, 확인 상대에게 도착 시간이 늦어진다는 메시지를 보내는 화면입니다.
      </Text>

      <Card tone="warm">
        <Clock3 color={colors.amber} size={34} strokeWidth={2.4} />
        <Text style={styles.cardTitle}>새 예상 도착 시간</Text>
        <Text style={styles.time}>22:45</Text>
        <Text style={styles.copy}>기존 예상 시간보다 15분 연장</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>메시지 미리보기</Text>
        <Text style={styles.copy}>“도착 시간이 조금 늦어져요. 22:45쯤 도착할 예정이에요.”</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  time: {
    ...typography.title,
    color: colors.amber,
  },
});
