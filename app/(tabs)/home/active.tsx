import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Clock3, QrCode } from "lucide-react-native";
import { AppButton, Card, ListItem, Screen, StatusChip } from "@/src/components";
import { activeTimeline } from "@/src/data/mock";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";
import { getStatusDisplay } from "@/src/types";

export default function ActiveReturnScreen() {
  const status = getStatusDisplay("on_the_way");

  return (
    <Screen>
      <Card tone="mint" style={styles.hero}>
        <StatusChip label={status.label} tone={status.tone} />
        <View style={styles.ring}>
          <Text style={styles.eta}>18분</Text>
          <Text style={styles.etaLabel}>예상 남은 시간</Text>
        </View>
        <Text style={styles.description}>
          상세 위치는 계속 공유되지 않고, 도착 인증 상태와 필요한 알림만 전달돼요.
        </Text>
      </Card>

      <Card>
        {activeTimeline.map((item) => (
          <ListItem
            detail={item.detail}
            icon={item.icon}
            key={item.title}
            title={item.title}
          />
        ))}
      </Card>

      <View style={styles.actions}>
        <AppButton
          icon={QrCode}
          onPress={() => router.push("/home/qr-arrival")}
          title="QR로 도착 인증"
        />
        <AppButton
          icon={Clock3}
          onPress={() => router.push("/home/time-extension")}
          title="시간 연장 요청"
          variant="secondary"
        />
        <AppButton
          onPress={() => router.push("/home/help-request")}
          title="도움 요청 화면 보기"
          variant="ghost"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  ring: {
    width: 204,
    height: 204,
    borderRadius: 102,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 13,
    borderColor: colors.primarySoft,
  },
  eta: {
    ...typography.title,
    color: colors.primaryDark,
  },
  etaLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  actions: {
    gap: spacing.md,
  },
});
