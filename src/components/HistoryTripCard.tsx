import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { StatusChip } from "./StatusChip";
import type { StatusTone } from "@/src/types";
import { colors, spacing, typography } from "@/src/theme/tokens";

type HistoryTripCardProps = {
  title: string;
  detail: string;
  meta?: string;
  statusLabel: string;
  statusTone: StatusTone;
  onPress?: () => void;
};

export function HistoryTripCard({
  title,
  detail,
  meta,
  statusLabel,
  statusTone,
  onPress,
}: HistoryTripCardProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.detail}>
          {detail}
        </Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      <View style={styles.right}>
        <StatusChip label={statusLabel} tone={statusTone} />
        {onPress ? <ChevronRight color={colors.textSubtle} size={18} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.6,
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
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
});
