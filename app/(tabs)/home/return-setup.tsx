import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Navigation } from "lucide-react-native";
import { AppButton, Card, ListItem, Screen, SectionHeader } from "@/src/components";
import { alertRecipients, arrivalPlaces, currentTrip } from "@/src/data/mock";
import { colors, spacing, typography } from "@/src/theme/tokens";

export default function ReturnSetupScreen() {
  return (
    <Screen
      footer={
        <AppButton
          icon={Navigation}
          onPress={() => router.push("/home/active")}
          title="귀가 시작하기"
        />
      }
    >
      <SectionHeader
        title="귀가 설정"
        description="더미 데이터로 도착지, 확인 상대, 예상 시간을 선택한 화면입니다."
      />

      <Card tone="mint">
        <Text style={styles.label}>도착지</Text>
        {arrivalPlaces.slice(0, 2).map((place) => (
          <ListItem
            detail={place.address}
            key={place.title}
            meta={place.tag}
            title={place.title}
          />
        ))}
      </Card>

      <Card>
        <Text style={styles.label}>알림 받을 사람</Text>
        {alertRecipients.map((person) => (
          <ListItem
            detail={person.status}
            key={person.name}
            meta={person.role}
            title={person.name}
          />
        ))}
      </Card>

      <Card tone="warm">
        <View style={styles.timeRow}>
          <Text style={styles.time}>{currentTrip.expectedArrival ?? "-"}</Text>
          <Text style={styles.copy}>
            상세 위치는 계속 공유되지 않고, 도착 인증 상태와 필요한 알림만 전달돼요.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.text,
  },
  timeRow: {
    gap: spacing.sm,
  },
  time: {
    ...typography.title,
    color: colors.primaryDark,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
  },
});
