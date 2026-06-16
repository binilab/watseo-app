import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { LogOut, RotateCw, Save } from "lucide-react-native";

import { AccountCard, AppButton, Card, Screen, SectionHeader } from "@/src/components";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import {
  fetchProfile,
  updateProfileDisplayName,
  type Profile,
} from "@/src/features/profile/api";
import { colors, radius, spacing, typography } from "@/src/theme/tokens";

const APP_VERSION = "1.0.0";

export default function MyScreen() {
  const { signOut, user } = useAuthSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nickname, setNickname] = useState("");
  const [savingNickname, setSavingNickname] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutMessage, setSignOutMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function loadProfile() {
        if (!user) {
          setProfile(null);
          setNickname("");
          return;
        }

        const { data, error } = await fetchProfile(user.id);

        if (!mounted) return;

        if (error) {
          console.error("fetch profile failed", error);
          setProfile(null);
          return;
        }

        setProfile(data ?? null);
        setNickname(data?.display_name ?? "");
      }

      void loadProfile();

      return () => {
        mounted = false;
      };
    }, [user]),
  );

  async function handleSaveNickname() {
    if (!user) return;

    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      setProfileMessage("닉네임을 입력해 주세요");
      return;
    }

    setSavingNickname(true);
    setProfileMessage(null);

    const { data, error } = await updateProfileDisplayName(user.id, trimmedNickname);

    setSavingNickname(false);

    if (error || !data) {
      console.error("update profile display name failed", error);
      setProfileMessage("저장이 안 됐어요. 잠시 뒤 다시 해주세요");
      return;
    }

    setProfile(data);
    setNickname(data.display_name);
    setProfileMessage("저장했어요");
  }

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutMessage(null);

    const { error } = await signOut();

    setSigningOut(false);

    if (error) {
      setSignOutMessage("로그아웃이 안 됐어요. 잠시 뒤 다시 해주세요");
      return;
    }

    router.replace("/login");
  }

  const displayName = profile?.display_name ?? "새 사용자";

  return (
    <Screen>
      <SectionHeader title="내 정보" description="프로필과 계정을 관리해요." />

      {user ? (
        <AccountCard email={user.email ?? "이메일 정보 없음"} name={displayName}>
          <Text style={styles.fieldLabel}>닉네임</Text>
          <TextInput
            onChangeText={(value) => {
              setNickname(value);
              setProfileMessage(null);
            }}
            placeholder="닉네임"
            placeholderTextColor={colors.textSubtle}
            style={styles.input}
            value={nickname}
          />
          <AppButton
            disabled={savingNickname}
            icon={Save}
            loading={savingNickname}
            onPress={handleSaveNickname}
            size="md"
            title="저장하기"
            variant="secondary"
          />
          {profileMessage ? (
            <Text style={styles.profileMessage}>{profileMessage}</Text>
          ) : null}
        </AccountCard>
      ) : null}

      <Card tone="blue">
        <Text style={styles.cardTitle}>안심하고 쓸 수 있어요</Text>
        <Text style={styles.copy}>상세 위치는 공유되지 않아요.</Text>
        <Text style={styles.copy}>도착 상태와 필요한 알림만 전달돼요.</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>계정</Text>
        <AppButton
          icon={RotateCw}
          onPress={() => router.push("/role")}
          size="md"
          title="처음 안내 다시 보기"
          variant="secondary"
        />
        {signOutMessage ? <Text style={styles.signOutMessage}>{signOutMessage}</Text> : null}
        <AppButton
          icon={LogOut}
          loading={signingOut}
          onPress={handleSignOut}
          size="md"
          title="로그아웃"
          variant="ghost"
        />
      </Card>

      <Text style={styles.version}>왔어 {APP_VERSION}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    ...typography.label,
    color: colors.textMuted,
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
  cardTitle: {
    ...typography.subheading,
    color: colors.text,
  },
  copy: {
    ...typography.body,
    color: colors.textMuted,
  },
  profileMessage: {
    ...typography.caption,
    color: colors.primaryDark,
    textAlign: "center",
  },
  signOutMessage: {
    ...typography.caption,
    color: colors.danger,
    textAlign: "center",
  },
  version: {
    ...typography.caption,
    color: colors.textSubtle,
    textAlign: "center",
    fontWeight: "500",
  },
});
