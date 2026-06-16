import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";
import type { Database } from "@/src/types/supabase";

export type Trip = Database["public"]["Tables"]["trips"]["Row"];
export type TripRecipient = Database["public"]["Tables"]["trip_recipients"]["Row"];

type TripInsert = Database["public"]["Tables"]["trips"]["Insert"];
type TripRecipientInsert =
  Database["public"]["Tables"]["trip_recipients"]["Insert"];
type WatseoSupabaseClient = SupabaseClient<Database>;

export type TripRecipientSelection = {
  recipientId: string;
  relationshipId: string;
};

export type CreateTripSessionInput = {
  ownerId: string;
  destinationId: string;
  expectedArrivalAt: string;
  startedAt: string;
  recipients: TripRecipientSelection[];
};

function getSupabaseClient(): WatseoSupabaseClient {
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았어요.");
  }

  return supabase;
}

export async function createTripSession(input: CreateTripSessionInput) {
  const client = getSupabaseClient();
  const tripInsert: TripInsert = {
    owner_id: input.ownerId,
    destination_id: input.destinationId,
    state: "on_the_way",
    expected_arrival_at: input.expectedArrivalAt,
    started_at: input.startedAt,
  };

  const tripResult = await client
    .from("trips")
    .insert(tripInsert)
    .select("id, owner_id, destination_id, state, expected_arrival_at, started_at, arrived_at, cancelled_at, created_at, updated_at")
    .single();

  if (tripResult.error || !tripResult.data) {
    console.error("create trip failed", tripResult.error ?? "trip insert returned no data");

    return {
      data: null,
      error: tripResult.error ?? new Error("trip insert failed"),
      recipientError: null,
    };
  }

  if (input.recipients.length === 0) {
    return {
      data: {
        trip: tripResult.data,
        recipients: [] as TripRecipient[],
      },
      error: null,
      recipientError: null,
    };
  }

  const recipientInserts: TripRecipientInsert[] = input.recipients.map((recipient) => ({
    trip_id: tripResult.data.id,
    recipient_id: recipient.recipientId,
    relationship_id: recipient.relationshipId,
    added_by: input.ownerId,
    notification_enabled: true,
  }));

  const recipientsResult = await client
    .from("trip_recipients")
    .insert(recipientInserts)
    .select("id, trip_id, recipient_id, relationship_id, added_by, notification_enabled, created_at");

  if (recipientsResult.error) {
    console.error("create trip recipients failed", recipientsResult.error, {
      tripId: tripResult.data.id,
      recipientCount: recipientInserts.length,
    });

    return {
      data: {
        trip: tripResult.data,
        recipients: [] as TripRecipient[],
      },
      error: null,
      recipientError: recipientsResult.error,
    };
  }

  return {
    data: {
      trip: tripResult.data,
      recipients: recipientsResult.data ?? [],
    },
    error: null,
    recipientError: null,
  };
}

export async function fetchTripById(tripId: string) {
  const client = getSupabaseClient();

  return client
    .from("trips")
    .select("id, owner_id, destination_id, state, expected_arrival_at, started_at, arrived_at, cancelled_at, created_at, updated_at")
    .eq("id", tripId)
    .maybeSingle();
}
