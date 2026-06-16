import type { SupabaseClient } from "@supabase/supabase-js";
import * as Crypto from "expo-crypto";

import { supabase } from "@/src/lib/supabase";
import { logFriendlyError } from "@/src/lib/friendlyAlert";
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

export type RecipientActiveTrip = {
  expectedArrivalAt: string;
  ownerId: string;
  ownerProfile: Pick<Profile, "id" | "display_name" | "avatar_url"> | null;
  pendingTimeExtensionRequest: {
    id: string;
    previousExpectedArrivalAt: string;
    requestedExpectedArrivalAt: string;
  } | null;
  state: Database["public"]["Enums"]["app_state"];
  tripId: string;
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

export async function fetchRecipientActiveTrips(userId: string) {
  const client = getSupabaseClient();
  const recipientsResult = await client
    .from("trip_recipients")
    .select("trip_id")
    .eq("recipient_id", userId);

  if (recipientsResult.error) {
    return {
      data: null,
      error: recipientsResult.error,
    };
  }

  const tripIds = [...new Set((recipientsResult.data ?? []).map((row) => row.trip_id))];

  if (tripIds.length === 0) {
    return {
      data: [] as RecipientActiveTrip[],
      error: null,
    };
  }

  const activeStates = [
    "on_the_way",
    "late",
    "extension_requested",
    "emergency_requested",
  ] as const;
  const tripsResult = await client
    .from("trips")
    .select("id, owner_id, state, expected_arrival_at, updated_at")
    .in("id", tripIds)
    .in("state", activeStates)
    .order("updated_at", { ascending: false });

  if (tripsResult.error) {
    return {
      data: null,
      error: tripsResult.error,
    };
  }

  const trips = [...(tripsResult.data ?? [])].sort((a, b) => {
    if (a.state === "emergency_requested" && b.state !== "emergency_requested") return -1;
    if (a.state !== "emergency_requested" && b.state === "emergency_requested") return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
  const latestTripsByOwnerId = new Map<string, (typeof trips)[number]>();

  for (const trip of trips) {
    if (!latestTripsByOwnerId.has(trip.owner_id)) {
      latestTripsByOwnerId.set(trip.owner_id, trip);
    }
  }

  const visibleTrips = [...latestTripsByOwnerId.values()];
  const ownerIds = [...new Set(visibleTrips.map((trip) => trip.owner_id))];

  if (ownerIds.length === 0) {
    return {
      data: [] as RecipientActiveTrip[],
      error: null,
    };
  }

  const profilesResult = await client
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", ownerIds);

  if (profilesResult.error) {
    return {
      data: null,
      error: profilesResult.error,
    };
  }

  const profilesById = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.id, profile]),
  );
  const pendingRequestsResult = await client
    .from("time_extension_requests")
    .select("id, trip_id, previous_expected_arrival_at, requested_expected_arrival_at, status, created_at")
    .in("trip_id", visibleTrips.map((trip) => trip.id))
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (pendingRequestsResult.error) {
    logFriendlyError("시간 연장 요청 확인", pendingRequestsResult.error);
  }

  const pendingRequestByTripId = new Map<
    string,
    {
      id: string;
      previousExpectedArrivalAt: string;
      requestedExpectedArrivalAt: string;
    }
  >();

  for (const request of pendingRequestsResult.data ?? []) {
    if (!pendingRequestByTripId.has(request.trip_id)) {
      pendingRequestByTripId.set(request.trip_id, {
        id: request.id,
        previousExpectedArrivalAt: request.previous_expected_arrival_at,
        requestedExpectedArrivalAt: request.requested_expected_arrival_at,
      });
    }
  }

  return {
    data: visibleTrips.map((trip) => ({
      expectedArrivalAt: trip.expected_arrival_at,
      ownerId: trip.owner_id,
      ownerProfile: profilesById.get(trip.owner_id) ?? null,
      pendingTimeExtensionRequest: pendingRequestByTripId.get(trip.id) ?? null,
      state: trip.state,
      tripId: trip.id,
    })),
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
    logFriendlyError("초대 생성 확인", error, {
      codeLength: rawToken.length,
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

export async function respondTimeExtensionRequest(
  requestId: string,
  responseStatus: Extract<Database["public"]["Enums"]["request_status"], "accepted" | "declined">,
) {
  const client = getSupabaseClient();

  return client.rpc("respond_time_extension_request", {
    request_id: requestId,
    response_status: responseStatus,
  });
}
