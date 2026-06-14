import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { UserPlus } from "lucide-react-native";
import { AppButton, Card, ListItem, Screen, SectionHeader } from "@/src/components";
import { connectedPeople, dashboardCards } from "@/src/data/mock";
import { colors, spacing, typography } from "@/src/theme/tokens";

export default function ConnectionsDashboardScreen() {
  return (
    <Screen>
      <SectionHeader
        title="연결 대시보드"
        description="도착 알림을 함께 확인할 사람과 초대 상태를 관리합니다."
      />

      <Card tone="mint">
        <Text style={styles.big}>2명 연결됨</Text>
        <Text style={styles.copy}>1명은 초대 수락을 기다리고 있어요.</Text>
        <AppButton
          icon={UserPlus}
          onPress={() => router.push("/connections/connect")}
          title="확인 상대 추가"
          variant="secondary"
        />
      </Card>

      <Card>
        {connectedPeople.map((person) => (
          <ListItem
            detail={person.status}
            key={person.name}
            meta={person.role}
            title={person.name}
          />
        ))}
      </Card>

      <Card tone="blue">
        {dashboardCards.map((item) => (
          <ListItem
            detail={item.detail}
            icon={item.icon}
            key={item.title}
            title={item.title}
          />
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  big: {
    ...typography.heading,
    color: colors.primaryDark,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
});
