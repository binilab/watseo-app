import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Check, Link2 } from "lucide-react-native";

import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import {
  acceptConnectionInvite,
  normalizeInviteToken,
} from "@/src/features/connections/api";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

function getAcceptErrorMessage(message?: string) {
  if (!message) {
    return "초대를 수락하지 못했어요. 코드를 다시 확인해주세요.";
  }

  if (message.includes("own invite")) {
    return "내가 만든 초대 코드는 직접 수락할 수 없어요.";
  }

  if (message.includes("not available")) {
    return "이미 사용됐거나 만료됐거나 코드가 맞지 않아요.";
  }

  if (message.includes("required")) {
    return "초대 코드를 입력해주세요.";
  }

  if (message.includes("already exists")) {
    return "이미 연결된 사람이거나 이 초대로 연결할 수 없어요.";
  }

  return "초대를 수락하지 못했어요. 코드를 다시 확인해주세요.";
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
      setMessage("초대 코드를 입력해주세요.");
      return;
    }

    setAccepting(true);
    setMessage(null);

    try {
      const { error } = await acceptConnectionInvite(normalizedToken);

      if (error) {
        console.error("accept invite failed", error, {
          tokenLength: normalizedToken.length,
        });
        setMessage(getAcceptErrorMessage(error.message));
        return;
      }

      setAccepted(true);
      setMessage("연결이 완료됐어요.");
    } catch (error) {
      console.error("accept invite failed", error, {
        tokenLength: normalizedToken.length,
      });
      setMessage("초대를 수락하지 못했어요. 잠시 후 다시 시도해주세요.");
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
            title={accepted ? "연결 대시보드로 이동" : "초대 수락"}
          />
          <AppButton
            onPress={() => router.push("/home")}
            title="홈으로 가기"
            variant="secondary"
          />
        </View>
      }
    >
      <Card tone="mint" style={styles.card}>
        <View style={styles.iconWrap}>
          <Link2 color={colors.primaryDark} size={46} strokeWidth={2.4} />
        </View>
        <StatusChip label={accepted ? "연결 완료" : "연결 초대 수락"} tone="active" />
        <Text style={styles.title}>{accepted ? "연결이 완료됐어요" : "초대 코드를 입력해주세요"}</Text>
        <Text style={styles.copy}>
          {accepted
            ? "이제 도착 인증 상태와 필요한 알림을 함께 확인할 수 있어요."
            : "초대 코드는 만든 사람이 화면에서 복사해 전달한 값입니다."}
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
            placeholder="받은 초대 코드를 붙여넣기"
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
    minHeight: 54,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    color: colors.text,
    paddingHorizontal: spacing.lg,
  },
  message: {
    ...typography.caption,
    color: colors.primaryDark,
    textAlign: "center",
  },
});
