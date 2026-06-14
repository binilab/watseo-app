import { ComponentType, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

type AppButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: IconComponent;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  children?: ReactNode;
};

export function AppButton({
  title,
  onPress,
  variant = "primary",
  icon: Icon,
  disabled,
  loading,
  style,
}: AppButtonProps) {
  const isPrimary = variant === "primary";
  const foreground =
    variant === "primary" || variant === "danger" ? colors.white : colors.primaryDark;

  const inner = (
    <View style={styles.inner}>
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <>
          {Icon ? <Icon color={foreground} size={20} strokeWidth={2.5} /> : null}
          <Text style={[styles.text, { color: foreground }]}>{title}</Text>
        </>
      )}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.gradient}
        >
          {inner}
        </LinearGradient>
      ) : (
        inner
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
  },
  inner: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  text: {
    ...typography.label,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceMint,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
