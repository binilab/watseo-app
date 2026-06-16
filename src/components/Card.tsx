import { ReactNode } from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radius, shadows, spacing } from "@/src/theme/tokens";

type CardTone = "plain" | "mint" | "warm" | "blue" | "danger" | "success" | "soft";

type CardProps = {
  children: ReactNode;
  tone?: CardTone;
  padded?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function Card({
  children,
  tone = "plain",
  padded = true,
  onPress,
  style,
}: CardProps) {
  const cardStyle = [
    styles.card,
    padded ? styles.padded : null,
    styles[tone],
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed ? styles.pressed : null]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  padded: {
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  plain: {
    backgroundColor: colors.surface,
  },
  soft: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
  },
  mint: {
    backgroundColor: colors.primarySoft,
    borderColor: "transparent",
  },
  blue: {
    backgroundColor: colors.primarySoft,
    borderColor: "transparent",
  },
  warm: {
    backgroundColor: colors.warningSoft,
    borderColor: "transparent",
  },
  success: {
    backgroundColor: colors.successSoft,
    borderColor: "transparent",
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: "transparent",
  },
});
