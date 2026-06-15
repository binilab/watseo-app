import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { AppButton, Card, ListItem, Screen, SectionHeader, StatusChip } from "@/src/components";
import { roleOptions } from "@/src/data/mock";
import { colors, spacing, typography } from "@/src/theme/tokens";

export default function RoleScreen() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <Screen
      hasBottomTabs={false}
      footer={
        <AppButton
          disabled={!selectedRole}
          icon={ArrowRight}
          onPress={() => router.push("/permissions")}
          title="권한 안내 보기"
        />
      }
    >
      {from === "signup" ? (
        <StatusChip label="계정이 준비됐어요. 사용 방식을 이어서 선택해주세요." tone="active" />
      ) : null}

      <SectionHeader
        title="어떤 방식으로 사용할까요?"
        description="역할은 나중에 언제든 바꿀 수 있어요. 지금은 온보딩 흐름만 확인합니다."
      />

      {roleOptions.map((item) => (
        <Card key={item.title} tone={selectedRole === item.title ? "mint" : "plain"}>
          <ListItem
            detail={item.detail}
            icon={item.icon}
            onPress={() => setSelectedRole(item.title)}
            title={item.title}
          />
        </Card>
      ))}

      <Text style={styles.note}>
        앱 안에서는 “연결된 사람”, “확인 상대”, “알림 받을 사람”이라는 표현을 사용합니다.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
