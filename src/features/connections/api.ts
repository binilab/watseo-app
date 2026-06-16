import type { SupabaseClient } from "@supabase/supabase-js";
import * as Crypto from "expo-crypto";

import { supabase } from "@/src/lib/supabase";
import type { Database } from "@/src/types/supabase";

export type Relationship = Database["public"]["Tables"]["relationships"]["Row"];
export type ConnectionInvite = Database["public"]["Tables"]["connection_invites"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type RelationshipType = Database["public"]["Enums"]["relationship_type"];
export type AcceptedInviteResult =
  Database["public"]["Functions"]["accept_connection_invite"]["Returns"][number];

export type ConnectedPerson = {
  relationship: Relationship;
  profile: Pick<Profile, "id" | "display_name" | "avatar_url"> | null;
};

type ConnectionInviteInsert =
  Database["public"]["Tables"]["connection_invites"]["Insert"];
type WatseoSupabaseClient = SupabaseClient<Database>;

function getSupabaseClient(): WatseoSupabaseClient {
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았어요.");
  }

  return supabase;
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function generateInviteToken() {
  const bytes = await Crypto.getRandomBytesAsync(32);
  return bytesToHex(bytes);
}

export async function hashInviteToken(rawToken: string) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    normalizeInviteToken(rawToken),
  );
}

export function normalizeInviteToken(rawToken: string) {
  return rawToken.replace(/\s/g, "");
}

export async function fetchAcceptedRelationships(userId: string) {
  const client = getSupabaseClient();
  const relationshipsResult = await client
    .from("relationships")
    .select("id, requester_id, recipient_id, relationship_type, status, created_at, updated_at")
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (relationshipsResult.error) {
    return {
      data: null,
      error: relationshipsResult.error,
    };
  }

  const relationships = relationshipsResult.data ?? [];
  const profileIds = relationships.map((relationship) =>
    relationship.requester_id === userId
      ? relationship.recipient_id
      : relationship.requester_id,
  );

  if (profileIds.length === 0) {
    return {
      data: [] as ConnectedPerson[],
      error: null,
    };
  }

  const profilesResult = await client
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", profileIds);

  if (profilesResult.error) {
    return {
      data: null,
      error: profilesResult.error,
    };
  }

  const profilesById = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.id, profile]),
  );

  return {
    data: relationships.map((relationship) => {
      const connectedUserId =
        relationship.requester_id === userId
          ? relationship.recipient_id
          : relationship.requester_id;

      return {
        relationship,
        profile: profilesById.get(connectedUserId) ?? null,
      };
    }),
    error: null,
  };
}

export async function createConnectionInvite(
  userId: string,
  relationshipType: RelationshipType = "other",
) {
  const client = getSupabaseClient();
  const rawToken = await generateInviteToken();
  const tokenHash = await hashInviteToken(rawToken);
  const invite: ConnectionInviteInsert = {
    inviter_id: userId,
    token_hash: tokenHash,
    relationship_type: relationshipType,
  };

  const { data, error } = await client
    .from("connection_invites")
    .insert(invite)
    .select("id, inviter_id, token_hash, relationship_type, status, accepted_by, accepted_at, expires_at, created_at, updated_at")
    .single();

  if (error) {
    console.error("create invite failed", error, {
      rawTokenLength: rawToken.length,
      tokenHashPrefix: tokenHash.slice(0, 8),
    });
  }

  return {
    data: data ? { invite: data, rawToken } : null,
    error,
  };
}

export async function acceptConnectionInvite(rawToken: string) {
  const client = getSupabaseClient();
  const inviteToken = normalizeInviteToken(rawToken);

  return client.rpc("accept_connection_invite", {
    invite_token: inviteToken,
  });
}
