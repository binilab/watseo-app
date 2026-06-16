import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { UserRound } from "lucide-react-native";
import { Card } from "./Card";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

type AccountCardProps = {
  name: string;
  email: string;
  children?: ReactNode;
};

export function AccountCard({ name, email, children }: AccountCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <UserRound color={colors.primaryDark} size={20} strokeWidth={2.4} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMint,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.subheading,
    color: colors.text,
  },
  email: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
  },
});
