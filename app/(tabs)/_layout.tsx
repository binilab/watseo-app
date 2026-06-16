import { Redirect, Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Clock3, Home, MapPinned, UsersRound } from "lucide-react-native";
import { Screen } from "@/src/components";
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

  if (loading) {
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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
        tabBarStyle: {
          height: TAB_BAR_HEIGHT,
          left: 18,
          right: 18,
          bottom: TAB_BAR_BOTTOM_OFFSET,
          paddingTop: 9,
          paddingBottom: 11,
          borderTopWidth: 0,
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
