import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import { AppButton, Card, ListItem, Screen, SectionHeader } from "@/src/components";
import { permissionItems } from "@/src/data/mock";
import { colors, spacing, typography } from "@/src/theme/tokens";

export default function PermissionsScreen() {
  return (
    <Screen
      footer={
        <AppButton
          icon={CheckCircle2}
          onPress={() => router.replace("/home")}
          title="홈으로 이동"
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
});
