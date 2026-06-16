import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";
import type { Database, Json } from "@/src/types/supabase";

type NotificationEventInsert =
  Database["public"]["Tables"]["notification_events"]["Insert"];
type NotificationType = Database["public"]["Enums"]["notification_type"];
type WatseoSupabaseClient = SupabaseClient<Database>;

type CreateTripNotificationEventsInput = {
  actorId: string;
  destinationName?: string;
  message?: string;
  notificationType: Extract<
    NotificationType,
    "trip_started" | "arrived_partial" | "help_requested"
  >;
  previousState?: string;
  recipientIds: string[];
  state: "on_the_way" | "arrived_partial" | "emergency_requested";
  tripId: string;
};

function getSupabaseClient(): WatseoSupabaseClient {
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았어요.");
  }

  return supabase;
}

export async function createTripNotificationEvents(
  input: CreateTripNotificationEventsInput,
) {
  if (input.recipientIds.length === 0) {
    return { error: null };
  }

  const client = getSupabaseClient();
  const payload: Json = {
    state: input.state,
    notification_type: input.notificationType,
    trip_id: input.tripId,
  };

  if (input.destinationName) {
    payload.destination_name = input.destinationName;
  }

  if (input.previousState) {
    payload.previous_state = input.previousState;
  }

  if (input.message) {
    payload.message = input.message;
  }
  const events: NotificationEventInsert[] = input.recipientIds.map((recipientId) => ({
    actor_id: input.actorId,
    delivery_status: "recorded",
    payload,
    recipient_id: recipientId,
    trip_id: input.tripId,
    type: input.notificationType,
  }));

  const { error } = await client.from("notification_events").insert(events);

  if (error) {
    console.error("create notification events failed", error, {
      eventType: input.notificationType,
      recipientCount: input.recipientIds.length,
      tripId: input.tripId,
    });
  }

  return { error };
}
