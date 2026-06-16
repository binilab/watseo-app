import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Check, Copy, Link2, Send } from "lucide-react-native";

import { AppButton, Card, Screen, SectionHeader, StatusChip } from "@/src/components";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import {
  createConnectionInvite,
  type ConnectionInvite,
  type RelationshipType,
} from "@/src/features/connections/api";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

const RELATIONSHIP_TYPE_OPTIONS: Array<{
  label: string;
  value: RelationshipType;
}> = [
  { label: "연결된 사람", value: "other" },
  { label: "친구", value: "friend" },
  { label: "연인", value: "partner" },
  { label: "가족", value: "family" },
  { label: "형제자매", value: "sibling" },
];

type CreatedInvite = {
  invite: ConnectionInvite;
  rawToken: string;
};

export default function ConnectPersonScreen() {
  const { user } = useAuthSession();
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("other");
  const [createdInvite, setCreatedInvite] = useState<CreatedInvite | null>(null);
  const [creating, setCreating] = useState(false);
  const [copying, setCopying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCreateInvite = async () => {
    if (!user) {
      setMessage("로그인이 필요해요.");
      return;
    }

    setCreating(true);
    setMessage(null);

    try {
      const { data, error } = await createConnectionInvite(user.id, relationshipType);

      if (error || !data) {
        setMessage("초대 코드를 만들지 못했어요. 잠시 후 다시 시도해주세요.");
        return;
      }

      setCreatedInvite(data);
      setMessage("초대 코드가 만들어졌어요.");
    } catch {
      setMessage("초대 코드를 만들지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!createdInvite) return;

    setCopying(true);
    try {
      await Clipboard.setStringAsync(createdInvite.rawToken);
      setMessage("초대 코드를 복사했어요.");
    } catch {
      setMessage("복사하지 못했어요. 코드를 직접 전달해주세요.");
    } finally {
      setCopying(false);
    }
  };

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <AppButton
            icon={Send}
            loading={creating}
            onPress={handleCreateInvite}
            title="초대 코드 만들기"
          />
          <AppButton
            onPress={() => router.back()}
            title="돌아가기"
            variant="secondary"
          />
        </View>
      }
    >
      <SectionHeader
        title="관계 연결"
        description="확인 상대나 알림 받을 사람을 초대합니다."
      />

      <Card tone="mint">
        <Link2 color={colors.primaryDark} size={34} strokeWidth={2.3} />
        <Text style={styles.cardTitle}>초대 코드</Text>
        <Text style={styles.copy}>
          초대 코드는 한 번만 화면에 보여주고, DB에는 해시만 저장합니다.
        </Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>관계 유형</Text>
        <View style={styles.optionGrid}>
          {RELATIONSHIP_TYPE_OPTIONS.map((option) => {
            const selected = option.value === relationshipType;

            return (
              <Pressable
                accessibilityRole="button"
                key={option.value}
                onPress={() => setRelationshipType(option.value)}
                style={({ pressed }) => [
                  styles.option,
                  selected ? styles.optionSelected : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text style={[styles.optionText, selected ? styles.optionTextSelected : null]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {createdInvite ? (
        <Card tone="blue">
          <StatusChip label="초대 생성 완료" tone="active" />
          <Text style={styles.cardTitle}>전달할 초대 코드</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tokenScroller}
          >
            <Text selectable style={styles.token}>
              {createdInvite.rawToken}
            </Text>
          </ScrollView>
          <Text style={styles.copy}>
            복사 버튼으로 전달하면 줄바꿈 없이 정확한 코드가 복사됩니다.
          </Text>
          <AppButton
            icon={Copy}
            loading={copying}
            onPress={handleCopyInvite}
            title="초대 코드 복사"
            variant="secondary"
          />
          <AppButton
            icon={Check}
            onPress={() => router.replace("/connections")}
            title="연결 목록으로 이동"
            variant="secondary"
          />
        </Card>
      ) : null}

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  option: {
    minHeight: 42,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMint,
  },
  optionText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  optionTextSelected: {
    color: colors.primaryDark,
  },
  pressed: {
    opacity: 0.68,
  },
  token: {
    ...typography.caption,
    color: colors.primaryDark,
    fontFamily: "monospace",
    paddingVertical: spacing.sm,
  },
  tokenScroller: {
    maxWidth: "100%",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },
  message: {
    ...typography.caption,
    color: colors.primaryDark,
  },
});
