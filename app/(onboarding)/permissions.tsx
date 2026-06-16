import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import { AppButton, Card, ListItem, Screen, SectionHeader } from "@/src/components";
import { permissionItems } from "@/src/data/mock";
import { completeOnboarding } from "@/src/features/auth/onboarding";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import { colors, spacing, typography } from "@/src/theme/tokens";

export default function PermissionsScreen() {
  const { user } = useAuthSession();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function finishOnboarding() {
    if (!user) {
      setMessage("로그인 후 온보딩을 완료할 수 있어요.");
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await completeOnboarding(user.id);

    setSaving(false);

    if (error) {
      setMessage("저장이 안 됐어요. 잠시 뒤 다시 해주세요");
      return;
    }

    router.replace("/home");
  }

  return (
    <Screen
      hasBottomTabs={false}
      footer={
        <AppButton
          icon={CheckCircle2}
          loading={saving}
          onPress={finishOnboarding}
          title="시작하기"
        />
      }
    >
      <SectionHeader
        title="권한은 나중에 받아요"
        description="지금은 어떤 게 필요한지 안내만 해드려요."
      />

      <Card tone="mint">
        <View style={styles.summary}>
          <Text style={styles.big}>3가지 안내 항목</Text>
          <Text style={styles.copy}>필요할 때 권한을 요청할게요.</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.privacy}>
          상세 위치는 공유되지 않아요. 도착 상태와 알림만 전달돼요.
        </Text>
      </Card>

      {message ? (
        <Card tone="warm">
          <Text style={styles.message}>{message}</Text>
        </Card>
      ) : null}

      <Card>
        {permissionItems.map((item) => (
          <ListItem
            detail={item.detail}
            icon={item.icon}
            key={item.title}
            title={item.title}
          />
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    gap: spacing.sm,
  },
  big: {
    ...typography.heading,
    color: colors.primaryDark,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
  },
  privacy: {
    ...typography.body,
    color: colors.primaryDark,
  },
  message: {
    ...typography.body,
    color: colors.amber,
  },
});
