import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { MessageCircleWarning, Phone } from "lucide-react-native";
import { AppButton, Card, ListItem, Screen, StatusChip } from "@/src/components";
import { alertRecipients } from "@/src/data/mock";
import { colors, spacing, typography } from "@/src/theme/tokens";
import { getStatusDisplay } from "@/src/types";

export default function HelpRequestScreen() {
  const status = getStatusDisplay("emergency_requested");

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <AppButton
            icon={MessageCircleWarning}
            onPress={() => router.push("/home/active")}
            title="도움 요청 확인"
            variant="danger"
          />
          <AppButton
            onPress={() => router.back()}
            title="취소"
            variant="secondary"
          />
        </View>
      }
    >
      <StatusChip label={status.label} tone={status.tone} />
      <Text style={styles.title}>연결된 사람에게 지금 상황을 알릴까요?</Text>
      <Text style={styles.copy}>
        실제 긴급 신고나 메시지 전송은 구현하지 않았습니다. 요청 전 확인 UI만 구성했습니다.
      </Text>

      <Card tone="warm">
        <Text style={styles.cardTitle}>알림 받을 사람</Text>
        {alertRecipients.map((person) => (
          <ListItem
            detail={person.role}
            icon={Phone}
            key={person.name}
            title={person.name}
          />
        ))}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>전송될 내용</Text>
        <Text style={styles.copy}>현재 귀가 상태, 마지막 확인 시간, 선택한 도착지가 포함될 예정입니다.</Text>
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
});
