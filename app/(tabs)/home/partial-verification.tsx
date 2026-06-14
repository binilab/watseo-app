import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import { colors, spacing, typography } from "@/src/theme/tokens";

export default function PartialVerificationScreen() {
  return (
    <Screen
      footer={
        <AppButton
          icon={CheckCircle2}
          onPress={() => router.push("/home/arrived")}
          title="도착 완료 처리"
        />
      }
    >
      <StatusChip label="부분 인증" tone="pending" />
      <Text style={styles.title}>QR은 확인됐고, 마지막 확인만 남았어요</Text>

      <Card tone="warm">
        <Text style={styles.cardTitle}>확인된 내용</Text>
        <Text style={styles.copy}>장소: 집</Text>
        <Text style={styles.copy}>시간: 22:18</Text>
        <Text style={styles.copy}>방식: QR 도착 인증</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>알림 예정</Text>
        <Text style={styles.copy}>
          연결된 사람 2명에게 도착 확인 알림이 표시되는 화면입니다.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.text,
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
