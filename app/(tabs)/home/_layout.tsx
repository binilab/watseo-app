import { Stack } from "expo-router";

export default function HomeLayout() {
  // TODO: Move active session flows outside tabs when the navigation model is finalized.
  return <Stack screenOptions={{ headerShown: false }} />;
}
