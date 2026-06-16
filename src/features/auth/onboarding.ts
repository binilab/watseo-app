import { supabase } from "@/src/lib/supabase";

export type OnboardingRoute = "/home" | "/role";

export async function completeOnboarding(userId: string) {
  if (!supabase) {
    return { error: new Error("로그인 설정이 아직 준비되지 않았어요.") };
  }

  const completedAt = new Date().toISOString();

  return supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      onboarding_completed_at: completedAt,
      permissions_seen: true,
      permissions_seen_at: completedAt,
    })
    .eq("id", userId);
}

export async function getOnboardingRoute(userId: string): Promise<{
  error: Error | null;
  route: OnboardingRoute;
}> {
  if (!supabase) {
    return {
      error: new Error("로그인 설정이 아직 준비되지 않았어요."),
      route: "/role",
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { error, route: "/role" };
  }

  return {
    error: null,
    route: data?.onboarding_completed ? "/home" : "/role",
  };
}
