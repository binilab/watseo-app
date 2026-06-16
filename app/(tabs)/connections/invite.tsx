import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Check, Link2 } from "lucide-react-native";

import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import {
  acceptConnectionInvite,
  normalizeInviteToken,
} from "@/src/features/connections/api";
import { logFriendlyError } from "@/src/lib/friendlyAlert";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

function getAcceptErrorMessage(error: unknown) {
  const message =
    typeof (error as { message?: unknown })?.message === "string"
      ? (error as { message: string }).message
      : "";
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("own invite")
    || normalizedMessage.includes("cannot accept own")
  ) {
    return "내가 만든 초대는 수락할 수 없어요.";
  }

  if (
    normalizedMessage.includes("not available")
    || normalizedMessage.includes("expired")
    || normalizedMessage.includes("already accepted")
    || normalizedMessage.includes("already used")
  ) {
    return "이미 사용됐거나 만료된 초대예요.";
  }

  if (normalizedMessage.includes("required")) {
    return "초대 코드를 입력해 주세요.";
  }

  if (normalizedMessage.includes("already exists")) {
    return "이미 연결된 사람이에요.";
  }

  if (normalizedMessage.includes("not found") || normalizedMessage.includes("invalid")) {
    return "초대 코드를 확인해 주세요.";
  }

  return "초대를 수락하지 못했어요. 잠시 뒤 다시 시도해 주세요.";
}

export default function InviteAcceptScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [inviteToken, setInviteToken] = useState(normalizeInviteToken(token ?? ""));
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const normalizedToken = normalizeInviteToken(inviteToken);

  const handleAcceptInvite = async () => {
    if (!normalizedToken) {
      setMessage("초대 코드를 입력해 주세요");
      return;
    }

    setAccepting(true);
    setMessage(null);

    try {
      const { error } = await acceptConnectionInvite(normalizedToken);

      if (error) {
        logFriendlyError("초대 수락 확인", error, {
          codeLength: normalizedToken.length,
        });
        setMessage(getAcceptErrorMessage(error));
        return;
      }

      setAccepted(true);
      setMessage("연결됐어요");
    } catch (error) {
      logFriendlyError("초대 수락 확인", error, {
        codeLength: normalizedToken.length,
      });
      setMessage("초대를 수락하지 못했어요. 잠시 뒤 다시 시도해 주세요.");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <AppButton
            icon={accepted ? Check : Link2}
            loading={accepting}
            onPress={accepted ? () => router.replace("/connections") : handleAcceptInvite}
            title={accepted ? "연결 목록으로" : "초대 수락"}
          />
          <AppButton
            onPress={() => router.push("/home")}
            size="md"
            title="홈으로"
            variant="ghost"
          />
        </View>
      }
    >
      <Card tone="mint" style={styles.card}>
        <View style={styles.iconWrap}>
          <Link2 color={colors.primaryDark} size={46} strokeWidth={2.4} />
        </View>
        <StatusChip label={accepted ? "연결됐어요" : "초대 수락"} tone="active" />
        <Text style={styles.title}>{accepted ? "연결됐어요" : "초대 코드를 입력해 주세요"}</Text>
        <Text style={styles.copy}>
          {accepted
            ? "이제 서로의 도착을 함께 확인해요."
            : "상대가 보내준 초대 코드를 입력해 주세요."}
        </Text>
      </Card>

      {!accepted ? (
        <Card>
          <Text style={styles.cardTitle}>초대 코드</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            editable={!accepting}
            onChangeText={(value) => setInviteToken(normalizeInviteToken(value))}
            placeholder="받은 초대 코드 입력"
            placeholderTextColor={colors.textSubtle}
            style={styles.input}
            value={inviteToken}
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
  card: {
    alignItems: "center",
    marginTop: spacing.xxxl,
  },
  iconWrap: {
    width: 110,
    height: 110,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  title: {
    ...typography.title,
    color: colors.primaryDark,
    textAlign: "center",
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  input: {
    ...typography.body,
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    color: colors.text,
    paddingHorizontal: spacing.lg,
  },
  message: {
    ...typography.caption,
    color: colors.primaryDark,
    textAlign: "center",
  },
});
