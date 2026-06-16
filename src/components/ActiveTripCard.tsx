import { ComponentType } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "./AppButton";
import { Card } from "./Card";
import { StatusChip } from "./StatusChip";
import type { StatusTone } from "@/src/types";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

type ActiveTripCardProps = {
  icon: IconComponent;
  tone?: "blue" | "warm";
  statusLabel: string;
  statusTone: StatusTone;
  title: string;
  detail: string;
  actionLabel: string;
  actionIcon?: IconComponent;
  onPress: () => void;
};

export function ActiveTripCard({
  icon: Icon,
  tone = "blue",
  statusLabel,
  statusTone,
  title,
  detail,
  actionLabel,
  actionIcon,
  onPress,
}: ActiveTripCardProps) {
  const accent = tone === "warm" ? colors.warning : colors.primary;

  return (
    <Card tone={tone} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon color={accent} size={26} strokeWidth={2.4} />
        </View>
        <View style={styles.copy}>
          <StatusChip label={statusLabel} tone={statusTone} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.detail}>{detail}</Text>
        </View>
      </View>
      <AppButton icon={actionIcon} onPress={onPress} title={actionLabel} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.subheading,
    color: colors.text,
  },
  detail: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
  },
});
