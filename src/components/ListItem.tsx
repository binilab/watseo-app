import { ComponentType, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Check, ChevronRight } from "lucide-react-native";
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
  selected?: boolean;
  trailing?: ReactNode;
  showChevron?: boolean;
};

export function ListItem({
  title,
  detail,
  meta,
  icon: Icon,
  onPress,
  selected,
  trailing,
  showChevron,
}: ListItemProps) {
  const chevron = showChevron ?? (Boolean(onPress) && !selected && !trailing && !meta);

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed ? styles.pressed : null]}
    >
      {Icon ? (
        <View style={[styles.iconWrap, selected ? styles.iconWrapSelected : null]}>
          <Icon
            color={selected ? colors.white : colors.primaryDark}
            size={20}
            strokeWidth={2.4}
          />
        </View>
      ) : null}
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
      {trailing ? (
        trailing
      ) : selected ? (
        <View style={styles.selectedBadge}>
          <Check color={colors.white} size={15} strokeWidth={3} />
        </View>
      ) : meta ? (
        <Text style={styles.meta}>{meta}</Text>
      ) : null}
      {chevron ? <ChevronRight color={colors.textSubtle} size={18} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMint,
  },
  iconWrapSelected: {
    backgroundColor: colors.primary,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  detail: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
  },
  meta: {
    ...typography.caption,
    color: colors.primary,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
});
