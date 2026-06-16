import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";
import type { Database } from "@/src/types/supabase";

export type Destination = Database["public"]["Tables"]["destinations"]["Row"];

type DestinationInsert = Database["public"]["Tables"]["destinations"]["Insert"];
type DestinationUpdate = Database["public"]["Tables"]["destinations"]["Update"];
type WatseoSupabaseClient = SupabaseClient<Database>;

function getSupabaseClient(): WatseoSupabaseClient {
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았어요.");
  }

  return supabase;
}

export async function fetchDestinations(userId: string) {
  const client = getSupabaseClient();

  return client
    .from("destinations")
    .select("id, owner_id, name, qr_token, created_at, updated_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
}

export async function fetchDestinationById(destinationId: string, userId?: string) {
  const client = getSupabaseClient();

  let query = client
    .from("destinations")
    .select("id, owner_id, name, qr_token, created_at, updated_at")
    .eq("id", destinationId);

  if (userId) {
    query = query.eq("owner_id", userId);
  }

  return query.maybeSingle();
}

export async function createDestination(userId: string, name: string) {
  const client = getSupabaseClient();
  const destination: DestinationInsert = {
    owner_id: userId,
    name: name.trim(),
  };

  return client
    .from("destinations")
    .insert(destination)
    .select("id, owner_id, name, qr_token, created_at, updated_at")
    .single();
}

export async function updateDestinationName(destinationId: string, name: string) {
  const client = getSupabaseClient();
  const update: DestinationUpdate = {
    name: name.trim(),
  };

  return client
    .from("destinations")
    .update(update)
    .eq("id", destinationId)
    .select("id, owner_id, name, qr_token, created_at, updated_at")
    .single();
}
