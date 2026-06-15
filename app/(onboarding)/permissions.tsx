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
      setMessage("온보딩 상태를 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
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
          title="완료하고 홈으로 이동"
        />
      }
    >
      <SectionHeader
        title="권한은 아직 요청하지 않아요"
        description="이번 단계에서는 실제 위치, 알림, 카메라 권한을 호출하지 않고 안내 UI만 보여줍니다."
      />

      <Card tone="mint">
        <View style={styles.summary}>
          <Text style={styles.big}>3가지 준비 항목</Text>
          <Text style={styles.copy}>실제 권한 요청은 Supabase 및 기능 구현 단계 이후에 연결합니다.</Text>
        </View>
      </Card>

      <Card tone="blue">
        <Text style={styles.privacy}>
          상세 위치는 계속 공유되지 않고, 도착 인증 상태와 필요한 알림만 전달돼요.
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
