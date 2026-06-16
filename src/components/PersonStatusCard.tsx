import { Image, StyleSheet, Text, View } from "react-native";
import { StatusChip } from "./StatusChip";
import type { StatusTone } from "@/src/types";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

type PersonStatusCardProps = {
  name: string;
  relationshipLabel: string;
  avatarUrl?: string | null;
  statusLabel?: string;
  statusTone?: StatusTone;
  detail?: string;
};

export function PersonStatusCard({
  name,
  relationshipLabel,
  avatarUrl,
  statusLabel,
  statusTone = "neutral",
  detail,
}: PersonStatusCardProps) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{name.slice(0, 1)}</Text>
        )}
      </View>
      <View style={styles.copy}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.relationship}>{relationshipLabel}</Text>
        </View>
        {statusLabel ? <StatusChip label={statusLabel} tone={statusTone} /> : null}
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.surfaceMint,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    ...typography.subheading,
    color: colors.primaryDark,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  name: {
    ...typography.bodyStrong,
    color: colors.text,
    flexShrink: 1,
  },
  relationship: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  detail: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
  },
});
