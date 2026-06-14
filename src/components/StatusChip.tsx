import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

type StatusChipProps = {
  label: string;
  tone?: "active" | "pending" | "neutral" | "danger";
};

export function StatusChip({ label, tone = "neutral" }: StatusChipProps) {
  const dotStyles = {
    active: styles.activeDot,
    pending: styles.pendingDot,
    neutral: styles.neutralDot,
    danger: styles.dangerDot,
  };
  const textStyles = {
    active: styles.activeText,
    pending: styles.pendingText,
    neutral: styles.neutralText,
    danger: styles.dangerText,
  };

  return (
    <View style={[styles.chip, styles[tone]]}>
      <View style={[styles.dot, dotStyles[tone]]} />
      <Text style={[styles.label, textStyles[tone]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    minHeight: 32,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
  },
  label: {
    ...typography.caption,
  },
  active: {
    backgroundColor: colors.surfaceMint,
  },
  pending: {
    backgroundColor: colors.amberSoft,
  },
  neutral: {
    backgroundColor: colors.surfaceSoft,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  pendingDot: {
    backgroundColor: colors.amber,
  },
  neutralDot: {
    backgroundColor: colors.textSubtle,
  },
  dangerDot: {
    backgroundColor: colors.danger,
  },
  activeText: {
    color: colors.primaryDark,
  },
  pendingText: {
    color: colors.amber,
  },
  neutralText: {
    color: colors.textMuted,
  },
  dangerText: {
    color: colors.danger,
  },
});
