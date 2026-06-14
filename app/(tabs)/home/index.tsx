import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { MapPin, Navigation, QrCode } from "lucide-react-native";
import {
  AppButton,
  Card,
  ListItem,
  Screen,
  SectionHeader,
  StatusChip,
} from "@/src/components";
import { currentTrip, defaultPlace, homeMetrics, quickActions } from "@/src/data/mock";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";
import { getStatusDisplay } from "@/src/types";

export default function HomeScreen() {
  const status = getStatusDisplay(currentTrip.state);

  return (
    <Screen>
      <View style={styles.header}>
        <StatusChip label={status.label} tone={status.tone} />
        <Text style={styles.title}>오늘도 편하게 도착을 알려요</Text>
        <Text style={styles.description}>
          도착지와 확인 상대를 고른 뒤 귀가를 시작할 수 있어요.
        </Text>
      </View>

      <Card tone="mint" style={styles.primaryCard}>
        <View style={styles.destinationRow}>
          <View style={styles.destinationIcon}>
            <MapPin color={colors.primaryDark} size={28} strokeWidth={2.5} />
          </View>
          <View style={styles.destinationCopy}>
            <Text style={styles.cardTitle}>기본 도착지</Text>
            <Text style={styles.muted}>
              {defaultPlace.title} · {defaultPlace.address}
            </Text>
          </View>
        </View>
        <AppButton
          icon={Navigation}
          onPress={() => router.push("/home/return-setup")}
          title="귀가 설정하기"
        />
      </Card>

      <View style={styles.metrics}>
        {homeMetrics.map((item) => (
          <Card key={item.label} style={styles.metricCard}>
            <Text style={styles.metricValue}>{item.value}</Text>
            <Text style={styles.metricLabel}>{item.label}</Text>
          </Card>
        ))}
      </View>

      <SectionHeader title="빠른 이동" />
      <Card>
        {quickActions.map((item) => (
          <ListItem
            detail={item.detail}
            icon={item.icon}
            key={item.title}
            onPress={() => {
              if (item.route) router.push(item.route);
            }}
            title={item.title}
          />
        ))}
      </Card>

      <AppButton
        icon={QrCode}
        onPress={() => router.push("/places/qr-code")}
        title="도착 QR 보기"
        variant="secondary"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
  },
  destinationRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  destinationIcon: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  destinationCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  primaryCard: {
    gap: spacing.lg,
  },
  metricCard: {
    flex: 1,
    padding: spacing.md,
  },
  metricValue: {
    ...typography.subheading,
    color: colors.primaryDark,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
