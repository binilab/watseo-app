import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { LogIn, Mail, UserPlus } from "lucide-react-native";
import { AppButton, Card, Screen, StatusChip } from "@/src/components";
import { getOnboardingRoute } from "@/src/features/auth/onboarding";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import { isSupabaseConfigured, supabase } from "@/src/lib/supabase";
import { colors, spacing, typography } from "@/src/theme/tokens";

function getAuthMessage(message: string, mode: "signIn" | "signUp") {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("invalid credentials")
  ) {
    return "이메일이나 비밀번호가 맞지 않아요.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "이메일 확인 후 다시 로그인해 주세요";
  }

  if (normalizedMessage.includes("user already registered")) {
    return "이미 가입된 이메일이에요. 로그인해 주세요";
  }

  if (normalizedMessage.includes("password")) {
    return "비밀번호를 다시 확인해 주세요";
  }

  if (normalizedMessage.includes("email")) {
    return "이메일 주소를 확인해 주세요";
  }

  return mode === "signIn"
    ? "로그인이 안 됐어요. 다시 확인해 주세요"
    : "계정을 만들지 못했어요. 잠시 뒤 다시 해주세요";
}

export default function LoginScreen() {
  const { loading: sessionLoading, session } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState<"signIn" | "signUp" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isStartingOnboarding, setIsStartingOnboarding] = useState(false);

  useEffect(() => {
    if (!session || isStartingOnboarding) {
      return;
    }

    let mounted = true;

    getOnboardingRoute(session.user.id).then(({ route }) => {
      if (mounted) {
        router.replace(route);
      }
    });

    return () => {
      mounted = false;
    };
  }, [isStartingOnboarding, session]);

  const trimmedEmail = email.trim();
  const canSubmit = Boolean(trimmedEmail && password && !submitting && !sessionLoading);

  async function signIn() {
    if (!supabase) {
      setMessage("로그인 준비 중이에요. 잠시만요.");
      return;
    }

    setSubmitting("signIn");
    setMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    setSubmitting(null);

    if (error) {
      setMessage(getAuthMessage(error.message, "signIn"));
      return;
    }

    const { error: routeError, route } = await getOnboardingRoute(data.user.id);

    if (routeError) {
      setMessage("사용 방식을 다시 확인해 주세요");
    }

    router.replace(route);
  }

  async function signUp() {
    if (!supabase) {
      setMessage("로그인 준비 중이에요. 잠시만요.");
      return;
    }

    setSubmitting("signUp");
    setIsStartingOnboarding(true);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });

    setSubmitting(null);

    if (error) {
      setIsStartingOnboarding(false);
      setMessage(getAuthMessage(error.message, "signUp"));
      return;
    }

    // profiles row creation is handled by the DB trigger handle_new_user_profile.
    router.replace({
      pathname: "/role",
      params: { from: "signup" },
    });
  }

  return (
    <Screen
      hasBottomTabs={false}
      footer={
        <View style={styles.footer}>
          <AppButton
            disabled={!canSubmit}
            icon={LogIn}
            loading={submitting === "signIn"}
            onPress={signIn}
            title="로그인"
          />
          <AppButton
            disabled={!canSubmit}
            icon={Mail}
            loading={submitting === "signUp"}
            onPress={signUp}
            title="새 계정 만들기"
            variant="secondary"
          />
        </View>
      }
    >
      <StatusChip
        label={isSupabaseConfigured ? "반가워요" : "로그인 준비 중"}
        tone={isSupabaseConfigured ? "active" : "neutral"}
      />
      <View style={styles.header}>
        <Text style={styles.title}>다시 왔어요</Text>
        <Text style={styles.description}>
          처음이라면 계정을 만들어주세요.
        </Text>
      </View>

      <Card style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            editable={!submitting}
            inputMode="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="name@example.com"
            placeholderTextColor={colors.textSubtle}
            style={styles.input}
            textContentType="emailAddress"
            value={email}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            autoCapitalize="none"
            editable={!submitting}
            onChangeText={setPassword}
            placeholder="비밀번호"
            placeholderTextColor={colors.textSubtle}
            secureTextEntry
            style={styles.input}
            textContentType="password"
            value={password}
          />
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}
        {!isSupabaseConfigured ? (
          <Text style={styles.hint}>
            조금만 기다려 주세요.
          </Text>
        ) : null}
      </Card>

      <Card tone="mint">
        <View style={styles.cardHeader}>
          <UserPlus color={colors.primaryDark} size={20} strokeWidth={2.4} />
          <Text style={styles.cardTitle}>새 계정을 만들면</Text>
        </View>
        <Text style={styles.item}>닉네임과 사용 방식을 이어서 설정해요.</Text>
        <Text style={styles.item}>도착 장소와 알림 받을 사람을 연결할 수 있어요.</Text>
        <Text style={styles.item}>상세 위치는 공유되지 않고, 도착 상태만 전달돼요.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.md,
    paddingTop: spacing.xxxl,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
  },
  formCard: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
  input: {
    ...typography.body,
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surfaceSoft,
    color: colors.text,
    paddingHorizontal: spacing.lg,
  },
  message: {
    ...typography.body,
    color: colors.danger,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  item: {
    ...typography.body,
    color: colors.textMuted,
  },
});
