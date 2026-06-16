import { ComponentType } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "lg" | "md" | "sm";

type AppButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconComponent;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

const FOREGROUND: Record<Variant, string> = {
  primary: colors.white,
  secondary: colors.primaryDark,
  ghost: colors.textMuted,
  danger: colors.white,
};

const HEIGHT: Record<Size, number> = {
  lg: 54,
  md: 48,
  sm: 40,
};

const ICON_SIZE: Record<Size, number> = {
  lg: 20,
  md: 19,
  sm: 17,
};

export function AppButton({
  title,
  onPress,
  variant = "primary",
  size = "lg",
  icon: Icon,
  disabled,
  loading,
  style,
}: AppButtonProps) {
  const foreground = FOREGROUND[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { minHeight: HEIGHT[size] },
        styles[variant],
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color={foreground} />
        ) : (
          <>
            {Icon ? (
              <Icon color={foreground} size={ICON_SIZE[size]} strokeWidth={2.5} />
            ) : null}
            <Text
              style={[
                size === "sm" ? styles.textSm : styles.text,
                { color: foreground },
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    overflow: "hidden",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  text: {
    ...typography.label,
    fontSize: 15,
  },
  textSm: {
    ...typography.label,
    fontSize: 13,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primarySoft,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
