import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";
import type { Database } from "@/src/types/supabase";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type WatseoSupabaseClient = SupabaseClient<Database>;

function getSupabaseClient(): WatseoSupabaseClient {
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았어요.");
  }

  return supabase;
}

export async function fetchProfile(userId: string) {
  const client = getSupabaseClient();

  return client
    .from("profiles")
    .select("id, display_name, avatar_url, onboarding_completed, permissions_seen, onboarding_completed_at, permissions_seen_at, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();
}

export async function updateProfileDisplayName(userId: string, displayName: string) {
  const client = getSupabaseClient();
  const profileUpdate: ProfileUpdate = {
    display_name: displayName.trim(),
  };

  return client
    .from("profiles")
    .update(profileUpdate)
    .eq("id", userId)
    .select("id, display_name, avatar_url, onboarding_completed, permissions_seen, onboarding_completed_at, permissions_seen_at, created_at, updated_at")
    .single();
}
