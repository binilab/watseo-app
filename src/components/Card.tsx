import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, radius, shadows, spacing } from "@/src/theme/tokens";

type CardProps = {
  children: ReactNode;
  tone?: "plain" | "mint" | "warm" | "blue";
  style?: ViewStyle;
};

export function Card({ children, tone = "plain", style }: CardProps) {
  return <View style={[styles.card, styles[tone], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  plain: {
    backgroundColor: colors.surface,
  },
  mint: {
    backgroundColor: colors.surfaceMint,
  },
  warm: {
    backgroundColor: colors.surfaceWarm,
  },
  blue: {
    backgroundColor: colors.surfaceBlue,
  },
});
