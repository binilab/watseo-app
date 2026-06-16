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
    return "이메일 확인을 마친 뒤 다시 로그인해주세요.";
  }

  if (normalizedMessage.includes("user already registered")) {
    return "이미 가입된 이메일이에요. 로그인으로 이어가주세요.";
  }

  if (normalizedMessage.includes("password")) {
    return "비밀번호 조건을 다시 확인해주세요.";
  }

  if (normalizedMessage.includes("email")) {
    return "이메일 주소를 다시 확인해주세요.";
  }

  return mode === "signIn"
    ? "로그인하지 못했어요. 입력 내용을 확인하고 다시 시도해주세요."
    : "계정을 만들지 못했어요. 잠시 후 다시 시도해주세요.";
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
      setMessage("로그인 설정이 아직 준비되지 않았어요.");
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
      setMessage("온보딩 상태를 확인하지 못했어요. 사용 방식을 다시 확인해주세요.");
    }

    router.replace(route);
  }

  async function signUp() {
    if (!supabase) {
      setMessage("로그인 설정이 아직 준비되지 않았어요.");
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
            title="이메일로 로그인"
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
        label={isSupabaseConfigured ? "계정 연결 준비 완료" : "로그인 설정 필요"}
        tone={isSupabaseConfigured ? "active" : "neutral"}
      />
      <View style={styles.header}>
        <Text style={styles.title}>왔어에 오신 걸 환영해요</Text>
        <Text style={styles.description}>
          이메일과 비밀번호로 계정을 만들거나 로그인할 수 있어요.
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
            앱 설정을 마친 뒤 로그인할 수 있어요.
          </Text>
        ) : null}
      </Card>

      <Card>
        <View style={styles.cardHeader}>
          <UserPlus color={colors.primaryDark} size={20} strokeWidth={2.4} />
          <Text style={styles.cardTitle}>회원가입 후 자동 준비</Text>
        </View>
        <Text style={styles.item}>계정 프로필은 서버 trigger가 자동 생성</Text>
        <Text style={styles.item}>앱에서는 profiles row를 중복 생성하지 않음</Text>
        <Text style={styles.item}>귀가 세션과 도착 인증 연결은 다음 단계에서 진행</Text>
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
    backgroundColor: colors.white,
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
