import { ComponentType } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

type ListItemProps = {
  title: string;
  detail?: string;
  meta?: string;
  icon?: IconComponent;
  onPress?: () => void;
};

export function ListItem({ title, detail, meta, icon: Icon, onPress }: ListItemProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        pressed ? styles.pressed : null,
      ]}
    >
      {Icon ? (
        <View style={styles.iconWrap}>
          <Icon color={colors.primaryDark} size={22} strokeWidth={2.5} />
        </View>
      ) : null}
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      {onPress ? <ChevronRight color={colors.textSubtle} size={18} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.68,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMint,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.label,
    color: colors.text,
  },
  detail: {
    ...typography.caption,
    color: colors.textMuted,
  },
  meta: {
    ...typography.caption,
    color: colors.primary,
  },
});
