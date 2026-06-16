import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CircleUserRound, Clock3, Home, MapPinned, UsersRound } from "lucide-react-native";
import { Screen } from "@/src/components";
import { getOnboardingRoute, type OnboardingRoute } from "@/src/features/auth/onboarding";
import { useAuthSession } from "@/src/features/auth/useAuthSession";
import {
  colors,
  radius,
  shadows,
  TAB_BAR_BOTTOM_OFFSET,
  TAB_BAR_HEIGHT,
  typography,
} from "@/src/theme/tokens";

export default function TabLayout() {
  const { loading, session } = useAuthSession();
  const [onboardingRoute, setOnboardingRoute] = useState<OnboardingRoute | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkOnboarding() {
      if (!session) {
        setOnboardingRoute(null);
        setCheckingOnboarding(false);
        return;
      }

      setCheckingOnboarding(true);
      const { route } = await getOnboardingRoute(session.user.id);

      if (!mounted) return;

      setOnboardingRoute(route);
      setCheckingOnboarding(false);
    }

    void checkOnboarding();

    return () => {
      mounted = false;
    };
  }, [session]);

  if (loading || checkingOnboarding) {
    return (
      <Screen hasBottomTabs={false} scroll={false}>
        <View style={styles.loading}>
          <Text style={styles.loadingTitle}>계정 상태를 확인하고 있어요</Text>
          <Text style={styles.loadingText}>잠시만 기다려주세요.</Text>
        </View>
      </Screen>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (onboardingRoute === "/role") {
    return <Redirect href="/role" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
        tabBarStyle: {
          height: TAB_BAR_HEIGHT,
          left: 12,
          right: 12,
          bottom: TAB_BAR_BOTTOM_OFFSET,
          paddingTop: 10,
          paddingBottom: 12,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.xl,
          backgroundColor: colors.surface,
          position: "absolute",
          ...shadows.floating,
        },
        tabBarItemStyle: {
          borderRadius: radius.lg,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "홈",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="places"
        options={{
          title: "장소",
          tabBarIcon: ({ color, size }) => <MapPinned color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="connections"
        options={{
          title: "연결",
          tabBarIcon: ({ color, size }) => <UsersRound color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "기록",
          tabBarIcon: ({ color, size }) => <Clock3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: "마이",
          tabBarIcon: ({ color, size }) => <CircleUserRound color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
  loadingTitle: {
    ...typography.subheading,
    color: colors.text,
    textAlign: "center",
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
});
