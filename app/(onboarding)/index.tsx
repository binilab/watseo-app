import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ShieldCheck } from "lucide-react-native";
import { AppButton } from "@/src/components";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <View style={styles.hero}>
        <View style={styles.logoTile}>
          <ShieldCheck color={colors.white} size={34} strokeWidth={2.6} />
        </View>
        <Text style={styles.wordmark}>왔어</Text>
        <Text style={styles.tagline}>도착하면 알려요</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.note}>상세 위치 없이, 도착 상태만 함께 확인해요</Text>
        <AppButton onPress={() => router.push("/login")} title="시작하기" />
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.push("/login")}
          style={({ pressed }) => [styles.secondary, pressed ? styles.pressed : null]}
        >
          <Text style={styles.secondaryText}>이미 계정이 있어요</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.xl,
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  logoTile: {
    width: 76,
    height: 76,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginBottom: spacing.xs,
  },
  wordmark: {
    fontSize: 56,
    lineHeight: 62,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: -1,
  },
  tagline: {
    ...typography.subheading,
    color: colors.textOnDarkMuted,
  },
  footer: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  note: {
    ...typography.caption,
    color: colors.textOnDarkMuted,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  secondary: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    ...typography.label,
    color: colors.textOnDark,
  },
  pressed: {
    opacity: 0.6,
  },
});
