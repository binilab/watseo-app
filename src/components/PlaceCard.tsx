import { StyleSheet, Text, View } from "react-native";
import { Check, MapPin, QrCode } from "lucide-react-native";
import { AppButton } from "./AppButton";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

type PlaceCardProps = {
  name: string;
  detail?: string;
  selected?: boolean;
  onViewQr: () => void;
  onRename: () => void;
};

export function PlaceCard({
  name,
  detail = "QR 도착 인증에 사용할 장소",
  selected,
  onViewQr,
  onRename,
}: PlaceCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <MapPin color={colors.primaryDark} size={20} strokeWidth={2.4} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.detail}>{detail}</Text>
        </View>
        {selected ? <Text style={styles.meta}>선택됨</Text> : null}
      </View>
      <View style={styles.actions}>
        <AppButton
          icon={QrCode}
          onPress={onViewQr}
          size="sm"
          style={styles.action}
          title="QR 보기"
          variant="secondary"
        />
        <AppButton
          icon={Check}
          onPress={onRename}
          size="sm"
          style={styles.action}
          title="이름 수정"
          variant="ghost"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMint,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
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
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
