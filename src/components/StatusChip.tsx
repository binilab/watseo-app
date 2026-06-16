import { StyleSheet, Text, View } from "react-native";
import type { StatusTone } from "@/src/types";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

type StatusChipProps = {
  label: string;
  tone?: StatusTone;
};

const DOT_COLOR: Record<StatusTone, string> = {
  active: colors.primary,
  success: colors.success,
  pending: colors.warning,
  neutral: colors.textSubtle,
  danger: colors.danger,
};

const BG: Record<StatusTone, string> = {
  active: colors.primarySoft,
  success: colors.successSoft,
  pending: colors.warningSoft,
  neutral: colors.surfaceSoft,
  danger: colors.dangerSoft,
};

const TEXT_COLOR: Record<StatusTone, string> = {
  active: colors.primaryDark,
  success: "#0E7A4E",
  pending: "#9A6308",
  neutral: colors.textMuted,
  danger: "#C0322B",
};

export function StatusChip({ label, tone = "neutral" }: StatusChipProps) {
  return (
    <View style={[styles.chip, { backgroundColor: BG[tone] }]}>
      <View style={[styles.dot, { backgroundColor: DOT_COLOR[tone] }]} />
      <Text style={[styles.label, { color: TEXT_COLOR[tone] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    minHeight: 26,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
  },
  label: {
    ...typography.micro,
  },
});
