import { supabase } from "@/src/lib/supabase";

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
