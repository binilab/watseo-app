import { Tabs } from "expo-router";
import { Clock3, Home, MapPinned, UsersRound } from "lucide-react-native";
import { colors, radius, shadows } from "@/src/theme/tokens";

export default function TabLayout() {
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
          height: 76,
          left: 18,
          right: 18,
          bottom: 12,
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
